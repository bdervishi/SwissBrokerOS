
import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavigation } from '../../components/PublicNavigation';
import { BackToTop } from '../../components/ui/BackToTop';
import { Button } from '../../components/ui/Button';
import { 
    Zap, 
    Smartphone, 
    Clock, 
    FileCheck, 
    Coffee, 
    ArrowRight, 
    CheckCircle2,
    HardDrive
} from 'lucide-react';

export const SolutionBroker: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-sans overflow-x-hidden">
            <BackToTop />
            <PublicNavigation />

            <main className="pt-20">
                {/* HERO SECTION */}
                <section className="relative py-24 px-4 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>
                    
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-6">
                                <Zap size={14} /> Für Einzelkämpfer
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-[1.1]">
                                Ihr digitales Backoffice. <br/>
                                <span className="text-brand-600">0% Admin. 100% Beratung.</span>
                            </h1>
                            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                Als Einzelmakler sind Sie CEO, Berater und Sekretär in einem. 
                                SwissBroker OS nimmt Ihnen den Papierkram ab, damit Sie das tun können, was Geld bringt: Kunden beraten.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/register">
                                    <Button size="lg" className="px-8 py-6 text-lg font-bold shadow-xl shadow-brand-500/20 w-full sm:w-auto">
                                        Kostenlos starten
                                    </Button>
                                </Link>
                                <Link to="/saas/demo">
                                    <Button variant="outline" size="lg" className="px-8 py-6 text-lg w-full sm:w-auto">
                                        Demo ansehen
                                    </Button>
                                </Link>
                            </div>
                            <p className="mt-4 text-xs text-slate-500 flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-emerald-500"/> Keine Kreditkarte nötig
                                <span className="mx-2">•</span>
                                <CheckCircle2 size={14} className="text-emerald-500"/> Monatlich kündbar
                            </p>
                        </div>
                        <div className="relative">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">Heutige Aufgaben</p>
                                        <h3 className="font-bold text-lg">Morning Briefing</h3>
                                    </div>
                                    <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center text-brand-600">
                                        <Coffee size={20} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <TaskItem time="09:00" text="Policen-Update AXA (Automatisch)" done />
                                    <TaskItem time="09:15" text="Geburtstags-Mail Herr Müller (KI)" done />
                                    <TaskItem time="10:00" text="Terminvorbereitung Fam. Schmid" active />
                                    <TaskItem time="14:00" text="Offerte Hausrat generieren" />
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                                    <p className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 py-2 rounded-lg">
                                        2.5 Stunden Admin-Zeit gespart
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PAIN POINTS */}
                <section className="py-24 bg-white dark:bg-slate-900">
                    <div className="max-w-4xl mx-auto px-4 text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Das Problem: Sie ertrinken in Portalen.</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">
                            IG B2B, BrokerStar, diverse Extranets... Ein typischer Schweizer Makler verbringt 60% seiner Zeit mit Datenpflege.
                        </p>
                    </div>
                    
                    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard 
                            icon={<Smartphone size={32} />}
                            title="Büro in der Hosentasche"
                            desc="Voller Zugriff auf alle Kundendaten, Policen und Dokumente via Smartphone. Scannen Sie Dokumente direkt beim Kunden."
                        />
                        <FeatureCard 
                            icon={<FileCheck size={32} />}
                            title="IG B2B Deep-Sync"
                            desc="Wir holen Dokumente und Mutationen automatisch ab. Keine manuellen Downloads mehr aus fünf verschiedenen Portalen."
                        />
                        <FeatureCard 
                            icon={<Clock size={32} />}
                            title="KI-Assistent"
                            desc="Lassen Sie die KI E-Mails schreiben, Termine koordinieren und Vergleichsofferten erstellen. Ihr digitaler Mitarbeiter."
                        />
                        <FeatureCard 
                            icon={<HardDrive size={32} />}
                            title="BYOS / Zero Migration"
                            desc="Behalten Sie Ihr OneDrive oder Dropbox. Wir verlinken Ihre bestehende Ablage direkt in die Kundenakte. Kein Umzug nötig."
                        />
                    </div>
                </section>

                {/* USP SECTION */}
                <section className="py-24 px-4">
                    <div className="max-w-6xl mx-auto bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-16 opacity-10">
                            <Zap size={200} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black mb-6">Starten Sie in 15 Minuten.</h2>
                                <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                                    Unser "Smart Import" zieht Ihre bestehenden Daten (Excel, CSV oder BrokerStar-Export) per Drag & Drop ins System. Die KI ordnet alles automatisch zu.
                                </p>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center gap-3 font-medium"><CheckCircle2 className="text-brand-400"/> Datenimport-Assistent</li>
                                    <li className="flex items-center gap-3 font-medium"><CheckCircle2 className="text-brand-400"/> Vorkonfigurierte E-Mail Vorlagen</li>
                                    <li className="flex items-center gap-3 font-medium"><CheckCircle2 className="text-brand-400"/> Sofort einsatzbereit</li>
                                </ul>
                                <Link to="/register">
                                    <Button className="bg-white text-slate-900 hover:bg-slate-100 border-none font-bold px-8">
                                        Jetzt Import starten
                                    </Button>
                                </Link>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                                <div className="text-center">
                                    <div className="text-5xl font-black text-brand-400 mb-2">CHF 99</div>
                                    <p className="text-slate-400 uppercase tracking-widest text-sm font-bold">Starter Plan / Monat</p>
                                    <div className="my-8 h-px bg-white/10 w-full"></div>
                                    <p className="text-sm text-slate-300 mb-6">
                                        Ein Abschluss mehr pro Jahr und das System hat sich bezahlt gemacht.
                                    </p>
                                    <div className="text-xs text-slate-500">
                                        Steuerlich voll absetzbar als IT-Aufwand.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-600 text-xs">
                &copy; {new Date().getFullYear()} SwissBroker OS. Ein Produkt der <a href="https://www.trifti.ch" target="_blank" rel="noreferrer" className="font-bold hover:text-brand-600 dark:hover:text-slate-300 transition-colors">Trifti GmbH</a>. Alle Rechte vorbehalten.
            </footer>
        </div>
    );
};

const TaskItem = ({ time, text, done, active }: any) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${active ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800' : 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-800'}`}>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
            {done && <CheckCircle2 size={12} />}
        </div>
        <div className="flex-1">
            <p className={`text-xs font-bold ${done ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{text}</p>
        </div>
        <span className="text-[10px] font-mono text-slate-400">{time}</span>
    </div>
);

const FeatureCard = ({ icon, title, desc }: any) => (
    <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-colors group">
        <div className="mb-6 text-slate-400 group-hover:text-brand-500 transition-colors">{icon}</div>
        <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{desc}</p>
    </div>
);
