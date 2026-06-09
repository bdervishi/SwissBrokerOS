import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Lock, Loader2, CheckCircle2, Home } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);      // recovery session detected
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    // Supabase emits PASSWORD_RECOVERY once it parses the recovery token from the URL.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    // Also handle the case where the session is already present.
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError('Mindestens 8 Zeichen.'); return; }
    if (password !== confirm) { setError('Passwörter stimmen nicht überein.'); return; }
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) { setError(err.message); return; }
      setDone(true);
      setTimeout(() => navigate('/login/broker'), 1800);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 text-sm font-bold"><Home size={16} /> Zur Startseite</Link>
        <Card className="p-8">
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">Passwort zurücksetzen</h1>
          {done ? (
            <div className="mt-6 flex flex-col items-center text-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={40} />
              <p className="text-slate-600 dark:text-slate-300">Passwort aktualisiert. Du wirst zum Login weitergeleitet…</p>
            </div>
          ) : !ready ? (
            <p className="text-sm text-slate-500 mt-4">Öffne diese Seite über den Link aus der Passwort-Reset-E-Mail. Warte einen Moment, während die Sitzung geprüft wird…</p>
          ) : (
            <form onSubmit={submit} className="space-y-4 mt-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Neues Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input type="password" autoFocus required value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono" placeholder="••••••••" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Passwort bestätigen</label>
                <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono" placeholder="••••••••" />
              </div>
              {error && <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/20 py-2 px-3 rounded">{error}</p>}
              <Button className="w-full py-5 font-black uppercase tracking-widest" disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : 'Passwort speichern'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
