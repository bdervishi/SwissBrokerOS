import React, { useRef, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { db, USE_MOCK } from '../../src/services/db';
import { documentsService } from '../../src/services/documents';
import { statementsApi, ReconcileResult } from '../../src/services/commissions';
import { useCommissionStatements, useCommissionStatementItems, useCommissions } from '../../src/hooks/useData';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Feedback';
import { Commission, CommissionStatement, CommissionStatus } from '../../types';
import { SensitiveData } from '../ui/SensitiveData';
import {
  Upload, Sparkles, Loader2, FileText, AlertTriangle, CheckCircle2,
  SearchX, Plus, ChevronRight,
} from 'lucide-react';

/**
 * KI-Abrechnungsabgleich (Konzept 4.2): Courtageabrechnung hochladen ->
 * Gemini extrahiert Positionen -> Auto-Matching gegen die Soll-Stellung ->
 * Abweichungs-Dashboard inkl. Leakage-Liste (erwartet, aber nie abgerechnet).
 */

interface StatementsTabProps {
  tenantId?: string;
}

export const StatementsTab: React.FC<StatementsTabProps> = ({ tenantId }) => {
  const { user } = useAuth();
  const toast = useToast();
  const { data: statements, refetch: refetchStatements } = useCommissionStatements(tenantId);
  const { data: commissions, refetch: refetchCommissions } = useCommissions();
  const [selected, setSelected] = useState<CommissionStatement | null>(null);
  const { data: items, refetch: refetchItems } = useCommissionStatementItems(selected?.id);

  // Upload modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [insurer, setInsurer] = useState('');
  const [period, setPeriod] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsingId, setParsingId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ReconcileResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    setError(null);
    if (!insurer.trim()) { setError('Versicherer angeben.'); return; }
    if (!file && !USE_MOCK) { setError('Bitte die Abrechnung (PDF/Excel) wählen.'); return; }
    setBusy(true);
    try {
      let documentId: string | null = null;
      if (file && tenantId) {
        const doc = await documentsService.upload({
          tenantId, clientId: null, file,
          title: `Courtageabrechnung ${insurer.trim()}${period ? ` ${period}` : ''}`,
          category: 'COURTAGE',
          uploadedBy: user?.id ?? null,
        });
        documentId = doc.id;
      }
      await db.commissionStatements.create({
        tenantId, insurer: insurer.trim(), period: period || null,
        documentId, status: 'NEW',
      } as any);
      setIsUploadOpen(false);
      setFile(null); setInsurer(''); setPeriod('');
      refetchStatements();
    } catch (e: any) {
      setError(e?.message || 'Upload fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  };

  const handleParse = async (s: CommissionStatement) => {
    if (!tenantId) return;
    setParsingId(s.id);
    setLastResult(null);
    try {
      const result = await statementsApi.parseAndReconcile(s.id, tenantId);
      setLastResult(result);
      refetchStatements();
      refetchCommissions();
      if (selected?.id === s.id) refetchItems();
      setSelected({ ...s, status: 'RECONCILED' });
    } catch (e: any) {
      toast.error(e?.message || 'Abgleich fehlgeschlagen. Ist das Backend deployed?');
    } finally {
      setParsingId(null);
    }
  };

  // Leakage: EXPECTED commissions whose due period already passed.
  const nowYm = new Date().toISOString().slice(0, 7);
  const leakage = (commissions as Commission[]).filter(
    (c) => c.status === ('EXPECTED' as CommissionStatus) && (c.period ?? '9999') <= nowYm,
  );
  const disputed = (commissions as Commission[]).filter((c) => c.status === ('DISPUTED' as CommissionStatus));

  const statusBadge = (s: CommissionStatement['status']) => {
    const map = {
      NEW: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      PARSED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      RECONCILED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    } as const;
    const labels = { NEW: 'Neu', PARSED: 'Extrahiert', RECONCILED: 'Abgeglichen' } as const;
    return <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${map[s]}`}>{labels[s]}</span>;
  };

  return (
    <>
      {/* Discrepancy KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <DiscrepancyCard
          icon={<SearchX className="text-red-600" size={22} />}
          title="Courtage-Leakage"
          value={<SensitiveData>CHF {leakage.reduce((s, c) => s + (c.expectedAmount ?? 0), 0).toLocaleString()}</SensitiveData>}
          hint={`${leakage.length} fällige, nie abgerechnete Positionen`}
          tone="red"
        />
        <DiscrepancyCard
          icon={<AlertTriangle className="text-amber-600" size={22} />}
          title="Strittig / zu tief"
          value={<SensitiveData>CHF {disputed.reduce((s, c) => s + ((c.expectedAmount ?? 0) - (c.amount ?? 0)), 0).toLocaleString()}</SensitiveData>}
          hint={`${disputed.length} Positionen mit Differenz`}
          tone="amber"
        />
        <DiscrepancyCard
          icon={<CheckCircle2 className="text-emerald-600" size={22} />}
          title="Abrechnungen"
          value={String(statements.length)}
          hint={`${statements.filter((s) => s.status === 'RECONCILED').length} abgeglichen`}
          tone="emerald"
        />
      </div>

      {lastResult && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-sm text-emerald-800 dark:text-emerald-300">
          <strong>KI-Abgleich abgeschlossen:</strong> {lastResult.itemsParsed} Positionen extrahiert ·
          {' '}{lastResult.matched} bezahlt ✓ · {lastResult.disputed} strittig ⚠️ · {lastResult.unexpected} unerwartet
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statements list */}
        <Card noPadding>
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Courtageabrechnungen</h3>
            <Button size="sm" icon={<Upload size={14} />} onClick={() => { setError(null); setIsUploadOpen(true); }}>Abrechnung hochladen</Button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {statements.length === 0 && (
              <div className="px-6 py-10 text-center text-slate-500 italic text-sm">
                Noch keine Abrechnung hochgeladen.
                {USE_MOCK && <span className="block mt-1 text-xs">Demo-Modus: Der Abgleich wird simuliert — einfach ausprobieren.</span>}
              </div>
            )}
            {statements.map((s) => (
              <div key={s.id}
                onClick={() => setSelected(s)}
                className={`px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${selected?.id === s.id ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}>
                <FileText size={18} className="text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{s.insurer}{s.period ? ` • ${s.period}` : ''}</p>
                  <p className="text-xs text-slate-400">{s.createdAt ? String(s.createdAt).slice(0, 10) : ''}{s.totalAmount ? ` • CHF ${Number(s.totalAmount).toLocaleString()}` : ''}</p>
                </div>
                {statusBadge(s.status)}
                {s.status !== 'RECONCILED' && (
                  <Button size="sm" variant="secondary" disabled={parsingId === s.id}
                    onClick={(e: any) => { e.stopPropagation(); handleParse(s); }}
                    icon={parsingId === s.id ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}>
                    {parsingId === s.id ? 'Analysiere…' : 'KI-Abgleich'}
                  </Button>
                )}
                <ChevronRight size={14} className="text-slate-300" />
              </div>
            ))}
          </div>
        </Card>

        {/* Items of selected statement / leakage */}
        <div className="space-y-6">
          {selected && (
            <Card title={`Positionen – ${selected.insurer}${selected.period ? ` ${selected.period}` : ''}`} noPadding>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[320px] overflow-y-auto">
                {items.length === 0 && <div className="px-6 py-8 text-center text-slate-500 italic text-sm">Noch nicht extrahiert — «KI-Abgleich» starten.</div>}
                {items.map((it) => (
                  <div key={it.id} className="px-6 py-3 flex items-center gap-3 text-sm">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${it.matchStatus === 'MATCHED' ? 'bg-emerald-500' : it.matchStatus === 'DISPUTED' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-slate-500">{it.policyNumber || '—'}</p>
                      <p className="text-slate-700 dark:text-slate-300 truncate">{it.line || it.clientName || ''}</p>
                    </div>
                    <span className="font-mono"><SensitiveData>CHF {(it.amount ?? 0).toLocaleString()}</SensitiveData></span>
                    <span className="text-[10px] font-bold uppercase text-slate-400 w-20 text-right">
                      {it.matchStatus === 'MATCHED' ? 'OK' : it.matchStatus === 'DISPUTED' ? 'Differenz' : 'Unerwartet'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card title="Leakage – fällig, aber nie abgerechnet" noPadding>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[320px] overflow-y-auto">
              {leakage.length === 0 && <div className="px-6 py-8 text-center text-slate-500 italic text-sm">Keine offenen Soll-Positionen. 👍</div>}
              {leakage.map((c) => (
                <div key={c.id} className="px-6 py-3 flex items-center gap-3 text-sm">
                  <SearchX size={15} className="text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 dark:text-slate-300 truncate">{c.description}</p>
                    <p className="text-xs text-slate-400">{c.partnerName} • fällig {c.period}</p>
                  </div>
                  <span className="font-mono text-red-600"><SensitiveData>CHF {(c.expectedAmount ?? 0).toLocaleString()}</SensitiveData></span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* UPLOAD MODAL */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Courtageabrechnung hochladen" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-brand-400 transition-colors">
            <input ref={fileRef} type="file" accept=".pdf,.xls,.xlsx,.csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {file ? (
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{file.name}</span>
            ) : (
              <span className="text-slate-400 text-sm flex flex-col items-center gap-2"><Plus size={22} /> Abrechnung wählen (PDF / Excel){USE_MOCK ? ' – im Demo-Modus optional' : ''}</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Versicherer *</label>
              <input value={insurer} onChange={(e) => setInsurer(e.target.value)} className={inputCls} placeholder="z.B. AXA" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Periode</label>
              <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className={inputCls} />
            </div>
          </div>
          {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={busy}>Abbrechen</Button>
            <Button onClick={handleUpload} disabled={busy}>{busy ? <Loader2 className="animate-spin" size={18} /> : 'Hochladen'}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm';

const DiscrepancyCard: React.FC<{ icon: React.ReactNode; title: string; value: React.ReactNode; hint: string; tone: 'red' | 'amber' | 'emerald' }> =
  ({ icon, title, value, hint, tone }) => {
    const tones = {
      red: 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30',
      amber: 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30',
      emerald: 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800',
    };
    return (
      <div className={`p-5 rounded-xl border shadow-sm flex items-start justify-between ${tones[tone]}`}>
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-0.5">{value}</h3>
          <p className="text-xs text-slate-400">{hint}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-800">{icon}</div>
      </div>
    );
  };
