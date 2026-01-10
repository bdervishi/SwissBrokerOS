
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Users2, 
    Users,
    Target, 
    ShieldCheck, 
    TrendingUp, 
    Zap, 
    ChevronRight, 
    ChevronLeft, 
    X, 
    Play,
    BrainCircuit,
    Globe,
    Briefcase,
    LayoutDashboard,
    Presentation,
    ArrowRight,
    CheckCircle,
    XCircle,
    Layers,
    Calculator,
    Mail,
    Smartphone,
    Database,
    Shield,
    Clock,
    HeartPulse,
    Scale,
    Search,
    ShieldAlert,
    Coins,
    Building,
    BarChart3,
    ArrowUpRight,
    Handshake,
    // Add missing Wallet icon
    Wallet
} from 'lucide-react';
import { Button } from '../components/ui/Button';

type Persona = 'BROKER' | 'AGENT' | 'PROVIDER' | 'INVESTOR' | null;

interface Slide {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    points: string[];
    visualType: 'IMAGE' | 'STATS' | 'NETWORK' | 'COMPARISON' | 'GRID' | 'API';
}

const PERSONA_DECKS: Record<Exclude<Persona, null>, Slide[]> = {
    BROKER: [
        {
            id: 'b1',
            title: "Scale without Admin.",
            subtitle: "Fokus für Broker-Inhaber",
            description: "Makler verlieren 60% ihrer Zeit in Portalen. Wir geben Ihnen diese Zeit zurück durch totale Automatisierung.",
            icon: <Building size={48} />,
            color: "from-brand-600 to-indigo-700",
            points: ["Zentrales Portfolio Management", "Automatisierte Zeiterfassung", "Team-Hierarchien & HR", "nDSG Safe Vault"],
            visualType: 'NETWORK'
        },
        {
            id: 'b2',
            title: "The Compliance Shield.",
            subtitle: "Sicherer Hafen Schweiz",
            description: "Vermeiden Sie Haftungsfallen. Unser System validiert Zefix-Daten und prüft PEP-Listen in Echtzeit.",
            icon: <ShieldCheck size={48} />,
            color: "from-emerald-600 to-emerald-800",
            points: ["Zefix Live-Sync", "Automatisierte GwG-Files", "Haftungs-Radar (Storno)", "Tier IV Hosting Zürich"],
            visualType: 'STATS'
        }
    ],
    AGENT: [
        {
            id: 'a1',
            title: "Your Wallet. Your Rules.",
            subtitle: "Fokus für Vermittler & Aussendienst",
            description: "Schluss mit Excel-Listen für Ihre Provisionen. Sehen Sie Ihren Verdienst in Echtzeit – direkt nach dem Abschluss.",
            icon: <Wallet size={48} />,
            color: "from-amber-500 to-orange-700",
            points: ["Live Commission Tracking", "Digitales 'Portemonnaie'", "Sofortige Abrechnung", "Transparente Splits"],
            visualType: 'STATS'
        },
        {
            id: 'a2',
            title: "The Lead Magnet.",
            subtitle: "Mehr Sales, weniger Suchen",
            description: "Der Lead Radar findet für Sie Neukunden im Web. Unsere KI bereitet das Gespräch vor, bevor Sie wählen.",
            icon: <Target size={48} />,
            color: "from-purple-600 to-pink-700",
            points: ["AI-gestützte Kaltakquise", "Mobile Client App", "3D Wealth Vis (Wow-Effekt)", "Terminbuchung integriert"],
            visualType: 'NETWORK'
        }
    ],
    PROVIDER: [
        {
            id: 'p1',
            title: "Embedded Finance API.",
            subtitle: "Für Versicherer & Leasinggeber",
            description: "Integrieren Sie Ihre Produkte direkt in den Beratungs-Workflow von hunderten Brokern via API.",
            icon: <Zap size={48} />,
            color: "from-blue-600 to-indigo-800",
            points: ["Direct-to-Broker Distribution", "Standardisierte Datensätze", "Instant Underwriting", "Geringere Akquisekosten"],
            visualType: 'API'
        },
        {
            id: 'p2',
            title: "Lead Marketplace Access.",
            subtitle: "Prequalified Business",
            description: "Greifen Sie auf einen Pool von verifizierten Kundenanfragen zu, die Makler auf unserer Plattform teilen.",
            icon: <Handshake size={48} />,
            color: "from-emerald-700 to-teal-900",
            points: ["Verifizierte Lead-Qualität", "Transparentes Bidding", "Direkter Datentransfer", "Sichere Abrechnung"],
            visualType: 'GRID'
        }
    ],
    INVESTOR: [
        {
            id: 'i1',
            title: "The Vertical SaaS Moat.",
            subtitle: "Investor Relations",
            description: "Wir digitalisieren den Kernmarkt der Schweizer Finanzindustrie. Ein unersetzbares System-of-Record.",
            icon: <TrendingUp size={48} />,
            color: "from-slate-800 to-slate-950",
            points: ["High Stickiness (Core OS)", "Data Moat (CH Logic)", "Scalable Unit Economics", "Expansion in EU Ready"],
            visualType: 'STATS'
        },
        {
            id: 'i2',
            title: "AI & Automation DNA.",
            subtitle: "Unfair Advantage",
            description: "Unsere proprietären KI-Modelle für Schweizer AVBs schaffen eine Effizienz-Barriere für Konkurrenten.",
            icon: <BrainCircuit size={48} />,
            color: "from-indigo-900 to-purple-900",
            points: ["Proprietary AI Pipelines", "Deep Legal Integration", "18% MRR Growth Rate", "Low Churn Ecosystem"],
            visualType: 'NETWORK'
        }
    ]
};

