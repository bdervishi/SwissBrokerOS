import React, { useEffect, useState } from 'react';
import { db } from '../../src/services/db';
import { Asset, AssetType, MortgageScenario } from '../../types';
import { WizardModal, WizardStep, Field, FieldLabel, SelectField, SummaryRow, inputCls } from './Wizard';
import { Wallet, PiggyBank, Heart, Building2, LineChart, Home, Package } from 'lucide-react';

/**
 * Detailed create/edit WIZARD for Vermögen & Vorsorge (3 steps:
 * Typ -> Basisdaten -> Details). Type-specific detail fields are stored in
 * the JSONB `details` column (see database_detail_capture.sql).
 */

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  [AssetType.CASH]: 'Konto / Bargeld',
  [AssetType.PILLAR_3A]: 'Säule 3a',
  [AssetType.PILLAR_3B]: 'Säule 3b',
  [AssetType.PENSION_FUND]: 'Pensionskasse (2. Säule)',
  [AssetType.SECURITIES]: 'Wertschriften / Depot',
  [AssetType.REAL_ESTATE]: 'Immobilie',
  [AssetType.OTHER]: 'Sonstiges',
};

const TYPE_CARDS: { type: AssetType; icon: React.ReactNode; hint: string }[] = [
  { type: AssetType.PILLAR_3A, icon: <PiggyBank size={22} />, hint: 'Gebundene Vorsorge' },
  { type: AssetType.PILLAR_3B, icon: <Heart size={22} />, hint: 'Freie Vorsorge' },
  { type: AssetType.PENSION_FUND, icon: <Building2 size={22} />, hint: 'BVG / Altersguthaben' },
  { type: AssetType.SECURITIES, icon: <LineChart size={22} />, hint: 'Aktien, Fonds, ETF' },
  { type: AssetType.REAL_ESTATE, icon: <Home size={22} />, hint: 'Wohneigentum, Renditeobjekt' },
  { type: AssetType.CASH, icon: <Wallet size={22} />, hint: 'Privat-, Spar-, Festgeldkonto' },
  { type: AssetType.OTHER, icon: <Package size={22} />, hint: 'Kunst, Fahrzeuge, …' },
];

interface AssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  clientId: string;
  /** Mortgages of this client – for linking a financed property. */
  mortgages?: MortgageScenario[];
  /** Edit mode when set. */
  initial?: Asset | null;
}

