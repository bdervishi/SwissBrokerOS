
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../src/lib/supabase';
import { USE_MOCK } from '../src/services/db';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { User, ArrowRight, ShieldCheck, Loader2, Lock, Building2, Users, ShieldAlert, Home, Mail, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { role: roleParam } = useParams<{ role: string }>();
  const { loginStep, requestOtl, verifyOtl, completeLogin, sendMagicLink, isAuthenticated } = useAuth();
  const realAuth = isSupabaseConfigured && !USE_MOCK;
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Branding based on role
  const roleThemes: Record<string, any> = {
    broker: { title: 'Broker Portal', bg: 'bg-brand-50/30', icon: <Building2 className="text-brand-600" size={32} />, desc: 'Für Makler-Inhaber & Mitarbeiter' },
    client: { title: 'Kunden Portal', bg: 'bg-emerald-50/30', icon: <Users className="text-emerald-600" size={32} />, desc: 'Für Endkunden & Versicherte' },
    saas: { title: 'Admin Platform', bg: 'bg-purple-50/30', icon: <ShieldAlert className="text-purple-600" size={32} />, desc: 'Nur für SaaS-Mitarbeiter' },
  };
  const theme = roleThemes[roleParam || 'broker'] || roleThemes.broker;

  // SPA Redirect Logic - Using 'navigate' instead of window.location
  useEffect(() => {
    if (isAuthenticated) {
        navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // ----- Real mode: passwordless magic-link login --------------------------
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const ok = await sendMagicLink(email);
    if (!ok) {
      setError('E-Mail konnte nicht gesendet werden. Bitte prüfe die Adresse.');
    } else {
      setLinkSent(true);
    }
    setIsLoading(false);
  };

  // ----- Mock mode: demo username -> simulated link -> password ------------
  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const success = await requestOtl(username);
    if (!success) setError('Benutzername nicht gefunden.');
    setIsLoading(false);
  };

  const handleSimulateOtlClick = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    await verifyOtl('valid-demo-token');
    setIsLoading(false);
  };

  const handleFinalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const success = await completeLogin(password);
    if (!success) setError('Ungültiges Passwort.');
    setIsLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${theme.bg} dark:bg-slate-950`}>
      {/* Top Navigation */}
      <div className="absolute top-8 left-0 w-full px-8 flex justify-between items-center pointer-events-none">
          <Link to="/" className="pointer-events-auto flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-bold text-sm">
            <Home size={18} /> Zur Startseite
          </Link>
      </div>

      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg">+</div>
                <span className="font-black text-xl tracking-tighter uppercase dark:text-white">SwissBroker <span className="text-slate-400">OS</span></span>
            </div>
            <div className="flex flex-col items-center">
                <div className="mb-2">{theme.icon}</div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">{theme.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{theme.desc}</p>
            </div>
        </div>

        <Card className="p-8 border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          {/* ===== REAL MODE: magic-link only ===== */}
          {realAuth && (
            linkSent ? (
              <div className="text-center space-y-5 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Prüfen Sie Ihr Postfach</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Wir haben einen Anmelde-Link an <span className="font-bold">{email}</span> gesendet. Öffnen Sie ihn, um sich anzumelden.</p>
                </div>
                <button type="button" onClick={() => { setLinkSent(false); setError(null); }} className="text-xs font-bold text-brand-600 hover:underline">Andere E-Mail-Adresse verwenden</button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-Mail-Adresse</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input type="email" required autoFocus className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold" placeholder="name@firma.ch" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <p className="text-[11px] text-slate-400 ml-1 mt-1">Passwortlose Anmeldung – wir senden Ihnen einen sicheren Link.</p>
                </div>
                {error && <p className="text-xs text-red-500 font-bold text-center bg-red-50 dark:bg-red-900/20 py-2 rounded">{error}</p>}
                <Button className="w-full py-6 font-black uppercase tracking-widest" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <>Anmelde-Link senden <ArrowRight size={18} className="ml-2" /></>}
                </Button>
                <p className="text-center text-xs text-slate-400">Noch kein Konto? <Link to="/signup" className="font-bold text-brand-600 hover:underline">Jetzt registrieren</Link></p>
              </form>
            )
          )}

          {/* ===== MOCK MODE: demo username/password flow ===== */}
          {!realAuth && loginStep === 'IDENTIFY' && (
            <form onSubmit={handleIdentify} className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Benutzername</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input type="text" required autoFocus className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold" placeholder="z.B. max_broker" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
              </div>
              {error && <p className="text-xs text-red-500 font-bold text-center bg-red-50 dark:bg-red-900/20 py-2 rounded">{error}</p>}
              <Button className="w-full py-6 font-black uppercase tracking-widest" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <>Link anfordern <ArrowRight size={18} className="ml-2" /></>}
              </Button>
            </form>
          )}

          {!realAuth && loginStep === 'AWAIT_OTL' && (
            <div className="text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mx-auto relative transform rotate-3">
                <ShieldCheck size={40} />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
              </div>
              <div><h3 className="text-lg font-bold text-slate-900 dark:text-white">Prüfen Sie Ihr Postfach</h3></div>
              <Button variant="outline" className="w-full text-xs font-black uppercase py-4" onClick={handleSimulateOtlClick} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : "Demo: Link-Klick simulieren"}</Button>
            </div>
          )}

          {!realAuth && loginStep === 'PASSWORD' && (
            <form onSubmit={handleFinalLogin} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input type="password" required autoFocus className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <p className="text-[10px] text-slate-400 ml-1">Demo-Passwort: <span className="font-mono">password123</span></p>
              </div>
              {error && <p className="text-xs text-red-500 font-bold text-center bg-red-50 dark:bg-red-900/20 py-2 rounded">{error}</p>}
              <Button className="w-full py-6 font-black uppercase tracking-widest" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : "Sicher Anmelden"}</Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
