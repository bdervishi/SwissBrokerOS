import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_SAAS_PACKAGES, MOCK_ADDONS } from '../constants';
import { Button } from '../components/ui/Button';
import { BackToTop } from '../components/ui/BackToTop';
import { Check, Star, Zap, Plus } from 'lucide-react';
import { PublicNavigation } from '../components/PublicNavigation';

export const PublicPlans: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-sans">
            <BackToTop />
            <PublicNavigation />

            <main className="pb-20 px-4 pt-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Pakete & Preise</h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Transparente Kosten. Jederzeit kündbar. Skaliert mit Ihrem Erfolg.
                        </p>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                        {MOCK_SAAS_PACKAGES.map(pkg => (
                            <div 
                                key={pkg.id} 
                                className={`
                                    relative rounded-2xl p-8 flex flex-col transition-all duration-300 bg-white dark:bg-slate-900 border 
                                    ${pkg.isPopular ? 'border-brand-500 shadow-xl scale-105 z-10' : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 hover:shadow-lg'}
                                `}
                            >
                                {pkg.isPopular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                                        <Star size={12} fill="currentColor" /> Beliebt
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
                                            <div className="mt-0.5 p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                    {pkg.includedAddons && pkg.includedAddons.map(addonId => {
                                        const addon = MOCK_ADDONS.find(a => a.id === addonId);
                                        return addon ? (
                                            <li key={addonId} className="flex items-start gap-3 text-sm font-bold text-brand-600 dark:text-brand-400">
                                                <div className="mt-0.5 p-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600">
                                                    <Plus size={12} strokeWidth={3} />
                                                </div>
                                                {addon.name} inklusive
                                            </li>
                                        ) : null;
                                    })}
                                </ul>

                                <Link to="/register">
                                    <Button className="w-full" variant={pkg.isPopular ? 'primary' : 'outline'}>
                                        Jetzt starten
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Addons Section */}
                    <div id="addons" className="mb-16">
                        <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
                            <Zap className="text-yellow-500" fill="currentColor" /> Erweiterungen
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {MOCK_ADDONS.map(addon => (
                                <div key={addon.id} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-300 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-brand-600">
                                            <Zap size={24} />
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">CHF {addon.price} <span className="text-xs font-normal text-slate-500">/mt.</span></span>
                                    </div>
                                    <h4 className="font-bold text-lg mb-2">{addon.name}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{addon.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>

            <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-600 text-xs">
                &copy; {new Date().getFullYear()} SwissBroker OS. Alle Rechte vorbehalten.
            </footer>
        </div>
    );
};
