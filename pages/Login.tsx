
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  User,
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  ChevronLeft, 
  Lock, 
  HelpCircle,
  Sparkles,
  Building2,
  Users,
  ShieldAlert,
  Home
} from 'lucide-react';

export const Login: React.FC = () => {
  const { role: roleParam } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { loginStep, requestOtl, verifyOtl, completeLogin, isAuthenticated, resetPasswordRequest } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Branding & Configuration based on role
  const roleThemes: Record<string, any> = {
    broker: { 
        title: 'Broker Portal', 
        color: 'brand', 
        bg: 'bg-brand-50/30',
        icon: <Building2 className="text-brand-600" size={32} />,
        desc: 'Für Makler-Inhaber & Mitarbeiter'
    },
    client: { 
        title: 'Kunden Portal', 
        color: 'emerald', 
        bg: 'bg-emerald-50/30',
        icon: <Users className="text-emerald-600" size={32} />,
        desc: 'Für Endkunden & Versicherte'
    },
    saas: { 
        title: 'Admin Platform', 
        color: 'purple', 
        bg: 'bg-purple-50/30',
        icon: <ShieldAlert className="text-purple-600" size={32} />,
        desc: 'Nur für SaaS-Mitarbeiter'
    },
  };

  const theme = roleThemes[roleParam || 'broker'] || roleThemes.broker;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const success = await requestOtl(username);
    if (!success) {
      setError('Benutzername nicht gefunden.');
    }
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
    if (!success) {
      setError('Ungültiges Passwort.');
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
      setIsLoading(true);
      await resetPasswordRequest(username);
      setResetSent(true);
      setTimeout(() => {
          setIsLoading(false);
          setResetSent(false);
          alert("Ein Passwort-Reset Link wurde an Ihre hinterlegte E-Mail gesendet.");
      }, 1000);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${theme.bg} dark:bg-slate-950`}>
      
      {/* Top Navigation */}
      <div className="absolute top-8 left-0 w-full px-8 flex justify-between items-center pointer-events-none">
          <Link to="/" className="pointer-events-auto flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-bold text-sm">
            <Home size={18} /> Zur Startseite
          </Link>
          <div className="hidden md:flex gap-4 pointer-events-auto">
             <Link to="/login/broker" className={`text-xs font-black uppercase tracking-widest ${roleParam === 'broker' ? 'text-brand-600' : 'text-slate-400'}`}>Broker</Link>
             <Link to="/login/client" className={`text-xs font-black uppercase tracking-widest ${roleParam === 'client' ? 'text-emerald-600' : 'text-slate-400'}`}>Kunden</Link>
             <Link to="/login/saas" className={`text-xs font-black uppercase tracking-widest ${roleParam === 'saas' ? 'text-purple-600' : 'text-slate-400'}`}>SaaS</Link>
          </div>
      </div>

      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Logo Section */}
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
          
          {/* Step 1: Identification */}
          {loginStep === 'IDENTIFY' && (
            <form onSubmit={handleIdentify} className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Benutzername</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input 
                    type="text"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold"
                    placeholder="z.B. max_broker"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-slate-400 ml-1">Hinweis: Demo-User sind z.B. max_broker, felix_agent, admin_global</p>
              </div>

              {error && <p className="text-xs text-red-500 font-bold text-center bg-red-50 dark:bg-red-900/20 py-2 rounded">{error}</p>}

              <Button className="w-full py-6 font-black uppercase tracking-widest" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <>Link anfordern <ArrowRight size={18} className="ml-2" /></>}
              </Button>
            </form>
          )}

          {/* Step 2: Awaiting OTL */}
          {loginStep === 'AWAIT_OTL' && (
            <div className="text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mx-auto relative transform rotate-3">
                <ShieldCheck size={40} />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Prüfen Sie Ihr Postfach</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Wir haben einen sicheren One-Time Link an die E-Mail-Adresse von <strong>{username}</strong> gesendet.
                </p>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-xs text-slate-500 leading-relaxed italic">
                Der Link ist für 15 Minuten gültig.
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" className="w-full text-xs font-black uppercase py-4" onClick={handleSimulateOtlClick} disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "Demo: Link-Klick simulieren"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Password Entry */}
          {loginStep === 'PASSWORD' && (
            <form onSubmit={handleFinalLogin} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Identität verifiziert</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Willkommen zurück, <strong>{username}</strong>.</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Passwort</label>
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-black text-brand-600 hover:text-brand-700 flex items-center gap-1 uppercase tracking-wider"
                  >
                    <HelpCircle size={12}/> Reset anfordern
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input 
                    type="password"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-slate-400 ml-1">Demo-Passwort: <span className="font-mono">password123</span></p>
              </div>

              {error && <p className="text-xs text-red-500 font-bold text-center bg-red-50 dark:bg-red-900/20 py-2 rounded">{error}</p>}

              <Button className="w-full py-6 font-black uppercase tracking-widest" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Sicher Anmelden"}
              </Button>

              <button 
                type="button"
                onClick={() => window.location.reload()}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2 font-medium"
              >
                <ChevronLeft size={14} /> Anderer Account
              </button>
            </form>
          )}

        </Card>

        {/* Footer Role Links for Desktop/Mobile fallback */}
        <div className="mt-8 flex flex-col items-center gap-4">
             <div className="flex items-center justify-center gap-6 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                <div className="flex flex-col items-center">
                    <ShieldCheck size={20} className="mb-1 text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">ISO 27001</span>
                </div>
                <div className="flex flex-col items-center">
                    <Sparkles size={20} className="mb-1 text-purple-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">nDSG Safe</span>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-5 h-5 bg-red-600 rounded-sm mb-1"></div>
                    <span className="text-[8px] font-black uppercase tracking-widest">Swiss Hosted</span>
                </div>
            </div>
            
            <div className="flex gap-4 md:hidden">
                 <Link to="/login/broker" className="text-[10px] font-black text-slate-400 uppercase">Makler</Link>
                 <Link to="/login/client" className="text-[10px] font-black text-slate-400 uppercase">Kunde</Link>
                 <Link to="/login/saas" className="text-[10px] font-black text-slate-400 uppercase">Admin</Link>
            </div>
        </div>
      </div>
    </div>
  );
};

// Internal icon for step 1
const UserIcon = ({ className, size = 20 }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
