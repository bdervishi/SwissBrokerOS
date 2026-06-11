import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { db } from '../../src/services/db';
import { Policy, PolicyStatus } from '../../types';
import { Loader2 } from 'lucide-react';

/** Structural client shape – avoids coupling to the (duplicated) Client type. */
export interface ClientLite {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string | null;
  tenantId?: string;
}

/**
 * Detailed create/edit form for insurance policies. Used from the Policies
 * page (with client selector) and from ClientDetail (client fixed). Covers
 * every persisted column of public.policies.
 */

export const POLICY_TYPE_SUGGESTIONS = [
  'Krankenkasse (KVG)', 'Krankenzusatz (VVG)', 'Privathaftpflicht', 'Hausrat',
  'Gebäude', 'Motorfahrzeug', 'Rechtsschutz', 'Reise', 'Wertsachen',
  'Lebensversicherung', 'Säule 3a', 'Säule 3b', 'Erwerbsunfähigkeit',
  'BVG (Pensionskasse)', 'UVG (Unfall)', 'KTG (Krankentaggeld)',
  'Betriebshaftpflicht', 'Sach / Inventar', 'Cyber', 'Transport',
];

const FREQUENCIES = ['Jährlich', 'Halbjährlich', 'Vierteljährlich', 'Monatlich'];
const PAYMENT_METHODS = ['Rechnung', 'eBill', 'LSV / Lastschrift', 'QR-Rechnung', 'Kreditkarte'];
const STATUS_OPTIONS: { value: PolicyStatus; label: string }[] = [
  { value: 'ACTIVE' as PolicyStatus, label: 'Aktiv' },
  { value: 'PENDING' as PolicyStatus, label: 'Pendent / Offerte' },
  { value: 'CANCELLED' as PolicyStatus, label: 'Gekündigt' },
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
    if (!form.clientId) { setError('Bitte einen Kunden wählen.'); return; }
    if (!form.insurer.trim() || !form.type.trim()) {
      setError('Versicherer und Sparte sind erforderlich.');
      return;
    }
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Police bearbeiten' : 'Neue Police erfassen'} maxWidth="max-w-3xl">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Kunde */}
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

        {/* Grunddaten */}
        <SectionTitle>Vertrag</SectionTitle>
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
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <FieldLabel>Status</FieldLabel>
            <select value={form.status} onChange={(e) => set({ status: e.target.value })} className={inputCls}>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <Field label="Beginn" type="date" value={form.startDate} onChange={(v) => set({ startDate: v })} />
          <Field label="Ablauf" type="date" value={form.endDate} onChange={(v) => set({ endDate: v })} />
        </div>

        {/* Prämie & Zahlung */}
        <SectionTitle>Prämie & Zahlung</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Prämie (CHF)" type="number" value={form.premiumAmount} onChange={(v) => set({ premiumAmount: v })} />
          <div className="space-y-1">
            <FieldLabel>Zahlungsrhythmus</FieldLabel>
            <select value={form.premiumFrequency} onChange={(e) => set({ premiumFrequency: e.target.value })} className={inputCls}>
              {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <FieldLabel>Zahlart</FieldLabel>
            <select value={form.paymentMethod} onChange={(e) => set({ paymentMethod: e.target.value })} className={inputCls}>
              <option value="">–</option>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Selbstbehalt (CHF)" type="number" value={form.deductible} onChange={(v) => set({ deductible: v })} />
          <Field label="Kündigungsfrist (Monate)" type="number" value={form.cancellationNoticePeriod} onChange={(v) => set({ cancellationNoticePeriod: v })} placeholder="z.B. 3" />
        </div>

        {/* Deckung */}
        <SectionTitle>Deckung</SectionTitle>
        <Field label="Versicherte Personen (kommagetrennt)" value={form.insuredPersons} onChange={(v) => set({ insuredPersons: v })} placeholder="z.B. Max Muster, Anna Muster" />
        <div className="space-y-1">
          <FieldLabel>Deckungen / Leistungen (eine pro Zeile)</FieldLabel>
          <textarea
            value={form.coverageDetails}
            onChange={(e) => set({ coverageDetails: e.target.value })}
            className={`${inputCls} min-h-[80px] font-mono text-xs`}
            placeholder={'Hausrat bis CHF 100\'000\nGlasbruch\nDiebstahl auswärts'}
          />
        </div>

        {/* Broker-intern */}
        <SectionTitle>Broker-intern</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Abschlussprovision (CHF)" type="number" value={form.initialCommission} onChange={(v) => set({ initialCommission: v })} />
          <Field label="Stornohaftung (Monate)" type="number" value={form.liabilityDurationMonths} onChange={(v) => set({ liabilityDurationMonths: v })} />
        </div>
        <div className="space-y-1">
          <FieldLabel>Interne Notizen</FieldLabel>
          <textarea value={form.notes} onChange={(e) => set({ notes: e.target.value })} className={`${inputCls} min-h-[60px]`} />
        </div>

        {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">{error}</p>}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={saving}>Abbrechen</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={18} /> : (initial ? 'Änderungen speichern' : 'Police speichern')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ---- small shared field helpers -------------------------------------------
const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm';

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{children}</label>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-100 dark:border-slate-800 first:border-0 first:pt-0">{children}</h4>
);

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }> =
  ({ label, value, onChange, type = 'text', placeholder }) => (
    <div className="space-y-1">
      <FieldLabel>{label}</FieldLabel>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  );
