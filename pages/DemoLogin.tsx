import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase';
import { demoApi } from '../src/services/demo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Mail, Loader2, CheckCircle2, Home, PlayCircle } from 'lucide-react';

export const DemoLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes('@')) { setError('Bitte eine gültige E-Mail eingeben.'); return; }
    if (!isSupabaseConfigured) { setError('Demo-Zugang ist in diesem Modus nicht verfügbar.'); return; }
    setBusy(true);
    try {
      // 1. Server checks the allow-list and provisions a demo account if allowed.
      const { eligible } = await demoApi.requestAccess(email.trim().toLowerCase());
      // 2. Only existing (allow-listed) accounts receive a magic link.
      if (eligible) {
        await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/#/dashboard` },
        });
      }
      // Always show the same message – never reveal who is on the list.
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 text-sm font-bold"><Home size={16} /> Zur Startseite</Link>
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-2 text-brand-600"><PlayCircle size={22} /><span className="font-black uppercase tracking-wider">Demo-Zugang</span></div>
          {sent ? (
            <div className="mt-4 flex flex-col items-center text-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={40} />
              <p className="text-slate-700 dark:text-slate-300 font-medium">Falls deine Adresse freigeschaltet ist, haben wir dir einen Anmelde-Link per E-Mail geschickt.</p>
              <p className="text-xs text-slate-400">Öffne den Link in der E-Mail, um die Demo zu starten.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 mt-4">
              <p className="text-sm text-slate-500">Gib deine freigeschaltete E-Mail-Adresse ein. Wir senden dir einen passwortlosen Anmelde-Link.</p>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" placeholder="name@firma.ch" />
              </div>
              {error && <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/20 py-2 px-3 rounded">{error}</p>}
              <Button className="w-full py-5 font-black uppercase tracking-widest" disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : 'Demo-Link anfordern'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
