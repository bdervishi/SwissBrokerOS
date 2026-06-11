import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Check, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

/**
 * Shared multi-step wizard shell for the detailed capture forms
 * (Policy / Asset / TaxReturn). Renders a step indicator, per-step
 * validation on "Weiter", free back-navigation, and a finish action.
 */

export interface WizardStep {
  /** Short label under the step bullet. */
  label: string;
  content: React.ReactNode;
  /** Return an error message to block leaving this step, or null. */
  validate?: () => string | null;
}

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  steps: WizardStep[];
  onFinish: () => Promise<void> | void;
  saving?: boolean;
  finishLabel?: string;
  /** Error from the save call (shown above the footer). */
  externalError?: string | null;
  maxWidth?: string;
}

export const WizardModal: React.FC<WizardModalProps> = ({
  isOpen, onClose, title, steps, onFinish, saving = false,
  finishLabel = 'Speichern', externalError = null, maxWidth = 'max-w-2xl',
}) => {
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) { setStep(0); setVisited(0); setStepError(null); }
  }, [isOpen]);

  const validateCurrent = (): boolean => {
    const err = steps[step]?.validate?.() ?? null;
    setStepError(err);
    return !err;
  };

  const next = () => {
    if (!validateCurrent()) return;
    const n = Math.min(step + 1, steps.length - 1);
    setStep(n);
    setVisited((v) => Math.max(v, n));
  };

  const back = () => { setStepError(null); setStep((s) => Math.max(0, s - 1)); };
  const jump = (i: number) => {
    if (i === step) return;
    // forward jumps only onto already-visited steps, and only if current is valid
    if (i > step && !validateCurrent()) return;
    if (i <= visited) { setStepError(null); setStep(i); }
  };

  const finish = async () => {
    if (!validateCurrent()) return;
    await onFinish();
  };

  const isLast = step === steps.length - 1;
  const error = stepError || externalError;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth}>
      {/* Step indicator */}
      <div className="flex items-start mb-6 px-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && (
              <div className={`flex-1 h-0.5 rounded mt-[18px] mx-2 transition-colors ${i <= visited ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
            <button
              type="button"
              onClick={() => jump(i)}
              disabled={i > visited}
              className="flex flex-col items-center gap-1.5 shrink-0 disabled:cursor-default"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all
                  ${i === step
                    ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-600/30 scale-110'
                    : i < step
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : i <= visited
                        ? 'bg-white dark:bg-slate-900 border-brand-300 text-brand-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'}`}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${i === step ? 'text-brand-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[300px] max-h-[55vh] overflow-y-auto pr-1 space-y-4 animate-in fade-in duration-200" key={step}>
        {steps[step]?.content}
      </div>

      {error && (
        <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded mt-3">{error}</p>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
        <Button variant="ghost" onClick={step === 0 ? onClose : back} disabled={saving}>
          {step === 0 ? 'Abbrechen' : (<span className="flex items-center gap-1"><ArrowLeft size={16} /> Zurück</span>)}
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Schritt {step + 1} / {steps.length}</span>
          {isLast ? (
            <Button onClick={finish} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : finishLabel}
            </Button>
          ) : (
            <Button onClick={next}>
              <span className="flex items-center gap-1">Weiter <ArrowRight size={16} /></span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ---- shared field helpers for the wizard forms -----------------------------
export const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm';

export const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{children}</label>
);

export const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }> =
  ({ label, value, onChange, type = 'text', placeholder }) => (
    <div className="space-y-1">
      <FieldLabel>{label}</FieldLabel>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  );

export const SelectField: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] | string[]; allowEmpty?: boolean }> =
  ({ label, value, onChange, options, allowEmpty = true }) => (
    <div className="space-y-1">
      <FieldLabel>{label}</FieldLabel>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {allowEmpty && <option value="">–</option>}
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return <option key={opt.value} value={opt.value}>{opt.label}</option>;
        })}
      </select>
    </div>
  );

/** Read-only summary line for final wizard steps. */
export const SummaryRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <span className="text-xs text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{value || '–'}</span>
  </div>
);
