import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MOCK_SAAS_PACKAGES, MOCK_TENANTS } from '../constants';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Check, Star, Plus, Edit2, Users, Crown, Zap, ShieldCheck, CreditCard } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const SaaSPlans: React.FC = () => {
    const { role } = useAuth();

    if (role === UserRole.CLIENT) {
        return <Navigate to="/dashboard" />;
    }

    // --- SAAS ADMIN VIEW (Management) ---
    if (role === UserRole.SAAS_SUPER_ADMIN || role === UserRole.SAAS_SALES || role === UserRole.SAAS_FINANCE) {
        return (
            <Layout>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Paket-Verwaltung</h1>
                        <p className="text-slate-500 dark:text-slate-400">Konfigurieren Sie die Angebote für Ihre Broker.</p>
                    </div>
                    <Button icon={<Plus size={18} />}>Neues Paket</Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {MOCK_SAAS_PACKAGES.map(pkg => (
                        <div key={pkg.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 relative flex flex-col">
                            {pkg.isPopular && (
                                <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                    Popular
                                </div>
                            )}
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{pkg.name}</h3>
                                <p className="text-slate-500 text-sm mt-1 h-10">{pkg.description}</p>
                            </div>
                            
                            <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">CHF {pkg.price}</span>
                                    <span className="text-slate-500 mb-1">/ Monat</span>
                                </div>
                            </div>

                            <div className="space-y-3 flex-1 mb-8">
                                <div className="flex items-center gap-2 text-sm">
                                    <Users size={16} className="text-slate-400" />
                                    <span>Max. {pkg.maxUsers} Benutzer</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <ShieldCheck size={16} className="text-slate-400" />
                                    <span>Support: {pkg.supportLevel}</span>
                                </div>
                                {pkg.features.slice(0, 3).map((feat, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Check size={16} className="text-brand-500" />
                                        <span>{feat}</span>
                                    </div>
                                ))}
                                {pkg.features.length > 3 && (
                                    <div className="text-xs text-slate-400 pl-6">+ {pkg.features.length - 3} weitere Features</div>
                                )}
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <Button variant="outline" className="w-full" icon={<Edit2 size={16} />}>Editieren</Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12">
                    <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">Abonnenten Übersicht</h3>
                    <Card noPadding>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-3">Tenant</th>
                                    <th className="px-6 py-3">Aktuelles Paket</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">MRR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {MOCK_TENANTS.map(t => (
                                    <tr key={t.id}>
                                        <td className="px-6 py-4 font-medium">{t.name}</td>
                                        <td className="px-6 py-4"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono">{t.plan}</span></td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono">CHF {t.mrr}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </Layout>
        );
    }

    // --- BROKER VIEW (Storefront) ---
    // Simulate current plan (hardcoded for demo, would come from auth context's tenant info)
    const currentPlanId = 'pkg_pro'; 

    return (
        <Layout>
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Wählen Sie den passenden Plan</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Skalieren Sie Ihr Maklergeschäft mit unseren leistungsstarken Paketen. Jederzeit kündbar.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                {MOCK_SAAS_PACKAGES.map(pkg => {
                    const isCurrent = pkg.id === currentPlanId;
                    return (
                        <div 
                            key={pkg.id} 
                            className={`
                                relative rounded-2xl p-8 flex flex-col transition-all duration-300
                                ${isCurrent 
                                    ? 'bg-white dark:bg-slate-900 border-2 border-brand-500 shadow-xl scale-105 z-10' 
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-300 hover:shadow-lg'
                                }
                            `}
                        >
                            {pkg.isPopular && !isCurrent && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <Star size={12} fill="currentColor" /> Beliebt
                                </div>
                            )}

                            {isCurrent && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <Check size={14} /> Ihr Plan
                                </div>
                            )}

                            <div className="mb-6 text-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{pkg.name}</h3>
                                <div className="flex justify-center items-end gap-1 mt-4">
                                    <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">CHF {pkg.price}</span>
                                    <span className="text-slate-500 mb-1">/ Monat</span>
                                </div>
                                <p className="text-slate-500 text-sm mt-4">{pkg.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {pkg.features.map((feat, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                        <div className="mt-0.5 p-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 shrink-0">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <Button 
                                variant={isCurrent ? 'outline' : 'primary'} 
                                className={`w-full ${isCurrent ? 'border-brand-200 text-brand-700 cursor-default hover:bg-transparent' : ''}`}
                                disabled={isCurrent}
                            >
                                {isCurrent ? 'Aktiver Plan' : 'Plan wählen'}
                            </Button>
                        </div>
                    );
                })}
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-brand-900 rounded-2xl p-8 text-white flex items-center gap-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Enterprise Support</h3>
                        <p className="text-brand-100 text-sm mb-4">Benötigen Sie individuelle Anpassungen, API-Integrationen oder On-Premise Hosting?</p>
                        <Button size="sm" className="bg-white text-brand-900 hover:bg-brand-50 border-none">Sales kontaktieren</Button>
                    </div>
                    <Crown size={120} className="absolute -right-6 -bottom-6 text-brand-800 opacity-50" />
                </div>
                 <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 flex items-center gap-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">Zusatzmodule</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Erweitern Sie Ihren Plan mit KI-Modulen oder zusätzlichen User-Lizenzen.</p>
                        <Button size="sm" variant="outline">Module ansehen</Button>
                    </div>
                    <Zap size={120} className="absolute -right-6 -bottom-6 text-slate-200 dark:text-slate-700 opacity-50" />
                </div>
            </div>
        </Layout>
    );
};