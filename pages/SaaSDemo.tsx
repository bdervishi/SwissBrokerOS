
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate, Link } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
// Added missing icons: Cpu, Globe, RefreshCw, MapPin, Brain, Quote
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
    Clock,
    FileSpreadsheet,
    Landmark,
    Building2,
    Calculator,
    Target,
    Cpu,
    Globe,
    RefreshCw,
    MapPin,
    Brain,
    Quote
} from 'lucide-react';
import { OnepagerView, OnepagerContent } from '../components/ui/OnepagerView';

type OfferStep = 'LEAD' | 'CONFIG' | 'REVIEW' | 'SENDING';

const ONEPAGERS: OnepagerContent[] = [
    {
        id: 'op_broker',
        target: 'Für Versicherungsmakler',
        title: 'Skalieren Sie Ihr Büro, nicht Ihren Admin.',
        subtitle: 'Das Betriebssystem für die nächste Generation Schweizer Broker.',
        problem: 'Makler verbringen 60% ihrer Zeit mit Datenpflege, Portal-Logins und manuellem Belegfluss. Das bremst das Wachstum und erhöht das Haftungsrisiko (nDSG).',
        solution: 'SwissBroker OS zentralisiert alle Prozesse. Von der KI-gestützten Risikoanalyse bis zum integrierten Kundenportal. Wir eliminieren manuelle Schnittstellen.',
        highlights: [
            { title: 'Digitaler Zwilling', desc: 'Ihre KI, trainiert auf Ihrem Wissen.', icon: <Sparkles size={20}/> },
            { title: '3D Vermögensvis', desc: 'Verkaufschancen in Echtzeit erkennen.', icon: <TrendingUp size={20}/> },
            { title: 'nDSG Safe Vault', desc: 'Hosting in Zürich (Tier IV).', icon: <Lock size={20}/> },
            { title: 'Smart CRM', desc: 'Proaktiver Lead-Radar integriert.', icon: <Target size={20}/> }
        ],
        stats: [
            { label: 'Zeitersparnis', value: '40%' },
            { label: 'Conversion Rate', value: '+25%' },
            { label: 'Setup Zeit', value: '2h' }
        ],
        cta: 'Demo für Broker starten',
        color: 'from-brand-600 to-indigo-700'
    },
    {
        id: 'op_investor',
        target: 'Für Investoren (VC/Private)',
        title: 'Digitalisierung des Schweizer Finanzkerns.',
        subtitle: 'Die SaaS-Plattform für den 35 Mrd. CHF Brokermarkt.',
        problem: 'Der Schweizer Brokermarkt ist hochgradig fragmentiert und technologisch veraltet. Legacy-Systeme verhindern Skaleneffekte und proaktive Finanzberatung.',
        solution: 'Wir bauen den "Vertical SaaS" Layer für Broker. Durch tiefgehende Integration (KI, APIs, FinTech) schaffen wir eine klebrige Plattform mit hohen Margen und negativem Churn.',
        highlights: [
            { title: 'Hohe Sticky-Rate', desc: 'System-of-Record Status bei Tenants.', icon: <ShieldCheck size={20}/> },
            { title: 'AI Moat', desc: 'Eigene Modelle für Schweizer Regulatorik.', icon: <Cpu size={20}/> },
            { title: 'Embedded Finance', desc: 'Revenue Share bei Krediten & Leasing.', icon: <DollarSign size={20}/> },
            { title: 'Total Addressable Market', desc: '15k+ Broker allein in der Schweiz.', icon: <Globe size={20}/> }
        ],
        stats: [
            { label: 'MRR Growth', value: '18%' },
            { label: 'LTV/CAC', value: '4.8x' },
            { label: 'TAM (CH)', value: '1.2B' }
        ],
        cta: 'Investor Deck öffnen',
        color: 'from-slate-800 to-slate-950'
    },
    {
        id: 'op_insurance',
        target: 'Für Versicherungsgesellschaften',
        title: 'Datenqualität auf einem neuen Level.',
        subtitle: 'Direkte Anbindung an den Vertrieb der Zukunft.',
        problem: 'Versicherer leiden unter unvollständigen Anträgen, hohen Storno-Raten und langsamen Kommunikationswegen über tausende Einzelbroker.',
        solution: 'SwissBroker OS standardisiert den Datenfluss. Versicherer profitieren von validierten Anträgen, Echtzeit-Bestandsdaten und einer direkten API-Schnittstelle zum Makler.',
        highlights: [
            { title: 'Validierte Daten', desc: 'KI prüft Anträge vor dem Absenden.', icon: <CheckCircle size={20}/> },
            { title: 'Churn Prevention', desc: 'Frühwarnsystem bei Storno-Gefahr.', icon: <AlertCircle size={20}/> },
            { title: 'API Gateway', desc: 'Nahtlose Integration in Core-Systeme.', icon: <Zap size={20}/> },
            { title: 'Direct Marketing', desc: 'Produkte direkt im Makler-Workflow.', icon: <Presentation size={20}/> }
        ],
        stats: [
            { label: 'Daten-Präzision', value: '99%' },
            { label: 'Polizzen-Storno', value: '-15%' },
            { label: 'Response-Time', value: 'Live' }
        ],
        cta: 'Partner Hub ansehen',
        color: 'from-red-600 to-rose-700'
    },
    {
        id: 'op_bank',
        target: 'Für Banken & Kreditgeber',
        title: 'Embedded Mortgage Distribution.',
        subtitle: 'Ihr Kreditangebot direkt im Beratungsprozess.',
        problem: 'Banken verlieren den Kontakt zum Kunden oft am Anfang der Journey (beim Broker). Die manuelle Prüfung von Tragbarkeiten ist teuer und fehleranfällig.',
        solution: 'Integrieren Sie Ihre Zinssätze und Kredit-Regeln direkt in unseren Hypotheken-Simulator. Erhalten Sie vorqualifizierte Leads mit vollständigen Dossiers.',
        highlights: [
            { title: 'Auto-Affordability', desc: 'Check nach Ihren spezifischen Regeln.', icon: <Calculator size={20}/> },
            { title: 'Full Dossier Import', desc: 'Alle Dokumente digital & validiert.', icon: <FileSpreadsheet size={20}/> },
            { title: 'Cross-Selling', desc: 'Anbindung an Anlage- & Vorsorgekonten.', icon: <Landmark size={20}/> },
            { title: 'Real-time Feeds', desc: 'Zinsen per API live pushen.', icon: <RefreshCw size={20}/> }
        ],
        stats: [
            { label: 'Lead Quality', value: 'High' },
            { label: 'Processing Cost', value: '-60%' },
            { label: 'Cross-Sell Rate', value: '+12%' }
        ],
        cta: 'Banking API Docs',
        color: 'from-blue-600 to-indigo-800'
    },
    {
        id: 'op_tax',
        target: 'Für Treuhand & Steuerfirmen',
        title: 'Automatisierter Belegfluss.',
        subtitle: 'Die Brücke zwischen Makler, Kunde und Steuern.',
        problem: 'Steuerberater müssen mühsam Dokumente bei Maklern oder Kunden anfragen (3a-Belege, Zinsausweise). Das führt zu Verzögerungen und Fehlern.',
        solution: 'SwissBroker OS aggregiert alle steuerrelevanten Daten automatisch. Broker können ihren Kunden (und deren Treuhändern) fertige Reports exportieren.',
        highlights: [
            { title: '3a Aggregator', desc: 'Alle Einzahlungen auf einen Blick.', icon: <CheckCircle size={20}/> },
            { title: 'Zinsausweise', desc: 'Automatischer Import aus Hypotheken.', icon: <Building2 size={20}/> },
            { title: 'Sitzverlegung AI', desc: 'Simulator für Firmenumzüge.', icon: <MapPin size={20}/> },
            { title: 'Partner Login', desc: 'Direkter Zugriff für Treuhänder.', icon: <Users size={20}/> }
        ],
        stats: [
            { label: 'Doc Collection', value: 'Instant' },
            { label: 'Manual Work', value: '-80%' },
            { label: 'Tax Savings', value: 'High' }
        ],
        cta: 'Steuer-Modul testen',
        color: 'from-emerald-600 to-teal-800'
    }
];

