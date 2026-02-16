
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
import { SensitiveData } from '../components/ui/SensitiveData';
import { 
    Settings, 
    Save, 
    RefreshCw, 
    Mail, 
    Sparkles, 
    ShieldAlert, 
    Server,
    ToggleLeft,
    ToggleRight,
    DollarSign,
    BarChart3,
    PieChart as PieIcon,
    TrendingUp,
    AlertTriangle,
    Coins
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

// Mock Usage Data
const USAGE_DATA = [
    { date: '01.05', tokens: 150000, cost: 0.15 },
    { date: '05.05', tokens: 230000, cost: 0.23 },
    { date: '10.05', tokens: 180000, cost: 0.18 },
    { date: '15.05', tokens: 450000, cost: 0.45 },
    { date: '20.05', tokens: 320000, cost: 0.32 },
    { date: '25.05', tokens: 580000, cost: 0.58 },
    { date: '30.05', tokens: 620000, cost: 0.62 },
];

const TENANT_USAGE = [
    { name: 'Muster Broker AG', usage: 1250000, share: 45 },
    { name: 'Finanz & Partner', usage: 850000, share: 30 },
    { name: 'Solo Broker Hans', usage: 120000, share: 5 },
    { name: 'Andere', usage: 550000, share: 20 },
];

export const SaaSEmailConfig: React.FC = () => {
    const { role } = useAuth();
    const [activeTab, setActiveTab] = useState<'FEATURES' | 'COSTS'>('FEATURES');
    const [isSaving, setIsSaving] = useState(false);

    // Feature Config State
    const [providers, setProviders] = useState({
        outlook: true,
        gmail: true,
        imap: false,
    });

    const [aiFeatures, setAiFeatures] = useState({
        summarization: true,
        drafting: true,
        sentiment: false,
        dataExtraction: true
    });

    const [compliance, setCompliance] = useState({
        globalFooter: true,
        retentionDays: 3650,
        footerText: 'Diese Nachricht wurde über SwissBroker OS gesendet. Datenhaltung in der Schweiz.'
    });

    // Billing Config State
    const [billingModel, setBillingModel] = useState<'FLAT' | 'FREEMIUM' | 'PAYG'>('FREEMIUM');
    const [pricing, setPricing] = useState({
        baseCostPer1k: 0.002, // Google Price (Mock)
        salesPricePer1k: 0.005, // Re-billing Price
        freeLimit: 50000 // Tokens
    });

    // Access Control: Only SaaS Admins
    if (role !== UserRole.SAAS_SUPER_ADMIN && role !== UserRole.SAAS_FINANCE) {
        return <Navigate to="/dashboard" />;
    }

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            console.log("Email config saved:", { providers, aiFeatures, compliance, billingModel, pricing });
        }, 1000);
    };

    // Calculate Margin
    const totalVolume = 2770000; // Mock total tokens
    const totalCost = (totalVolume / 1000) * pricing.baseCostPer1k;
    const totalRevenue = (totalVolume / 1000) * pricing.salesPricePer1k;
    const margin = totalRevenue - totalCost;
    const marginPercent = ((pricing.salesPricePer1k - pricing.baseCostPer1k) / pricing.baseCostPer1k) * 100;

    const Toggle = ({ checked, onChange, label, description }: { checked: boolean, onChange: () => void, label: string, description?: string }) => (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{label}</p>
                {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
            </div>
            <button 
                onClick={onChange}
                className={`transition-colors text-2xl ${checked ? 'text-brand-600' : 'text-slate-300 dark:text-slate-600'}`}
            >
                {checked ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
        </div>
    );

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Mail className="text-brand-600" />
                        E-Mail & AI Operations
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Konfiguration, Kostenkontrolle und Abrechnung der KI-Modelle.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 flex">
                        <button 
                            onClick={() => setActiveTab('FEATURES')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'FEATURES' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Konfiguration
                        </button>
                        <button 
                            onClick={() => setActiveTab('COSTS')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'COSTS' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Kosten & Abrechnung
                        </button>
                    </div>
                    <Button 
                        onClick={handleSave} 
                        icon={isSaving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18} />}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Speichere...' : 'Speichern'}
                    </Button>
                </div>
            </div>

            {activeTab === 'FEATURES' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
                    {/* AI Features & Costs */}
                    <Card title="KI & Automatisierung (Google Gemini)">
                        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 text-sm text-purple-800 dark:text-purple-300 rounded-lg flex gap-3">
                            <Sparkles size={20} className="shrink-0" />
                            <p>Steuern Sie, welche KI-Funktionen den Brokern zur Verfügung stehen. Deaktivierte Funktionen verursachen keine Kosten.</p>
                        </div>
                        
                        <div className="space-y-1">
                            <Toggle 
                                label="E-Mail Zusammenfassung" 
                                description="Erstellt automatisch Zusammenfassungen langer Threads (High Token usage)."
                                checked={aiFeatures.summarization} 
                                onChange={() => setAiFeatures(p => ({...p, summarization: !p.summarization}))} 
                            />
                            <Toggle 
                                label="Smart Reply (Entwürfe)" 
                                description="Generiert Antwortvorschläge basierend auf dem Kontext."
                                checked={aiFeatures.drafting} 
                                onChange={() => setAiFeatures(p => ({...p, drafting: !p.drafting}))} 
                            />
                            <Toggle 
                                label="Sentiment Analyse" 
                                description="Analysiert die Stimmung (Positiv/Negativ) der Nachricht."
                                checked={aiFeatures.sentiment} 
                                onChange={() => setAiFeatures(p => ({...p, sentiment: !p.sentiment}))} 
                            />
                            <Toggle 
                                label="Daten-Extraktion" 
                                description="Erkennt automatisch Termine, Policen-Nummern und Beträge."
                                checked={aiFeatures.dataExtraction} 
                                onChange={() => setAiFeatures(p => ({...p, dataExtraction: !p.dataExtraction}))} 
                            />
                        </div>
                    </Card>

                    {/* Providers & Connectivity */}
                    <div className="space-y-6">
                        <Card title="Erlaubte Mail-Provider">
                            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-800 dark:text-blue-300 rounded-lg flex gap-3">
                                <Server size={20} className="shrink-0" />
                                <p>OAuth-Apps müssen im jeweiligen Developer Console (Azure/Google) konfiguriert sein.</p>
                            </div>
                            
                            <div className="space-y-1">
                                <Toggle 
                                    label="Microsoft 365 (Outlook)" 
                                    checked={providers.outlook} 
                                    onChange={() => setProviders(p => ({...p, outlook: !p.outlook}))} 
                                />
                                <Toggle 
                                    label="Google Workspace (Gmail)" 
                                    checked={providers.gmail} 
                                    onChange={() => setProviders(p => ({...p, gmail: !p.gmail}))} 
                                />
                                <Toggle 
                                    label="Generisches IMAP/SMTP" 
                                    description="Erfordert die Speicherung von Benutzer-Passwörtern (Nicht empfohlen)."
                                    checked={providers.imap} 
                                    onChange={() => setProviders(p => ({...p, imap: !p.imap}))} 
                                />
                            </div>
                        </Card>

                        <Card title="Compliance & Sicherheit">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Gesetzliche Aufbewahrungsfrist (Tage)
                                    </label>
                                    <select 
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                        value={compliance.retentionDays}
                                        onChange={(e) => setCompliance(p => ({...p, retentionDays: parseInt(e.target.value)}))}
                                    >
                                        <option value={365}>1 Jahr</option>
                                        <option value={1825}>5 Jahre</option>
                                        <option value={3650}>10 Jahre (Schweizer Standard)</option>
                                    </select>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <Toggle 
                                        label="Globaler Footer erzwingen" 
                                        checked={compliance.globalFooter} 
                                        onChange={() => setCompliance(p => ({...p, globalFooter: !p.globalFooter}))} 
                                    />
                                    {compliance.globalFooter && (
                                        <div className="mt-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold">Footer Text</label>
                                            <textarea 
                                                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm h-20"
                                                value={compliance.footerText}
                                                onChange={(e) => setCompliance(p => ({...p, footerText: e.target.value}))}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'COSTS' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Verbrauch (Tokens)</p>
                                    <h3 className="text-2xl font-bold">2.77M</h3>
                                    <p className="text-xs text-emerald-600 font-medium">+12% vs Vormonat</p>
                                </div>
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                                    <BarChart3 size={20} />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Einkauf (Kosten)</p>
                                    <h3 className="text-2xl font-bold"><SensitiveData>CHF {totalCost.toFixed(2)}</SensitiveData></h3>
                                    <p className="text-xs text-slate-400 font-medium">Bezahlt an Google</p>
                                </div>
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Verkauf (Umsatz)</p>
                                    <h3 className="text-2xl font-bold"><SensitiveData>CHF {totalRevenue.toFixed(2)}</SensitiveData></h3>
                                    <p className="text-xs text-slate-400 font-medium">Verrechnet an Broker</p>
                                </div>
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                                    <DollarSign size={20} />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm ring-1 ring-emerald-500/20">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Marge (Profit)</p>
                                    <h3 className="text-2xl font-bold text-emerald-600"><SensitiveData>CHF {margin.toFixed(2)}</SensitiveData></h3>
                                    <p className="text-xs text-emerald-600 font-medium">{marginPercent.toFixed(0)}% Aufschlag</p>
                                </div>
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-lg">
                                    <Coins size={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Configuration */}
                        <div className="space-y-6">
                            <Card title="Weiterverrechnungs-Strategie" description="Wie werden AI-Kosten an die Broker weitergegeben?">
                                <div className="space-y-4 mb-6">
                                    <div 
                                        className={`p-4 rounded-lg border cursor-pointer transition-colors flex gap-3 ${billingModel === 'FLAT' ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300'}`}
                                        onClick={() => setBillingModel('FLAT')}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${billingModel === 'FLAT' ? 'border-brand-600' : 'border-slate-300'}`}>
                                            {billingModel === 'FLAT' && <div className="w-2.5 h-2.5 rounded-full bg-brand-600"></div>}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Flatrate (Inklusive)</h4>
                                            <p className="text-xs text-slate-500">Kosten sind im SaaS-Grundpreis enthalten. Einfachste Verwaltung, aber Margen-Risiko bei Power-Usern.</p>
                                        </div>
                                    </div>

                                    <div 
                                        className={`p-4 rounded-lg border cursor-pointer transition-colors flex gap-3 ${billingModel === 'FREEMIUM' ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300'}`}
                                        onClick={() => setBillingModel('FREEMIUM')}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${billingModel === 'FREEMIUM' ? 'border-brand-600' : 'border-slate-300'}`}>
                                            {billingModel === 'FREEMIUM' && <div className="w-2.5 h-2.5 rounded-full bg-brand-600"></div>}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Freemium Limit (Empfohlen)</h4>
                                            <p className="text-xs text-slate-500">X Tokens/Monat inklusive, danach automatische Verrechnung pro 1k Tokens.</p>
                                        </div>
                                    </div>

                                    <div 
                                        className={`p-4 rounded-lg border cursor-pointer transition-colors flex gap-3 ${billingModel === 'PAYG' ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300'}`}
                                        onClick={() => setBillingModel('PAYG')}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${billingModel === 'PAYG' ? 'border-brand-600' : 'border-slate-300'}`}>
                                            {billingModel === 'PAYG' && <div className="w-2.5 h-2.5 rounded-full bg-brand-600"></div>}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Pay-per-Use</h4>
                                            <p className="text-xs text-slate-500">Volle Weiterverrechnung aller Token-Kosten ab dem ersten Request.</p>
                                        </div>
                                    </div>
                                </div>

                                {billingModel !== 'FLAT' && (
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Einkauf (Google)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2 text-slate-400 text-sm">CHF</span>
                                                <input 
                                                    type="number" 
                                                    step="0.0001"
                                                    value={pricing.baseCostPer1k}
                                                    onChange={e => setPricing({...pricing, baseCostPer1k: parseFloat(e.target.value)})}
                                                    className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                                />
                                                <span className="absolute right-3 top-2 text-slate-400 text-xs">/ 1k Tokens</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Verkauf (Broker)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2 text-slate-400 text-sm">CHF</span>
                                                <input 
                                                    type="number" 
                                                    step="0.0001"
                                                    value={pricing.salesPricePer1k}
                                                    onChange={e => setPricing({...pricing, salesPricePer1k: parseFloat(e.target.value)})}
                                                    className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-800 border border-brand-300 dark:border-brand-700 rounded-lg text-sm font-bold text-brand-600"
                                                />
                                                <span className="absolute right-3 top-2 text-slate-400 text-xs">/ 1k Tokens</span>
                                            </div>
                                        </div>
                                        {billingModel === 'FREEMIUM' && (
                                            <div className="col-span-2 space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Freigrenze (Inklusive)</label>
                                                <input 
                                                    type="number" 
                                                    step="1000"
                                                    value={pricing.freeLimit}
                                                    onChange={e => setPricing({...pricing, freeLimit: parseFloat(e.target.value)})}
                                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                                />
                                                <p className="text-xs text-slate-400">Entspricht ca. {Math.round(pricing.freeLimit / 1000)} Standard-Emails pro Monat.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Charts & Analytics */}
                        <div className="space-y-6">
                            <Card title="Token-Verbrauch (Global)">
                                <div className="h-[200px] w-full min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={USAGE_DATA}>
                                            <defs>
                                                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                            <Area type="monotone" dataKey="tokens" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorTokens)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card title="Top Verbraucher (Tenants)">
                                <div className="space-y-4">
                                    {TENANT_USAGE.map((tenant, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <div className="w-8 text-sm text-slate-400 font-bold">#{idx+1}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-medium text-slate-900 dark:text-slate-100">{tenant.name}</span>
                                                    <span className="font-mono text-slate-600 dark:text-slate-400">{(tenant.usage/1000000).toFixed(2)}M Tokens</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${tenant.share}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="text-xs font-bold text-slate-500 w-10 text-right">{tenant.share}%</div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};
