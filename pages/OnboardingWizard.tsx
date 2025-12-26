import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
    Check, 
    CheckCircle,
    CheckCircle2,
    ArrowRight, 
    ArrowLeft, 
    Building2, 
    Users, 
    ShieldCheck, 
    Zap, 
    Globe, 
    Lock,
    Sparkles,
    Clock,
    TrendingUp,
    Shield,
    Loader2,
    Mail,
    User,
    X,
    Coins,
    BarChart3
} from 'lucide-react';
import { MOCK_SAAS_PACKAGES } from '../constants';
import { BackToTop } from '../components/ui/BackToTop';

type Step = 'NEEDS' | 'ANALYSIS' | 'PLAN' | 'ACCOUNT' | 'FINISH';

export const OnboardingWizard: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<Step>('NEEDS');
    const [analysisProgress, setAnalysisProgress] = useState(0);
    
    // Form State
    const [formData, setFormData] = useState({
        companySize: 1,
        clientCount: 50,
        companyName: '',
        adminName: '',
        email: '',
        selectedPlanId: ''
    });

    // Business Value Simulation Logic
    const simulation = useMemo(() => {
        const hoursSavedPerClientYearly = 2.8; 
        const totalSavedHoursPerYear = formData.clientCount * hoursSavedPerClientYearly;
        const savedHoursPerWeek = Math.round(totalSavedHoursPerYear / 52);
        
        // Value in CHF (Assumed internal hourly rate of 120 CHF)
        const yearlyValue = totalSavedHoursPerYear * 120;
        const efficiencyGain = formData.companySize > 5 ? 38 : 22;

        return {
            savedHoursPerWeek,
            efficiencyGain,
            yearlyValue: yearlyValue.toLocaleString('de-CH'),
            roiFactor: (yearlyValue / 3000).toFixed(1) // Rough ROI vs Tool Cost
        };
    }, [formData.companySize, formData.clientCount]);

    // Plan Recommendation Logic
    const recommendedPlanId = useMemo(() => {
        if (formData.companySize >= 10 || formData.clientCount > 500) return 'pkg_enterprise';
        if (formData.companySize > 1 || formData.clientCount > 50) return 'pkg_pro';
        return 'pkg_starter';
    }, [formData.companySize, formData.clientCount]);

    // Handle Analysis Phase Animation
    useEffect(() => {
        if (currentStep === 'ANALYSIS') {
            setAnalysisProgress(0);
            const timer = setInterval(() => {
                setAnalysisProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(timer);
                        setTimeout(() => setCurrentStep('PLAN'), 800);
                        return 100;
                    }
                    return prev + 1;
                });
            }, 30);
            return () => clearInterval(timer);
        }
    }, [currentStep]);

    const handleRegister = () => {
        setCurrentStep('FINISH');
        setTimeout(() => navigate('/dashboard'), 3500);
    };

    const ProgressBar = () => {
        const steps: Step[] = ['NEEDS', 'ANALYSIS', 'PLAN', 'ACCOUNT', 'FINISH'];
        const currentIdx = steps.indexOf(currentStep);
        return (
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 flex rounded-full overflow-hidden mb-12 shadow-inner">
                <div 
                    className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-brand-600 transition-all duration-1000 ease-in-out" 
                    style={{ width: `${((currentIdx + 1) / steps.length) * 100}%` }}
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col items-center py-12 px-4 selection:bg-brand-500/30 overflow-x-hidden transition-colors duration-500">
            <BackToTop />
            {/* Header */}
            <div className="max-w-5xl w-full flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <Link to="/" className="font-bold text-2xl tracking-tight flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-serif font-bold text-lg group-hover:scale-110 transition-transform shadow-lg shadow-red-600/20">+</div>
                    <span className="group-hover:text-brand-600 transition-colors">SwissBroker</span>
                </Link>
                {currentStep !== 'FINISH' && (
                    <Link to="/" className="text-slate-500 hover:text-red-500 text-sm transition-colors flex items-center gap-2 font-medium">
                        <X size={16}/> Abbrechen
                    </Link>
                )}
            </div>

            <div className="max-w-5xl w-full">
                <ProgressBar />

                {/* STEP 1: NEEDS INPUT & SIMULATION */}
                {currentStep === 'NEEDS' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 leading-tight">
                                Entfesseln Sie Ihr Skalierungspotenzial.
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                                Geben Sie Ihre Eckdaten ein. Unsere Engine berechnet sofort Ihren individuellen Business-Case mit SwissBroker OS.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            <div className="space-y-8">
                                <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-brand-500/5">
                                    <div className="space-y-12">
                                        {/* Team Size Slider */}
                                        <div className="group space-y-4">
                                            <div className="flex justify-between items-end">
                                                <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Users size={18} className="text-brand-500" /> Teamgrösse
                                                </label>
                                                <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                                                    {formData.companySize} 
                                                    <span className="text-sm font-medium text-slate-400 ml-2">Pers.</span>
                                                </span>
                                            </div>
                                            <input 
                                                type="range" min="1" max="50" step="1" 
                                                value={formData.companySize}
                                                onChange={e => setFormData({...formData, companySize: parseInt(e.target.value)})}
                                                className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-400 transition-all"
                                            />
                                        </div>

                                        {/* Client Count Slider */}
                                        <div className="group space-y-4">
                                            <div className="flex justify-between items-end">
                                                <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Building2 size={18} className="text-emerald-500" /> Klienten
                                                </label>
                                                <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                                                    {formData.clientCount} 
                                                    <span className="text-sm font-medium text-slate-400 ml-2">Mandate</span>
                                                </span>
                                            </div>
                                            <input 
                                                type="range" min="10" max="2500" step="10" 
                                                value={formData.clientCount}
                                                onChange={e => setFormData({...formData, clientCount: parseInt(e.target.value)})}
                                                className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-400 transition-all"
                                            />
                                        </div>
                                    </div>
                                </Card>

                                <Button 
                                    size="lg" 
                                    className="w-full py-8 text-2xl font-bold shadow-2xl shadow-brand-500/20 group relative overflow-hidden"
                                    onClick={() => setCurrentStep('ANALYSIS')}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        Analyse & Simulation starten
                                        <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </Button>
                            </div>

                            {/* Live Simulation Display */}
                            <div className="relative lg:sticky lg:top-12">
                                <div className="absolute inset-0 bg-brand-500/5 dark:bg-brand-500/10 blur-[120px] rounded-full animate-pulse"></div>
                                <Card className="relative p-8 border-brand-500/20 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border-t-4 border-t-brand-500">
                                    <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                        <BarChart3 size={14} className="text-brand-500" /> 
                                        Potenzial-Vorschau
                                    </h3>
                                    
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0 border border-brand-500/20">
                                                <Clock size={32} />
                                            </div>
                                            <div>
                                                <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">~{simulation.savedHoursPerWeek}h</div>
                                                <p className="text-sm text-slate-500 font-medium">Zeitersparnis pro Woche</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-500/20">
                                                <TrendingUp size={32} />
                                            </div>
                                            <div>
                                                <div className="text-3xl font-black text-emerald-600 tabular-nums">+{simulation.efficiencyGain}%</div>
                                                <p className="text-sm text-slate-500 font-medium">Mehr Kapazität für Akquise</p>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-bold text-slate-400 uppercase">Automatisierungs-Wert</span>
                                                <span className="text-xl font-bold text-slate-900 dark:text-white">CHF {simulation.yearlyValue} <span className="text-xs text-slate-500 font-normal">/ Jahr</span></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 leading-relaxed italic flex gap-3">
                                        <Sparkles className="text-brand-500 shrink-0" size={16}/>
                                        Diese Berechnung basiert auf aggregierten Effizienzdaten von über 500 digitalisierten Schweizer Maklerfirmen.
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: ANALYSIS SIMULATION */}
                {currentStep === 'ANALYSIS' && (
                    <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-1000">
                        <div className="relative w-64 h-64 mb-16">
                            {/* Decorative Rings */}
                            <div className="absolute inset-0 border-2 border-slate-200 dark:border-slate-800 rounded-full scale-110 opacity-50"></div>
                            <div className="absolute inset-0 border border-brand-500/20 rounded-full scale-125 animate-ping opacity-20"></div>
                            
                            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                                <circle 
                                    cx="128" cy="128" r="120" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="12" 
                                    className="text-brand-600"
                                    strokeDasharray={754}
                                    strokeDashoffset={754 - (754 * analysisProgress) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-black text-slate-900 dark:text-white tabular-nums">{analysisProgress}%</span>
                                <span className="text-[10px] text-brand-500 font-black uppercase tracking-[0.3em] mt-2 animate-pulse">Computing ROI</span>
                            </div>
                            
                            {/* Orbital Particles */}
                            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-500 rounded-full blur-sm"></div>
                            </div>
                        </div>

                        <div className="text-center space-y-4 max-w-md">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                                {analysisProgress < 25 && "Initialisiere Daten-Engine..."}
                                {analysisProgress >= 25 && analysisProgress < 50 && "Berechne Skalierungs-Faktor..."}
                                {analysisProgress >= 50 && analysisProgress < 75 && "Prüfe nDSG Compliance-Pfad..."}
                                {analysisProgress >= 75 && "Konfiguriere Dashboard..."}
                            </h2>
                            <div className="flex justify-center gap-3">
                                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>

                        <div className="mt-20 flex flex-wrap justify-center gap-8 opacity-40">
                             <TrustIcon icon={<Shield />} label="Safe Vault" />
                             <TrustIcon icon={<Globe />} label="Tier IV Data" />
                             <TrustIcon icon={<Lock />} label="AES-256" />
                             <TrustIcon icon={<CheckCircle2 />} label="FINMA Ready" />
                        </div>
                    </div>
                )}

                {/* STEP 3: PLAN RECOMMENDATION */}
                {currentStep === 'PLAN' && (
                    <div className="animate-in fade-in slide-in-from-right-12 duration-1000">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-8 border border-emerald-500/20 animate-bounce">
                                <CheckCircle size={16}/> Simulation abgeschlossen
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white leading-tight">
                                Das optimale Setup für Ihr Business.
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xl max-w-3xl mx-auto font-medium">
                                Basierend auf <span className="text-slate-900 dark:text-white font-bold">{formData.companySize} Mitarbeitern</span> und <span className="text-slate-900 dark:text-white font-bold">{formData.clientCount} Klienten</span> empfehlen wir:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
                            {MOCK_SAAS_PACKAGES.map(pkg => {
                                const isRecommended = pkg.id === recommendedPlanId;
                                const isSelected = formData.selectedPlanId === pkg.id || (formData.selectedPlanId === '' && isRecommended);
                                
                                return (
                                    <div 
                                        key={pkg.id}
                                        onClick={() => setFormData({...formData, selectedPlanId: pkg.id})}
                                        className={`relative rounded-[2rem] p-10 border-2 transition-all duration-700 cursor-pointer flex flex-col overflow-hidden transform hover:-translate-y-2 ${
                                            isSelected 
                                            ? 'bg-white dark:bg-slate-900 border-brand-500 ring-8 ring-brand-500/10 shadow-[0_35px_60px_-15px_rgba(14,165,233,0.3)] z-10' 
                                            : 'bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        {isRecommended && (
                                            <div className="absolute top-0 right-0 bg-brand-600 text-white text-[10px] font-black px-6 py-2 rounded-bl-2xl uppercase tracking-[0.2em] shadow-lg">
                                                Best ROI
                                            </div>
                                        )}
                                        
                                        <div className="mb-10">
                                            <h3 className={`text-2xl font-black mb-2 tracking-tight ${isSelected ? 'text-brand-600' : 'text-slate-700 dark:text-slate-200'}`}>{pkg.name}</h3>
                                            <div className="flex items-end gap-1">
                                                <span className={`text-5xl font-black tabular-nums ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>CHF {pkg.price}</span>
                                                <span className="text-slate-400 text-sm mb-2 font-bold">/ Mo.</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-4 leading-relaxed">{pkg.description}</p>
                                        </div>

                                        <ul className="space-y-5 mb-10 flex-1">
                                            {pkg.features.map((f, i) => (
                                                <li key={i} className="flex items-start gap-4 text-sm font-medium">
                                                    <div className={`mt-0.5 p-1 rounded-full transition-colors ${isSelected ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                                                        <Check size={14} strokeWidth={4} />
                                                    </div>
                                                    <span className={isSelected ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>{f}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className={`w-full py-4 rounded-2xl border-2 text-center text-sm font-black transition-all uppercase tracking-widest ${
                                            isSelected ? 'bg-brand-600 border-brand-600 text-white shadow-xl shadow-brand-600/30' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400'
                                        }`}>
                                            {isSelected ? 'Plan ausgewählt' : 'Diesen Plan wählen'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center bg-white/60 dark:bg-slate-900/60 p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-md gap-6">
                            <button onClick={() => setCurrentStep('NEEDS')} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group font-bold uppercase tracking-widest text-xs">
                                <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform"/> Zurück zur Eingabe
                            </button>
                            <div className="flex items-center gap-6">
                                <div className="text-xs text-slate-400 font-medium hidden md:block border-r border-slate-200 dark:border-slate-800 pr-6">
                                    <span className="font-black text-brand-600 uppercase block mb-1">Inklusive</span> 
                                    14 Tage Testphase • nDSG Hosting Zürich
                                </div>
                                <Button size="lg" className="px-14 py-6 text-lg font-black rounded-2xl shadow-2xl shadow-brand-600/20" onClick={() => setCurrentStep('ACCOUNT')}>Weiter zum Setup</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: ACCOUNT SETUP */}
                {currentStep === 'ACCOUNT' && (
                    <div className="animate-in fade-in slide-in-from-right-12 duration-1000 max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white">Starten Sie jetzt.</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">Richten Sie in wenigen Sekunden Ihren Administrator-Account ein.</p>
                        </div>

                        <Card className="p-12 border-slate-200 dark:border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] bg-white dark:bg-slate-900 backdrop-blur-2xl relative overflow-hidden rounded-[2.5rem]">
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <Lock size={160} />
                            </div>
                            
                            <div className="space-y-10 relative z-10">
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Building2 size={16} className="text-brand-500" /> Maklerfirma / Organisation
                                        </label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-xl font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700"
                                            placeholder="z.B. Alpine Insurance Services AG"
                                            value={formData.companyName}
                                            onChange={e => setFormData({...formData, companyName: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <User size={16} className="text-brand-500" /> Administrator
                                            </label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700"
                                                placeholder="Vor- & Nachname"
                                                value={formData.adminName}
                                                onChange={e => setFormData({...formData, adminName: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Mail size={16} className="text-brand-500" /> Business Email
                                            </label>
                                            <input 
                                                type="email" 
                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700"
                                                placeholder="kontakt@firma.ch"
                                                value={formData.email}
                                                onChange={e => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <Button 
                                        className="w-full py-8 text-2xl font-black shadow-2xl shadow-brand-600/30 group rounded-2xl" 
                                        size="lg" 
                                        onClick={handleRegister}
                                        disabled={!formData.companyName || !formData.email || !formData.adminName}
                                    >
                                        Jetzt Instanz provisionieren
                                        <Zap className="ml-3 fill-current group-hover:scale-125 transition-transform" size={24}/>
                                    </Button>
                                    <div className="mt-8 flex flex-col items-center gap-4 opacity-60">
                                        <div className="flex gap-6">
                                            <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-slate-500"><ShieldCheck size={14} className="text-emerald-500"/> nDSG Konform</div>
                                            <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-slate-500"><Lock size={14} className="text-emerald-500"/> SSL 256-Bit</div>
                                        </div>
                                        <p className="text-[10px] text-center max-w-sm text-slate-400">
                                            Kostenlose Testphase. Keine Kreditkarte erforderlich. <br/>Ihre Daten werden ausschliesslich in der Schweiz gespeichert.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        
                        <button onClick={() => setCurrentStep('PLAN')} className="mt-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mx-auto transition-colors text-sm font-bold uppercase tracking-widest">
                            <ArrowLeft size={16}/> Paket ändern
                        </button>
                    </div>
                )}

                {/* STEP 5: SUCCESS & LOADING */}
                {currentStep === 'FINISH' && (
                    <div className="animate-in zoom-in-95 duration-1000 flex flex-col items-center justify-center py-24 text-center">
                        <div className="relative mb-16">
                            <div className="absolute inset-0 bg-emerald-500/30 blur-[80px] rounded-full scale-150 animate-pulse"></div>
                            <div className="w-40 h-40 bg-emerald-500 text-white rounded-full flex items-center justify-center relative z-10 shadow-[0_0_80px_rgba(16,185,129,0.4)]">
                                <Check size={80} strokeWidth={4} className="animate-in slide-in-from-bottom-4 duration-700" />
                            </div>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400 leading-tight">
                            Willkommen an Bord!
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 mb-16 max-w-xl mx-auto font-medium">
                            Ihre SwissBroker Instanz wird gerade in unserem Datacenter in Zürich aufgesetzt. Das Dashboard öffnet sich in Kürze...
                        </p>
                        
                        <div className="space-y-4 w-full max-w-md mx-auto">
                             <LoadingTask label="Tenant-Datenbank isolieren" done={true} />
                             <LoadingTask label="End-to-End Verschlüsselung aktivieren" done={true} />
                             <LoadingTask label="KI-Persona initialisieren" active={true} />
                        </div>
                    </div>
                )}
            </div>
            
            {/* Ambient Background Elements */}
            <div className="fixed -bottom-64 -left-64 w-[500px] h-[500px] bg-brand-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
            <div className="fixed -top-64 -right-64 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
        </div>
    );
};

const TrustIcon = ({ icon, label }: { icon: any, label: string }) => (
    <div className="flex flex-col items-center gap-3">
        <div className="p-4 bg-slate-200 dark:bg-slate-800 rounded-2xl text-slate-500">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
    </div>
);

const LoadingTask = ({ label, done, active }: { label: string, done?: boolean, active?: boolean }) => (
    <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-700 ${done ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : active ? 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-xl scale-105' : 'bg-transparent border-transparent opacity-20'}`}>
        <span className="text-sm font-bold tracking-tight">{label}</span>
        {/* Fixed invalid 'weight' prop on Lucide icon */}
        {done ? <CheckCircle size={20} strokeWidth={3} /> : active ? <Loader2 size={20} className="animate-spin text-brand-500" /> : null}
    </div>
);