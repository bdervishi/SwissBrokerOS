import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { db } from '../../src/services/db';
import { TaxReturn, TaxReturnStatus } from '../../types';
import { ClientLite } from './PolicyForm';
import { Loader2 } from 'lucide-react';

/**
 * Create/edit form for tax mandates: client/year/canton plus itemised Swiss
 * deductions. `deductionsTotal` is computed automatically from the line items.
 */

export const SWISS_CANTONS = [
  'Aargau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Basel-Landschaft',
  'Basel-Stadt', 'Bern', 'Freiburg', 'Genf', 'Glarus', 'Graubünden', 'Jura',
  'Luzern', 'Neuenburg', 'Nidwalden', 'Obwalden', 'Schaffhausen', 'Schwyz',
  'Solothurn', 'St. Gallen', 'Tessin', 'Thurgau', 'Uri', 'Waadt', 'Wallis',
  'Zug', 'Zürich',
];

const STATUS_OPTIONS: { value: TaxReturnStatus; label: string }[] = [
  { value: 'OPEN', label: 'Offen' },
  { value: 'DOCS_MISSING', label: 'Unterlagen fehlen' },
  { value: 'IN_PROGRESS', label: 'In Bearbeitung' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'SUBMITTED', label: 'Eingereicht' },
  { value: 'ARCHIVED', label: 'Archiviert' },
];

// label + state key for each deduction line item
export const DEDUCTION_FIELDS: { key: DeductionKey; label: string }[] = [
  { key: 'occupationalExpenses', label: 'Berufsauslagen' },
  { key: 'insurancePremiums', label: 'Versicherungsprämien (KVG/VVG)' },
  { key: 'pillar3aContributions', label: 'Säule 3a' },
  { key: 'debtInterest', label: 'Schuldzinsen' },
  { key: 'medicalExpenses', label: 'Krankheitskosten' },
  { key: 'donations', label: 'Spenden' },
  { key: 'childcareCosts', label: 'Kinderbetreuung' },
  { key: 'educationCosts', label: 'Weiterbildung' },
];

type DeductionKey =
  | 'occupationalExpenses' | 'insurancePremiums' | 'pillar3aContributions'
  | 'debtInterest' | 'medicalExpenses' | 'donations' | 'childcareCosts'
  | 'educationCosts';

interface TaxFormState {
  clientId: string;
  year: string;
  canton: string;
  municipality: string;
  status: TaxReturnStatus;
  deadline: string;
  submittedAt: string;
  grossIncome: string;
  taxableIncome: string;
  notes: string;
  deductions: Record<DeductionKey, string>;
}

const emptyDeductions = (): Record<DeductionKey, string> =>
  Object.fromEntries(DEDUCTION_FIELDS.map((f) => [f.key, ''])) as Record<DeductionKey, string>;

const emptyState = (defaultYear: number): TaxFormState => ({
  clientId: '', year: String(defaultYear), canton: 'Zürich', municipality: '',
  status: 'OPEN', deadline: `${defaultYear + 1}-03-31`, submittedAt: '',
  grossIncome: '', taxableIncome: '', notes: '', deductions: emptyDeductions(),
});

const fromReturn = (tr: TaxReturn): TaxFormState => ({
  clientId: tr.clientId,
  year: String(tr.year),
  canton: tr.canton ?? 'Zürich',
  municipality: tr.municipality ?? '',
  status: tr.status,
  deadline: tr.deadline ?? '',
  submittedAt: tr.submittedAt ?? '',
  grossIncome: tr.grossIncome != null && tr.grossIncome !== 0 ? String(tr.grossIncome) : '',
  taxableIncome: tr.taxableIncome != null && tr.taxableIncome !== 0 ? String(tr.taxableIncome) : '',
  notes: tr.notes ?? '',
  deductions: Object.fromEntries(
    DEDUCTION_FIELDS.map((f) => {
      const v = tr[f.key];
      return [f.key, v != null && v !== 0 ? String(v) : ''];
    }),
  ) as Record<DeductionKey, string>,
});

interface TaxReturnFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  clients: ClientLite[];
  defaultYear: number;
  /** Edit mode when set. */
  initial?: TaxReturn | null;
}

