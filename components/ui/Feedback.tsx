import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, AlertOctagon, Loader2 } from 'lucide-react';
import { Button } from './Button';

/**
 * Zentrales Feedback-System: nicht-blockierende Toasts + ein hübscher
 * Bestätigungs-Dialog. Ersetzt window.alert()/confirm().
 *
 *   const toast = useToast();
 *   toast.success('Gespeichert');               toast.error('Fehlgeschlagen');
 *   const confirm = useConfirm();
 *   if (await confirm({ title: 'Löschen?', danger: true })) { ... }
 */

type ToastKind = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: string; kind: ToastKind; message: string; }

interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface FeedbackCtx {
  push: (kind: ToastKind, message: string) => void;
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
  warning: (m: string) => void;
  confirm: (o: ConfirmOptions) => Promise<boolean>;
}

const Ctx = createContext<FeedbackCtx | null>(null);

export const useToast = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useToast must be used within FeedbackProvider');
  return { push: c.push, success: c.success, error: c.error, info: c.info, warning: c.warning };
};

export const useConfirm = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useConfirm must be used within FeedbackProvider');
  return c.confirm;
};

const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : `t-${Date.now()}-${Math.random()}`);

const KIND_STYLE: Record<ToastKind, { icon: React.ReactNode; ring: string }> = {
  success: { icon: <CheckCircle2 size={18} className="text-emerald-500" />, ring: 'border-l-emerald-500' },
  error: { icon: <AlertOctagon size={18} className="text-red-500" />, ring: 'border-l-red-500' },
  warning: { icon: <AlertTriangle size={18} className="text-amber-500" />, ring: 'border-l-amber-500' },
  info: { icon: <Info size={18} className="text-brand-500" />, ring: 'border-l-brand-500' },
};

export const FeedbackProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const timers = useRef<Record<string, any>>({});

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    if (timers.current[id]) { clearTimeout(timers.current[id]); delete timers.current[id]; }
  }, []);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = uid();
    setToasts((t) => [...t, { id, kind, message }]);
    timers.current[id] = setTimeout(() => remove(id), kind === 'error' ? 6000 : 4000);
  }, [remove]);

  const confirm = useCallback((o: ConfirmOptions) => new Promise<boolean>((resolve) => {
    setConfirmState({ ...o, resolve });
  }), []);

  const closeConfirm = (value: boolean) => {
    confirmState?.resolve(value);
    setConfirmState(null);
  };

  // ESC / Enter on the confirm dialog
  useEffect(() => {
    if (!confirmState) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeConfirm(false);
      if (e.key === 'Enter') closeConfirm(true);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [confirmState]);

  const value: FeedbackCtx = {
    push,
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
    warning: (m) => push('warning', m),
    confirm,
  };

  return (
    <Ctx.Provider value={value}>
      {children}

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 w-[340px] max-w-[calc(100vw-2rem)] pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id}
            className={`pointer-events-auto flex items-start gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-l-4 ${KIND_STYLE[t.kind].ring} rounded-xl shadow-xl p-3.5 animate-in slide-in-from-right-4 fade-in duration-200`}>
            <div className="shrink-0 mt-0.5">{KIND_STYLE[t.kind].icon}</div>
            <p className="flex-1 text-sm text-slate-700 dark:text-slate-200 leading-snug">{t.message}</p>
            <button onClick={() => remove(t.id)} className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors"><X size={15} /></button>
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      {confirmState && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150" onClick={() => closeConfirm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${confirmState.danger ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-600'}`}>
                {confirmState.danger ? <AlertTriangle size={22} /> : <Info size={22} />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{confirmState.title}</h3>
                {confirmState.body && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{confirmState.body}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => closeConfirm(false)}>{confirmState.cancelLabel || 'Abbrechen'}</Button>
              <Button onClick={() => closeConfirm(true)} className={confirmState.danger ? 'bg-red-600 hover:bg-red-700 border-red-600' : ''}>
                {confirmState.confirmLabel || 'Bestätigen'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
};
