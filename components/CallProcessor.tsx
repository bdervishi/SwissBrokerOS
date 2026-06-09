import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { callsApi, ProcessResult } from '../src/services/calls';
import { Loader2, CheckCircle2, Phone } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  clientId?: string;
  onDone?: () => void;
}

export const CallProcessor: React.FC<Props> = ({ isOpen, onClose, tenantId, clientId, onDone }) => {
  const [transcript, setTranscript] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const reset = () => { setTranscript(''); setConsent(false); setResult(null); setError(null); };
  const close = () => { reset(); onClose(); };

  const run = async () => {
    setError(null);
    if (!transcript.trim()) { setError('Bitte ein Transkript einfügen.'); return; }
    setBusy(true);
    try {
      const res = await callsApi.process({ tenantId, clientId, transcript: transcript.trim(), consentCaptured: consent });
      setResult(res);
      onDone?.();
    } catch (e: any) {
      setError(e?.message || 'Verarbeitung fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Gespräch verarbeiten" maxWidth="max-w-2xl">
      {result ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold"><CheckCircle2 size={18} /> Verarbeitet</div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Zusammenfassung</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{result.summary}</p>
          </div>
          {!!result.outcome?.actions?.length && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Folgeaktionen</p>
              <ul className="space-y-1 text-sm">
                {result.outcome.actions.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-bold">{a.type}</span>
                    {a.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-slate-400">{result.created?.notes ?? 0} Notiz · {result.created?.events ?? 0} Aufgabe(n) erstellt.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={reset}>Weiteres verarbeiten</Button>
            <Button onClick={close}>Fertig</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 items-start text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
            <Phone size={16} className="text-brand-600 shrink-0 mt-0.5" />
            <span>Füge das Transkript eines (telefonischen) Gesprächs ein. Die KI erstellt eine Zusammenfassung als Notiz und Folge-Aufgaben.</span>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={9}
            placeholder="Transkript einfügen…"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            Einwilligung zur Aufzeichnung/Verarbeitung wurde eingeholt
          </label>
          {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={close} disabled={busy}>Abbrechen</Button>
            <Button onClick={run} disabled={busy}>{busy ? <Loader2 className="animate-spin" size={18} /> : 'Verarbeiten'}</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
