import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { 
    Users, 
    BrainCircuit, 
    Calculator, 
    Smartphone, 
    ShieldCheck, 
    Zap, 
    Lock, 
    Globe,
    CheckCircle2
} from 'lucide-react';
import { BackToTop } from '../components/ui/BackToTop';
import { PublicNavigation } from '../components/PublicNavigation';

interface FeatureContent {
    title: string;
    description: string;
    icon: React.ReactNode;
    benefits: string[];
    details: string;
    color: string;
}

const FEATURE_DATA: Record<string, FeatureContent> = {
    'crm': {
        title: 'CRM für moderne Makler',
        description: 'Verwalten Sie Ihre Kundenbeziehungen mit Schweizer Präzision und modernster Automatisierung.',
        icon: <Users className="w-12 h-12" />,
        color: 'text-brand-600 dark:text-brand-400',
        benefits: [
            'Zentrales Klienten-Register nach nDSG Standards',
            'Automatisierte Dokumentenzuordnung via KI',
            '360° Sicht auf Policen, Hypotheken und Steuern',
            'Integrierte Mail- und Telefon-Historie'
        ],
        details: 'Unser CRM ist nicht einfach nur eine Datenbank. Es ist das Herzstück Ihres Unternehmens. Dank intelligenter Verknüpfungen erkennt das System automatisch Potenziale für Cross-Selling oder notwendige Anpassungen bei Lebensereignissen Ihrer Kunden.'
    },
    'ai-risk': {
        title: 'KI-Risikoanalyse',
        description: 'Vorsorgelücken und Überversicherungen identifizieren – bevor sie zum Problem werden.',
        icon: <BrainCircuit className="w-12 h-12" />,
        color: 'text-purple-600 dark:text-purple-400',
        benefits: [
            'Proaktive Erkennung von Deckungslücken',
            'Automatische Analyse von AVBs und Kleingedrucktem',
            'Sentiment-Analyse bei Kundenanfragen',
            'Prädiktive Storno-Warnungen'
        ],
        details: 'Die SwissBroker KI nutzt modernste LLMs (Gemini 3 Pro), um das Portfolio Ihrer Kunden rund um die Uhr zu überwachen. Sie erhalten präzise Handlungsempfehlungen, die Sie direkt als Beratungsanlass nutzen können.'
    },
    'mortgage-calc': {
        title: 'Hypotheken-Simulator',
        description: 'Visualisieren Sie Finanzierungsszenarien in Echtzeit während des Beratungsgesprächs.',
        icon: <Calculator className="w-12 h-12" />,
        color: 'text-emerald-600 dark:text-emerald-400',
        benefits: [
            'Tragbarkeitsrechner nach Schweizer Banken-Standard',
            'Vergleich von Fest- und SARON-Hypotheken',
            'Visualisierung von Amortisationsmodellen (Direkt vs. Indirekt)',
            'Anbindung an aktuelle Marktzinssätze'
        ],
        details: 'Beeindrucken Sie Ihre Klienten mit interaktiven Grafiken. Simulieren Sie, wie sich Zinsänderungen auf das verfügbare Einkommen auswirken und finden Sie die optimale Finanzierungsstruktur für jedes Eigenheim.'
    },
    'tax-module': {
        title: 'Innovatives Steuermodul',
        description: 'Steueroptimierung als wertvoller Service für Ihre Klienten – vollautomatisiert.',
        icon: <ShieldCheck className="w-12 h-12" />,
        color: 'text-red-600 dark:text-red-400',
        benefits: [
            'Aggregations-Engine für steuerrelevante Daten',
            'Sitzverlegungs-Simulator für alle Schweizer Kantone',
            'Automatisierter Steuerausweis (3a, Schuldzinsen, KVG)',
            'Direkter Export für Steuerberater'
        ],
        details: 'Steuern sind für Kunden oft ein Buch mit sieben Siegeln. Mit SwissBroker OS generieren Sie per Knopfdruck eine Übersicht aller Abzüge, die Ihre Kunden in der Steuererklärung geltend machen können.'
    },
    'client-portal': {
        title: 'Kundenportal (Mobile App)',
        description: 'Geben Sie Ihren Kunden das Gefühl von Sicherheit – direkt in der Hosentasche.',
        icon: <Smartphone className="w-12 h-12" />,
        color: 'text-indigo-600 dark:text-indigo-400',
        benefits: [
            'Digitale Policenmappe (End-to-End verschlüsselt)',
            'Einfache Schadensmeldung mit Foto-Upload',
            'Direkter Chat-Kanal zum Makler',
            'Interaktive 3D-Vermögensübersicht'
        ],
        details: 'Ihre eigene White-Label App. Ihre Kunden haben jederzeit Zugriff auf ihre Dokumente, können Termine buchen oder neue Angebote anfragen. So bleiben Sie als Berater top-of-mind.'
    }
};

export const FeatureInfo: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const feature = slug ? FEATURE_DATA[slug] : null;

    if (!feature) {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 overflow-x-hidden">
            <BackToTop />
            <PublicNavigation />

            <main className="max-w-4xl mx-auto px-4 pb-20 pt-8">
                <div className={`${feature.color} mb-6`}>
                    {feature.icon}
                </div>
                
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white">
                    {feature.title}
                </h1>
                
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-12 font-medium">
                    {feature.description}
                </p>

                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ihre Vorteile</h2>
                        <ul className="space-y-4">
                            {feature.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 font-medium">
                                    <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl p-8 backdrop-blur-sm shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                            <Zap className="text-yellow-500" size={18} fill="currentColor" /> 
                            Funktionsweise
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                            {feature.details}
                        </p>
                    </div>
                </div>

                {/* Trust Elements */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12 border-y border-slate-200 dark:border-white/5">
                    <TrustItem icon={<Lock size={18}/>} title="Swiss Security" desc="AES-256 verschlüsselt" />
                    <TrustItem icon={<Globe size={18}/>} title="Kantonale Logik" desc="Alle 26 Kantone abgebildet" />
                    <TrustItem icon={<Smartphone size={18}/>} title="Cloud Native" desc="Immer & überall verfügbar" />
                </div>

                <div className="mt-20 text-center bg-gradient-to-br from-brand-600 to-indigo-700 rounded-[2.5rem] p-12 shadow-2xl text-white">
                    <h2 className="text-3xl font-bold mb-4">Bereit für die Zukunft?</h2>
                    <p className="text-brand-100 mb-8 max-w-lg mx-auto font-medium opacity-90">Starten Sie noch heute mit SwissBroker OS und digitalisieren Sie Ihr Geschäft in Minuten.</p>
                    <Link to="/register">
                        <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50 px-12 py-6 text-lg font-black shadow-xl">Kostenlos starten</Button>
                    </Link>
                </div>
            </main>

            <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-600 text-xs">
                &copy; {new Date().getFullYear()} SwissBroker OS. Alle Rechte vorbehalten.
            </footer>
        </div>
    );
};

const TrustItem = ({ icon, title, desc }: any) => (
    <div className="flex flex-col items-center text-center px-4">
        <div className="text-slate-400 dark:text-slate-500 mb-2">{icon}</div>
        <h4 className="font-bold text-sm mb-1 text-slate-900 dark:text-slate-100 uppercase tracking-wider">{title}</h4>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">{desc}</p>
    </div>
);
