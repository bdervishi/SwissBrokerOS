import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { requireTenant, tenantFromBody } from './auth';

/**
 * Call agent – post-call pipeline (Phase 1, no telephony).
 * Takes a transcript, asks Gemini for a summary + structured follow-up actions,
 * persists a `calls` row, and creates the follow-ups (client note + calendar
 * events) via the Supabase service role. See docs/CALL_AGENT.md.
 */

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export const callsRouter = Router();

interface Action { type: string; title: string; dueInDays?: number; }
interface Outcome { summary: string; sentiment?: string; intent?: string; actions?: Action[]; }

async function analyseTranscript(transcript: string): Promise<Outcome> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('AI not configured');
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Du bist Assistent eines Schweizer Versicherungsmaklers. Analysiere dieses Telefongespräch-Transkript und gib NUR JSON zurück:
{
  "summary": "kurze Zusammenfassung auf Deutsch (Sie-Form)",
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "intent": "kurzer Betreff (z.B. Offerte, Beschwerde, Terminwunsch)",
  "actions": [ { "type": "TASK" | "NOTE", "title": "konkrete Folgeaktion", "dueInDays": number } ]
}
Transkript:
${transcript}`;
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  try {
    return JSON.parse(res.text || '{}');
  } catch {
    return { summary: res.text || 'Keine Zusammenfassung.' };
  }
}

// Process a transcript: persist the call + create follow-up actions.
callsRouter.post('/process', requireTenant(tenantFromBody), async (req, res) => {
  const { tenantId, clientId, transcript, toNumber, consentCaptured } = req.body || {};
  const caller = (req as any).caller;
  if (!tenantId || !transcript) return res.status(400).json({ error: 'tenantId and transcript required' });

  try {
    const outcome = await analyseTranscript(transcript);

    // 1. Persist the call
    const { data: call } = await supabase.from('calls').insert({
      tenant_id: tenantId, client_id: clientId || null, agent_id: caller?.userId || null,
      direction: 'OUTBOUND', status: 'COMPLETED', provider: 'manual', to_number: toNumber || null,
      transcript, summary: outcome.summary || null, outcome,
      consent_captured: Boolean(consentCaptured),
    }).select('id').single();

    let notes = 0, events = 0;

    // 2. Client note with the summary
    if (clientId && outcome.summary) {
      await supabase.from('client_notes').insert({
        client_id: clientId, author_id: caller?.userId || null,
        author_name: 'Call Agent', content: `📞 Anruf: ${outcome.summary}`,
      });
      notes++;
    }

    // 3. Follow-up tasks -> calendar events (type TASK)
    for (const a of outcome.actions || []) {
      if (a.type !== 'TASK' || !a.title) continue;
      const start = new Date(Date.now() + (a.dueInDays ?? 2) * 86_400_000);
      await supabase.from('calendar_events').insert({
        tenant_id: tenantId, user_id: caller?.userId || null, title: a.title,
        start_time: start.toISOString(), end_time: start.toISOString(),
        type: 'TASK', related_id: clientId || null, related_type: clientId ? 'CLIENT' : 'NONE',
        is_all_day: true, description: 'Automatisch aus Anruf erstellt.',
      });
      events++;
    }

    res.json({ callId: call?.id, summary: outcome.summary, outcome, created: { notes, events } });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Processing failed' });
  }
});

// List calls for a client
callsRouter.get('/', requireTenant((req) => String(req.query.tenantId || '')), async (req, res) => {
  const tenantId = String(req.query.tenantId || '');
  const clientId = req.query.clientId ? String(req.query.clientId) : undefined;
  let query = supabase.from('calls').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (clientId) query = query.eq('client_id', clientId);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ calls: data || [] });
});