export const TaxReturnForm: React.FC<TaxReturnFormProps> = ({
  isOpen, onClose, onSaved, clients, defaultYear, initial,
}) => {
  const [form, setForm] = useState<TaxFormState>(emptyState(defaultYear));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setForm(initial ? fromReturn(initial) : emptyState(defaultYear));
    }
  }, [isOpen, initial, defaultYear]);

  const set = (patch: Partial<TaxFormState>) => setForm((f) => ({ ...f, ...patch }));
  const setDeduction = (key: DeductionKey, value: string) =>
    setForm((f) => ({ ...f, deductions: { ...f.deductions, [key]: value } }));

  const deductionsTotal = useMemo(
    () => DEDUCTION_FIELDS.reduce((sum, f) => sum + (Number(form.deductions[f.key]) || 0), 0),
    [form.deductions],
  );

  const handleSave = async () => {
    setError(null);
    if (!form.clientId) { setError('Bitte einen Kunden wählen.'); return; }
    const year = Number(form.year);
    if (!year || year < 2000 || year > 2100) { setError('Bitte ein gültiges Steuerjahr angeben.'); return; }
    setSaving(true);
    try {
      const owner = clients.find((c) => c.id === form.clientId);
      const payload: any = {
        year,
        canton: form.canton,
        municipality: form.municipality.trim() || null,
        status: form.status,
        deadline: form.deadline || null,
        submittedAt: form.submittedAt || null,
        grossIncome: Number(form.grossIncome) || 0,
        taxableIncome: Number(form.taxableIncome) || 0,
        deductionsTotal,
        notes: form.notes.trim() || null,
      };
      for (const f of DEDUCTION_FIELDS) payload[f.key] = Number(form.deductions[f.key]) || 0;

      if (initial) {
        await db.taxReturns.update(initial.id, payload);
      } else {
        await db.taxReturns.create({ ...payload, clientId: form.clientId, tenantId: owner?.tenantId });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Speichern fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Steuermandat bearbeiten' : 'Neues Steuermandat'} maxWidth="max-w-3xl">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Mandat */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <FieldLabel>Kunde *</FieldLabel>
            <select value={form.clientId} onChange={(e) => set({ clientId: e.target.value })} className={inputCls} disabled={!!initial}>
              <option value="">– Kunde wählen –</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName ? c.companyName : `${c.firstName} ${c.lastName}`}</option>
              ))}
            </select>
          </div>
          <Field label="Steuerjahr *" type="number" value={form.year} onChange={(v) => set({ year: v })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <FieldLabel>Kanton</FieldLabel>
            <select value={form.canton} onChange={(e) => set({ canton: e.target.value })} className={inputCls}>
              {SWISS_CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Gemeinde" value={form.municipality} onChange={(v) => set({ municipality: v })} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <FieldLabel>Status</FieldLabel>
            <select value={form.status} onChange={(e) => set({ status: e.target.value as TaxReturnStatus })} className={inputCls}>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <Field label="Frist" type="date" value={form.deadline} onChange={(v) => set({ deadline: v })} />
          <Field label="Eingereicht am" type="date" value={form.submittedAt} onChange={(v) => set({ submittedAt: v })} />
        </div>

        {/* Einkommen */}
        <SectionTitle>Einkommen</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bruttoeinkommen (CHF)" type="number" value={form.grossIncome} onChange={(v) => set({ grossIncome: v })} />
          <Field label="Steuerbares Einkommen (CHF)" type="number" value={form.taxableIncome} onChange={(v) => set({ taxableIncome: v })} />
        </div>

        {/* Abzüge */}
        <SectionTitle>Abzüge</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {DEDUCTION_FIELDS.map((f) => (
            <Field key={f.key} label={`${f.label} (CHF)`} type="number" value={form.deductions[f.key]} onChange={(v) => setDeduction(f.key, v)} />
          ))}
        </div>
        <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-lg px-4 py-3">
          <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Abzüge Total (automatisch)</span>
          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">CHF {deductionsTotal.toLocaleString()}</span>
        </div>

        <div className="space-y-1">
          <FieldLabel>Interne Notiz</FieldLabel>
          <textarea value={form.notes} onChange={(e) => set({ notes: e.target.value })} className={`${inputCls} min-h-[60px]`} />
        </div>

        {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">{error}</p>}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={saving}>Abbrechen</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={18} /> : (initial ? 'Änderungen speichern' : 'Mandat anlegen')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ---- field helpers ---------------------------------------------------------
const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm';

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{children}</label>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-100 dark:border-slate-800">{children}</h4>
);

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string }> =
  ({ label, value, onChange, type = 'text' }) => (
    <div className="space-y-1">
      <FieldLabel>{label}</FieldLabel>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  );
