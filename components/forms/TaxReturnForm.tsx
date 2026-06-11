import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../../src/services/db';
import { TaxReturn, TaxReturnStatus } from '../../types';
import { ClientLite } from './PolicyForm';
import { WizardModal, WizardStep, Field, FieldLabel, SelectField, SummaryRow, inputCls } from './Wizard';

/**
 * Create/edit WIZARD for tax mandates (3 steps: Mandat -> Einkommen & Abzüge
 * -> Abschluss). `deductionsTotal` is computed automatically from the
 * itemised Swiss deduction line items.
 */

export const SWISS_CANTONS = [
  'Aargau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Basel-Landschaft',
  'Basel-Stadt', 'Bern', 'Freiburg', 'Genf', 'Glarus', 'Graubünden', 'Jura',
  'Luzern', 'Neuenburg', 'Nidwalden', 'Obwalden', 'Schaffhausen', 'Schwyz',
  'Solothurn', 'St. Gallen', 'Tessin', 'Thurgau', 'Uri', 'Waadt', 'Wallis',
  'Zug', 'Zürich',
];

const STATUS_OPTIONS = [
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
    setSaving(true);
    try {
      const owner = clients.find((c) => c.id === form.clientId);
      const payload: any = {
        year: Number(form.year),
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

  const clientName = (id: string) => {
    const c = clients.find((x) => x.id === id);
    return c ? (c.companyName || `${c.firstName} ${c.lastName}`) : '';
  };

  const steps: WizardStep[] = [
    {
      label: 'Mandat',
      validate: () => {
        if (!form.clientId) return 'Bitte einen Kunden wählen.';
        const year = Number(form.year);
        if (!year || year < 2000 || year > 2100) return 'Bitte ein gültiges Steuerjahr angeben.';
        return null;
      },
      content: (
        <>
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
            <SelectField label="Kanton" value={form.canton} onChange={(v) => set({ canton: v })} options={SWISS_CANTONS} allowEmpty={false} />
            <Field label="Gemeinde" value={form.municipality} onChange={(v) => set({ municipality: v })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <SelectField label="Status" value={form.status} onChange={(v) => set({ status: v as TaxReturnStatus })} options={STATUS_OPTIONS} allowEmpty={false} />
            <Field label="Frist" type="date" value={form.deadline} onChange={(v) => set({ deadline: v })} />
            <Field label="Eingereicht am" type="date" value={form.submittedAt} onChange={(v) => set({ submittedAt: v })} />
          </div>
        </>
      ),
    },
    {
      label: 'Einkommen & Abzüge',
      content: (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bruttoeinkommen (CHF)" type="number" value={form.grossIncome} onChange={(v) => set({ grossIncome: v })} />
            <Field label="Steuerbares Einkommen (CHF)" type="number" value={form.taxableIncome} onChange={(v) => set({ taxableIncome: v })} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest pt-2">Abzüge</p>
          <div className="grid grid-cols-2 gap-3">
            {DEDUCTION_FIELDS.map((f) => (
              <Field key={f.key} label={`${f.label} (CHF)`} type="number" value={form.deductions[f.key]} onChange={(v) => setDeduction(f.key, v)} />
            ))}
          </div>
          <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-lg px-4 py-3">
            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Abzüge Total (automatisch)</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">CHF {deductionsTotal.toLocaleString()}</span>
          </div>
        </>
      ),
    },
    {
      label: 'Abschluss',
      content: (
        <>
          <div className="space-y-1">
            <FieldLabel>Interne Notiz</FieldLabel>
            <textarea value={form.notes} onChange={(e) => set({ notes: e.target.value })} className={`${inputCls} min-h-[80px]`} />
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Zusammenfassung</p>
            <SummaryRow label="Kunde" value={clientName(form.clientId)} />
            <SummaryRow label="Steuerjahr / Kanton" value={`${form.year} • ${form.canton}${form.municipality ? ` (${form.municipality})` : ''}`} />
            <SummaryRow label="Status / Frist" value={`${STATUS_OPTIONS.find((s) => s.value === form.status)?.label} • ${form.deadline || '–'}`} />
            <SummaryRow label="Steuerbares Einkommen" value={form.taxableIncome ? `CHF ${Number(form.taxableIncome).toLocaleString()}` : '–'} />
            <SummaryRow label="Abzüge Total" value={`CHF ${deductionsTotal.toLocaleString()}`} />
          </div>
        </>
      ),
    },
  ];

  return (
    <WizardModal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Steuermandat bearbeiten' : 'Neues Steuermandat'}
      steps={steps}
      onFinish={handleSave}
      saving={saving}
      finishLabel={initial ? 'Änderungen speichern' : 'Mandat anlegen'}
      externalError={error}
      maxWidth="max-w-2xl"
    />
  );
};
