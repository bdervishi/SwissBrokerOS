import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { db } from '../../src/services/db';
import { useBranding } from '../../contexts/BrandingContext';
import { Commission, Policy } from '../../types';
import { FileSignature, Loader2 } from 'lucide-react';

/**
 * Art. 45b VAG: ungebundene Versicherungsvermittler müssen dem Kunden die
 * Entschädigung offenlegen, die sie von Versicherern erhalten. Generiert ein
 * druckbares Offenlegungs-Dokument aus den Policen + Courtage-Daten des Kunden.
 */

interface VagDisclosureProps {
  clientId: string;
  clientName: string;
  policies: Policy[];
}

const chf = (n: number) => `CHF ${n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const VagDisclosureButton: React.FC<VagDisclosureProps> = ({ clientId, clientName, policies }) => {
  const { branding } = useBranding();
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    try {
      const all = (await db.commissions.getAll().catch(() => [])) as Commission[];
      const clientCommissions = all.filter((c) => c.clientId === clientId && c.status !== 'CLAWBACK');

      const rows = policies.map((p) => {
        const related = clientCommissions.filter((c) => c.policyId === p.id);
        const acquisition = related.filter((c) => c.type === 'ACQUISITION')
          .reduce((s, c) => s + (c.amount || c.expectedAmount || 0), 0)
          || (p.initialCommission ?? 0);
        const recurring = related.filter((c) => c.type === 'RECURRING')
          .reduce((s, c) => Math.max(s, c.amount || c.expectedAmount || 0), 0);
        return `<tr>
          <td>${p.insurer}</td><td>${p.type}</td><td>${p.policyNumber || '–'}</td>
          <td style="text-align:right">${chf(p.premiumAmount || 0)}</td>
          <td style="text-align:right">${acquisition ? chf(acquisition) : '–'}</td>
          <td style="text-align:right">${recurring ? `${chf(recurring)} p.a.` : '–'}</td>
        </tr>`;
      }).join('');

      const html = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">
<title>Entschädigungs-Offenlegung – ${clientName}</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; margin: 48px; font-size: 13px; line-height: 1.55; }
  h1 { font-size: 19px; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 2px; }
  .sub { color: #64748b; font-size: 11px; margin-bottom: 28px; }
  table { width: 100%; border-collapse: collapse; margin: 18px 0 26px; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #64748b; border-bottom: 2px solid #0f172a; padding: 6px 8px; }
  th:nth-child(n+4) { text-align: right; }
  td { padding: 7px 8px; border-bottom: 1px solid #e2e8f0; }
  .legal { font-size: 11px; color: #475569; }
  .sig { margin-top: 56px; display: flex; gap: 64px; }
  .sig div { flex: 1; border-top: 1px solid #94a3b8; padding-top: 6px; font-size: 11px; color: #64748b; }
  @media print { body { margin: 24px; } }
</style></head><body>
  <h1>Offenlegung der Entschädigung</h1>
  <div class="sub">gemäss Art. 45b VAG (Versicherungsaufsichtsgesetz) · ${branding.logoText} · erstellt am ${new Date().toLocaleDateString('de-CH')}</div>
  <p><strong>Kundin/Kunde:</strong> ${clientName}</p>
  <p>Als ungebundener Versicherungsvermittler erhalten wir von den Versicherungsunternehmen
  für die Vermittlung und Betreuung Ihrer Verträge folgende Entschädigungen (Courtagen):</p>
  <table>
    <thead><tr><th>Versicherer</th><th>Sparte</th><th>Police-Nr.</th><th>Jahresprämie</th><th>Abschlussentschädigung</th><th>Bestandesentschädigung</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#94a3b8">Keine Policen erfasst.</td></tr>'}</tbody>
  </table>
  <p class="legal">Die aufgeführten Entschädigungen sind in den Versicherungsprämien enthalten und werden uns
  von den Versicherern ausgerichtet. Sofern die tatsächliche Entschädigung von den aufgeführten Werten
  abweicht, informieren wir Sie auf Anfrage über die effektiv erhaltenen Beträge. Mit Ihrer Unterschrift
  bestätigen Sie, von dieser Offenlegung Kenntnis genommen zu haben; ein Verzicht auf die Herausgabe der
  Entschädigung (Art. 45b Abs. 2 VAG) wird damit ausdrücklich vereinbart.</p>
  <div class="sig">
    <div>Ort, Datum</div>
    <div>Unterschrift Kundin/Kunde</div>
  </div>
  <script>window.onload = () => window.print();</script>
</body></html>`;

      const w = window.open('', '_blank', 'noopener,width=900,height=1100');
      if (w) { w.document.write(html); w.document.close(); }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={generate} disabled={busy}
      icon={busy ? <Loader2 className="animate-spin" size={14} /> : <FileSignature size={14} />}>
      VAG-45b-Offenlegung erstellen
    </Button>
  );
};
