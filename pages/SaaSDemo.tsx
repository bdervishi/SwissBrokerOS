import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate, Link } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
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
    Quote,
    Scale,
    ShieldAlert,
    // Add missing Search icon import
    Search
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
        solution: 'SwissBroker OS zentralisiert alle Prozesse. Vom KI-gestützten Compliance Shield bis zum automatisierten Arbeitsrapport. Wir eliminieren manuelle Schnittstellen.',
        highlights: [
            { title: 'Compliance Shield', desc: 'Zefix-Sync & KYC automatisiert.', icon: <Scale size={20}/> },
            { title: 'Arbeitsrapport', desc: 'Integrierte Zeiterfassung & HR.', icon: <Clock size={20}/> },
            { title: 'nDSG Safe Vault', desc: 'Hosting in Zürich (Tier IV).', icon: <Lock size={20}/> },
            { title: 'AI Contract Review', desc: 'Fine-Print & AVB Analyse.', icon: <Search size={20}/> }
        ],
        stats: [
            { label: 'Zeitersparnis', value: '45%' },
            { label: 'Compliance-Score', value: '100%' },
            { label: 'Setup Zeit', value: '2h' }
        ],
        cta: 'Demo für Broker starten',
        color: 'from-brand-600 to-indigo-700'
    },
    {
        id: 'op_compliance',
        target: 'Für Compliance Officer',
        title: 'Risiko-Management per Knopfdruck.',
        subtitle: 'Automatisierte Überwachung nach FINMA & nDSG Standards.',
        problem: 'Manuelle Sorgfaltspflichten sind teuer, fehleranfällig und oft lückenhaft dokumentiert.',
        solution: 'Unser Compliance Shield integriert Zefix, SECO-Listen und Plausibilitäts-KIs direkt in den Beratungs-Workflow. Lückenlose Dokumentation im Journal.',
        highlights: [
            { title: 'KYC Automation', desc: 'Echtzeit-Identitätsprüfung.', icon: <ShieldCheck size={20}/> },
            { title: 'AML Radar', desc: 'Früherkennung von Anomalien.', icon: <ShieldAlert size={20}/> },
            { title: 'Zefix API', desc: 'Stammdaten immer aktuell.', icon: <RefreshCw size={20}/> },
            { title: 'Audit Log', desc: 'Revisionssicheres Journal.', icon: <FileText size={20}/> }
        ],
        stats: [
            { label: 'Audit Ready', value: 'Live' },
            { label: 'Fehlerrate', value: '< 0.1%' },
            { label: 'Legal-Proof', value: 'nDSG' }
        ],
        cta: 'Security Docs öffnen',
        color: 'from-emerald-700 to-emerald-950'
    },
    {
        id: 'op_investor',
        target: 'Für Investoren (VC/Private)',
        title: 'Digitalisierung des Schweizer Finanzkerns.',
        subtitle: 'Die SaaS-Plattform für den 35 Mrd. CHF Brokermarkt.',
        problem: 'Der Schweizer Brokermarkt ist hochgradig fragmentiert und technologisch veraltet. Legacy-Systeme verhindern Skaleneffekte.',
        solution: 'Wir bauen den "Vertical SaaS" Layer. Durch tiefe Integration von AI, HR und Compliance schaffen wir ein unersetzbares System-of-Record.',
        highlights: [
            { title: 'Vertical SaaS Moat', desc: 'Tief integrierte Compliance-Logik.', icon: <ShieldCheck size={20}/> },
            { title: 'AI Moat', desc: 'Eigene Modelle für Schweizer AVB.', icon: <Cpu size={20}/> },
            { title: 'Expansion Ready', desc: 'Modularer Aufbau (Add-ons).', icon: <Plus size={20}/> },
            // Fix: Changed property 'value' to 'desc' to match OnepagerContent interface
            { title: 'TAM (CH)', desc: '1.2B', icon: <Globe size={20}/> }
        ],
        stats: [
            { label: 'MRR Growth', value: '18%' },
            { label: 'LTV/CAC', value: '4.8x' },
            { label: 'Churn Risk', value: 'Low' }
        ],
        cta: 'Investor Deck öffnen',
        color: 'from-slate-800 to-slate-950'
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
            features: ["Einfaches Dashboard", "Basic CRM", "Ohne HR & Rapport"],
            icon: <User size={32} className="text-brand-500" />,
            color: "border-brand-200 hover:border-brand-400"
        },
        {
            id: 'u_broker_1',
            title: "Professional Broker",
            description: "Wachsendes Maklerbüro mit Fokus auf Compliance & Zeiterfassung.",
            features: ["Compliance Shield", "Arbeitsrapport & HR", "Hypotheken-Rechner"],
            icon: <Briefcase size={32} className="text-emerald-500" />,
            color: "border-emerald-200 hover:border-emerald-400"
        },
        {
            id: 'u_demo_corp',
            title: "Enterprise Broker",
            description: "Grosse Organisation, Full Compliance, Multi-Team-Reporting.",
            features: ["Contract AI Pro", "SaaS Risk Radar", "Full White Labeling"],
            icon: <Users size={32} className="text-purple-500" />,
            color: "border-purple-200 hover:border-purple-400"
        }
    ];

    const handleHandleObjection = async () => {
        if (!objectionInput.trim() || !process.env.API_KEY) return;
        setIsHandlingLoading(true);
        setHandlingResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Du bist ein erfahrener Sales-Coach für SaaS-Vertrieb im Schweizer Finanzmarkt.
                Ein potenzieller Kunde (Broker) bringt folgenden Einwand bezüglich Compliance oder HR: "${objectionInput}"
                
                Erstelle eine schlagfertige Antwort nach der L.A.E.R.-Methode.
                Themenfokus: SwissBroker OS Compliance Shield, nDSG, Zeiterfassung (Arbeitsrapport).
                
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
                        Inklusive neuer Module: Compliance Shield & HR Operations.
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
                            <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest">
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
                                    <CheckCircle size={14} className="text-emerald-500" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

            {/* Objection Radar Section */}
            <section className="bg-slate-950 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden mb-12">
                <div className="absolute top-0 right-0 p-8 opacity-20 animate-pulse">
                    <Brain size={120} className="text-purple-500" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white tracking-tight">Live Einwand-Training (AI)</h4>
                            <p className="text-slate-400 text-sm font-medium">Lass dir von der KI helfen, kritische Compliance- oder HR-Fragen souverän zu klären.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Was sagt der Kunde?</label>
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none h-32"
                                    placeholder="z.B. 'Warum brauchen wir einen Zefix-Sync?' oder 'Zeiterfassung ist bei uns Vertrauenssache'..."
                                    value={objectionInput}
                                    onChange={(e) => setObjectionInput(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {["Zefix zu teuer", "HR ist zu komplex", "Haftung reicht uns so", "Daten nDSG?"].map(t => (
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
                                        <span className="text-[10px] font-black uppercase tracking-widest">Verkaufs-Taktik</span>
                                    </div>
                                    <div className="prose prose-sm prose-invert max-w-none space-y-4">
                                        <div dangerouslySetInnerHTML={{ __html: handlingResult.replace(/\n/g, '<br/>') }} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center space-y-4">
                                    <MessageSquare size={40} className="opacity-20" />
                                    <p className="text-xs font-medium max-w-[200px]">Gib links einen Einwand ein, um eine Antwortstrategie zu erhalten.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Onepager Viewer Overlay */}
            {selectedOnepager && (
                <OnepagerView 
                    content={selectedOnepager} 
                    onClose={() => setSelectedOnepager(null)} 
                />
            )}
        </Layout>
    );
};