import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_JOBS } from '../constants';
import { Button } from '../components/ui/Button';
import { BackToTop } from '../components/ui/BackToTop';
import { ArrowLeft, MapPin, Clock, Briefcase, Zap, Heart, Sun, Moon } from 'lucide-react';

export const Career: React.FC = () => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        if (localStorage.theme === 'light') {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        } else {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-sans">
            <BackToTop />
            
            {/* Nav (Simplified for public pages) */}
            <nav className="fixed w-full z-50 border-b border-slate-200 dark:border-white/10 backdrop-blur-md bg-white/70 dark:bg-slate-950/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link to="/" className="font-bold text-2xl tracking-tight flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">+</div>
                        <span className="text-slate-900 dark:text-white">SwissBroker</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:hover:text-white transition-colors mb-12 font-medium">
                        <ArrowLeft size={16} /> Zurück zur Startseite
                    </Link>

                    {/* Hero */}
                    <div className="text-center mb-24">
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-400">
                            Wir bauen das Betriebssystem <br/>für die Finanzindustrie.
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Komm zu uns und revolutioniere, wie Schweizer Broker arbeiten. <br/>Wir suchen Visionäre, Macher und Tech-Enthusiasten.
                        </p>
                    </div>

                    {/* Values */}
                    <div className="grid md:grid-cols-3 gap-8 mb-24">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Innovation First</h3>
                            <p className="text-slate-500 dark:text-slate-400">Wir hinterfragen den Status Quo. "Das haben wir schon immer so gemacht" gibt es bei uns nicht.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
                                <Heart size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Swiss Quality</h3>
                            <p className="text-slate-500 dark:text-slate-400">Präzision, Zuverlässigkeit und Sicherheit sind in unserer DNA. Wir liefern Software, der man vertraut.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                                <Briefcase size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Ownership</h3>
                            <p className="text-slate-500 dark:text-slate-400">Jeder im Team übernimmt Verantwortung. Wir arbeiten flach, schnell und ergebnisorientiert.</p>
                        </div>
                    </div>

                    {/* Jobs List */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold mb-8 text-center text-slate-900 dark:text-white">Offene Stellen</h2>
                        {MOCK_JOBS.map((job) => (
                            <div key={job.id} className="group bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-lg">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors">{job.title}</h3>
                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-1 rounded font-medium uppercase tracking-wider">{job.department}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {job.type}</span>
                                    </div>
                                </div>
                                <Button className="shrink-0" onClick={() => window.location.href = 'mailto:jobs@swissbroker-os.ch'}>Jetzt bewerben</Button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-12 bg-slate-100 dark:bg-slate-900 rounded-3xl text-center">
                        <h3 className="text-2xl font-bold mb-4">Keine passende Stelle dabei?</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto">
                            Wir sind immer auf der Suche nach Talenten. Sende uns deine Initiativbewerbung und erzähle uns, wie du uns unterstützen kannst.
                        </p>
                        <Button variant="outline" size="lg" onClick={() => window.location.href = 'mailto:jobs@swissbroker-os.ch'}>Initiativ bewerben</Button>
                    </div>
                </div>
            </main>

            <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-600 text-xs">
                &copy; {new Date().getFullYear()} SwissBroker OS. Alle Rechte vorbehalten.
            </footer>
        </div>
    );
};