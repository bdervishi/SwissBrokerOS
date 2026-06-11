import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { db } from '../../src/services/db';
import { statementsApi } from '../../src/services/commissions';
import { useCommissionAgreements } from '../../src/hooks/useData';
import { CommissionAgreement } from '../../types';
import { POLICY_TYPE_SUGGESTIONS } from '../forms/PolicyForm';
import { Plus, PenTool, Trash2, Loader2, Handshake, BarChart3 } from 'lucide-react';
import { useToast, useConfirm } from '../ui/Feedback';

/**
 * Courtagevereinbarungen: verhandelte Sätze je Versicherer/Sparte. Grundlage
 * der automatischen Soll-Stellung beim Erfassen einer Police.
 */

interface AgreementsTabProps {
  tenantId?: string;
}

const empty = { insurer: '', line: '', acquisitionRate: '', recurringRate: '', liabilityMonths: '', validFrom: '', notes: '' };

export const AgreementsTab: React.FC<AgreementsTabProps> = ({ tenantId }) => {
  const { data: agreements, refetch } = useCommissionAgreements(tenantId);
  const toast = useToast();
  const confirm = useConfirm();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<CommissionAgreement | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [benchmark, setBenchmark] = useState<{ acquisitionRate: number | null; recurringRate: number | null; tenants: number } | null>(null);

  const open = (a?: CommissionAgreement) => {
    setError(null);
    setEditing(a ?? null);
    setForm(a ? {
      insurer: a.insurer, line: a.line ?? '',
      acquisitionRate: String(a.acquisitionRate ?? ''), recurringRate: String(a.recurringRate ?? ''),
      liabilityMonths: String(a.liabilityMonths ?? ''), validFrom: a.validFrom ?? '', notes: a.notes ?? '',
    } : empty);
    setIsOpen(true);
  };

  // Anonymised cross-tenant benchmark for the entered insurer (backend only).
  useEffect(() => {
    if (!isOpen || !form.insurer.trim()) { setBenchmark(null); return; }
    let active = true;
    const t = setTimeout(() => {
      statementsApi.benchmark(form.insurer.trim(), form.line.trim() || undefined)
        .then((b) => { if (active) setBenchmark(b); })
        .catch(() => { if (active) setBenchmark(null); });
    }, 600);
    return () => { active = false; clearTimeout(t); };
  }, [isOpen, form.insurer, form.line]);

  const save = async () => {
    setError(null);
    if (!form.insurer.trim()) { setError('Versicherer ist erforderlich.'); return; }
    setSaving(true);
    try {
      const payload: any = {
        insurer: form.insurer.trim(),
        line: form.line.trim() || null,
        acquisitionRate: Number(form.acquisitionRate) || 0,
        recurringRate: Number(form.recurringRate) || 0,
        liabilityMonths: Number(form.liabilityMonths) || 0,
        validFrom: form.validFrom || null,
        notes: form.notes.trim() || null,
      };
      if (editing) await db.commissionAgreements.update(editing.id, payload);
      else await db.commissionAgreements.create({ ...payload, tenantId });
      setIsOpen(false);
      refetch();
    } catch (e: any) {
      setError(e?.message || 'Speichern fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a: CommissionAgreement) => {
    if (!(await confirm({ title: 'Vereinbarung löschen?', body: `${a.insurer}${a.line ? ` / ${a.line}` : ''} wird entfernt.`, danger: true, confirmLabel: 'Löschen' }))) return;
    await db.commissionAgreements.remove(a.id);
    toast.success('Vereinbarung gelöscht.');
    refetch();
  };

  return (
    <>
      <div className="mb-6 p-4 bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800/30 rounded-xl flex gap-4">
        <div className="p-2 bg-brand-100 dark:bg-brand-800/20 rounded-lg h-fit text-brand-600"><Handshake size={24} /></div>
        <div>
          <h3 className="font-semibold text-brand-900 dark:text-brand-200">Courtagevereinbarungen</h3>
          <p className="text-sm text-brand-800 dark:text-brand-300 mt-1">
            Hinterlege deine verhandelten Sätze je Versicherer und Sparte. Beim Erfassen einer Police
            wird daraus automatisch der <strong>Courtage-Plan</strong> (Soll-Stellung) erzeugt.
          </p>
        </div>
      </div>

      <Card noPadding>
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Vereinbarungen ({agreements.length})</h3>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => open()}>Vereinbarung erfassen</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Versicherer</th>
                <th className="px-6 py-3">Sparte</th>
                <th className="px-6 py-3 text-right">Abschluss %</th>
                <th className="px-6 py-3 text-right">Bestand %</th>
                <th className="px-6 py-3 text-right">Stornohaftung</th>
                <th className="px-6 py-3">Gültig ab</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {agreements.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-500 italic">
                  Noch keine Vereinbarungen. Ohne Vereinbarung wird beim Policen-Erfassen nur die manuell
                  eingetragene Abschlussprovision berücksichtigt.
                </td></tr>
              )}
              {agreements.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{a.insurer}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{a.line || <span className="italic text-slate-400">alle Sparten</span>}</td>
                  <td className="px-6 py-4 text-right font-mono">{a.acquisitionRate}%</td>
                  <td className="px-6 py-4 text-right font-mono">{a.recurringRate}%</td>
                  <td className="px-6 py-4 text-right">{a.liabilityMonths || 0} Mt.</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{a.validFrom || '–'}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button onClick={() => open(a)} className="p-1.5 text-slate-300 hover:text-brand-600 transition-colors" title="Bearbeiten"><PenTool size={15} /></button>
                    <button onClick={() => remove(a)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors" title="Löschen"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Vereinbarung bearbeiten' : 'Courtagevereinbarung erfassen'} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FieldWrap label="Versicherer *">
              <input value={form.insurer} onChange={(e) => setForm({ ...form, insurer: e.target.value })} className={inputCls} placeholder="z.B. AXA" />
            </FieldWrap>
            <FieldWrap label="Sparte (leer = alle)">
              <input list="agreement-line-suggestions" value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} className={inputCls} placeholder="z.B. Hausrat" />
              <datalist id="agreement-line-suggestions">
                {POLICY_TYPE_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
              </datalist>
            </FieldWrap>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FieldWrap label="Abschluss (%)">
              <input type="number" value={form.acquisitionRate} onChange={(e) => setForm({ ...form, acquisitionRate: e.target.value })} className={inputCls} />
            </FieldWrap>
            <FieldWrap label="Bestand (%)">
              <input type="number" value={form.recurringRate} onChange={(e) => setForm({ ...form, recurringRate: e.target.value })} className={inputCls} />
            </FieldWrap>
            <FieldWrap label="Stornohaftung (Mt.)">
              <input type="number" value={form.liabilityMonths} onChange={(e) => setForm({ ...form, liabilityMonths: e.target.value })} className={inputCls} />
            </FieldWrap>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldWrap label="Gültig ab">
              <input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className={inputCls} />
            </FieldWrap>
            <FieldWrap label="Notiz">
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} />
            </FieldWrap>
          </div>

          {benchmark && benchmark.tenants >= 3 && (
            <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-lg text-sm">
              <BarChart3 size={18} className="text-indigo-600 shrink-0" />
              <span className="text-indigo-800 dark:text-indigo-300">
                Plattform-Benchmark ({benchmark.tenants} Broker): Abschluss Ø <strong>{benchmark.acquisitionRate}%</strong>,
                Bestand Ø <strong>{benchmark.recurringRate}%</strong>
              </span>
            </div>
          )}

          {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={saving}>Abbrechen</Button>
            <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={18} /> : 'Speichern'}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm';

const FieldWrap: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);
