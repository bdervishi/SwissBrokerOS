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
    HeartPulse
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface Slide {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    points: string[];
    visualType: 'IMAGE' | 'STATS' | 'NETWORK' | 'COMPARISON' | 'GRID';
}

const PITCH_SLIDES: Slide[] = [
    {
        id: 'intro',
        title: "Build a Better Brokerage.",
        subtitle: "SwissBroker OS — Das komplette Betriebssystem.",
        description: "Warum 5 verschiedene Tools nutzen, wenn man eines haben kann, das alles besser macht? Skalierbar, sicher und Schweizer-DNA.",
        icon: <Zap size={48} />,
        color: "from-brand-600 to-indigo-700",
        points: ["Zentralisiertes CRM", "Automatisierte HR", "KI-Lead Radar", "White Labeling"],
        visualType: 'NETWORK'
    },
    {
        id: 'comparison',
        title: "Der Quantensprung.",
        subtitle: "Veraltetes Chaos vs. SwissBroker OS.",
        description: "Eliminieren Sie manuelle Prozesse. Wir verwandeln Ihr Backoffice von einer Kostenstelle in einen Wachstums-Motor.",
        icon: <ArrowRight size={48} />,
        color: "from-slate-700 to-slate-900",
        points: ["Vollautomatisiertes CRM", "Echtzeit-Transparenz", "Papierloses Büro", "Höchste nDSG-Sicherheit"],
        visualType: 'COMPARISON'
    },
    {
        id: 'hr',
        title: "The People Engine.",
        subtitle: "Verwalten Sie Ihr Team, nicht nur Ihre Daten.",
        description: "Von der Lohnbuchhaltung bis zum Provisions-Split. Integrierte Team-Strukturen, die mit Ihrem Maklerbüro wachsen.",
        icon: <Users2 size={48} />,
        color: "from-emerald-600 to-teal-700",
        points: ["Hierarchische Team-Verwaltung", "Automatisierte Courtage-Splits", "HR-Personalakten (nDSG)", "Berechtigungs-Matrix"],
        visualType: 'STATS'
    },
    {
        id: 'growth',
        title: "Growth on Autopilot.",
        subtitle: "Proaktive Akquise mit KI-Grounding.",
        description: "Unser Lead Radar findet Neukunden im Web, während Sie schlafen. Dank Gemini-Integration identifizieren wir Potenziale in Echtzeit.",
        icon: <Target size={48} />,
        color: "from-purple-600 to-pink-700",
        points: ["Real-time Google Search Integration", "B2B & B2C Radar", "Automatisierter Daten-Import", "Sales Pipeline Management"],
        visualType: 'NETWORK'
    },
    {
        id: 'features',
        title: "Der komplette Stack.",
        subtitle: "Alles, was ein Makler wirklich braucht.",
        description: "Wir decken den gesamten Lebenszyklus eines Maklerbüros ab – von der Gründung bis zum 100-Personen-Betrieb.",
        icon: <Layers size={48} />,
        color: "from-amber-500 to-orange-700",
        points: ["CRM & Portfolio", "Hypotheken-Simulator", "Steuer-Cockpit", "AI Studio", "Mobile App"],
        visualType: 'GRID'
    },
    {
        id: 'trust',
        title: "The Swiss Vault.",
        subtitle: "Sicherheit ohne Kompromisse.",
        description: "Hosting in Zürich (Tier IV). Konform mit dem neuen Datenschutzgesetz (nDSG) und FINMA-bereit.",
        icon: <ShieldCheck size={48} />,
        color: "from-red-600 to-rose-700",
        points: ["Data Residency: Schweiz (ZH)", "AES-256 Verschlüsselung", "Audited SaaS Infrastructure", "ISO 27001 Datacenter"],
        visualType: 'NETWORK'
    },
    {
        id: 'outro',
        title: "Bereit für das nächste Level?",
        subtitle: "Starten Sie jetzt Ihre kostenlose Demo.",
        description: "Überzeugen Sie sich selbst von der Power von SwissBroker OS. In wenigen Klicks einsatzbereit.",
        icon: <Play size={48} />,
        color: "from-slate-800 to-slate-950",
        points: ["14 Tage Gratis-Test", "Keine Setup-Gebühr", "Full Support inklusive", "Ready for 2025"],
        visualType: 'STATS'
    }
];