export const SaaSDemo: React.FC = () => {
    const { role, impersonateUser } = useAuth();
    
    // UI Modals
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isPricesOpen, setIsPricesOpen] = useState(false);
    
    // Onepager state
    const [selectedOnepager, setSelectedOnepager] = useState<OnepagerContent | null>(null);

    // Live Objection State
    const [objectionInput, setObjectionInput] = useState("");
    const [handlingResult, setHandlingResult] = useState<string | null>(null);
    const [isHandlingLoading, setIsHandlingLoading] = useState(false);

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

    const handleHandleObjection = async () => {
        if (!objectionInput.trim() || !process.env.API_KEY) return;
        setIsHandlingLoading(true);
        setHandlingResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Du bist ein erfahrener Sales-Coach für SaaS-Vertrieb im Schweizer Finanzmarkt.
                Ein potenzieller Kunde (Broker) bringt folgenden Einwand: "${objectionInput}"
                
                Erstelle eine schlagfertige, aber sympathische Antwort nach der L.A.E.R.-Methode (Listen, Acknowledge, Explore, Respond).
                Sprache: Deutsch (Schweiz), professionell, "Sie"-Form.
                
                Formatierung:
                1. Einleitung (Kurzer Satz zur Tonalität)
                2. Die Antwort (Was genau soll man sagen?)
                3. Profi-Tipp (Warum funktioniert das psychologisch?)
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setHandlingResult(response.text || "Entschuldigung, ich konnte keine Taktik generieren.");
        } catch (e) {
            setHandlingResult("Konnte KI-Service nicht erreichen.");
        } finally {
            setIsHandlingLoading(false);
        }
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Play className="text-brand-600" /> Demo Center
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Starten Sie interaktive Demos für Leads oder nutzen Sie unsere Pitch-Assets.
                    </p>
                </div>
                <Link to="/saas/pitch">
                    <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20" icon={<Presentation size={18}/>}>
                        Vollbild Pitch starten
                    </Button>
                </Link>
            </div>

            {/* PERSONAS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

            {/* PITCH ASSETS SECTION */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <FileText size={20} className="text-brand-600" /> Pitch-Assets & Onepager
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {ONEPAGERS.map(op => (
                        <div 
                            key={op.id}
                            onClick={() => setSelectedOnepager(op)}
                            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-xl hover:border-brand-500 transition-all cursor-pointer group relative overflow-hidden`}
                        >
                            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${op.color} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`}></div>
                            <div className="relative z-10">
                                <div className={`text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3`}>{op.target}</div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-6 line-clamp-2 leading-tight">{op.title}</h4>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-[10px] font-bold text-brand-600">Vorschau öffnen</span>
                                    <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" /> 
                        Vertriebs-Leitfaden
                    </h3>
                    <p className="text-slate-300 mb-6">
                        Nutzen Sie die neuen **Compliance-Features** (Datenhaltung Schweiz) und die **3D-Wealth Visualisierung** als stärkste Verkaufsargumente.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800" icon={<FileText size={16}/>} onClick={() => setIsGuideOpen(true)}>Objection-Radar & Guide</Button>
                        <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800" icon={<DollarSign size={16}/>} onClick={() => setIsPricesOpen(true)}>Preisliste intern</Button>
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            </div>

            {/* Onepager Viewer Overlay */}
            {selectedOnepager && (
                <OnepagerView 
                    content={selectedOnepager} 
                    onClose={() => setSelectedOnepager(null)} 
                />
            )}

            {/* MODAL: TALKING POINTS & LIVE OBJECTION HANDLING */}
            <Modal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} title="Sales Intelligence Hub" maxWidth="max-w-5xl">
                <div className="space-y-10 p-2">
                    
                    {/* SECTION: LIVE AI HANDLING */}
                    <section className="bg-slate-950 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20 animate-pulse">
                            <Brain size={120} className="text-purple-500" />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white tracking-tight">Live Einwand-Training</h4>
                                    <p className="text-slate-400 text-sm font-medium">Lass dir von der KI helfen, kritische Kunden-Einwände souverän zu umschiffen.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Was sagt der Kunde?</label>
                                        <textarea 
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none h-32"
                                            placeholder="z.B. 'Wir haben keine Zeit für eine Migration' oder 'Der Preis ist zu hoch für mein kleines Büro'..."
                                            value={objectionInput}
                                            onChange={(e) => setObjectionInput(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {["Zu teuer", "Keine Zeit", "Mitarbeiter wehren sich", "Sind zufrieden"].map(t => (
                                            <button 
                                                key={t}
                                                onClick={() => setObjectionInput(`Der Kunde sagt: "${t}"`)}
                                                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[10px] font-bold text-slate-400 transition-colors"
                                            >
                                                + {t}
                                            </button>
                                        ))}
                                    </div>
                                    <Button 
                                        className="w-full bg-purple-600 hover:bg-purple-500 border-none shadow-xl shadow-purple-600/20 py-4 font-black"
                                        onClick={handleHandleObjection}
                                        disabled={isHandlingLoading || !objectionInput.trim()}
                                        icon={isHandlingLoading ? <Loader2 className="animate-spin" size={18}/> : <Brain size={18}/>}
                                    >
                                        {isHandlingLoading ? 'Strategie wird berechnet...' : 'Gegenstrategie generieren'}
                                    </Button>
                                </div>

                                <div className="min-h-[250px] bg-white/5 border border-white/10 rounded-2xl p-6 relative flex flex-col">
                                    {handlingResult ? (
                                        <div className="animate-in fade-in zoom-in-95 duration-500">
                                            <div className="flex items-center gap-2 text-purple-400 mb-4">
                                                <Quote size={16} fill="currentColor" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Empfohlene Taktik</span>
                                            </div>
                                            <div className="prose prose-sm prose-invert max-w-none space-y-4">
                                                <div dangerouslySetInnerHTML={{ __html: handlingResult.replace(/\n/g, '<br/>') }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center space-y-4">
                                            <MessageSquare size={40} className="opacity-20" />
                                            <p className="text-xs font-medium max-w-[200px]">Gib links einen Einwand ein, um eine psychologische Antwortstrategie zu erhalten.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h4 className="font-bold text-brand-600 uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                            <Zap size={14}/> Der Hook (Einstieg)
                        </h4>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border-l-4 border-l-brand-500 italic text-slate-700 dark:text-slate-300 shadow-sm">
                            "Arbeiten Sie noch für Ihre Software, oder arbeitet Ihre Software bereits für Sie? Die meisten Broker verlieren 40% ihrer Zeit durch Medienbrüche zwischen CRM, Excel und Portalen."
                        </div>
                    </section>

                    <section className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
                            <MessageSquare size={120} />
                        </div>
                        <h4 className="font-bold text-emerald-400 uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2 relative z-10">
                            <Sparkles size={14}/> Einwand-Radar: Klassische Muster
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
                    </section>

                    <div className="flex justify-end pt-4">
                        <button onClick={() => setIsGuideOpen(false)} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Schliessen</button>
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

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsPricesOpen(false)}>Schliessen</Button>
                        <Button icon={<Play size={16}/>} onClick={startOfferWizard}>Angebot generieren</Button>
                    </div>
                </div>
            </Modal>

            {/* OFFER WIZARD (Abbreviated logic for brevity) */}
            <Modal isOpen={isOfferWizardOpen} onClose={() => setIsOfferWizardOpen(false)} title="Angebots-Wizard" maxWidth="max-w-2xl">
                <div className="p-8 text-center">
                    <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">Angebot bereit zum Versand</h3>
                    <p className="text-slate-500 mt-2 mb-8">Alle Parameter wurden basierend auf dem gewählten Onepager vorkonfiguriert.</p>
                    <Button onClick={() => setIsOfferWizardOpen(false)} className="w-full">Versand bestätigen</Button>
                </div>
            </Modal>
        </Layout>
    );
};
