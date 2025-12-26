import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
import { Play, User, Users, Briefcase, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const SaaSDemo: React.FC = () => {
    const { role, impersonateUser } = useAuth();

    if (role !== UserRole.SAAS_SUPER_ADMIN && role !== UserRole.SAAS_SALES) {
        return <Navigate to="/dashboard" />;
    }

    const demoPersonas = [
        {
            id: 'u_demo_solo',
            title: "Starter Broker",
            description: "Einzelmakler, Fokus auf einfache Verwaltung und schnelle Übersicht.",
            features: ["Einfaches Dashboard", "Basic CRM", "Kein White Labeling"],
            icon: <User size={32} className="text-brand-500" />,
            color: "border-brand-200 hover:border-brand-400"
        },
        {
            id: 'u_broker_1', // Reusing the standard mock user
            title: "Professional Broker",
            description: "Etabliertes Maklerbüro mit Assistenten und Automatisierungsbedarf.",
            features: ["Erweitertes CRM", "Hypotheken-Rechner", "Integrationen aktiv"],
            icon: <Briefcase size={32} className="text-emerald-500" />,
            color: "border-emerald-200 hover:border-emerald-400"
        },
        {
            id: 'u_demo_corp',
            title: "Enterprise Broker",
            description: "Grosse Organisation, Custom Branding, Hierarchien und Compliance.",
            features: ["Full White Labeling", "Compliance Features", "Advanced Analytics"],
            icon: <Users size={32} className="text-purple-500" />,
            color: "border-purple-200 hover:border-purple-400"
        }
    ];

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Play className="text-brand-600" /> Demo Center
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Starten Sie interaktive Demos für Leads. Änderungen in Demo-Accounts sind temporär.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {demoPersonas.map(persona => (
                    <div key={persona.id} className={`bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-sm transition-all cursor-pointer group flex flex-col ${persona.color}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                {persona.icon}
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs px-2 py-1 rounded font-mono">
                                Live Data
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{persona.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1">
                            {persona.description}
                        </p>

                        <ul className="space-y-2 mb-6">
                            {persona.features.map((feat, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <CheckCircle size={14} className="text-slate-400" />
                                    {feat}
                                </li>
                            ))}
                        </ul>

                        <Button 
                            className="w-full group-hover:bg-brand-700" 
                            onClick={() => impersonateUser(persona.id)}
                            icon={<Play size={16} />}
                        >
                            Demo Starten
                        </Button>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" /> 
                        Vertriebs-Leitfaden
                    </h3>
                    <p className="text-slate-300 mb-6">
                        Vergessen Sie nicht, die neuen Compliance-Features (Datenhaltung Schweiz) und die Hypotheken-Simulation hervorzuheben. Das sind aktuell die stärksten Verkaufsargumente.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800">Talking Points PDF</Button>
                        <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800">Preisliste intern</Button>
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            </div>
        </Layout>
    );
};