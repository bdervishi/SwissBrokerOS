
import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavigation } from '../../components/PublicNavigation';
import { BackToTop } from '../../components/ui/BackToTop';
import { Button } from '../../components/ui/Button';
import { 
    Target, 
    TrendingUp, 
    Award, 
    Users, 
    PieChart, 
    MapPin, 
    Zap,
    Trophy
} from 'lucide-react';

export const SolutionSales: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-sans overflow-x-hidden">
            <BackToTop />
            <PublicNavigation />

            <main className="pt-20">
                {/* HERO SECTION */}
                <section className="relative py-32 px-4 overflow-hidden bg-slate-900">
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[150px] -mr-64 -mt-64 pointer-events-none mix-blend-screen"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] -ml-64 -mb-64 pointer-events-none mix-blend-screen"></div>
                    
                    <div className="max-w-5xl mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-black uppercase tracking-widest mb-8 backdrop-blur-md">
                            <Trophy size={14} className="text-yellow-400" /> High Performance Sales
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-8 text-white tracking-tight leading-tight">
                            Der Turbo für Ihren <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">Strukturvertrieb.</span>
                        </h1>
                        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-medium">
                            Automatische Lead-Verteilung, transparente Provisions-Splits und Gamification für Ihr Sales-Team.
                            Machen Sie Ihre Vertriebsorganisation zur Maschine.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link to="/register">
                                <Button size="lg" className="px-12 py-6 text-lg font-black bg-white text-slate-900 hover:bg-slate-100 border-none shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                                    Vertrieb skalieren
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* THE GROWTH ENGINE */}
                <section className="py-24 px-4 bg-white dark:bg-slate-950">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-black mb-6 text-slate-900 dark:text-white">
                                    Lead Radar: <br/>Nie wieder Kaltakquise.
                                </h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                    Unser "Lead Radar" (powered by Google & LinkedIn API) scannt das Web nach potenziellen Firmenkunden in Ihrer Zielregion.
                                    Qualifizieren Sie Leads vor und weisen Sie diese mit einem Klick Ihren besten Closern zu.
                                </p>
                                
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                                            <MapPin size={24}/>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">Geo-Targeting</h4>
                                            <p className="text-sm text-slate-500">Finden Sie KMUs in spezifischen PLZ-Gebieten.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                                            <Target size={24}/>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">Auto-Assignment</h4>
                                            <p className="text-sm text-slate-500">Verteilen Sie Leads fair nach Kapazität oder Performance.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                    <Target size={200} />
                                </div>
                                <div className="relative z-10 space-y-4">
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                                            <div>
                                                <div className="font-bold text-sm">Architekturbüro Müller</div>
                                                <div className="text-xs text-emerald-500 font-bold">Hohes Potenzial</div>
                                            </div>
                                        </div>
                                        <Button size="sm">Zuweisen</Button>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 opacity-80">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                                            <div>
                                                <div className="font-bold text-sm">Tech StartUp AG</div>
                                                <div className="text-xs text-emerald-500 font-bold">Hohes Potenzial</div>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline">Zuweisen</Button>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 opacity-60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                                            <div>
                                                <div className="font-bold text-sm">Bäckerei Meier</div>
                                                <div className="text-xs text-amber-500 font-bold">Mittleres Potenzial</div>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline">Zuweisen</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* COMMISSION ENGINE */}
                <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">Provisions-Clearing in Echtzeit</h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                                Behalten Sie den Überblick über Stufen, Overrides und Auszahlungen. 
                                Jeder Vermittler sieht sein eigenes Wallet – volle Transparenz schafft Vertrauen.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <PieChart size={32} />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Automatisierte Splits</h3>
                                <p className="text-sm text-slate-500">Definieren Sie Regeln (z.B. 40/60) pro Mitarbeiter-Level. Das System berechnet die Anteile bei jedem Abschluss automatisch.</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <TrendingUp size={32} />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Performance Tracking</h3>
                                <p className="text-sm text-slate-500">Live-Dashboards für Umsatz, Storno-Quote und Zielerreichung. Leaderboards für den Wettbewerb.</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Users size={32} />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Hierarchie & Teams</h3>
                                <p className="text-sm text-slate-500">Managen Sie Sub-Broker und Teams. Teamleiter sehen aggregierte Daten ihrer Downline.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* GAMIFICATION CTA */}
                <section className="py-24 px-4 text-center">
                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <Award size={64} className="mx-auto mb-8 text-yellow-300" />
                            <h2 className="text-4xl md:text-5xl font-black mb-6">Motivieren Sie Ihre Champions.</h2>
                            <p className="text-xl text-indigo-100 mb-10 font-medium">
                                Integrierte Sales-Contests und Badges treiben die Leistung Ihres Teams nach oben.
                            </p>
                            <Link to="/register">
                                <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 border-none px-12 py-6 text-lg font-black shadow-xl">
                                    Jetzt Performance steigern
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Background particles */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                            <div className="absolute top-10 left-10 w-4 h-4 bg-white rounded-full animate-bounce"></div>
                            <div className="absolute bottom-20 right-20 w-6 h-6 bg-white rounded-full animate-bounce [animation-delay:0.5s]"></div>
                            <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:1s]"></div>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-600 text-xs">
                &copy; {new Date().getFullYear()} SwissBroker OS. Alle Rechte vorbehalten.
            </footer>
        </div>
    );
};
