import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
import { 
    Coins, 
    TrendingUp, 
    Users, 
    ArrowUpRight, 
    ShieldCheck, 
    BarChart3, 
    Building2, 
    Activity, 
    Settings, 
    PieChart as PieIcon,
    DollarSign,
    Car,
    CreditCard
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { SensitiveData } from '../components/ui/SensitiveData';

// Mock Aggregated Data for SaaS Admin
const GLOBAL_VOLUME_DATA = [
    { name: 'Jan', volume: 450000, revenue: 1125 },
    { name: 'Feb', volume: 520000, revenue: 1300 },
    { name: 'Mär', volume: 890000, revenue: 2225 },
    { name: 'Apr', volume: 1250000, revenue: 3125 },
    { name: 'Mai', volume: 2100000, revenue: 5250 },
];

const TOP_TENANTS_FINANCE = [
    { name: 'Muster Broker AG', simulations: 145, conversion: 12, volume: 850000 },
    { name: 'Finanz & Partner', simulations: 98, conversion: 8, volume: 420000 },
    { name: 'David Consult', simulations: 45, conversion: 15, volume: 380000 },
    { name: 'Prime Finance AG', simulations: 112, conversion: 5, volume: 290000 },
];

const RECENT_ACTIVITY = [
    { id: 'ev1', tenant: 'Muster Broker AG', type: 'LEASING', amount: 45000, status: 'PROPOSAL_SENT', date: 'Vor 10 Min' },
    { id: 'ev2', tenant: 'David Consult', type: 'PRIVATE', amount: 15000, status: 'APPLICATION_SUBMITTED', date: 'Vor 45 Min' },
    { id: 'ev3', tenant: 'Prime Finance AG', type: 'LEASING', amount: 82000, status: 'SIMULATION', date: 'Vor 2 Std' },
];

export const SaaSEmbeddedFinance: React.FC = () => {
    const { role } = useAuth();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PARTNERS' | 'CONFIG'>('OVERVIEW');

    if (role !== UserRole.SAAS_SUPER_ADMIN && role !== UserRole.SAAS_FINANCE) {
        return <Navigate to="/dashboard" />;
    }

    const totalVolume = GLOBAL_VOLUME_DATA.reduce((sum, d) => sum + d.volume, 0);
    const totalSaaSRevenue = totalVolume * 0.0025; // 0.25% weighted avg margin

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Coins className="text-emerald-500" />
                        Embedded Finance Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Plattform-weite Übersicht über Kredit- & Leasing-Transaktionen.</p>
                </div>
                <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
                    <button 
                        onClick={() => setActiveTab('OVERVIEW')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'OVERVIEW' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Übersicht
                    </button>
                    <button 
                        onClick={() => setActiveTab('PARTNERS')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'PARTNERS' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Partner & Feeds
                    </button>
                    <button 
                        onClick={() => setActiveTab('CONFIG')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'CONFIG' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Global Config
                    </button>
                </div>
            </div>

            {activeTab === 'OVERVIEW' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <KPICard 
                            title="Total Transaktions-Volumen" 
                            value={`CHF ${(totalVolume/1000000).toFixed(1)}M`} 
                            trend="+240% vs Q1" 
                            icon={<BarChart3 className="text-brand-600" />} 
                        />
                        <KPICard 
                            title="SaaS Platform Fees" 
                            value={<SensitiveData>CHF {totalSaaSRevenue.toLocaleString()}</SensitiveData>} 
                            trend="Umsatz-Treiber" 
                            icon={<DollarSign className="text-emerald-600" />} 
                            highlight 
                        />
                        <KPICard 
                            title="Aktive Broker (Finance)" 
                            value="18 / 48" 
                            trend="37% Adoption" 
                            icon={<Users className="text-blue-600" />} 
                        />
                        <KPICard 
                            title="Ø Ticket Grösse" 
                            value="CHF 42k" 
                            trend="Mix Kredit/Leasing" 
                            icon={<Activity className="text-purple-600" />} 
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Revenue Chart */}
                        <div className="lg:col-span-2">
                            <Card title="Umsatzentwicklung (Plattform-Fees)">
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={GLOBAL_VOLUME_DATA}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `CHF ${val}`} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                            <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        {/* Recent System-wide Activity */}
                        <Card title="Echtzeit-Feed (Live)" noPadding>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {RECENT_ACTIVITY.map(act => (
                                    <div key={act.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-black text-brand-600 uppercase tracking-tighter">{act.tenant}</span>
                                            <span className="text-[10px] text-slate-400">{act.date}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                {act.type === 'LEASING' ? <Car size={16} /> : <CreditCard size={16} />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold">CHF {act.amount.toLocaleString()}</div>
                                                <div className="text-[10px] text-slate-500">{act.status}</div>
                                            </div>
                                            <ArrowUpRight size={14} className="ml-auto text-slate-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
                                <Button variant="ghost" size="sm" className="text-[10px] uppercase font-black">Alle Aktivitäten einsehen</Button>
                            </div>
                        </Card>
                    </div>

                    {/* Tenant Leaderboard */}
                    <Card title="Top-Tenants nach Finanzierungs-Volumen">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-4 py-3">Broker Firm</th>
                                        <th className="px-4 py-3 text-center">Simulationen</th>
                                        <th className="px-4 py-3 text-center">Konversion</th>
                                        <th className="px-4 py-3 text-right">Volumen (MTD)</th>
                                        <th className="px-4 py-3 text-right">SaaS Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {TOP_TENANTS_FINANCE.map((t, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-4 py-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-black">#{idx+1}</div>
                                                {t.name}
                                            </td>
                                            <td className="px-4 py-4 text-center tabular-nums">{t.simulations}</td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500" style={{width: `${t.conversion * 5}%`}} />
                                                    </div>
                                                    <span className="font-mono text-[10px]">{t.conversion}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-mono">CHF {t.volume.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-right font-mono font-bold text-emerald-600">
                                                <SensitiveData>CHF {(t.volume * 0.0025).toFixed(2)}</SensitiveData>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'PARTNERS' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <Card title="Finanzierungs-Provider Management">
                        <div className="space-y-4">
                            {[
                                { name: 'BANK-now', connected: true, usage: 'High', feedStatus: 'Live' },
                                { name: 'Cembra', connected: true, usage: 'Medium', feedStatus: 'Live' },
                                { name: 'Migros Bank', connected: false, usage: 'N/A', feedStatus: 'Maintenance' },
                                { name: 'AMAG Leasing', connected: true, usage: 'High', feedStatus: 'Live' },
                            ].map(p => (
                                <div key={p.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${p.connected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <div>
                                            <div className="font-bold">{p.name}</div>
                                            <div className="text-xs text-slate-500">Feed Status: {p.feedStatus}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-400 uppercase font-black">Nutzung</div>
                                            <div className="text-xs font-bold">{p.usage}</div>
                                        </div>
                                        <Button variant="outline" size="sm">Konfiguration</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'CONFIG' && (
                <div className="max-w-2xl animate-in slide-in-from-right-4 duration-500">
                    <Card title="Globale Transaktions-Regeln">
                        <div className="space-y-6">
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3">
                                <ShieldCheck className="text-amber-600 shrink-0" />
                                <p className="text-xs text-amber-800 dark:text-amber-300">Diese Werte überschreiben die Standard-Marge der Plattform für alle Tenants, sofern keine individuellen Verträge bestehen.</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Standard Plattform-Fee (%)</label>
                                    <div className="relative">
                                        <input type="number" defaultValue={10.0} step={0.1} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-mono" />
                                        <span className="absolute right-3 top-2 text-slate-400">% der Broker-Provision</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Max. Broker-Aufschlag (Cap)</label>
                                    <div className="relative">
                                        <input type="number" defaultValue={2.0} step={0.1} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-mono" />
                                        <span className="absolute right-3 top-2 text-slate-400">% Zinsaufschlag</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">Verhindert unethisch hohe Zinsaufschläge durch Vermittler.</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <Button icon={<Settings size={16}/>}>Regeln aktualisieren</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </Layout>
    );
};

const KPICard = ({ title, value, trend, icon, highlight }: any) => (
    <div className={`p-6 rounded-xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${highlight ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${highlight ? 'bg-emerald-100 dark:bg-emerald-800/50' : 'bg-slate-50 dark:bg-slate-800'}`}>
                {icon}
            </div>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${highlight ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {trend}
            </span>
        </div>
        <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{value}</h3>
        </div>
    </div>
);