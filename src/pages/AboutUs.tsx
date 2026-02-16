
import React, { useRef } from 'react';
import { Layout } from '../components/Layout';
import { PublicNavigation } from '../components/PublicNavigation';
import { BackToTop } from '../components/ui/BackToTop';
import { Button } from '../components/ui/Button';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Zap, 
    ShieldCheck, 
    Cpu, 
    Globe, 
    Layout as LayoutIcon, 
    Heart, 
    ArrowRight 
} from 'lucide-react';

// --- ANIMATION COMPONENTS (Based on Snippet 2) ---

const RevealText = ({ children, delay = 0, className = "" }: { children?: React.ReactNode, delay?: number, className?: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.8, delay, ease: [0.2, 0.65, 0.3, 0.9] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// --- MAIN PAGE COMPONENT ---

export const AboutUs: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-sans overflow-x-hidden">
            <BackToTop />
            <PublicNavigation />

            <main className="pt-20">
                
                {/* SECTION 1: HERO (Inspired by Snippet 2) */}
                <section className="py-24 px-4 min-h-[80vh] flex flex-col justify-center">
                    <div className="max-w-6xl mx-auto w-full">
                        <div className="flex flex-col lg:flex-row items-start gap-12">
                            <div className="flex-1">
                                <RevealText delay={0.1} className="sm:text-5xl text-4xl md:text-6xl font-bold leading-[1.1] text-slate-900 dark:text-white mb-12 tracking-tight">
                                    Wir <span className="text-slate-400">denken</span> das Brokerage neu. <br />
                                    Wir machen es <br/>
                                    <span className="inline-block border-2 border-dashed border-brand-500 text-brand-600 dark:text-brand-400 px-4 py-1 rounded-full mx-2 my-2 bg-brand-50 dark:bg-brand-900/20">
                                        schneller
                                    </span>
                                    , sicherer und <br />
                                    <span className="inline-block border-2 border-dashed border-emerald-500 text-emerald-600 dark:text-emerald-400 px-4 py-1 rounded-full mx-2 my-2 bg-emerald-50 dark:bg-emerald-900/20">
                                        menschlicher
                                    </span>
                                    für Sie.
                                </RevealText>

                                <div className="mt-16 flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-12">
                                    <RevealText delay={0.6} className="max-w-md">
                                        <div className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                                            SwissBroker OS ist mehr als Software.
                                        </div>
                                        <div className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                            Es ist das Versprechen, dass Technologie Ihnen den Rücken freihält, damit Sie sich auf das Wesentliche konzentrieren können: Ihre Kunden.
                                        </div>
                                    </RevealText>

                                    <RevealText delay={0.8}>
                                        <Link to="/register">
                                            <Button size="lg" className="rounded-full px-8 py-6 text-lg font-bold shadow-xl shadow-brand-500/20">
                                                <Zap className="mr-2" size={20} fill="currentColor" />
                                                Jetzt starten
                                            </Button>
                                        </Link>
                                    </RevealText>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: GRID VALUES (Inspired by Snippet 1) */}
                <section className="py-32 px-4 relative overflow-hidden bg-white dark:bg-slate-900">
                    {/* Background Blur Blob */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-24">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">Das Fundament unserer Arbeit</h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                                Jedes Modul von SwissBroker OS wurde mit Intention, Präzision und Schweizer Qualitätsanspruch entwickelt.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20">
                            {/* Feature 1 */}
                            <RevealText delay={0.2}>
                                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                                    <Zap size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Blitzschnelle Performance</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Keine Ladezeiten, keine Verzögerung. Unsere Architektur ist auf Geschwindigkeit optimiert, damit Ihr Workflow nie unterbrochen wird.
                                </p>
                            </RevealText>

                            {/* Feature 2 */}
                            <RevealText delay={0.3}>
                                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                                    <ShieldCheck size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Swiss Vault Security</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Ihre Daten verlassen die Schweiz nicht. Gehostet in Tier IV Datacentern in Zürich, geschützt durch AES-256 Verschlüsselung.
                                </p>
                            </RevealText>

                            {/* Feature 3 */}
                            <RevealText delay={0.4}>
                                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                                    <LayoutIcon size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Intuitives Design</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Software muss nicht kompliziert sein. Unser Interface ist modern, pixel-perfect und selbsterklärend.
                                </p>
                            </RevealText>

                            {/* Feature 4 */}
                            <RevealText delay={0.5}>
                                <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                                    <Cpu size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">KI-gestützte Prozesse</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Von der Risikoanalyse bis zur E-Mail-Zusammenfassung: Unsere KI-Modelle nehmen Ihnen die Routinearbeit ab.
                                </p>
                            </RevealText>

                            {/* Feature 5 */}
                            <RevealText delay={0.6}>
                                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
                                    <Globe size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Kantonale Intelligenz</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Wir verstehen den Föderalismus. Steuerfüsse, Feiertage und kantonale Regelungen sind nativ integriert.
                                </p>
                            </RevealText>

                            {/* Feature 6 */}
                            <RevealText delay={0.7}>
                                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
                                    <Heart size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Für Menschen gemacht</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Wir entwickeln nicht für User, sondern für Menschen. Barrierefrei, transparent und fair.
                                </p>
                            </RevealText>
                        </div>
                    </div>
                </section>

                {/* TEAM CTA */}
                <section className="py-24 px-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                    <div className="max-w-4xl mx-auto text-center">
                        <RevealText>
                            <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Werden Sie Teil der Bewegung</h2>
                            <p className="text-xl text-slate-500 dark:text-slate-400 mb-10">
                                Über 500 Broker vertrauen bereits auf SwissBroker OS.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/career">
                                    <Button variant="outline" size="lg" className="px-8">Karriere bei uns</Button>
                                </Link>
                                <Link to="/p/contact">
                                    <Button variant="primary" size="lg" className="px-8" icon={<ArrowRight size={18}/>}>Kontakt aufnehmen</Button>
                                </Link>
                            </div>
                        </RevealText>
                    </div>
                </section>

            </main>

            <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-600 text-xs">
                &copy; {new Date().getFullYear()} SwissBroker OS. Ein Produkt der <a href="https://www.trifti.ch" target="_blank" rel="noreferrer" className="font-bold hover:text-brand-600 dark:hover:text-slate-300 transition-colors">Trifti GmbH</a>. Alle Rechte vorbehalten.
            </footer>
        </div>
    );
};
