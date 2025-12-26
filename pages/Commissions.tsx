import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MOCK_COMMISSIONS, MOCK_TENANTS, MOCK_POLICIES, MOCK_CLIENTS, MOCK_USERS } from '../constants';
import { CommissionStatus, CommissionType, UserRole, PolicyStatus } from '../types';
import { TrendingUp, DollarSign, Clock, Download, Filter, Building2, AlertTriangle, ShieldAlert, Phone, Users, CheckCircle, Settings as SettingsIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { SensitiveData } from '../components/ui/SensitiveData';

export const Commissions: React.FC = () => {
    const { role } = useAuth();
    const location = useLocation();
    
    // Check if a specific tab was requested via navigation state
    const initialTab = location.state?.tab === 'STORNO' ? 'STORNO' : 'OVERVIEW';
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STORNO' | 'AGENTS'>(initialTab);

    // Mock Agent Settings (Local State)
    const [agentSettings, setAgentSettings] = useState([
        { userId: 'u_agent_1', name: 'Felix Fieldagent', split: 60, role: 'Broker Agent' },
        { userId: 'u_saas_4', name: 'Alex Acquisition', split: 20, role: 'Hunter (SaaS)' } // Hunter gets recurring SaaS commission
    ]);

    // Update tab if location state changes (e.g. clicking multiple times)
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    // 1. Client Access Control
    if (role === UserRole.CLIENT) {
        return <Navigate to="/dashboard" />;
    }
    
    // 2. SaaS Hunter View
    if (role === UserRole.SAAS_ACQUISITION) {
        // Simple view for Hunters
        const myCommissions = MOCK_COMMISSIONS; // Mock: In real app filter by hunter ID
        const totalEarned = 12500;
        
        return (
            <Layout>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Meine Provisionen</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <KPICard title="Total Verdient" value={`CHF ${totalEarned}`} icon={<DollarSign className="text-emerald-600"/>} trend="Lifetime"/>
                    <KPICard title="Offen" value="CHF 450" icon={<Clock className="text-amber-600"/>} trend="Nächste Auszahlung"/>
                    <KPICard title="Aktiver Split" value="20%" icon={<SettingsIcon className="text-slate-600"/>} trend="Auf Recurring Revenue"/>
                </div>
                <Card title="Abrechnungen">
                    <div className="p-4 text-center text-slate-500">Keine Transaktionen diesen Monat.</div>
                </Card>
            </Layout>
        )
    }

    // 3. SaaS Admin View (Revenue from Tenants)
    if (role === UserRole.SAAS_SUPER_ADMIN || role === UserRole.SAAS_SALES || role === UserRole.SAAS_FINANCE) {
        // ... (SaaS View Code remains same as previous, but included for completeness)
        const totalMrr = MOCK_TENANTS.reduce((sum, t) => sum + t.mrr, 0);
        const revenueData = [
            { name: 'Jan', value: 850 },
            { name: 'Feb', value: 920 },
            { name: 'Mär', value: 980 },
            { name: 'Apr', value: 1050 },
            { name: 'Mai', value: totalMrr },
        ];

        return (
            <Layout>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Revenue & Subscriptions</h1>
                        <p className="text-slate-500 dark:text-slate-400">Übersicht der SaaS-Einnahmen.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <KPICard 
                        title="Monthly Recurring Revenue" 
                        value={`CHF ${totalMrr}`} 
                        icon={<DollarSign className="text-emerald-600" />} 
                        trend="+15% MoM"
                    />
                     <KPICard 
                        title="Active Tenants" 
                        value={MOCK_TENANTS.length.toString()} 
                        icon={<Building2 className="text-blue-600" />} 
                        trend="Stable"
                    />
                </div>

                 <Card title="Revenue Growth" className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                        <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                 </Card>
            </Layout>
        );
    }

    // 4. Broker View (Normal Commissions + Storno + Agents)
    
    // --- Data Prep for Overview ---
    const totalPaid = MOCK_COMMISSIONS
        .filter(c => c.status === CommissionStatus.PAID)
        .reduce((sum, c) => sum + c.amount, 0);

    const totalPending = MOCK_COMMISSIONS
        .filter(c => c.status === CommissionStatus.PENDING)
        .reduce((sum, c) => sum + c.amount, 0);

    const recentMonthData = [
        { name: 'Jan', value: 3200 },
        { name: 'Feb', value: 4100 },
        { name: 'Mär', value: 3800 },
        { name: 'Apr', value: 5200 },
        { name: 'Mai', value: totalPaid + totalPending }, // Approx
    ];

    // --- Data Prep for Storno Risk ---
    // Filter policies that have a liability duration and are active
    const policiesWithRisk = MOCK_POLICIES.filter(p => 
        p.status === PolicyStatus.ACTIVE && 
        (p.liabilityDurationMonths || 0) > 0 && 
        p.initialCommission && p.initialCommission > 0
    );

    const today = new Date();
    
    // Enrich policies with risk calculation
    const riskyPolicies = policiesWithRisk.map(p => {
        const start = new Date(p.startDate);
        const liabilityMonths = p.liabilityDurationMonths || 0;
        
        // Calculate months passed since start
        const diffYears = today.getFullYear() - start.getFullYear();
        const diffMonths = today.getMonth() - start.getMonth();
        const monthsPassed = (diffYears * 12) + diffMonths;
        
        const remainingMonths = Math.max(0, liabilityMonths - monthsPassed);
        const progress = Math.min(100, (monthsPassed / liabilityMonths) * 100);
        
        // Linear clawback calculation (simplistic)
        // If 12 months passed of 60, we owe back 48/60ths if cancelled today
        const riskRatio = remainingMonths / liabilityMonths;
        const potentialClawback = (p.initialCommission || 0) * riskRatio;

        return {
            ...p,
            monthsPassed,
            remainingMonths,
            progress,
            potentialClawback
        };
    }).filter(p => p.remainingMonths > 0).sort((a,b) => b.potentialClawback - a.potentialClawback);

    const totalRiskAmount = riskyPolicies.reduce((sum, p) => sum + p.potentialClawback, 0);
    const avgMonthsRemaining = riskyPolicies.length > 0 
        ? Math.round(riskyPolicies.reduce((sum, p) => sum + p.remainingMonths, 0) / riskyPolicies.length) 
        : 0;

    // --- Data Prep for Agents ---
    const agents = MOCK_USERS.filter(u => u.role === UserRole.BROKER_AGENT);
    const agentStats = agents.map(agent => {
        const agentCommissions = MOCK_COMMISSIONS.filter(c => c.agentId === agent.id);
        const totalVolume = agentCommissions.reduce((sum, c) => sum + c.amount, 0);
        
        // Calculated payout
        const payoutDue = agentCommissions
            .filter(c => c.status === CommissionStatus.PAID) // Only pay out what we received
            .reduce((sum, c) => sum + (c.amount * (c.agentSplitPercentage || 0.5)), 0);
            
        return {
            agent,
            dealCount: agentCommissions.length,
            totalVolume,
            payoutDue
        };
    });

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Provisionen & Finanzen</h1>
                    <p className="text-slate-500 dark:text-slate-400">Verwalten Sie Einnahmen, Agenten-Abrechnungen und Storno-Risiken.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={<Filter size={16} />}>Filter</Button>
                    <Button variant="outline" icon={<Download size={16} />}>Export</Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto">
                <TabButton 
                    active={activeTab === 'OVERVIEW'} 
                    onClick={() => setActiveTab('OVERVIEW')} 
                    icon={<DollarSign size={16} />} 
                    label="Umsatz & Provisionen" 
                />
                <TabButton 
                    active={activeTab === 'STORNO'} 
                    onClick={() => setActiveTab('STORNO')} 
                    icon={<ShieldAlert size={16} />} 
                    label="Storno-Überwachung"
                    badge={riskyPolicies.length}
                />
                <TabButton 
                    active={activeTab === 'AGENTS'} 
                    onClick={() => setActiveTab('AGENTS')} 
                    icon={<Users size={16} />} 
                    label="Sales Force & Abrechnung"
                />
            </div>

            {activeTab === 'OVERVIEW' && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <KPICard 
                            title="Ausbezahlt (YTD)" 
                            value={<SensitiveData>CHF {totalPaid.toLocaleString()}</SensitiveData>} 
                            icon={<DollarSign className="text-emerald-600" />} 
                            trend="+12% vs. Vorjahr"
                        />
                        <KPICard 
                            title="Ausstehend / Pending" 
                            value={<SensitiveData>CHF {totalPending.toLocaleString()}</SensitiveData>}
                            icon={<Clock className="text-amber-600" />} 
                            trend="Erwartet in 30 Tagen"
                            highlight
                        />
                        <KPICard 
                            title="Bestandscourtage (Prognose)" 
                            value={<SensitiveData>CHF 45,000</SensitiveData>}
                            icon={<TrendingUp className="text-brand-600" />} 
                            trend="Basis 2024"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main List */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card title="Transaktionen" noPadding>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-3">Datum</th>
                                                <th className="px-6 py-3">Partner</th>
                                                <th className="px-6 py-3">Quelle</th>
                                                <th className="px-6 py-3">Typ</th>
                                                <th className="px-6 py-3 text-right">Betrag</th>
                                                <th className="px-6 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {MOCK_COMMISSIONS.map(com => (
                                                <tr key={com.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{com.date}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{com.partnerName}</td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{com.source}</td>
                                                    <td className="px-6 py-4">
                                                        <BadgeType type={com.type} />
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono font-medium">
                                                        <SensitiveData>CHF {com.amount.toFixed(2)}</SensitiveData>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <BadgeStatus status={com.status} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar Chart */}
                        <div className="space-y-6">
                            <Card title="Einnahmen Verlauf">
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={recentMonthData}>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                                        <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#0ea5e9" />
                                    </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <div className="bg-slate-900 rounded-xl p-6 text-white">
                                <h3 className="font-bold mb-2">Courtage-Ziel 2024</h3>
                                <div className="flex justify-between text-sm mb-2 text-slate-400">
                                    <span>Erreicht: <SensitiveData>CHF 35k</SensitiveData></span>
                                    <span>Ziel: CHF 100k</span>
                                </div>
                                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-4">
                                    <div className="bg-brand-500 h-full w-[35%]"></div>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Sie liegen leicht hinter dem Plan. Fokussieren Sie sich auf Hypotheken-Abschlüsse im Q3.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'STORNO' && (
                <>
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl flex gap-4">
                        <div className="p-2 bg-amber-100 dark:bg-amber-800/20 rounded-lg h-fit text-amber-600 dark:text-amber-400">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-900 dark:text-amber-200">Stornohaftung Dashboard</h3>
                            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                                Diese Übersicht zeigt Verträge, die sich noch in der Stornohaftungszeit befinden. 
                                Bei einer Kündigung droht eine anteilige Rückzahlung der Abschlussprovision.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <KPICard 
                            title="Total Storno-Risiko" 
                            value={<SensitiveData>CHF {totalRiskAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}</SensitiveData>} 
                            icon={<AlertTriangle className="text-red-600" />} 
                            trend="Rückforderungspotenzial"
                        />
                         <KPICard 
                            title="Gefährdete Verträge" 
                            value={riskyPolicies.length.toString()} 
                            icon={<ShieldAlert className="text-amber-600" />} 
                            trend="In Haftungszeit"
                        />
                         <KPICard 
                            title="Ø Rest-Haftung" 
                            value={`${avgMonthsRemaining} Monate`} 
                            icon={<Clock className="text-slate-600" />} 
                            trend="Bis verdiente Provision"
                        />
                    </div>

                    <Card title="Policen in Haftungszeit" noPadding>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3">Klient</th>
                                        <th className="px-6 py-3">Police / Versicherer</th>
                                        <th className="px-6 py-3">Startdatum</th>
                                        <th className="px-6 py-3 w-48">Haftungszeit Fortschritt</th>
                                        <th className="px-6 py-3 text-right">Risiko (CHF)</th>
                                        <th className="px-6 py-3">Aktion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {riskyPolicies.map(p => {
                                        const client = MOCK_CLIENTS.find(c => c.id === p.clientId);
                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <Link to={`/client/${p.clientId}`} className="font-medium text-brand-600 hover:underline">
                                                        {client ? `${client.firstName} ${client.lastName}` : 'Unbekannt'}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900 dark:text-slate-100">{p.type}</div>
                                                    <div className="text-xs text-slate-500">{p.insurer} • {p.policyNumber}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                    {p.startDate}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>{p.monthsPassed} Mo.</span>
                                                        <span className="text-slate-400">{p.liabilityDurationMonths} Mo.</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${p.progress > 80 ? 'bg-emerald-500' : p.progress > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                                            style={{ width: `${p.progress}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-1">
                                                        Noch {p.remainingMonths} Monate
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-medium text-red-600 dark:text-red-400">
                                                    <SensitiveData>CHF {p.potentialClawback.toFixed(2)}</SensitiveData>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Button size="sm" variant="outline" icon={<Phone size={14} />}>
                                                        Kontakt
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {riskyPolicies.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                                Keine Policen in der Stornohaftung.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}

            {activeTab === 'AGENTS' && (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">Externe Vermittler Übersicht</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <Card title="Agenten Konfiguration (Admin)" className="lg:col-span-1 bg-slate-50 dark:bg-slate-900/50">
                            <div className="space-y-4">
                                {agentSettings.map(agent => (
                                    <div key={agent.userId} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                        <div>
                                            <div className="font-bold text-sm">{agent.name}</div>
                                            <div className="text-xs text-slate-500">{agent.role}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-slate-400 uppercase">Split</div>
                                            <div className="font-bold text-brand-600">{agent.split}%</div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full text-xs">Provisionen bearbeiten</Button>
                            </div>
                        </Card>

                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {agentStats.map(stat => (
                                <div key={stat.agent.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                        <img src={stat.agent.avatarUrl} className="w-12 h-12 rounded-full bg-slate-200" alt="" />
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-slate-100">{stat.agent.firstName} {stat.agent.lastName}</h3>
                                            <p className="text-xs text-slate-500">{stat.dealCount} Abschlüsse</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Volumen Total</span>
                                            <span className="font-medium"><SensitiveData>CHF {stat.totalVolume.toLocaleString()}</SensitiveData></span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Auszahlbar (Freigegeben)</span>
                                            <span className="font-bold text-emerald-600"><SensitiveData>CHF {stat.payoutDue.toLocaleString()}</SensitiveData></span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="flex-1">Details</Button>
                                        <Button size="sm" className="flex-1" icon={<CheckCircle size={14}/>}>Abrechnen</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Card title="Abrechnungs-Journal" noPadding>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-3">Datum</th>
                                    <th className="px-6 py-3">Vermittler</th>
                                    <th className="px-6 py-3">Periode</th>
                                    <th className="px-6 py-3 text-right">Betrag</th>
                                    <th className="px-6 py-3">Dokument</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">30.04.2024</td>
                                    <td className="px-6 py-4 font-medium">Felix Fieldagent</td>
                                    <td className="px-6 py-4">April 2024</td>
                                    <td className="px-6 py-4 text-right font-mono"><SensitiveData>CHF 1,250.00</SensitiveData></td>
                                    <td className="px-6 py-4"><Button size="sm" variant="ghost" icon={<Download size={14}/>}>PDF</Button></td>
                                </tr>
                            </tbody>
                        </table>
                    </Card>
                </>
            )}
        </Layout>
    );
};

const KPICard = ({ title, value, icon, trend, highlight }: any) => (
    <div className={`p-6 rounded-xl border shadow-sm flex items-start justify-between ${highlight ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30' : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'}`}>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{value}</h3>
            <p className="text-xs font-medium text-slate-400">{trend}</p>
        </div>
        <div className={`p-3 rounded-lg ${highlight ? 'bg-amber-100 dark:bg-amber-800/30' : 'bg-slate-50 dark:bg-slate-800'}`}>
            {icon}
        </div>
    </div>
);

const BadgeType = ({ type }: { type: CommissionType }) => {
    switch(type) {
        case CommissionType.ACQUISITION: return <span className="text-xs font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">Abschluss</span>;
        case CommissionType.RECURRING: return <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">Bestand</span>;
        case CommissionType.ONE_OFF: return <span className="text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">Einmalig</span>;
        default: return null;
    }
};

const BadgeStatus = ({ status }: { status: CommissionStatus }) => {
    switch(status) {
        case CommissionStatus.PAID: return <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">Bezahlt</span>;
        case CommissionStatus.PENDING: return <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">Offen</span>;
        default: return <span className="text-xs text-slate-500">Unbekannt</span>;
    }
};

const TabButton = ({ active, onClick, icon, label, badge }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap relative
      ${active 
        ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
  >
    {icon}
    {label}
    {badge ? (
        <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 font-bold">
            {badge}
        </span>
    ) : null}
  </button>
);