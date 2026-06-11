
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CommissionStatus, CommissionType, UserRole, PolicyStatus } from '../types';
import { TrendingUp, DollarSign, Clock, Download, Filter, Building2, AlertTriangle, ShieldAlert, Phone, Users, Handshake, FileSearch, Settings as SettingsIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useCommissions, useTenants, usePolicies, useClients, useProfiles } from '../src/hooks/useData';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { SensitiveData } from '../components/ui/SensitiveData';
import { AgreementsTab } from '../components/commissions/AgreementsTab';
import { StatementsTab } from '../components/commissions/StatementsTab';
import { PayoutTab } from '../components/commissions/PayoutTab';

type CommissionsTab = 'OVERVIEW' | 'AGREEMENTS' | 'STATEMENTS' | 'STORNO' | 'PAYOUT';

export const Commissions: React.FC = () => {
    const { user, role } = useAuth();
    const { data: commissions } = useCommissions();
    const { data: tenants } = useTenants();
    const { data: policies } = usePolicies();
    const { data: clients } = useClients();
    const { data: users } = useProfiles();
    const location = useLocation();
    const tenantId = user?.tenantId;

    // Check if a specific tab was requested via navigation state
    const initialTab: CommissionsTab = location.state?.tab === 'STORNO' ? 'STORNO' : 'OVERVIEW';
    const [activeTab, setActiveTab] = useState<CommissionsTab>(initialTab);

    // Update tab if location state changes (e.g. clicking multiple times)
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab === 'AGENTS' ? 'PAYOUT' : location.state.tab);
        }
    }, [location.state]);

    // 1. Client Access Control
    if (role === UserRole.CLIENT) {
        return <Navigate to="/dashboard" />;
    }
    
    // 2. SaaS Hunter View
    if (role === UserRole.SAAS_ACQUISITION) {
        // Simple view for Hunters
        const myCommissions = commissions; // Mock: In real app filter by hunter ID
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
        const totalMrr = tenants.reduce((sum, t) => sum + t.mrr, 0);
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
                        value={tenants.length.toString()} 
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

    // 4. Broker View (Soll/Ist + Vereinbarungen + Abgleich + Storno + Auszahlung)

    // --- Data Prep for Overview ---
    const totalPaid = commissions
        .filter(c => c.status === CommissionStatus.PAID || c.status === CommissionStatus.MATCHED)
        .reduce((sum, c) => sum + c.amount, 0);

    const totalPending = commissions
        .filter(c => c.status === CommissionStatus.PENDING)
        .reduce((sum, c) => sum + c.amount, 0);

    const totalExpectedOpen = commissions
        .filter(c => c.status === CommissionStatus.EXPECTED)
        .reduce((sum, c) => sum + (c.expectedAmount ?? 0), 0);

    // 12-Monats-Forecast aus der Soll-Stellung (Bestandes- + Abschlusscourtagen).
    const ymOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const forecastMonths: { name: string; value: number }[] = [];
    for (let i = 0; i < 12; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() + i);
        const key = ymOf(d);
        const value = commissions
            .filter(c => c.status === CommissionStatus.EXPECTED && c.period === key)
            .reduce((s, c) => s + (c.expectedAmount ?? 0), 0);
        forecastMonths.push({ name: key.slice(2), value: Math.round(value) });
    }
    const forecast12Total = forecastMonths.reduce((s, m) => s + m.value, 0);

    const sortedCommissions = [...commissions].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

    // --- Data Prep for Storno Risk ---
    // Filter policies that have a liability duration and are active
    const policiesWithRisk = policies.filter(p => 
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
                    active={activeTab === 'AGREEMENTS'}
                    onClick={() => setActiveTab('AGREEMENTS')}
                    icon={<Handshake size={16} />}
                    label="Vereinbarungen"
                />
                <TabButton
                    active={activeTab === 'STATEMENTS'}
                    onClick={() => setActiveTab('STATEMENTS')}
                    icon={<FileSearch size={16} />}
                    label="Abrechnungs-Abgleich"
                />
                <TabButton
                    active={activeTab === 'STORNO'}
                    onClick={() => setActiveTab('STORNO')}
                    icon={<ShieldAlert size={16} />}
                    label="Storno-Überwachung"
                    badge={riskyPolicies.length}
                />
                <TabButton
                    active={activeTab === 'PAYOUT'}
                    onClick={() => setActiveTab('PAYOUT')}
                    icon={<Users size={16} />}
                    label="Splits & Auszahlung"
                />
            </div>

            {activeTab === 'AGREEMENTS' && <AgreementsTab tenantId={tenantId} />}
            {activeTab === 'STATEMENTS' && <StatementsTab tenantId={tenantId} />}
            {activeTab === 'PAYOUT' && <PayoutTab tenantId={tenantId} />}

            {activeTab === 'OVERVIEW' && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <KPICard
                            title="Erhalten (Ist)"
                            value={<SensitiveData>CHF {totalPaid.toLocaleString()}</SensitiveData>}
                            icon={<DollarSign className="text-emerald-600" />}
                            trend="Abgeglichene & bezahlte Courtagen"
                        />
                        <KPICard
                            title="Offenes Soll"
                            value={<SensitiveData>CHF {Math.round(totalExpectedOpen + totalPending).toLocaleString()}</SensitiveData>}
                            icon={<Clock className="text-amber-600" />}
                            trend="Erwartet gemäss Courtage-Plan"
                            highlight
                        />
                        <KPICard
                            title="Forecast 12 Monate"
                            value={<SensitiveData>CHF {forecast12Total.toLocaleString()}</SensitiveData>}
                            icon={<TrendingUp className="text-brand-600" />}
                            trend="Aus Soll-Stellung (Abschluss + Bestand)"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main List */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card title="Courtage-Positionen (Soll / Ist)" noPadding>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-3">Fällig</th>
                                                <th className="px-6 py-3">Versicherer / Position</th>
                                                <th className="px-6 py-3">Typ</th>
                                                <th className="px-6 py-3 text-right">Soll</th>
                                                <th className="px-6 py-3 text-right">Ist</th>
                                                <th className="px-6 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {sortedCommissions.length === 0 && (
                                                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic">
                                                    Noch keine Courtagen. Erfasse eine Courtagevereinbarung und lege eine Police an —
                                                    der Courtage-Plan wird automatisch erstellt.
                                                </td></tr>
                                            )}
                                            {sortedCommissions.map(com => (
                                                <tr key={com.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{com.period || com.date}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-slate-900 dark:text-slate-100">{com.partnerName}</div>
                                                        <div className="text-xs text-slate-500">
                                                            {com.clientId
                                                                ? <Link to={`/client/${com.clientId}`} className="text-brand-600 hover:underline">{com.description || com.source}</Link>
                                                                : (com.description || com.source)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <BadgeType type={com.type} />
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono text-slate-500">
                                                        {com.expectedAmount != null ? <SensitiveData>CHF {com.expectedAmount.toLocaleString()}</SensitiveData> : '–'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono font-medium">
                                                        {com.amount ? <SensitiveData>CHF {com.amount.toLocaleString()}</SensitiveData> : '–'}
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
                            <Card title="Courtage-Forecast (12 Monate)">
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={forecastMonths}>
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
                                        const client = clients.find(c => c.id === p.clientId);
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
        case CommissionStatus.MATCHED: return <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">Abgeglichen</span>;
        case CommissionStatus.PENDING: return <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">Offen</span>;
        case CommissionStatus.EXPECTED: return <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">Erwartet</span>;
        case CommissionStatus.DISPUTED: return <span className="text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">Strittig</span>;
        case CommissionStatus.CLAWBACK: return <span className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">Storno</span>;
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
