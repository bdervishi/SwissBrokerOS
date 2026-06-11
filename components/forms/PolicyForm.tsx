import React, { useEffect, useState } from 'react';
import { db } from '../../src/services/db';
import { Policy, PolicyStatus } from '../../types';
import { WizardModal, WizardStep, Field, FieldLabel, SelectField, SummaryRow, inputCls } from './Wizard';

/**
 * Detailed create/edit WIZARD for insurance policies (4 steps:
 * Vertrag -> Laufzeit & Prämie -> Deckung -> Abschluss). Used from the
 * Policies page (with client selector) and from ClientDetail (client fixed).
 * Covers every persisted column of public.policies.
 */

/** Structural client shape – avoids coupling to the (duplicated) Client type. */
export interface ClientLite {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string | null;
  tenantId?: string;
}

export const POLICY_TYPE_SUGGESTIONS = [
  'Krankenkasse (KVG)', 'Krankenzusatz (VVG)', 'Privathaftpflicht', 'Hausrat',
  'Gebäude', 'Motorfahrzeug', 'Rechtsschutz', 'Reise', 'Wertsachen',
  'Lebensversicherung', 'Säule 3a', 'Säule 3b', 'Erwerbsunfähigkeit',
  'BVG (Pensionskasse)', 'UVG (Unfall)', 'KTG (Krankentaggeld)',
  'Betriebshaftpflicht', 'Sach / Inventar', 'Cyber', 'Transport',
];

const FREQUENCIES = ['Jährlich', 'Halbjährlich', 'Vierteljährlich', 'Monatlich'];
const PAYMENT_METHODS = ['Rechnung', 'eBill', 'LSV / Lastschrift', 'QR-Rechnung', 'Kreditkarte'];
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Aktiv' },
  { value: 'PENDING', label: 'Pendent / Offerte' },
  { value: 'CANCELLED', label: 'Gekündigt' },
];

interface PolicyFormState {
  clientId: string;
  insurer: string;
  type: string;
  productName: string;
  policyNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  premiumAmount: string;
  premiumFrequency: string;
  paymentMethod: string;
  deductible: string;
  cancellationNoticePeriod: string;
  insuredPersons: string;
  coverageDetails: string;
  initialCommission: string;
  liabilityDurationMonths: string;
  notes: string;
}

const emptyState = (clientId = ''): PolicyFormState => ({
  clientId, insurer: '', type: '', productName: '', policyNumber: '',
  status: 'ACTIVE', startDate: '', endDate: '', premiumAmount: '',
  premiumFrequency: 'Jährlich', paymentMethod: '', deductible: '',
  cancellationNoticePeriod: '', insuredPersons: '', coverageDetails: '',
  initialCommission: '', liabilityDurationMonths: '', notes: '',
});

const fromPolicy = (p: Policy): PolicyFormState => ({
  clientId: p.clientId,
  insurer: p.insurer ?? '',
  type: p.type ?? '',
  productName: p.productName ?? '',
  policyNumber: p.policyNumber ?? '',
  status: (p.status as string) ?? 'ACTIVE',
  startDate: p.startDate ?? '',
  endDate: p.endDate ?? '',
  premiumAmount: p.premiumAmount != null ? String(p.premiumAmount) : '',
  premiumFrequency: p.premiumFrequency ?? 'Jährlich',
  paymentMethod: p.paymentMethod ?? '',
  deductible: p.deductible != null ? String(p.deductible) : '',
  cancellationNoticePeriod: p.cancellationNoticePeriod != null ? String(p.cancellationNoticePeriod) : '',
  insuredPersons: (p.insuredPersons ?? []).join(', '),
  coverageDetails: (p.coverageDetails ?? []).join('\n'),
  initialCommission: p.initialCommission != null ? String(p.initialCommission) : '',
  liabilityDurationMonths: p.liabilityDurationMonths != null ? String(p.liabilityDurationMonths) : '',
  notes: p.notes ?? '',
});

interface PolicyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Show the client selector (Policies page). */
  clients?: ClientLite[];
  /** Fix the client (ClientDetail page). */
  fixedClientId?: string;
  fixedTenantId?: string;
  /** Edit mode when set. */
  initial?: Policy | null;
}

