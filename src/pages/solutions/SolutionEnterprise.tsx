
import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavigation } from '../../components/PublicNavigation';
import { BackToTop } from '../../components/ui/BackToTop';
import { Button } from '../../components/ui/Button';
import { 
    ShieldCheck, 
    Users, 
    Building2, 
    Lock, 
    FileText, 
    Activity, 
    ArrowRight, 
    Check,
    HardDrive
} from 'lucide-react';

export const SolutionEnterprise: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-sans overflow-x-hidden">
            <BackToTop />
            <PublicNavigation />

            <main className="pt-20">
                {/* HERO SECTION */}
                <section className="relative py-24 px-4 overflow-hidden bg-slate-900 text-white">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                    
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
                                <Building2 size={14} /> Für Grossbetriebe & Organisationen
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-[1.1]">
                                Compliance & Skalierung <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">auf Autopilot.</span>
                            </h1>
                            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
                                Managen Sie komplexe Teams, Hierarchien und Compliance-Vorgaben mit Schweizer Präzision. 
                                ISO 27001 zertifiziert und nDSG-konform.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/p/contact">
                                    <Button size="lg" className="px-10 py-6 text-lg font-bold bg-white text-slate-900 hover:bg-slate-100 border-none w-full sm:w-auto">
                                        Sales kontaktieren
                                    </Button>
                                </Link>
                                <Link to="/saas/demo">
                                    <Button variant="outline" size="lg" className="px-10 py-6 text-lg border-slate-600 text-white hover:bg-slate-800 w-full sm:w-auto">
                                        Live Demo
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        
                        {/* Visual: Dashboard Abstraction */}
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2rem] blur-2xl opacity-20"></div>
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
                                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    </div>
                                    <div className="text-xs font-mono text-slate-500">admin@finanz-partner.ch</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <StatBox label="Active Users" value="48" change="+2" />
                                    <StatBox label="Compliance Score" value="98%" change="SAFE" color="text-emerald-400" />
                                    <StatBox label="Open Tickets" value="12" change="-5" />
                                    <StatBox label="Revenue YTD" value="CHF 4.2M" change="+18%" color="text-blue-400" />
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 bg-slate-800 rounded-full w-full overflow-hidden"><div className="h-full bg-blue-500 w-3/4"></div></div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Team Performance</span>
                                        <span>Target: 100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES GRID */}
                <section className="py-24 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Enterprise-Grade Features</h2>
                            <p className="text-slate-500 dark:text-slate-400">Gebaut für Organisationen, die keine Kompromisse bei Sicherheit eingehen.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard 
                                icon={<Users size={32} className="text-blue-600" />}
                                title="Team & HR Management"
                                points={[
                                    "Granulare Rechteverwaltung (RBAC)",
                                    "Digitale Personalakte & Lohn-Integration",
                                    "Integrierte Zeiterfassung & Ferienplanung",
                                    "Team-Hierarchien & Lead-Zuweisung"
                                ]}
                            />
                            <FeatureCard 
                                icon={<ShieldCheck size={32} className="text-emerald-600" />}
                                title="Risk & Compliance Shield"
                                points={[
                                    "Automatischer Zefix & SECO Abgleich",
                                    "GWG/AML Prüfungen in Echtzeit",
                                    "Revisionssicheres Audit-Log (Journal)",
                                    "Vertrags-KI für Due Diligence"
                                ]}
                            />
                            <FeatureCard 
                                icon={<Activity size={32} className="text-purple-600" />}
                                title="Operations & Reporting"
                                points={[
                                    "Mandantenfähige Architektur",
                                    "Zentrales Provisions-Clearing",
                                    "Business Intelligence Dashboards",
                                    "API-First für Drittsysteme (ERP)"
                                ]}
                            />
                        </div>
                    </div>
                </section>

                {/* SECURITY SECTION */}
                <section className="py-24 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                    <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Hybrid-Cloud & Datenhoheit.</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                Sie müssen Ihre Daten nicht zwingend in unsere Cloud migrieren. 
                                Mit <strong>BYOS (Bring Your Own Storage)</strong> integrieren wir Ihre bestehende SharePoint- oder Azure-Infrastruktur nahtlos.
                                <br/><br/>
                                Alternativ hosten wir für Sie in zertifizierten Tier IV Datacentern im Kanton Zürich.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <Lock className="text-emerald-600" />
                                    <span className="font-bold text-slate-900 dark:text-slate-100">AES-256 Encrypted</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <HardDrive className="text-emerald-600" />
                                    <span className="font-bold text-slate-900 dark:text-slate-100">SharePoint Native</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="text-emerald-600" />
                                    <span className="font-bold text-slate-900 dark:text-slate-100">FINMA Konform</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="text-emerald-600" />
                                    <span className="font-bold text-slate-900 dark:text-slate-100">2FA / SSO Ready</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Switzerland.svg" alt="Swiss Made" className="w-64 h-64 opacity-20 dark:invert rounded-full shadow-2xl" />
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 px-4 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl font-black mb-8 text-slate-900 dark:text-white">Bereit für den nächsten Schritt?</h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400 mb-10">
                            Wir beraten Sie gerne persönlich zu Migration, Onboarding und Enterprise-Preisen.
                        </p>
                        <Link to="/p/contact">
                            <Button size="lg" className="px-12 py-6 text-lg font-bold">
                                Beratungstermin vereinbaren
                            </Button>
                        </Link>
                    </div>
                </section>

            </main>

            <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-600 text-xs">
                &copy; {new Date().getFullYear()} SwissBroker OS. Ein Produkt der <a href="https://www.trifti.ch" target="_blank" rel="noreferrer" className="font-bold hover:text-brand-600 dark:hover:text-slate-300 transition-colors">Trifti GmbH</a>. Alle Rechte vorbehalten.
            </footer>
        </div>
    );
};

const StatBox = ({ label, value, change, color = "text-white" }: any) => (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
        <p className="text-xs text-slate-500 uppercase font-bold mb-1">{label}</p>
        <div className={`text-2xl font-black ${color}`}>{value}</div>
        <p className="text-xs text-slate-400 mt-1">{change}</p>
    </div>
);

const FeatureCard = ({ icon, title, points }: any) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:shadow-xl transition-shadow">
        <div className="mb-6">{icon}</div>
        <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{title}</h3>
        <ul className="space-y-4">
            {points.map((p: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>{p}</span>
                </li>
            ))}
        </ul>
    </div>
);
