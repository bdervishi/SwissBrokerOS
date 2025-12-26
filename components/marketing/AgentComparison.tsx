import React from 'react';
import { Card } from '../ui/Card';
import { 
    TrendingDown, 
    Zap, 
    Clock, 
    Users, 
    CheckCircle, 
    XCircle,
    Bot,
    User
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const AgentComparison: React.FC = () => {
    const costData = [
        { name: 'Human Agent', cost: 1.50, color: '#94a3b8' }, // CHF per minute (~90 CHF/h fully loaded)
        { name: 'SwissBroker AI', cost: 0.08, color: '#0ea5e9' }, // API cost + Margin
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Cost Analysis */}
                <Card title="Kosten-Analyse (pro Minute)">
                    <div className="h-[300px] w-full flex flex-col justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={costData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    formatter={(value: number) => [`CHF ${value.toFixed(2)}`, 'Kosten/Min']}
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="cost" barSize={40} radius={[0, 4, 4, 0]}>
                                    {costData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
                            <TrendingDown className="text-emerald-600" size={24} />
                            <div>
                                <p className="font-bold text-emerald-800 dark:text-emerald-300">94% Kostenersparnis</p>
                                <p className="text-xs text-emerald-700 dark:text-emerald-400">Bei gleicher oder höherer Verfügbarkeit.</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Quality & Features */}
                <Card title="Qualitäts-Matrix">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="text-center">
                                <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                                    <User size={24} className="text-slate-500" />
                                </div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-300">Mensch</h4>
                            </div>
                            <div className="text-center">
                                <div className="mx-auto w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-2">
                                    <Bot size={24} className="text-brand-600" />
                                </div>
                                <h4 className="font-bold text-brand-600">SwissBroker AI</h4>
                            </div>
                        </div>

                        <div className="space-y-4 text-sm">
                            <ComparisonRow 
                                label="Reaktionszeit" 
                                left="Variabel" 
                                right="< 500ms" 
                                winner="RIGHT"
                            />
                            <ComparisonRow 
                                label="Verfügbarkeit" 
                                left="8h / 5 Tage" 
                                right="24/7" 
                                winner="RIGHT"
                            />
                            <ComparisonRow 
                                label="Skalierbarkeit" 
                                left="Linear (Teuer)" 
                                right="Unbegrenzt" 
                                winner="RIGHT"
                            />
                            <ComparisonRow 
                                label="Empathie & Tonfall" 
                                left="Natürlich" 
                                right="Neural (High-Fi)" 
                                winner="DRAW"
                            />
                            <ComparisonRow 
                                label="Compliance" 
                                left="Fehleranfällig" 
                                right="100% Skript-treu" 
                                winner="RIGHT"
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Audio Quality Info */}
            <div className="bg-slate-900 text-white rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="relative z-10 flex-1">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Zap className="text-yellow-400" fill="currentColor" />
                        Native Audio Streaming
                    </h3>
                    <p className="text-slate-300 mb-6 leading-relaxed">
                        Anders als ältere Systeme nutzt SwissBroker OS <strong>kein Speech-to-Text</strong>. 
                        Das Modell "hört" den Audio-Stream direkt und generiert Audio-Antworten in Echtzeit.
                        Dadurch bleiben Emotionen, Intonation und Nuancen erhalten.
                        <br/><br/>
                        Es klingt nicht wie ein Roboter, der vorliest – es klingt wie ein Gespräch.
                    </p>
                    <div className="flex gap-4">
                        <Badge icon={<CheckCircle size={14}/>} label="Unterbrechbar" />
                        <Badge icon={<CheckCircle size={14}/>} label="Emotionale Intelligenz" />
                        <Badge icon={<CheckCircle size={14}/>} label="Schweizer Akzent (adaptiv)" />
                    </div>
                </div>
                
                {/* Visual Representation of Waveform */}
                <div className="relative z-10 w-full md:w-1/3 h-32 flex items-center justify-center gap-1">
                    {[...Array(20)].map((_, i) => (
                        <div 
                            key={i} 
                            className="w-1.5 bg-gradient-to-t from-brand-500 to-purple-500 rounded-full animate-pulse"
                            style={{ 
                                height: `${20 + Math.random() * 80}%`,
                                animationDelay: `${i * 0.1}s`
                            }} 
                        />
                    ))}
                </div>

                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            </div>
        </div>
    );
};

const ComparisonRow = ({ label, left, right, winner }: { label: string, left: string, right: string, winner: 'LEFT' | 'RIGHT' | 'DRAW' }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
        <div className={`flex-1 text-center ${winner === 'LEFT' ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
            {left}
        </div>
        <div className="w-32 text-center font-medium text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
            {label}
        </div>
        <div className={`flex-1 text-center ${winner === 'RIGHT' ? 'text-brand-600 font-bold' : 'text-slate-500'}`}>
            {right}
        </div>
    </div>
);

const Badge = ({ icon, label }: { icon: any, label: string }) => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sm font-medium text-white backdrop-blur-sm border border-white/10">
        {icon}
        {label}
    </span>
);