const FEATURE_GRID = [
    { icon: <Users size={20}/>, label: "CRM" },
    { icon: <Shield size={20}/>, label: "Policen" },
    { icon: <Calculator size={20}/>, label: "Hypotheken" },
    { icon: <Target size={20}/>, label: "Leads" },
    { icon: <Smartphone size={20}/>, label: "Client App" },
    { icon: <BrainCircuit size={20}/>, label: "AI Studio" },
    { icon: <Mail size={20}/>, label: "Smart Inbox" },
    { icon: <Users2 size={20}/>, label: "HR/Teams" },
    { icon: <TrendingUp size={20}/>, label: "Commissions" },
    { icon: <ShieldCheck size={20}/>, label: "Compliance" },
    { icon: <Database size={20}/>, label: "Import" },
    { icon: <Globe size={20}/>, label: "Whitelabel" },
];

export const SaaSPitch: React.FC = () => {
    const navigate = useNavigate();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [direction, setDirection] = useState(0);

    const slide = PITCH_SLIDES[currentIdx];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'Escape') navigate('/saas/demo');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIdx]);

    const nextSlide = () => {
        if (currentIdx < PITCH_SLIDES.length - 1) {
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

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.8,
            filter: 'blur(10px)'
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)'
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 1.2,
            filter: 'blur(10px)'
        })
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 text-white overflow-hidden font-sans selection:bg-brand-500/30">
            {/* Header Controls */}
            <div className="absolute top-0 left-0 w-full p-8 z-50 flex justify-between items-center bg-gradient-to-b from-slate-950/80 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-serif font-bold text-xl shadow-lg shadow-red-600/20">+</div>
                    <span className="font-black text-xl tracking-tighter uppercase">SwissBroker <span className="text-slate-500">OS</span></span>
                </div>
                <button 
                    onClick={() => navigate('/saas/demo')}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 group"
                    title="Beenden (ESC)"
                >
                    <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>

            {/* Main Presentation Area */}
            <div className="relative h-full w-full flex items-center justify-center">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentIdx}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.3 },
                            scale: { duration: 0.4 }
                        }}
                        className="w-full max-w-7xl px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
                    >
                        {/* Content Section */}
                        <div className="space-y-10">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center shadow-2xl shadow-brand-500/20`}
                            >
                                {slide.icon}
                            </motion.div>

                            <div className="space-y-4">
                                <motion.h3 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-brand-400 font-black uppercase tracking-[0.3em] text-sm"
                                >
                                    {slide.subtitle}
                                </motion.h3>
                                <motion.h1 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95]"
                                >
                                    {slide.title}
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-xl text-slate-400 max-w-xl leading-relaxed"
                                >
                                    {slide.description}
                                </motion.p>
                            </div>

                            <motion.ul 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                            >
                                {slide.points.map((p, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300 font-bold bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                        <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                                        {p}
                                    </li>
                                ))}
                            </motion.ul>

                            {currentIdx === PITCH_SLIDES.length - 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="pt-8"
                                >
                                    <Link to="/saas/demo">
                                        <Button size="lg" className="px-12 py-8 text-2xl font-black bg-emerald-500 hover:bg-emerald-600 shadow-2xl shadow-emerald-500/20 group">
                                            Live Demo starten <Play size={24} className="ml-2 fill-current group-hover:scale-125 transition-transform" />
                                        </Button>
                                    </Link>
                                </motion.div>
                            )}
                        </div>

                        {/* Visual Section */}
                        <div className="hidden lg:block relative min-h-[600px]">
                            {/* Decorative Background Elements */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-10 blur-[120px] rounded-full`}></div>
                            
                            <motion.div 
                                initial={{ scale: 0.9, rotate: -5, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 1 }}
                                className="relative z-10 w-full h-full flex items-center justify-center"
                            >
                                {slide.visualType === 'NETWORK' && (
                                    <div className="grid grid-cols-2 gap-8 w-full">
                                        {[LayoutDashboard, Briefcase, BrainCircuit, ShieldCheck].map((Icon, i) => (
                                            <motion.div 
                                                key={i}
                                                animate={{ y: [0, -10, 0] }}
                                                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                                                className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center gap-4 backdrop-blur-xl"
                                            >
                                                <Icon size={64} className="text-brand-500" />
                                                <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {slide.visualType === 'STATS' && (
                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                        <div className="relative">
                                             <div className={`w-80 h-80 rounded-full border-4 border-white/5 flex items-center justify-center animate-spin-slow`}>
                                                <div className={`w-64 h-64 rounded-full border-4 border-white/10 flex items-center justify-center`}>
                                                    <div className={`w-48 h-48 rounded-full bg-gradient-to-br ${slide.color} flex items-center justify-center shadow-2xl`}>
                                                        {React.cloneElement(slide.icon as React.ReactElement, { size: 80, className: 'text-white' })}
                                                    </div>
                                                </div>
                                             </div>
                                             <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-10 -right-10 bg-emerald-500 text-white p-6 rounded-3xl font-black shadow-xl">
                                                +42% ROI
                                             </motion.div>
                                             <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute -bottom-10 -left-10 bg-brand-500 text-white p-6 rounded-3xl font-black shadow-xl">
                                                nDSG Ready
                                             </motion.div>
                                        </div>
                                    </div>
                                )}

                                {slide.visualType === 'COMPARISON' && (
                                    <div className="flex flex-col gap-8 w-full max-w-md">
                                        <motion.div 
                                            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                                            className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 relative overflow-hidden"
                                        >
                                            <div className="text-xs font-black uppercase text-red-400 mb-3 tracking-widest flex items-center gap-2">
                                                <XCircle size={14} /> Gestern: Papier & 5+ Tools
                                            </div>
                                            <div className="space-y-2 opacity-50">
                                                <div className="h-4 bg-red-500/20 rounded w-3/4"></div>
                                                <div className="h-4 bg-red-500/20 rounded w-full"></div>
                                                <div className="h-4 bg-red-500/20 rounded w-5/6"></div>
                                            </div>
                                        </motion.div>
                                        <div className="flex justify-center -my-4 relative z-10">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl text-slate-900 border-4 border-slate-950">
                                                <ArrowRight className="rotate-90" />
                                            </div>
                                        </div>
                                        <motion.div 
                                            initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }}
                                            className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden ring-4 ring-emerald-500/20"
                                        >
                                            <div className="text-xs font-black uppercase text-emerald-400 mb-3 tracking-widest flex items-center gap-2">
                                                <CheckCircle size={14} /> Heute: 1 Single Source of Truth
                                            </div>
                                            <div className="space-y-3">
                                                <div className="h-4 bg-emerald-500/40 rounded w-1/2"></div>
                                                <div className="h-4 bg-emerald-500/40 rounded w-full"></div>
                                                <div className="h-4 bg-emerald-500/40 rounded w-2/3"></div>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}

                                {slide.visualType === 'GRID' && (
                                    <div className="grid grid-cols-3 gap-4 w-full">
                                        {FEATURE_GRID.map((feat, i) => (
                                            <motion.div 
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.1 * i + 0.4 }}
                                                className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center group hover:bg-brand-500/10 hover:border-brand-500/30 transition-all"
                                            >
                                                <div className="text-brand-500 group-hover:scale-125 transition-transform">{feat.icon}</div>
                                                <div className="text-[10px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-white transition-colors">{feat.label}</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls Footer */}
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
                        disabled={currentIdx === PITCH_SLIDES.length - 1}
                        className={`p-4 rounded-2xl border transition-all ${currentIdx === PITCH_SLIDES.length - 1 ? 'opacity-20 cursor-not-allowed border-white/5' : 'bg-brand-600 border-brand-500 hover:bg-brand-500 active:scale-95 shadow-xl shadow-brand-500/20'}`}
                    >
                        <ChevronRight size={32} />
                    </button>
                </div>

                <div className="flex gap-3">
                    {PITCH_SLIDES.map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => {
                                setDirection(i > currentIdx ? 1 : -1);
                                setCurrentIdx(i);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIdx ? 'w-12 bg-brand-500' : 'w-3 bg-slate-800 hover:bg-slate-700'}`}
                        />
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-6 text-slate-500 text-xs font-black uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-2"><Globe size={14} /> Swiss Dedicated</div>
                    <div className="flex items-center gap-2"><Briefcase size={14} /> Scalable Architecture</div>
                </div>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
            `}</style>
        </div>
    );
};