export const PolicyForm: React.FC<PolicyFormProps> = ({
  isOpen, onClose, onSaved, clients, fixedClientId, fixedTenantId, initial,
}) => {
  const [form, setForm] = useState<PolicyFormState>(emptyState(fixedClientId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setForm(initial ? fromPolicy(initial) : emptyState(fixedClientId));
    }
  }, [isOpen, initial, fixedClientId]);

  const set = (patch: Partial<PolicyFormState>) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const owner = clients?.find((c) => c.id === form.clientId);
      const payload: any = {
        insurer: form.insurer.trim(),
        type: form.type.trim(),
        productName: form.productName.trim() || null,
        policyNumber: form.policyNumber.trim(),
        status: form.status,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        premiumAmount: Number(form.premiumAmount) || 0,
        premiumFrequency: form.premiumFrequency,
        paymentMethod: form.paymentMethod || null,
        deductible: form.deductible !== '' ? Number(form.deductible) : null,
        cancellationNoticePeriod: form.cancellationNoticePeriod !== '' ? Number(form.cancellationNoticePeriod) : null,
        insuredPersons: form.insuredPersons.split(',').map((s) => s.trim()).filter(Boolean),
        coverageDetails: form.coverageDetails.split('\n').map((s) => s.trim()).filter(Boolean),
        initialCommission: form.initialCommission !== '' ? Number(form.initialCommission) : null,
        liabilityDurationMonths: form.liabilityDurationMonths !== '' ? Number(form.liabilityDurationMonths) : 0,
        notes: form.notes.trim() || null,
      };
      if (initial) {
        await db.policies.update(initial.id, payload);
      } else {
        await db.policies.create({
          ...payload,
          clientId: form.clientId,
          tenantId: fixedTenantId ?? owner?.tenantId,
        });
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
    const c = clients?.find((x) => x.id === id);
    return c ? (c.companyName || `${c.firstName} ${c.lastName}`) : '';
  };

  const steps: WizardStep[] = [
    {
      label: 'Vertrag',
      validate: () => {
        if (!form.clientId) return 'Bitte einen Kunden wählen.';
        if (!form.insurer.trim() || !form.type.trim()) return 'Versicherer und Sparte sind erforderlich.';
        return null;
      },
      content: (
        <>
          {!initial && clients && !fixedClientId && (
            <div className="space-y-1">
              <FieldLabel>Kunde *</FieldLabel>
              <select value={form.clientId} onChange={(e) => set({ clientId: e.target.value })} className={inputCls}>
                <option value="">– Kunde wählen –</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.companyName ? c.companyName : `${c.firstName} ${c.lastName}`}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Versicherer *" value={form.insurer} onChange={(v) => set({ insurer: v })} placeholder="z.B. Helvetia" />
            <div className="space-y-1">
              <FieldLabel>Sparte / Art *</FieldLabel>
              <input list="policy-type-suggestions" value={form.type} onChange={(e) => set({ type: e.target.value })} className={inputCls} placeholder="z.B. Hausrat" />
              <datalist id="policy-type-suggestions">
                {POLICY_TYPE_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
              </datalist>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Produktname" value={form.productName} onChange={(v) => set({ productName: v })} placeholder="z.B. Komfort Plus" />
            <Field label="Policennummer" value={form.policyNumber} onChange={(v) => set({ policyNumber: v })} />
          </div>
          <SelectField label="Status" value={form.status} onChange={(v) => set({ status: v })} options={STATUS_OPTIONS} allowEmpty={false} />
        </>
      ),
    },
    {
      label: 'Laufzeit & Prämie',
      content: (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Beginn" type="date" value={form.startDate} onChange={(v) => set({ startDate: v })} />
            <Field label="Ablauf" type="date" value={form.endDate} onChange={(v) => set({ endDate: v })} />
            <Field label="Kündigungsfrist (Monate)" type="number" value={form.cancellationNoticePeriod} onChange={(v) => set({ cancellationNoticePeriod: v })} placeholder="z.B. 3" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Prämie (CHF)" type="number" value={form.premiumAmount} onChange={(v) => set({ premiumAmount: v })} />
            <SelectField label="Zahlungsrhythmus" value={form.premiumFrequency} onChange={(v) => set({ premiumFrequency: v })} options={FREQUENCIES} allowEmpty={false} />
            <SelectField label="Zahlart" value={form.paymentMethod} onChange={(v) => set({ paymentMethod: v })} options={PAYMENT_METHODS} />
          </div>
          <Field label="Selbstbehalt (CHF)" type="number" value={form.deductible} onChange={(v) => set({ deductible: v })} />
        </>
      ),
    },
    {
      label: 'Deckung',
      content: (
        <>
          <Field label="Versicherte Personen (kommagetrennt)" value={form.insuredPersons} onChange={(v) => set({ insuredPersons: v })} placeholder="z.B. Max Muster, Anna Muster" />
          <div className="space-y-1">
            <FieldLabel>Deckungen / Leistungen (eine pro Zeile)</FieldLabel>
            <textarea
              value={form.coverageDetails}
              onChange={(e) => set({ coverageDetails: e.target.value })}
              className={`${inputCls} min-h-[140px] font-mono text-xs`}
              placeholder={'Hausrat bis CHF 100\'000\nGlasbruch\nDiebstahl auswärts'}
            />
          </div>
        </>
      ),
    },
    {
      label: 'Abschluss',
      content: (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Abschlussprovision (CHF)" type="number" value={form.initialCommission} onChange={(v) => set({ initialCommission: v })} />
            <Field label="Stornohaftung (Monate)" type="number" value={form.liabilityDurationMonths} onChange={(v) => set({ liabilityDurationMonths: v })} />
          </div>
          <div className="space-y-1">
            <FieldLabel>Interne Notizen</FieldLabel>
            <textarea value={form.notes} onChange={(e) => set({ notes: e.target.value })} className={`${inputCls} min-h-[60px]`} />
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 mt-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Zusammenfassung</p>
            {(!initial && clients && !fixedClientId) && <SummaryRow label="Kunde" value={clientName(form.clientId)} />}
            <SummaryRow label="Versicherer / Sparte" value={`${form.insurer || '–'} • ${form.type || '–'}`} />
            <SummaryRow label="Prämie" value={form.premiumAmount ? `CHF ${Number(form.premiumAmount).toLocaleString()} (${form.premiumFrequency})` : '–'} />
            <SummaryRow label="Laufzeit" value={form.startDate || form.endDate ? `${form.startDate || '?'} – ${form.endDate || 'offen'}` : '–'} />
            <SummaryRow label="Status" value={STATUS_OPTIONS.find((s) => s.value === form.status)?.label} />
          </div>
        </>
      ),
    },
  ];

  return (
    <WizardModal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Police bearbeiten' : 'Neue Police erfassen'}
      steps={steps}
      onFinish={handleSave}
      saving={saving}
      finishLabel={initial ? 'Änderungen speichern' : 'Police speichern'}
      externalError={error}
      maxWidth="max-w-2xl"
    />
  );
};
