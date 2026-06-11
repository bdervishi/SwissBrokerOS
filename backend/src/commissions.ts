import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { requireTenant, tenantFromBody } from './auth';

/**
 * Courtage-Abrechnungsabgleich (docs/COURTAGEN_KONZEPT.md, Phase 2):
 *  POST /statements/:id/parse  – download the uploaded insurer statement from
 *  Storage, extract line items via Gemini, persist them and match them against
 *  the tenant's EXPECTED commissions (policy number -> amount tolerance).
 *  GET  /benchmark             – anonymised cross-tenant average rates.
 */

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export const commissionsRouter = Router();

interface ParsedItem {
  policy_number?: string;
  client_name?: string;
  line?: string;
  premium?: number;
  amount?: number;
}

async function extractItems(fileBase64: string, mimeType: string): Promise<{ items: ParsedItem[]; total?: number; period?: string }> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('AI not configured');
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Du analysierst eine Courtage-/Provisionsabrechnung eines Schweizer Versicherers an einen Broker.
Extrahiere ALLE Positionen und gib NUR JSON zurück:
{
  "period": "YYYY-MM falls erkennbar, sonst null",
  "total": Gesamtbetrag der Abrechnung in CHF (number, sonst null),
  "items": [
    {
      "policy_number": "Policennummer (string)",
      "client_name": "Kundenname falls vorhanden",
      "line": "Sparte/Branche falls vorhanden",
      "premium": Jahresprämie in CHF (number, sonst null),
      "amount": Courtagebetrag in CHF (number)
    }
  ]
}`;
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { inlineData: { data: fileBase64, mimeType } },
      { text: prompt },
    ] as any,
    config: { responseMimeType: 'application/json' },
  });
  try {
    const parsed = JSON.parse(res.text || '{}');
    return { items: parsed.items || [], total: parsed.total ?? undefined, period: parsed.period ?? undefined };
  } catch {
    return { items: [] };
  }
}

// Amounts within 2% (or CHF 2) of the expectation count as a clean match.
const matches = (expected: number, actual: number): boolean =>
  Math.abs(expected - actual) <= Math.max(2, Math.abs(expected) * 0.02);

commissionsRouter.post('/statements/:id/parse', requireTenant(tenantFromBody), async (req, res) => {
  const { tenantId } = req.body || {};
  const statementId = req.params.id;
  try {
    // 1. Load statement + linked document
    const { data: statement } = await supabase
      .from('commission_statements').select('*')
      .eq('id', statementId).eq('tenant_id', tenantId).single();
    if (!statement) return res.status(404).json({ error: 'Abrechnung nicht gefunden' });
    if (!statement.document_id) return res.status(400).json({ error: 'Kein Dokument verknüpft' });

    const { data: doc } = await supabase
      .from('documents').select('storage_path, mime_type')
      .eq('id', statement.document_id).single();
    if (!doc?.storage_path) return res.status(400).json({ error: 'Dokument hat keine Datei' });

    // 2. Download + AI extraction
    const { data: file, error: dlErr } = await supabase.storage.from('documents').download(doc.storage_path);
    if (dlErr || !file) return res.status(500).json({ error: 'Download fehlgeschlagen' });
    const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');
    const { items, total, period } = await extractItems(base64, doc.mime_type || 'application/pdf');

    // 3. Load the tenant's open expectations + policies for matching
    const { data: expectedRows } = await supabase
      .from('commissions').select('*')
      .eq('tenant_id', tenantId).eq('status', 'EXPECTED');
    const { data: policies } = await supabase
      .from('policies').select('id, policy_number')
      .eq('tenant_id', tenantId);
    const policyByNumber = new Map((policies || []).map((p) => [String(p.policy_number || '').trim(), p.id]));

    let matched = 0, disputed = 0, unexpected = 0;

    // 4. Persist items + match
    for (const item of items) {
      const policyId = policyByNumber.get(String(item.policy_number || '').trim());
      const exp = (expectedRows || []).find((c) => c.policy_id === policyId);
      let matchStatus = 'UNEXPECTED';
      if (exp) matchStatus = matches(Number(exp.expected_amount) || 0, Number(item.amount) || 0) ? 'MATCHED' : 'DISPUTED';

      const { data: itemRow } = await supabase.from('commission_statement_items').insert({
        tenant_id: tenantId, statement_id: statementId,
        policy_number: item.policy_number || null, client_name: item.client_name || null,
        line: item.line || null, premium: item.premium ?? null, amount: item.amount ?? null,
        match_status: matchStatus, matched_commission_id: exp?.id ?? null,
        raw: item,
      }).select('id').single();

      if (exp) {
        await supabase.from('commissions').update({
          status: matchStatus === 'MATCHED' ? 'PAID' : 'DISPUTED',
          amount: item.amount ?? 0,
          statement_item_id: itemRow?.id ?? null,
        }).eq('id', exp.id);
        matchStatus === 'MATCHED' ? matched++ : disputed++;
      } else {
        unexpected++;
      }
    }

    // 5. Mark statement reconciled
    await supabase.from('commission_statements').update({
      status: 'RECONCILED', parsed_at: new Date().toISOString(),
      total_amount: total ?? null, period: statement.period || period || null,
    }).eq('id', statementId);

    res.json({ itemsParsed: items.length, matched, disputed, unexpected });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Abgleich fehlgeschlagen' });
  }
});

// Anonymised benchmark: average agreed rates per insurer(/line) across all
// tenants. Only returned when >= 3 tenants contribute (k-anonymity).
commissionsRouter.get('/benchmark', requireTenant((req) => String(req.query.tenantId || '')), async (req, res) => {
  const insurer = String(req.query.insurer || '').trim();
  const line = req.query.line ? String(req.query.line).trim() : undefined;
  if (!insurer) return res.status(400).json({ error: 'insurer required' });

  let query = supabase.from('commission_agreements')
    .select('tenant_id, acquisition_rate, recurring_rate')
    .ilike('insurer', insurer);
  if (line) query = query.ilike('line', line);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const tenants = new Set((data || []).map((r) => r.tenant_id)).size;
  if (!data || tenants < 3) return res.json({ acquisitionRate: null, recurringRate: null, tenants });

  const avg = (key: 'acquisition_rate' | 'recurring_rate') =>
    Math.round((data.reduce((s, r) => s + (Number(r[key]) || 0), 0) / data.length) * 10) / 10;
  res.json({ acquisitionRate: avg('acquisition_rate'), recurringRate: avg('recurring_rate'), tenants });
});