export const SaaSPitch: React.FC = () => {
    const navigate = useNavigate();
    const [persona, setPersona] = useState<Persona>(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [direction, setDirection] = useState(0);

    const activeDeck = persona ? PERSONA_DECKS[persona] : [];
    const slide = activeDeck[currentIdx];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'Escape') {
                if (persona) setPersona(null);
                else navigate('/saas/demo');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentIdx, persona]);

    const nextSlide = () => {
        if (currentIdx < activeDeck.length - 1) {
            setDirection(1);
            setCurrentIdx(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentIdx > 0) {
            setDirection(-1);
            setCurrentIdx(prev => prev - 1);
        }
    };

    if (!persona) {
        return (
            <div className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col items-center justify-center p-8 font-sans">
                <div className="absolute top-8 left-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-serif font-bold text-xl shadow-lg shadow-red-600/20">+</div>
                    <span className="font-black text-xl tracking-tighter uppercase">SwissBroker <span className="text-slate-500">OS</span></span>
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-2xl mb-16"
                >
                    <h1 className="text-5xl font-black mb-6 tracking-tight">Wählen Sie Ihr Publikum.</h1>
                    <p className="text-slate-400 text-lg">Jede Rolle hat andere Bedürfnisse. Wählen Sie ein Pitch-Deck, um die passenden Argumente zu präsentieren.</p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                    <PersonaCard 
                        title="Broker / Inhaber" 
                        desc="Haftungsschutz & Team-Skalierung" 
                        icon={<Building size={32}/>} 
                        color="border-brand-500 hover:bg-brand-500/10" 
                        onClick={() => { setPersona('BROKER'); setCurrentIdx(0); }}
                    />
                    <PersonaCard 
                        title="Agent / Vermittler" 
                        desc="Provisionen & Lead-Radar" 
                        icon={<Users size={32}/>} 
                        color="border-amber-500 hover:bg-amber-500/10" 
                        onClick={() => { setPersona('AGENT'); setCurrentIdx(0); }}
                    />
                    <PersonaCard 
                        title="Provider (Vers./Bank)" 
                        desc="API-Distribution & Marketplace" 
                        icon={<Zap size={32}/>} 
                        color="border-blue-500 hover:bg-blue-500/10" 
                        onClick={() => { setPersona('PROVIDER'); setCurrentIdx(0); }}
                    />
                    <PersonaCard 
                        title="Investor / VCs" 
                        desc="Marktmacht & Unit Economics" 
                        icon={<TrendingUp size={32}/>} 
                        color="border-purple-500 hover:bg-purple-500/10" 
                        onClick={() => { setPersona('INVESTOR'); setCurrentIdx(0); }}
                    />
                </div>

                <button 
                    onClick={() => navigate('/saas/demo')}
                    className="mt-20 text-slate-500 hover:text-white transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-xs"
                >
                    <X size={16}/> Zum Demo Center zurückkehren
                </button>
            </div>
        );
    }

    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0, scale: 0.8 }),
        center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
        exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0, scale: 1.2 })
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 text-white overflow-hidden font-sans selection:bg-brand-500/30">
            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-8 z-50 flex justify-between items-center bg-gradient-to-b from-slate-950/80 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-serif font-bold text-xl shadow-lg">+</div>
                    <div>
                        <span className="font-black text-xl tracking-tighter uppercase block">SwissBroker OS</span>
                        <span className="text-[10px] font-black uppercase text-brand-500 tracking-[0.3em]">{persona} PITCH DECK</span>
                    </div>
                </div>
                <button 
                    onClick={() => setPersona(null)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 group"
                    title="Deck wechseln (ESC)"
                >
                    <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>

            <div className="relative h-full w-full flex items-center justify-center">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={slide.id}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="w-full max-w-7xl px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
                    >
                        {/* Content */}
                        <div className="space-y-10">
                            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center shadow-2xl shadow-brand-500/20`}>
                                {slide.icon}
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-brand-400 font-black uppercase tracking-[0.3em] text-sm">{slide.subtitle}</h3>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">{slide.title}</h1>
                                <p className="text-xl text-slate-400 max-w-xl leading-relaxed">{slide.description}</p>
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {slide.points.map((p, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300 font-bold bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Visuals */}
                        <div className="hidden lg:block relative h-96">
                             <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-10 blur-[120px] rounded-full`}></div>
                             <div className="relative z-10 w-full h-full flex items-center justify-center">
                                 {slide.visualType === 'STATS' && (
                                     <div className="flex gap-4">
                                         <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center">
                                             <div className="text-4xl font-black text-brand-500 mb-2">100%</div>
                                             <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Swiss Data</div>
                                         </div>
                                         <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center mt-8">
                                             <div className="text-4xl font-black text-emerald-500 mb-2">45%</div>
                                             <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">ROI / Jahr</div>
                                         </div>
                                     </div>
                                 )}
                                 {slide.visualType === 'NETWORK' && (
                                      <div className="relative">
                                          <div className="w-32 h-32 bg-brand-600 rounded-full flex items-center justify-center animate-pulse">
                                              {slide.icon}
                                          </div>
                                          <div className="absolute -top-16 -left-16 w-16 h-16 bg-white/10 rounded-full border border-white/20 flex items-center justify-center"><Target size={24}/></div>
                                          <div className="absolute -bottom-16 -right-16 w-16 h-16 bg-white/10 rounded-full border border-white/20 flex items-center justify-center"><Users size={24}/></div>
                                      </div>
                                 )}
                                 {slide.visualType === 'API' && (
                                     <div className="bg-slate-900 p-8 rounded-2xl border border-white/10 font-mono text-sm w-full max-w-md shadow-2xl">
                                         <div className="flex gap-2 mb-4"><div className="w-3 h-3 bg-red-500 rounded-full"></div><div className="w-3 h-3 bg-amber-500 rounded-full"></div><div className="w-3 h-3 bg-emerald-500 rounded-full"></div></div>
                                         <p className="text-slate-500">// GET /api/v1/distribution</p>
                                         <p className="text-emerald-400">"status": "connected",</p>
                                         <p className="text-emerald-400">"broker_count": 485,</p>
                                         <p className="text-emerald-400">"active_leads": 1240</p>
                                     </div>
                                 )}
                                 {/* Grid etc fallback */}
                                 {(slide.visualType === 'GRID' || slide.visualType === 'IMAGE') && (
                                     <div className="grid grid-cols-2 gap-4">
                                         <div className="h-32 w-32 bg-white/5 rounded-2xl animate-pulse"></div>
                                         <div className="h-32 w-32 bg-white/5 rounded-2xl animate-pulse delay-75"></div>
                                         <div className="h-32 w-32 bg-white/5 rounded-2xl animate-pulse delay-150"></div>
                                         <div className="h-32 w-32 bg-white/5 rounded-2xl animate-pulse delay-200"></div>
                                     </div>
                                 )}
                             </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Nav Footer */}
            <div className="absolute bottom-0 left-0 w-full p-8 z-50 flex justify-between items-center bg-gradient-to-t from-slate-950/80 to-transparent">
                <div className="flex gap-4">
                    <button 
                        onClick={prevSlide}
                        disabled={currentIdx === 0}
                        className={`p-4 rounded-2xl border transition-all ${currentIdx === 0 ? 'opacity-20 cursor-not-allowed border-white/5' : 'bg-white/5 hover:bg-white/10 border-white/10 active:scale-95'}`}
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button 
                        onClick={nextSlide}
                        disabled={currentIdx === activeDeck.length - 1}
                        className={`p-4 rounded-2xl border transition-all ${currentIdx === activeDeck.length - 1 ? 'opacity-20 cursor-not-allowed border-white/5' : 'bg-brand-600 border-brand-500 hover:bg-brand-500 active:scale-95 shadow-xl shadow-brand-500/20'}`}
                    >
                        <ChevronRight size={32} />
                    </button>
                </div>

                <div className="flex gap-3">
                    {activeDeck.map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => { setDirection(i > currentIdx ? 1 : -1); setCurrentIdx(i); }}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIdx ? 'w-12 bg-brand-500' : 'w-3 bg-slate-800 hover:bg-slate-700'}`}
                        />
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-6 text-slate-500 text-xs font-black uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-2"><Globe size={14} /> Swiss OS</div>
                    <div className="flex items-center gap-2"><ShieldAlert size={14} /> FINMA / nDSG</div>
                </div>
            </div>
        </div>
    );
};

const PersonaCard = ({ title, desc, icon, color, onClick }: any) => (
    <div 
        onClick={onClick}
        className={`p-8 bg-white/5 border-2 rounded-3xl transition-all cursor-pointer group flex flex-col h-full ${color}`}
    >
        <div className="mb-6 group-hover:scale-110 transition-transform duration-500">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
        <div className="mt-auto pt-6 flex justify-end">
            <ArrowRight size={18} className="text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
    </div>
);
