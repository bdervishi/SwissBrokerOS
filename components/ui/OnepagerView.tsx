
import React from 'react';
import { 
    X, 
    Download, 
    CheckCircle2, 
    Zap, 
    ShieldCheck, 
    TrendingUp, 
    Building2, 
    Users,
    ArrowRight,
    PieChart,
    Globe,
    Cpu
} from 'lucide-react';
import { Button } from './Button';

export interface OnepagerContent {
    id: string;
    target: string;
    title: string;
    subtitle: string;
    problem: string;
    solution: string;
    highlights: { title: string; desc: string; icon: React.ReactNode }[];
    stats: { label: string; value: string }[];
    cta: string;
    color: string;
}

interface OnepagerViewProps {
    content: OnepagerContent;
    onClose: () => void;
}

export const OnepagerView: React.FC<OnepagerViewProps> = ({ content, onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-full overflow-y-auto rounded-[2.5rem] shadow-2xl relative flex flex-col md:flex-row border border-slate-200 dark:border-slate-800">
                
                {/* Header Controls (Mobile) */}
                <div className="absolute top-6 right-6 z-10 flex gap-2">
                    <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-brand-600 transition-colors">
                        <Download size={20} />
                    </button>
                    <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-red-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Left Sidebar (Value/Stats) */}
                <div className={`w-full md:w-80 bg-gradient-to-br ${content.color} p-8 text-white flex flex-col justify-between`}>
                    <div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-8 backdrop-blur-md">
                            <Zap size={24} />
                        </div>
                        <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">Value Proposition</h2>
                        <p className="text-white/70 text-sm font-medium mb-8">{content.target}</p>
                        
                        <div className="space-y-8">
                            {content.stats.map((stat, i) => (
                                <div key={i}>
                                    <p className="text-4xl font-black tracking-tighter">{stat.value}</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-white/60 mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/10 hidden md:block">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-serif font-bold text-sm">+</div>
                             <span className="text-xs font-black uppercase tracking-widest">SwissBroker OS</span>
                        </div>
                    </div>
                </div>

                {/* Right Main Content */}
                <div className="flex-1 p-8 md:p-16">
                    <div className="max-w-2xl">
                        <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 border border-slate-200 dark:border-slate-700">
                            Onepager / Strategy Sheet
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-[0.9]">
                            {content.title}
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 font-medium mb-12">
                            {content.subtitle}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                                    <X size={14} strokeWidth={3}/> Der Status Quo
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {content.problem}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                                    <CheckCircle2 size={14} strokeWidth={3}/> Die Lösung
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {content.solution}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 mb-16">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Core Capabilities</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {content.highlights.map((h, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-brand-200 transition-colors">
                                        <div className="shrink-0 text-brand-600 dark:text-brand-400">{h.icon}</div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{h.title}</p>
                                            <p className="text-xs text-slate-500 mt-1">{h.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button className="px-10 py-6 text-lg font-black" icon={<ArrowRight size={20}/>}>
                                {content.cta}
                            </Button>
                            <Button variant="outline" className="px-10 py-6" onClick={onClose}>Vorschau schliessen</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
