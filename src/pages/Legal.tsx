
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ShieldCheck, Mail, MapPin, Sun, Moon } from 'lucide-react';
import { BackToTop } from '../components/ui/BackToTop';

export const Legal: React.FC = () => {
    const { type } = useParams<{ type: string }>();
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

    const renderContent = () => {
        switch (type) {
            case 'imprint':
                return (
                    <>
                        <h1 className="text-4xl font-extrabold mb-8 text-slate-900 dark:text-white tracking-tight">Impressum</h1>
                        <section className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Herausgeber</h2>
                                <p>
                                    SwissBroker OS ist ein Produkt der:<br /><br />
                                    <strong>Trifti GmbH</strong><br />
                                    Musterstrasse 1<br />
                                    8000 Zürich<br />
                                    Schweiz
                                </p>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Unternehmens-Identifikation</h2>
                                <p>Eingetragener Firmenname: Trifti GmbH<br />Handelsregisteramt: Kanton Zürich</p>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kontakt</h2>
                                <p>E-Mail: support@swissbroker-os.ch<br />Webseite: <a href="https://www.trifti.ch" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">www.trifti.ch</a></p>
                            </div>
                        </section>
                    </>
                );
            case 'privacy':
                return (
                    <>
                        <h1 className="text-4xl font-extrabold mb-8 text-slate-900 dark:text-white tracking-tight">Datenschutzbestimmungen</h1>
                        <section className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed text-sm font-medium">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Einleitung</h2>
                                <p>Der Schutz Ihrer Privatsphäre ist uns ein wichtiges Anliegen. Wir halten uns strikt an die Bestimmungen des Bundesgesetzes über den Datenschutz (nDSG) und die entsprechenden Verordnungen.</p>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Datenhaltung in der Schweiz</h2>
                                <p>Sämtliche von SwissBroker OS verarbeiteten Daten werden ausschliesslich in zertifizierten Tier IV Datacentern im Kanton Zürich, Schweiz, gespeichert. Es findet kein unkontrollierter Datentransfer ins Ausland statt.</p>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Verschlüsselung</h2>
                                <p>Alle ruhenden Daten (At-Rest) werden mit AES-256 verschlüsselt. Die Übertragung erfolgt über gesicherte TLS 1.3 Verbindungen.</p>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4. KI-Verarbeitung (Google Gemini)</h2>
                                <p>Die Nutzung von KI-Modellen zur Analyse von Dokumenten erfolgt ausschliesslich auf Basis eines expliziten "Opt-In". Daten werden nur temporär für die Dauer des Requests an die Schnittstellen übermittelt und nicht für das Training globaler Modelle verwendet.</p>
                            </div>
                        </section>
                    </>
                );
            case 'terms':
                return (
                    <>
                        <h1 className="text-4xl font-extrabold mb-8 text-slate-900 dark:text-white tracking-tight">AGB</h1>
                        <section className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed text-sm font-medium">
                            <p>Dies ist eine Zusammenfassung unserer Nutzungsbedingungen für die SwissBroker OS SaaS-Plattform.</p>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Geltungsbereich</h2>
                                <p>Diese AGB gelten für alle Dienstleistungen der Trifti GmbH im Zusammenhang mit dem Produkt SwissBroker OS.</p>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Leistungen</h2>
                                <p>SwissBroker OS stellt eine Software-as-a-Service Plattform für Finanzdienstleister bereit. Der Funktionsumfang richtet sich nach dem gewählten Abonnement-Modell.</p>
                            </div>
                        </section>
                    </>
                );
            default:
                return <div className="text-slate-500">Seite nicht gefunden.</div>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 overflow-x-hidden">
            <BackToTop />
            <nav className="fixed w-full z-50 border-b border-slate-200 dark:border-white/10 backdrop-blur-md bg-white/70 dark:bg-slate-950/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link to="/" className="font-bold text-2xl tracking-tight flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">+</div>
                        <span className="text-slate-900 dark:text-white">SwissBroker</span>
                    </Link>
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 pt-32 pb-20">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:hover:text-white transition-colors mb-12 font-medium">
                    <ArrowLeft size={16} /> Zurück zur Startseite
                </Link>
                
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {renderContent()}
                </div>
            </main>

            <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-600 text-xs">
                &copy; {new Date().getFullYear()} SwissBroker OS. Ein Produkt der <a href="https://www.trifti.ch" target="_blank" rel="noreferrer" className="font-bold hover:text-brand-600 dark:hover:text-slate-300 transition-colors">Trifti GmbH</a>. Alle Rechte vorbehalten.
            </footer>
        </div>
    );
};
