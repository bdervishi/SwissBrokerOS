
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { MOCK_SAAS_PACKAGES, MOCK_TENANTS, MOCK_ADDONS } from '../constants';
import { UserRole, SaaSAddon } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';
import { Check, Star, Plus, Edit2, Users, Crown, Zap, ShieldCheck, CreditCard, Layout as LayoutIcon, BrainCircuit, Palette, ShoppingBag, CheckCircle, Loader2, Server, Lock } from 'lucide-react';
import { Navigate, Link, useNavigate } from 'react-router-dom';

export const SaaSPlans: React.FC = () => {
    const { role } = useAuth();
    const { tenant, updateTenant } = useBranding();
    const navigate = useNavigate();

    // Purchase Flow State
    const [purchasingAddon, setPurchasingAddon] = useState<SaaSAddon | null>(null);
    const [purchaseStep, setPurchaseStep] = useState<'CONFIRM' | 'PROCESSING' | 'SUCCESS'>('CONFIRM');

    if (role === UserRole.CLIENT) {
        return <Navigate to="/dashboard" />;
    }

    // Get icon component dynamically
    const getIcon = (name: string) => {
        switch(name) {
            case 'Layout': return <LayoutIcon size={24} />;
            case 'BrainCircuit': return <BrainCircuit size={24} />;
            case 'Palette': return <Palette size={24} />;
            default: return <Zap size={24} />;
        }
    };

    const initiatePurchase = (addon: SaaSAddon) => {
        setPurchasingAddon(addon);
        setPurchaseStep('CONFIRM');
    };

    const confirmPurchase = () => {
        if (!purchasingAddon || !tenant) return;
        
        setPurchaseStep('PROCESSING');

        // Simulate Network Request & Auto-Approval Logic
        setTimeout(() => {
            // 1. Simulate Request to SaaS Admin
            console.log(`[System] Requesting license for ${purchasingAddon.id} from SaaS Admin...`);
            
            setTimeout(() => {
                // 2. Simulate Auto-Approval
                console.log(`[System] Auto-Approval Policy matched. Approving license.`);
                
                // 3. Update Tenant State
                const currentAddons = tenant.activeAddons || [];
                updateTenant({
                    activeAddons: [...currentAddons, purchasingAddon.id]
                });

                setPurchaseStep('SUCCESS');
            }, 1500); // Wait for "Approval"
        }, 1000); // Wait for "Network"
    };

    const handleSuccessAction = () => {
        setPurchasingAddon(null);
        if (purchasingAddon?.id === 'addon_website') {
            navigate('/web-engine');
        }
    };

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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
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
                                {pkg.includedAddons && pkg.includedAddons.length > 0 && (
                                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-xs font-bold uppercase text-slate-400 mb-1">Inklusive:</p>
                                        {pkg.includedAddons.map(addonId => {
                                            const addon = MOCK_ADDONS.find(a => a.id === addonId);
                                            return addon ? (
                                                <div key={addonId} className="flex items-center gap-2 text-xs font-bold text-brand-600">
                                                    <Plus size={10} /> {addon.name}
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <Button variant="outline" className="w-full" icon={<Edit2 size={16} />}>Editieren</Button>
                            </div>
                        </div>
                    ))}
                </div>

                <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">Verfügbare Add-ons (Upselling)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {MOCK_ADDONS.map(addon => (
                        <div key={addon.id} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg text-brand-600">
                                {getIcon(addon.iconName)}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">{addon.name}</h4>
                                <p className="text-xs text-slate-500">CHF {addon.price} / Mt.</p>
                            </div>
                            <Button size="sm" variant="ghost" icon={<Edit2 size={14}/>} />
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
                                    <th className="px-6 py-3">Add-ons</th>
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
                                            {t.activeAddons?.length ? (
                                                <div className="flex gap-1">
                                                    {t.activeAddons.map(aid => (
                                                        <span key={aid} className="w-2 h-2 rounded-full bg-brand-500" title={aid}></span>
                                                    ))}
                                                </div>
                                            ) : <span className="text-slate-400">-</span>}
                                        </td>
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
    const currentPlanId = tenant?.plan === 'STARTER' ? 'pkg_starter' : tenant?.plan === 'ENTERPRISE' ? 'pkg_enterprise' : 'pkg_pro'; 

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
                                        <div className={`mt-0.5 p-0.5 rounded-full transition-colors ${isCurrent ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                                {/* Show Included Addons */}
                                {pkg.includedAddons && pkg.includedAddons.map(addonId => {
                                    const addon = MOCK_ADDONS.find(a => a.id === addonId);
                                    if(!addon) return null;
                                    return (
                                        <li key={addonId} className="flex items-start gap-3 text-sm font-bold text-brand-600 dark:text-brand-400">
                                            <div className="mt-0.5 p-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600">
                                                <Plus size={12} strokeWidth={3} />
                                            </div>
                                            {addon.name} inklusive
                                        </li>
                                    );
                                })}
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

            {/* ADD-ONS SECTION */}
            <div className="max-w-6xl mx-auto mb-16">
                <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Zap className="text-yellow-500" fill="currentColor" /> Erweiterungen & Module
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {MOCK_ADDONS.map(addon => {
                        // Check if addon is already active (via Plan OR explicit addon purchase)
                        const isIncludedInPlan = MOCK_SAAS_PACKAGES.find(p => p.id === currentPlanId)?.includedAddons?.includes(addon.id);
                        const isPurchased = tenant?.activeAddons?.includes(addon.id);
                        const isActive = isIncludedInPlan || isPurchased;

                        return (
                            <div key={addon.id} className={`p-6 rounded-xl border transition-all ${isActive ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                        {getIcon(addon.iconName)}
                                    </div>
                                    {isActive ? (
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                                            <CheckCircle size={12} /> Aktiv
                                        </span>
                                    ) : (
                                        <span className="font-bold text-slate-900 dark:text-slate-100">CHF {addon.price} <span className="text-xs font-normal text-slate-500">/mt.</span></span>
                                    )}
                                </div>
                                <h4 className="font-bold text-lg mb-2">{addon.name}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px]">{addon.description}</p>
                                
                                {isActive ? (
                                    <Button 
                                        variant="outline" 
                                        className="w-full border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                                        onClick={() => addon.id === 'addon_website' && navigate('/web-engine')}
                                    >
                                        Modul öffnen
                                    </Button>
                                ) : (
                                    <Button className="w-full" icon={<ShoppingBag size={16}/>} onClick={() => initiatePurchase(addon)}>
                                        Hinzufügen
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
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
                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">Volume Discounts</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Ab 10 Benutzerlizenzen bieten wir attraktive Mengenrabatte.</p>
                        <Button size="sm" variant="outline">Rabatt anfragen</Button>
                    </div>
                    <Users size={120} className="absolute -right-6 -bottom-6 text-slate-200 dark:text-slate-700 opacity-50" />
                </div>
            </div>

            {/* PURCHASE SIMULATION MODAL */}
            <Modal
                isOpen={!!purchasingAddon}
                onClose={() => setPurchasingAddon(null)}
                title={purchaseStep === 'SUCCESS' ? 'Aktivierung erfolgreich' : 'Add-on buchen'}
                maxWidth="max-w-md"
            >
                <div className="p-4">
                    {purchaseStep === 'CONFIRM' && purchasingAddon && (
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto text-brand-600">
                                {getIcon(purchasingAddon.iconName)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{purchasingAddon.name}</h3>
                                <p className="text-sm text-slate-500 mt-2">Möchten Sie dieses Modul kostenpflichtig zu Ihrem Plan hinzufügen?</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-slate-500">Monatliche Kosten</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">CHF {purchasingAddon.price}.00</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-400">
                                    <span>Abrechnung</span>
                                    <span>via Hauptrechnung</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="ghost" className="flex-1" onClick={() => setPurchasingAddon(null)}>Abbrechen</Button>
                                <Button className="flex-1" onClick={confirmPurchase}>Jetzt buchen</Button>
                            </div>
                        </div>
                    )}

                    {purchaseStep === 'PROCESSING' && (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-brand-100 dark:border-brand-900 rounded-full"></div>
                                <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 animate-pulse">Lizenzen werden geprüft...</h3>
                                <p className="text-xs text-slate-500">Anfrage an SaaS Admin gesendet.</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full animate-in fade-in slide-in-from-bottom-2 duration-700 delay-1000">
                                <Server size={12} /> Auto-Approval Policy Active
                            </div>
                        </div>
                    )}

                    {purchaseStep === 'SUCCESS' && purchasingAddon && (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-in zoom-in duration-300">
                                <Check size={40} strokeWidth={4} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Modul freigeschaltet!</h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    <strong>{purchasingAddon.name}</strong> steht Ihnen ab sofort zur Verfügung.
                                </p>
                            </div>
                            
                            {purchasingAddon.id === 'addon_website' && (
                                <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-xl border border-brand-100 dark:border-brand-800 text-sm text-left">
                                    <p className="font-bold text-brand-800 dark:text-brand-300 mb-1">Nächste Schritte:</p>
                                    <ul className="list-disc pl-4 space-y-1 text-brand-700 dark:text-brand-400 text-xs">
                                        <li>Webseite konfigurieren</li>
                                        <li>Domain verbinden (optional)</li>
                                        <li>Lead-Formulare aktivieren</li>
                                    </ul>
                                </div>
                            )}

                            <Button className="w-full" onClick={handleSuccessAction}>
                                {purchasingAddon.id === 'addon_website' ? 'Web-Engine starten' : 'Schliessen'}
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </Layout>
    );
};
