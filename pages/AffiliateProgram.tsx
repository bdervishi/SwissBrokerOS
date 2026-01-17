import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { BackToTop } from '../components/ui/BackToTop';
import { PublicNavigation } from '../components/PublicNavigation';
import { 
    ArrowLeft, 
    TrendingUp, 
    Users, 
    DollarSign, 
    ShieldCheck, 
    Send
} from 'lucide-react';

export const AffiliateProgram: React.FC = () => {
    
    // Calculator State
    const [referrals, setReferrals] = useState(10);
    const avgPlanPrice = 249; // Professional Plan
    const commissionRate = 0.20; // 20%
    const monthlyCommission = referrals * avgPlanPrice * commissionRate;
    const yearlyCommission = monthlyCommission * 12;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-sans">
            <BackToTop />
            <PublicNavigation />

            <main className="pb-20 px-4 pt-8">
                <div className="max-w-5xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:hover:text-white transition-colors mb-12 font-medium">
                        <ArrowLeft size={16} /> Zurück zur Startseite
                    </Link>

                    {/* Hero */}
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                            <DollarSign size={14} /> Partner Programm
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">
                            Empfehlen Sie Exzellenz.<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Verdienen Sie Lifetime.</span>
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
                            Werden Sie Vertriebspartner von SwissBroker OS. Helfen Sie Schweizer Maklern bei der Digitalisierung und erhalten Sie <strong>20% Provision</strong> auf alle Umsätze. Solange der Kunde bleibt.
                        </p>
                        <Button size="lg" className="px-10 py-6 text-lg font-black shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 border-none" onClick={() => document.getElementById('apply')?.scrollIntoView({behavior: 'smooth'})}>
                            Jetzt Partner werden
                        </Button>
                    </div>

                    {/* Calculator */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl mb-24 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <TrendingUp size={200} />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Ihr Einnahmen-Simulator</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-8">Schieben Sie den Regler und sehen Sie, was möglich ist.</p>
                                
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2 font-bold text-slate-700 dark:text-slate-300">
                                            <span>Vermittelte Kunden</span>
                                            <span className="text-brand-600">{referrals}</span>
                                        </div>
                                        <input 
                                            type="range" min="1" max="100" step="1" 
                                            value={referrals} 
                                            onChange={(e) => setReferrals(parseInt(e.target.value))}
                                            className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        />
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-400">
                                        Berechnet auf Basis des "Professional" Plans (CHF 249/Mt) bei 20% Provision.
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-emerald-500 text-white rounded-2xl p-8 text-center shadow-lg transform md:scale-110">
                                <p className="text-emerald-100 uppercase tracking-widest text-xs font-bold mb-2">Ihr Passives Einkommen</p>
                                <div className="text-5xl font-black mb-2">
                                    CHF {monthlyCommission.toFixed(0)}
                                </div>
                                <p className="text-sm font-medium opacity-90 mb-6">pro Monat</p>
                                
                                <div className="pt-6 border-t border-white/20">
                                    <p className="text-xs uppercase tracking-widest font-bold mb-1">Pro Jahr</p>
                                    <p className="text-2xl font-bold">CHF {yearlyCommission.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-24">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white mb-4">
                                <TrendingUp size={32} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Lifetime Provision</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Kein Einmal-Bonus. Sie verdienen jeden Monat mit, solange der Kunde bei uns ist.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white mb-4">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Transparentes Tracking</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Verfolgen Sie Leads, Conversions und Auszahlungen in Ihrem eigenen Partner-Dashboard.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white mb-4">
                                <Users size={32} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Marketing Support</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Wir stellen Ihnen Banner, Texte und Case Studies zur Verfügung, um das Verkaufen zu erleichtern.</p>
                        </div>
                    </div>

                    {/* Application Form */}
                    <div id="apply" className="max-w-2xl mx-auto">
                        <Card className="p-8 md:p-10 border-slate-200 dark:border-slate-800 shadow-2xl">
                            <h2 className="text-2xl font-bold text-center mb-8">Partner werden</h2>
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Vorname</label>
                                        <input type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nachname</label>
                                        <input type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Adresse</label>
                                    <input type="email" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Webseite / LinkedIn (Optional)</label>
                                    <input type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Wie möchten Sie werben?</label>
                                    <textarea className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-24" placeholder="z.B. Blog, Newsletter, Persönliches Netzwerk..."></textarea>
                                </div>
                                <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 border-none text-lg py-6 shadow-lg shadow-emerald-500/20" icon={<Send size={20}/>}>
                                    Bewerbung absenden
                                </Button>
                                <p className="text-xs text-center text-slate-400">
                                    Durch das Absenden akzeptieren Sie unsere Partner-AGB.
                                </p>
                            </form>
                        </Card>
                    </div>

                </div>
            </main>

            <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-600 text-xs">
                &copy; {new Date().getFullYear()} SwissBroker OS. Alle Rechte vorbehalten.
            </footer>
        </div>
    );
};