interface AssetFormState {
  type: AssetType;
  name: string;
  value: string;
  purchaseValue: string;
  provider: string;
  lastUpdated: string;
  notes: string;
  details: Record<string, string>;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyState = (): AssetFormState => ({
  type: AssetType.PILLAR_3A, name: '', value: '', purchaseValue: '',
  provider: '', lastUpdated: today(), notes: '', details: {},
});

const fromAsset = (a: Asset): AssetFormState => ({
  type: a.type,
  name: a.name ?? '',
  value: a.value != null ? String(a.value) : '',
  purchaseValue: a.purchaseValue != null ? String(a.purchaseValue) : '',
  provider: a.provider ?? '',
  lastUpdated: a.lastUpdated || today(),
  notes: a.notes ?? '',
  details: Object.fromEntries(
    Object.entries(a.details ?? {}).map(([k, v]) => [k, v != null ? String(v) : '']),
  ),
});

// Numeric detail keys get coerced back to numbers before saving.
const NUMERIC_DETAILS = new Set([
  'annualContribution', 'interestRate', 'insuredSalary', 'contributionRate',
  'purchasePotential', 'riskClass', 'ter', 'rentalIncome', 'constructionYear',
]);

export const AssetForm: React.FC<AssetFormProps> = ({
  isOpen, onClose, onSaved, clientId, mortgages = [], initial,
}) => {
  const [form, setForm] = useState<AssetFormState>(emptyState());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setForm(initial ? fromAsset(initial) : emptyState());
    }
  }, [isOpen, initial]);

  const set = (patch: Partial<AssetFormState>) => setForm((f) => ({ ...f, ...patch }));
  const setDetail = (key: string, value: string) =>
    setForm((f) => ({ ...f, details: { ...f.details, [key]: value } }));
  const pickType = (t: AssetType) => {
    if (initial) return; // type is fixed while editing
    setForm((f) => ({ ...f, type: t, details: {} }));
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const details: Record<string, any> = {};
      for (const [k, v] of Object.entries(form.details)) {
        if (v === '' || v == null) continue;
        details[k] = NUMERIC_DETAILS.has(k) ? Number(v) : v;
      }
      const payload: any = {
        type: form.type,
        name: form.name.trim(),
        value: Number(form.value) || 0,
        purchaseValue: form.purchaseValue !== '' ? Number(form.purchaseValue) : null,
        provider: form.provider.trim() || null,
        lastUpdated: form.lastUpdated || today(),
        notes: form.notes.trim() || null,
        details,
      };
      if (initial) {
        await db.assets.update(initial.id, payload);
      } else {
        await db.assets.create({ ...payload, clientId });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Speichern fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  };

  const d = form.details;

  const steps: WizardStep[] = [
    {
      label: 'Typ',
      content: (
        <div className="grid grid-cols-2 gap-3">
          {TYPE_CARDS.map((c) => {
            const active = form.type === c.type;
            return (
              <button
                key={c.type}
                type="button"
                onClick={() => pickType(c.type)}
                disabled={!!initial && !active}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all
                  ${active
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 bg-white dark:bg-slate-900'}
                  ${initial && !active ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {c.icon}
                </div>
                <div>
                  <p className={`font-bold text-sm ${active ? 'text-brand-700 dark:text-brand-300' : 'text-slate-900 dark:text-slate-100'}`}>
                    {ASSET_TYPE_LABELS[c.type]}
                  </p>
                  <p className="text-[11px] text-slate-400">{c.hint}</p>
                </div>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      label: 'Basisdaten',
      validate: () => (!form.name.trim() ? 'Bezeichnung ist erforderlich.' : null),
      content: (
        <>
          <Field label="Bezeichnung *" value={form.name} onChange={(v) => set({ name: v })} placeholder="z.B. 3a-Konto VIAC" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Aktueller Wert (CHF)" type="number" value={form.value} onChange={(v) => set({ value: v })} />
            <Field label="Einstandswert (CHF)" type="number" value={form.purchaseValue} onChange={(v) => set({ purchaseValue: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Anbieter / Bank / Versicherung" value={form.provider} onChange={(v) => set({ provider: v })} placeholder="z.B. ZKB, VIAC, Swiss Life" />
            <Field label="Stichtag" type="date" value={form.lastUpdated} onChange={(v) => set({ lastUpdated: v })} />
          </div>
          {form.type === AssetType.PENSION_FUND && (
            <p className="text-[11px] text-slate-400">«Aktueller Wert» = Altersguthaben gemäss PK-Ausweis.</p>
          )}
        </>
      ),
    },
    {
      label: 'Details',
      content: (
        <>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Details – {ASSET_TYPE_LABELS[form.type]}
          </p>

          {(form.type === AssetType.PILLAR_3A || form.type === AssetType.PILLAR_3B) && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Vertragsform" value={d.vehicle ?? ''} onChange={(v) => setDetail('vehicle', v)} options={['Bankstiftung', 'Versicherungspolice', 'Wertschriften (3a-Fonds)']} />
                <Field label="Jahresbeitrag (CHF)" type="number" value={d.annualContribution ?? ''} onChange={(v) => setDetail('annualContribution', v)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Begünstigung" value={d.beneficiary ?? ''} onChange={(v) => setDetail('beneficiary', v)} placeholder="gesetzl. / Person" />
                <Field label="Laufzeit bis" type="date" value={d.maturityDate ?? ''} onChange={(v) => setDetail('maturityDate', v)} />
                <Field label="Zins / Rendite (%)" type="number" value={d.interestRate ?? ''} onChange={(v) => setDetail('interestRate', v)} />
              </div>
            </>
          )}

          {form.type === AssetType.PENSION_FUND && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Arbeitgeber" value={d.employer ?? ''} onChange={(v) => setDetail('employer', v)} />
                <Field label="Versicherter Lohn (CHF)" type="number" value={d.insuredSalary ?? ''} onChange={(v) => setDetail('insuredSalary', v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Beitragssatz (%)" type="number" value={d.contributionRate ?? ''} onChange={(v) => setDetail('contributionRate', v)} />
                <Field label="Einkaufspotenzial (CHF)" type="number" value={d.purchasePotential ?? ''} onChange={(v) => setDetail('purchasePotential', v)} />
              </div>
            </>
          )}

          {form.type === AssetType.SECURITIES && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Depotart" value={d.custodyType ?? ''} onChange={(v) => setDetail('custodyType', v)} options={['Bankdepot', 'Online-Broker', 'Vermögensverwaltung']} />
                <SelectField label="Strategie" value={d.strategy ?? ''} onChange={(v) => setDetail('strategy', v)} options={['Einkommen', 'Ausgewogen', 'Wachstum', 'Aktien']} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Risikoklasse (1–5)" value={d.riskClass ?? ''} onChange={(v) => setDetail('riskClass', v)} options={['1', '2', '3', '4', '5']} />
                <Field label="TER (%)" type="number" value={d.ter ?? ''} onChange={(v) => setDetail('ter', v)} />
              </div>
            </>
          )}

          {form.type === AssetType.REAL_ESTATE && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Objekttyp" value={d.propertyType ?? ''} onChange={(v) => setDetail('propertyType', v)} options={['Einfamilienhaus', 'Eigentumswohnung', 'Mehrfamilienhaus', 'Gewerbe', 'Bauland']} />
                <SelectField label="Nutzung" value={d.usage ?? ''} onChange={(v) => setDetail('usage', v)} options={['Eigennutzung', 'Vermietet', 'Ferienobjekt']} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mietertrag p.a. (CHF)" type="number" value={d.rentalIncome ?? ''} onChange={(v) => setDetail('rentalIncome', v)} />
                <Field label="Baujahr" type="number" value={d.constructionYear ?? ''} onChange={(v) => setDetail('constructionYear', v)} />
              </div>
              {mortgages.length > 0 && (
                <div className="space-y-1">
                  <FieldLabel>Verknüpfte Hypothek</FieldLabel>
                  <select value={d.linkedMortgageId ?? ''} onChange={(e) => setDetail('linkedMortgageId', e.target.value)} className={inputCls}>
                    <option value="">– keine –</option>
                    {mortgages.map((m) => (
                      <option key={m.id} value={m.id}>{m.propertyName} (CHF {Number(m.loanAmount).toLocaleString()})</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {form.type === AssetType.CASH && (
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Kontoart" value={d.accountType ?? ''} onChange={(v) => setDetail('accountType', v)} options={['Privatkonto', 'Sparkonto', 'Festgeld', 'Fremdwährung']} />
              <Field label="Zins (%)" type="number" value={d.interestRate ?? ''} onChange={(v) => setDetail('interestRate', v)} />
            </div>
          )}

          {form.type === AssetType.OTHER && (
            <Field label="Beschreibung" value={d.description ?? ''} onChange={(v) => setDetail('description', v)} placeholder="z.B. Kunstsammlung, Oldtimer" />
          )}

          <div className="space-y-1 pt-2">
            <FieldLabel>Notizen</FieldLabel>
            <textarea value={form.notes} onChange={(e) => set({ notes: e.target.value })} className={`${inputCls} min-h-[60px]`} />
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Zusammenfassung</p>
            <SummaryRow label="Typ" value={ASSET_TYPE_LABELS[form.type]} />
            <SummaryRow label="Bezeichnung" value={form.name} />
            <SummaryRow label="Wert" value={form.value ? `CHF ${Number(form.value).toLocaleString()}` : '–'} />
            <SummaryRow label="Anbieter" value={form.provider} />
          </div>
        </>
      ),
    },
  ];

  return (
    <WizardModal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Vermögenswert bearbeiten' : 'Vermögenswert erfassen'}
      steps={steps}
      onFinish={handleSave}
      saving={saving}
      finishLabel={initial ? 'Änderungen speichern' : 'Vermögenswert speichern'}
      externalError={error}
      maxWidth="max-w-2xl"
    />
  );
};
