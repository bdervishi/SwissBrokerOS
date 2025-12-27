import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate, Link } from 'react-router-dom';
import { 
    Play, 
    User, 
    Users, 
    Briefcase, 
    CheckCircle, 
    ArrowRight, 
    ShieldCheck, 
    Presentation, 
    FileText, 
    DollarSign, 
    Check, 
    TrendingUp,
    Zap,
    Lock,
    UserPlus,
    Calendar,
    Sparkles,
    Loader2,
    Send,
    ChevronLeft,
    Plus,
    MessageSquare,
    AlertCircle,
    // Add missing Clock import
    Clock
} from 'lucide-react';

type OfferStep = 'LEAD' | 'CONFIG' | 'REVIEW' | 'SENDING';

export const SaaSDemo: React.FC = () => {
    const { role, impersonateUser } = useAuth();
    
    // UI Modals
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isPricesOpen, setIsPricesOpen] = useState(false);
    
    // Offer Wizard State
    const [isOfferWizardOpen, setIsOfferWizardOpen] = useState(false);
    const [offerStep, setOfferStep] = useState<OfferStep>('LEAD');
    const [useMeetingContext, setUseMeetingContext] = useState(false);
    const [offerData, setOfferData] = useState({
        leadName: '',
        company: '',
        selectedPlan: 'Professional',
        price: 249,
        addOns: [] as string[],
        notes: ''
    });

    if (role !== UserRole.SAAS_SUPER_ADMIN && role !== UserRole.SAAS_SALES && role !== UserRole.SAAS_ACQUISITION) {
        return <Navigate to="/dashboard" />;
    }

    const demoPersonas = [
        {
            id: 'u_demo_solo',
            title: "Starter Broker",
            description: "Einzelmakler, Fokus auf einfache Verwaltung und schnelle Übersicht.",
            features: ["Einfaches Dashboard", "Basic CRM", "Kein White Labeling"],
            icon: <User size={32} className="text-brand-500" />,
            color: "border-brand-200 hover:border-brand-400"
        },
        {
            id: 'u_broker_1',
            title: "Professional Broker",
            description: "Etabliertes Maklerbüro mit Assistenten und Automatisierungsbedarf.",
            features: ["Erweitertes CRM", "Hypotheken-Rechner", "Integrationen aktiv"],
            icon: <Briefcase size={32} className="text-emerald-500" />,
            color: "border-emerald-200 hover:border-emerald-400"
        },
        {
            id: 'u_demo_corp',
            title: "Enterprise Broker",
            description: "Grosse Organisation, Custom Branding, Hierarchien und Compliance.",
            features: ["Full White Labeling", "Compliance Features", "Advanced Analytics"],
            icon: <Users size={32} className="text-purple-500" />,
            color: "border-purple-200 hover:border-purple-400"
        }
    ];

    const startOfferWizard = () => {
        setIsPricesOpen(false);
        setIsOfferWizardOpen(true);
        setOfferStep('LEAD');
    };

    const toggleMeetingContext = () => {
        const active = !useMeetingContext;
        setUseMeetingContext(active);
        if (active) {
            // Mock data from a "Current Meeting"
            setOfferData({
                ...offerData,
                leadName: 'Thomas Müller',
                company: 'Müller & Partner Vorsorge AG',
                notes: 'Kunde hat grosses Interesse an Hypothekar-Simulation und nDSG Compliance geäussert. Teamgrösse ca. 12 Personen geplant.',
                selectedPlan: 'Enterprise'
            });
        } else {
            setOfferData({ ...offerData, leadName: '', company: '', notes: '', selectedPlan: 'Professional' });
        }
    };

    const handleSendOffer = () => {
        setOfferStep('SENDING');
        setTimeout(() => {
            setIsOfferWizardOpen(false);
            // Reset
            setOfferStep('LEAD');
        }, 2500);
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Play className="text-brand-600" /> Demo Center
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Starten Sie interaktive Demos für Leads. Änderungen in Demo-Accounts sind temporär.
                    </p>
                </div>
                <Link to="/saas/pitch">
                    <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20" icon={<Presentation size={18}/>}>
                        Vollbild Pitch starten
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {demoPersonas.map(persona => (
                    <div key={persona.id} className={`bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-sm transition-all cursor-pointer group flex flex-col ${persona.color}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                {persona.icon}
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs px-2 py-1 rounded font-mono">
                                Live Data
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{persona.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1">
                            {persona.description}
                        </p>

                        <ul className="space-y-2 mb-6">
                            {persona.features.map((feat, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <CheckCircle size={14} className="text-slate-400" />
                                    {feat}
                                </li>
                            ))}
                        </ul>

                        <Button 
                            className="w-full group-hover:bg-brand-700" 
                            onClick={() => impersonateUser(persona.id)}
                            icon={<Play size={16} />}
                        >
                            Demo Starten
                        </Button>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" /> 
                        Vertriebs-Leitfaden
                    </h3>
                    <p className="text-slate-300 mb-6">
                        Nutzen Sie die neuen **Compliance-Features** (Datenhaltung Schweiz) und die **3D-Wealth Visualisierung** als stärkste Verkaufsargumente.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800" icon={<FileText size={16}/>} onClick={() => setIsGuideOpen(true)}>Talking Points Vorschau</Button>
                        <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800" icon={<DollarSign size={16}/>} onClick={() => setIsPricesOpen(true)}>Preisliste intern</Button>
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            </div>

            {/* MODAL: TALKING POINTS & OBJECTION HANDLING */}
            <Modal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} title="Sales Guide: SwissBroker OS" maxWidth="max-w-4xl">
                <div className="space-y-10 p-2">
                    {/* SECTION: ENTRY */}
                    <section>
                        <h4 className="font-bold text-brand-600 uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                            <Zap size={14}/> Der Hook (Einstieg)
                        </h4>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border-l-4 border-l-brand-500 italic text-slate-700 dark:text-slate-300 shadow-sm">
                            "Arbeiten Sie noch für Ihre Software, oder arbeitet Ihre Software bereits für Sie? Die meisten Broker verlieren 40% ihrer Zeit durch Medienbrüche zwischen CRM, Excel und Portalen."
                        </div>
                    </section>

                    {/* SECTION: OBJECTION HANDLING (Gleichgültigkeits-Fokus) */}
                    <section className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
                            <MessageSquare size={120} />
                        </div>
                        <h4 className="font-bold text-emerald-400 uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2 relative z-10">
                            <Sparkles size={14}/> Einwand-Radar: Souverän Entwaffnen
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            {[
                                { 
                                    q: "Zu teuer.", 
                                    a: "Stimmt, Qualität kostet. Aber ein einziger verpasster Termin oder eine Storno-Haftung kostet Sie das 10-fache. Wir reden hier nicht von Kosten, sondern von Ihrer Rendite.",
                                    icon: <DollarSign size={14} /> 
                                },
                                { 
                                    q: "Migration dauert zu lange.", 
                                    a: "Überhaupt nicht. Unsere KI mappt Ihre Excel-Listen während Sie Kaffee trinken. In 2 Stunden sind Sie live. Der Aufwand ist für Sie gleich null.",
                                    icon: <Clock size={14} /> 
                                },
                                { 
                                    q: "Ich bin zufrieden mit meinem Tool.", 
                                    a: "Zufriedenheit ist der Feind von Wachstum. Ihr aktuelles Tool findet keine Leads im Web und rechnet keine 3D-Szenarien. Wollen Sie verwalten oder skalieren?",
                                    icon: <TrendingUp size={14} /> 
                                },
                                { 
                                    q: "Daten in der Cloud?", 
                                    a: "Ihre Daten liegen physisch im Banken-Bunker in Zürich. Sicherer als auf Ihrem Büro-Server. Das nDSG-Zertifikat bekommen Sie von uns direkt mit.",
                                    icon: <Lock size={14} /> 
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all group">
                                    <p className="text-xs font-black text-emerald-400 flex items-center gap-2 mb-2">
                                        <span className="p-1 bg-emerald-500/20 rounded-md">{item.icon}</span> "{item.q}"
                                    </p>
                                    <p className="text-sm text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                                        {item.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-[10px] text-brand-300 italic text-center">
                            Pro-Tipp: Hören Sie zu, nicken Sie, und führen Sie den Kunden sofort zurück zur Zeitersparnis.
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h5 className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2 text-slate-500">
                                <Lock size={16} className="text-emerald-500"/> nDSG & Vertrauen
                            </h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Betonen Sie: "Ihre Daten verlassen niemals die Schweiz. Hosting in Zürich (Tier IV). Damit sind Sie für das neue Datenschutzgesetz (nDSG) und FINMA-Audits perfekt gerüstet."
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h5 className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2 text-slate-500">
                                <TrendingUp size={16} className="text-blue-500"/> Die 3D-Story
                            </h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                "Verkaufen Sie nicht über Tabellen. Zeigen Sie dem Kunden sein Vermögen in 3D. Das steigert die Abschlussquote bei Vorsorge-Themen nachweislich um bis zu 25%."
                            </p>
                        </div>
                    </div>

                    <section className="bg-brand-50 dark:bg-brand-900/10 p-6 rounded-3xl border border-brand-100 dark:border-brand-900/30 flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3">Die "One OS" Strategie</h4>
                            <ul className="space-y-2">
                                {["CRM & HR in einem System", "KI-Lead Radar für proaktives Wachstum", "Integrierte Hypothekar-Simulation"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                        <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center text-white"><Check size={12} strokeWidth={4}/></div> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-full md:w-48 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-center border border-brand-100 dark:border-brand-900/50">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Average ROI</p>
                            <p className="text-3xl font-black text-brand-600">4.2x</p>
                            <p className="text-[9px] text-slate-500 mt-1">im ersten Jahr</p>
                        </div>
                    </section>
                    
                    <div className="flex justify-end pt-4">
                        <Button variant="secondary" onClick={() => setIsGuideOpen(false)}>Schliessen</Button>
                    </div>
                </div>
            </Modal>

            {/* MODAL: INTERNAL PRICES */}
            <Modal isOpen={isPricesOpen} onClose={() => setIsPricesOpen(false)} title="Interne Preisliste & Margen (SaaS)" maxWidth="max-w-4xl">
                <div className="space-y-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-4 py-4">Paket</th>
                                    <th className="px-4 py-4">Einkauf (COGS)</th>
                                    <th className="px-4 py-4">Listenpreis</th>
                                    <th className="px-4 py-4">Marge</th>
                                    <th className="px-4 py-4">Targeting</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { name: 'Starter', cost: '35.-', price: '99.-', margin: '65%', target: 'Einzelmakler' },
                                    { name: 'Professional', cost: '85.-', price: '249.-', margin: '66%', target: 'KMU (3-10 Pers.)' },
                                    { name: 'Enterprise', cost: '220.-', price: '899.-', margin: '75%', target: 'Grossegler (>20 Pers.)' }
                                ].map((p, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                        <td className="px-4 py-4 font-bold text-slate-900 dark:text-slate-100">{p.name}</td>
                                        <td className="px-4 py-4 text-slate-400">CHF {p.cost}</td>
                                        <td className="px-4 py-4 font-black text-brand-600">CHF {p.price}</td>
                                        <td className="px-4 py-4 text-emerald-600 font-bold">{p.margin}</td>
                                        <td className="px-4 py-4 text-xs text-slate-500 italic">{p.target}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-slate-50 dark:bg-slate-800 border-none">
                            <h5 className="font-bold text-xs uppercase text-slate-400 mb-3 tracking-widest">Einmalige Gebühren</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>Setup Fee (Std.)</span> <span className="font-bold">CHF 490.-</span></div>
                                <div className="flex justify-between"><span>Datenmigration AI</span> <span className="font-bold">CHF 0.- (Inkl.)</span></div>
                                <div className="flex justify-between"><span>Whitelabel Branding</span> <span className="font-bold">CHF 1'200.-</span></div>
                            </div>
                        </Card>
                        <Card className="bg-slate-50 dark:bg-slate-800 border-none">
                            <h5 className="font-bold text-xs uppercase text-slate-400 mb-3 tracking-widest">Add-on Module (mtl.)</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>KI Call Agent</span> <span className="font-bold">CHF 149.-</span></div>
                                <div className="flex justify-between"><span>Lead Radar Pro</span> <span className="font-bold">CHF 89.-</span></div>
                                <div className="flex justify-between"><span>Extra User</span> <span className="font-bold">CHF 29.- / Pers.</span></div>
                            </div>
                        </Card>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                            <span className="font-bold">Verhandlungsspielraum:</span> Bei Enterprise-Abschlüssen (Yearly) kann ein Rabatt von bis zu 15% ohne Rücksprache mit Finance gewährt werden. Setup Fees können bei Multi-Tenant-Strukturen erlassen werden.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsPricesOpen(false)}>Vorschau Schliessen</Button>
                        <Button icon={<Play size={16}/>} onClick={startOfferWizard}>Angebot generieren</Button>
                    </div>
                </div>
            </Modal>

            {/* MODAL: OFFER GENERATION WIZARD */}
            <Modal isOpen={isOfferWizardOpen} onClose={() => setIsOfferWizardOpen(false)} title="SaaS Angebots-Wizard" maxWidth="max-w-3xl">
                <div className="space-y-6">
                    {/* Progress indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        {['LEAD', 'CONFIG', 'REVIEW'].map((s, i) => (
                            <React.Fragment key={s}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                    offerStep === s ? 'bg-brand-600 text-white shadow-lg ring-4 ring-brand-500/20' : 
                                    (i < ['LEAD', 'CONFIG', 'REVIEW'].indexOf(offerStep)) ? 'bg-emerald-50 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                }`}>
                                    {i < ['LEAD', 'CONFIG', 'REVIEW'].indexOf(offerStep) ? <Check size={14}/> : i+1}
                                </div>
                                {i < 2 && <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full bg-brand-500 transition-all duration-500 ${i < ['LEAD', 'CONFIG', 'REVIEW'].indexOf(offerStep) ? 'w-full' : 'w-0'}`} />
                                </div>}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* STEP: LEAD IDENTIFICATION */}
                    {offerStep === 'LEAD' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg text-indigo-600">
                                        <Calendar size={20}/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Aktuelles Meeting nutzen?</p>
                                        <p className="text-xs text-indigo-700 dark:text-indigo-400">Importiert Leads und Notizen aus der Session.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={toggleMeetingContext}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${useMeetingContext ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${useMeetingContext ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Lead Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500" 
                                        placeholder="Name des Ansprechpartners"
                                        value={offerData.leadName}
                                        onChange={(e) => setOfferData({...offerData, leadName: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Firma</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500" 
                                        placeholder="Firmenname"
                                        value={offerData.company}
                                        onChange={(e) => setOfferData({...offerData, company: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Notizen zum Angebot</label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 h-24" 
                                    placeholder="Besonderheiten aus dem Verkaufsgespräch..."
                                    value={offerData.notes}
                                    onChange={(e) => setOfferData({...offerData, notes: e.target.value})}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={() => setOfferStep('CONFIG')} disabled={!offerData.company} icon={<ArrowRight size={18}/>}>
                                    Konfiguration
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP: CONFIGURATION */}
                    {offerStep === 'CONFIG' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['Starter', 'Professional', 'Enterprise'].map(p => (
                                    <div 
                                        key={p} 
                                        onClick={() => setOfferData({...offerData, selectedPlan: p, price: p === 'Starter' ? 99 : p === 'Professional' ? 249 : 899})}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${offerData.selectedPlan === p ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-100 dark:border-slate-800'}`}
                                    >
                                        <div className="font-bold text-sm mb-1">{p}</div>
                                        <div className="text-xs text-slate-500">CHF {p === 'Starter' ? 99 : p === 'Professional' ? 249 : 899} / Mo.</div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-sm uppercase text-slate-400 tracking-widest">Optionale Add-ons</h4>
                                {[
                                    { id: 'call', label: 'KI Call Agent Pro', price: 149 },
                                    { id: 'radar', label: 'Lead Radar Enterprise', price: 89 },
                                    { id: 'white', label: 'Custom Branding Setup', price: 1200, once: true }
                                ].map(addon => (
                                    <div 
                                        key={addon.id} 
                                        onClick={() => {
                                            const active = offerData.addOns.includes(addon.id);
                                            setOfferData({
                                                ...offerData, 
                                                addOns: active ? offerData.addOns.filter(a => a !== addon.id) : [...offerData.addOns, addon.id]
                                            });
                                        }}
                                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${offerData.addOns.includes(addon.id) ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${offerData.addOns.includes(addon.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                                                {offerData.addOns.includes(addon.id) && <Check size={14}/>}
                                            </div>
                                            <span className="text-sm font-medium">{addon.label}</span>
                                        </div>
                                        <span className="text-xs font-mono text-slate-500">CHF {addon.price} {addon.once ? '(einmalig)' : '/mt.'}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                                <Button variant="ghost" onClick={() => setOfferStep('LEAD')} icon={<ChevronLeft size={18}/>}>Zurück</Button>
                                <Button onClick={() => setOfferStep('REVIEW')} icon={<ArrowRight size={18}/>}>Vorschau & Prüfung</Button>
                            </div>
                        </div>
                    )}

                    {/* STEP: REVIEW & SEND */}
                    {offerStep === 'REVIEW' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <Card className="bg-slate-50 dark:bg-slate-950 border-none shadow-inner p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">SwissBroker <span className="text-brand-600">OS</span></h3>
                                        <p className="text-xs text-slate-400">Angebot Ref: #{Math.floor(Math.random()*100000)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{offerData.company}</p>
                                        <p className="text-xs text-slate-500">z.Hd. {offerData.leadName}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800">
                                        <span className="text-sm">Basis-Paket: <span className="font-bold">{offerData.selectedPlan}</span></span>
                                        <span className="font-mono">CHF {offerData.price}.00</span>
                                    </div>
                                    {offerData.addOns.length > 0 && offerData.addOns.map(a => (
                                        <div key={a} className="flex justify-between py-1 text-xs text-slate-500 italic">
                                            <span>+ {a === 'call' ? 'KI Call Agent Pro' : a === 'radar' ? 'Lead Radar Enterprise' : 'Branding Setup'}</span>
                                            <span className="font-mono">CHF {a === 'call' ? '149.00' : a === 'radar' ? '89.00' : '1200.00'}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between pt-4 text-lg font-black text-brand-600">
                                        <span>Total Netto / Monat</span>
                                        <span className="font-mono">CHF {(offerData.price + (offerData.addOns.includes('call') ? 149 : 0) + (offerData.addOns.includes('radar') ? 89 : 0)).toFixed(2)}</span>
                                    </div>
                                </div>

                                {offerData.notes && (
                                    <div className="mt-8 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest">Zusatzvereinbarung</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{offerData.notes}"</p>
                                    </div>
                                )}
                            </Card>

                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl flex gap-3">
                                <Sparkles className="text-amber-500 shrink-0" size={20} />
                                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                                    KI-Tipp: Da der Kunde Bedenken bzgl. der Migration geäussert hat, ist das "White Label Setup" im Preis inbegriffen – die Kosten werden intern als CAC (Customer Acquisition Cost) verbucht.
                                </p>
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                                <Button variant="ghost" onClick={() => setOfferStep('CONFIG')} icon={<ChevronLeft size={18}/>}>Zurück</Button>
                                <Button onClick={handleSendOffer} icon={<Send size={18}/>} className="bg-emerald-600 hover:bg-emerald-700">Angebot per Email senden</Button>
                            </div>
                        </div>
                    )}

                    {/* STEP: SENDING ANIMATION */}
                    {offerStep === 'SENDING' && (
                        <div className="py-20 text-center space-y-6 animate-in zoom-in-95">
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-ping"></div>
                                <div className="relative z-10 w-24 h-24 bg-brand-600 text-white rounded-full flex items-center justify-center">
                                    <Loader2 className="animate-spin" size={48} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold">Angebot wird generiert & versendet...</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">Verschlüsseltes PDF wird erstellt und über den Swiss Secure Mailserver an <span className="font-bold">{offerData.company}</span> zugestellt.</p>
                        </div>
                    )}
                </div>
            </Modal>
        </Layout>
    );
};

const NavButton = ({ active, onClick, icon, label, count }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
            active 
            ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-sm' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
    >
        <div className="flex items-center gap-3">
            {icon}
            {label}
        </div>
        {count > 0 && (
            <span className="bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {count}
            </span>
        )}
    </button>
);
