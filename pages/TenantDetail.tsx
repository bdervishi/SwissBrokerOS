
import React, { useState, useMemo } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MOCK_TENANTS, MOCK_USERS, MOCK_CLIENTS, MOCK_POLICIES, MOCK_SAAS_PACKAGES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { 
    ArrowLeft, 
    Building2, 
    Users, 
    CreditCard, 
    Zap, 
    ShieldCheck, 
    TrendingUp, 
    BarChart3, 
    Settings, 
    Lock, 
    Play, 
    AlertTriangle,
    CheckCircle,
    Calendar,
    Globe,
    Activity,
    Mail,
    Phone,
    Monitor,
    MoreHorizontal,
    XCircle,
    Search,
    Download,
    FileText,
    Key,
    UserX,
    Filter
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { SensitiveData } from '../components/ui/SensitiveData';

const USAGE_HISTORY = [
    { name: 'Jan', tokens: 450, clients: 120 },
    { name: 'Feb', tokens: 520, clients: 125 },
    { name: 'Mär', tokens: 890, clients: 140 },
    { name: 'Apr', tokens: 1250, clients: 148 },
    { name: 'Mai', tokens: 2100, clients: 152 },
];

// Mock Invoices for Billing Tab
const MOCK_INVOICES = [
    { id: 'inv-001', date: '01.05.2024', amount: 850.00, status: 'PAID', pdf: 'inv_may.pdf', period: 'Mai 2024' },
    { id: 'inv-002', date: '01.04.2024', amount: 850.00, status: 'PAID', pdf: 'inv_apr.pdf', period: 'April 2024' },
    { id: 'inv-003', date: '01.03.2024', amount: 820.00, status: 'PAID', pdf: 'inv_mar.pdf', period: 'März 2024' },
    { id: 'inv-004', date: '01.02.2024', amount: 820.00, status: 'PAID', pdf: 'inv_feb.pdf', period: 'Februar 2024' },
];

export const TenantDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { role, impersonateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'BILLING' | 'TECH' | 'DUE_DILIGENCE'>('OVERVIEW');
    const [userSearch, setUserSearch] = useState('');

    // Access Control
    if (role !== UserRole.SAAS_SUPER_ADMIN && role !== UserRole.SAAS_SALES && role !== UserRole.SAAS_FINANCE) {
        return <Navigate to="/dashboard" />;
    }

    const tenant = MOCK_TENANTS.find(t => t.id === id);
    const tenantUsers = MOCK_USERS.filter(u => u.tenantId === id);
    const tenantClients = MOCK_CLIENTS.filter(c => c.tenantId === id);
    const currentPlan = MOCK_SAAS_PACKAGES.find(p => p.id === (tenant?.plan === 'ENTERPRISE' ? 'pkg_enterprise' : tenant?.plan === 'STARTER' ? 'pkg_starter' : 'pkg_pro'));
    
    // Simple Health Score Mock
    const healthScore = tenant?.status === 'ACTIVE' ? 88 : tenant?.status === 'TRIAL' ? 45 : 12;

    if (!tenant) {
        return <Layout><div className="p-8">Tenant nicht gefunden</div></Layout>;
    }

    const tenantOwner = tenantUsers.find(u => u.role === UserRole.BROKER_ADMIN);

    const filteredUsers = tenantUsers.filter(u => 
        u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
        <Layout>
            <div className="mb-6">
                <Link to="/clients" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors mb-4">
                    <ArrowLeft size={16} /> Zurück zur Mandantenliste
                </Link>
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-brand-500/20" style={{ backgroundColor: tenant.branding.primaryColor }}>
                            {tenant.branding.logoText?.substring(0, 1) || tenant.name.substring(0, 1)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white">{tenant.name}</h1>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tenant.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {tenant.status}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5"><Calendar size={14}/> Seit {tenant.joinedDate}</span>
                                <span className="flex items-center gap-1.5"><Globe size={14}/> {tenant.branding.logoText || 'Standard Branding'}</span>
                                <span className="flex items-center gap-1.5"><ShieldCheck size={14}/> ISO 27001 compliant</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            variant="secondary" 
                            className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 border-none"
                            icon={<Play size={18} fill="currentColor" />}
                            onClick={() => tenantOwner && impersonateUser(tenantOwner.id)}
                        >
                            Einloggen als Admin
                        </Button>
                        <Button variant="outline" icon={<Settings size={18}/>}>Mandant sperren</Button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <KPICard title="Aktueller MRR" value={`CHF ${tenant.mrr}`} trend="+12%" icon={<TrendingUp className="text-emerald-500"/>} />
                <KPICard title="Total User" value={tenantUsers.length.toString()} trend="Lizenz Limit: 5" icon={<Users className="text-blue-500"/>} />
                <KPICard title="End-Klienten" value={tenantClients.length.toString()} trend="Wachsend" icon={<Building2 className="text-purple-500"/>} />
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Health Score</p>
                    <div className="flex items-end justify-between">
                        <h3 className={`text-3xl font-black ${healthScore > 80 ? 'text-emerald-500' : healthScore > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                            {healthScore}%
                        </h3>
                        <div className="w-16 h-16 relative">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800" />
                                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className={healthScore > 80 ? 'text-emerald-500' : 'text-amber-500'} strokeDasharray={176} strokeDashoffset={176 - (176 * healthScore) / 100} strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto no-scrollbar">
                <TabButton active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} icon={<BarChart3 size={16} />} label="Nutzungs-Analyse" />
                <TabButton active={activeTab === 'USERS'} onClick={() => setActiveTab('USERS')} icon={<Users size={16} />} label={`Benutzer (${tenantUsers.length})`} />
                <TabButton active={activeTab === 'BILLING'} onClick={() => setActiveTab('BILLING')} icon={<CreditCard size={16} />} label="Abo & Abrechnung" />
                <TabButton active={activeTab === 'DUE_DILIGENCE'} onClick={() => setActiveTab('DUE_DILIGENCE')} icon={<ShieldCheck size={16} />} label="SaaS Risk Radar" />
                <TabButton active={activeTab === 'TECH'} onClick={() => setActiveTab('TECH')} icon={<Monitor size={16} />} label="System & Branding" />
            </div>

            {/* Content Area */}
            <div className="space-y-8">
                {activeTab === 'OVERVIEW' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card title="Wachstum: End-Klienten (CRM)">
                            <div className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={USAGE_HISTORY}>
                                        <defs>
                                            <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                                        <Area type="monotone" dataKey="clients" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorClients)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        
                        <Card title="AI Token Verbrauch (Gemini)">
                            <div className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={USAGE_HISTORY}>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                                        <Bar dataKey="tokens" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'USERS' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <Card title="Benutzerverwaltung" noPadding>
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Benutzer suchen..." 
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" icon={<Filter size={16}/>}>Filter</Button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Rolle</th>
                                            <th className="px-6 py-4">Kontakt</th>
                                            <th className="px-6 py-4">Letzter Login</th>
                                            <th className="px-6 py-4 text-right">Aktionen</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={user.avatarUrl} className="w-8 h-8 rounded-full bg-slate-200" alt="" />
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-slate-100">{user.firstName} {user.lastName}</div>
                                                            <div className="text-xs text-slate-500">@{user.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === UserRole.BROKER_ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {user.role.replace('BROKER_', '')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                    <div className="flex items-center gap-2"><Mail size={12}/> {user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    Vor 2 Stunden
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" title="Passwort Reset">
                                                            <Key size={16} />
                                                        </button>
                                                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full" title="Sperren">
                                                            <UserX size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                                    Keine Benutzer gefunden.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'BILLING' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                        {/* Plan Details */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card title="Aktives Abonnement">
                                <div className="space-y-6">
                                    <div className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <p className="text-xs font-black uppercase text-slate-400 mb-2">Plan</p>
                                        <h3 className="text-2xl font-black text-brand-600 mb-1">{currentPlan?.name || tenant.plan}</h3>
                                        <p className="text-slate-900 dark:text-white font-bold text-lg">
                                            CHF {tenant.mrr} <span className="text-sm font-normal text-slate-500">/ Monat</span>
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Nächste Rechnung</span>
                                            <span className="font-medium">01.06.2024</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Zahlungsmethode</span>
                                            <span className="font-medium flex items-center gap-1"><CreditCard size={12}/> Visa •••• 4242</span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-3 border-t border-slate-100 dark:border-slate-800">
                                            <span className="text-slate-500">Status</span>
                                            <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={12}/> Bezahlt</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full">Abo ändern</Button>
                                </div>
                            </Card>

                            <Card title="Aktive Add-ons">
                                <div className="space-y-3">
                                    {tenant.activeAddons?.length ? tenant.activeAddons.map(addon => (
                                        <div key={addon} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <span className="text-sm font-medium">{addon}</span>
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Aktiv</span>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-slate-500 italic">Keine Add-ons gebucht.</p>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Invoices */}
                        <div className="lg:col-span-2">
                            <Card title="Rechnungshistorie" noPadding>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                            <tr>
                                                <th className="px-6 py-4">Rechnungs-Nr.</th>
                                                <th className="px-6 py-4">Periode</th>
                                                <th className="px-6 py-4">Datum</th>
                                                <th className="px-6 py-4 text-right">Betrag</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Download</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {MOCK_INVOICES.map(inv => (
                                                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs">{inv.id}</td>
                                                    <td className="px-6 py-4 font-medium">{inv.period}</td>
                                                    <td className="px-6 py-4 text-slate-500">{inv.date}</td>
                                                    <td className="px-6 py-4 text-right font-mono font-bold">CHF {inv.amount.toFixed(2)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-700">
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-brand-600 hover:text-brand-800 p-2 hover:bg-brand-50 rounded-full transition-colors">
                                                            <Download size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
                
                {activeTab === 'DUE_DILIGENCE' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2">
                        <Card title="Compliance Status (FINMA & Cicero)">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className={tenant.complianceStats?.finmaStatus === 'REGISTERED' ? 'text-emerald-500' : 'text-red-500'} />
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-slate-100">FINMA Vermittlerregister</p>
                                            <p className="text-xs text-slate-500">Automatischer Daily-Check</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-black uppercase ${
                                        tenant.complianceStats?.finmaStatus === 'REGISTERED' 
                                        ? 'bg-emerald-100 text-emerald-700' 
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                        {tenant.complianceStats?.finmaStatus || 'UNKNOWN'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-blue-500" />
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-slate-100">Cicero Zertifizierung</p>
                                            <p className="text-xs text-slate-500">Reg-Nr: {tenant.complianceStats?.ciceroNumber || '-'}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded text-xs font-black uppercase bg-blue-100 text-blue-700">
                                        Verified
                                    </span>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button variant="outline" size="sm" icon={<Search size={14}/>}>Live-Check durchführen</Button>
                                </div>
                            </div>
                        </Card>

                        <Card title="Risk & Anomalies Radar">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${
                                        tenant.complianceStats?.churnRisk === 'HIGH' ? 'bg-red-100 text-red-600' : 
                                        tenant.complianceStats?.churnRisk === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 
                                        'bg-emerald-100 text-emerald-600'
                                    }`}>
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Churn Risk: {tenant.complianceStats?.churnRisk || 'LOW'}</h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Basierend auf Login-Aktivität, Support-Tickets und Sentiment-Analyse der E-Mails.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-400 font-bold text-sm">
                                        <AlertTriangle size={16} /> Anomalie erkannt (Demo)
                                    </div>
                                    <p className="text-xs text-red-600 dark:text-red-300">
                                        Ungewöhnlich hohe Anzahl an Daten-Exporten am 12.05.2024 durch User "Max Muster".
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'TECH' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card title="Design & White-Labeling">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full border-4 border-white dark:border-slate-800 shadow-md" style={{ backgroundColor: tenant.branding.primaryColor }} />
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Primärfarbe</p>
                                        <p className="font-mono text-sm">{tenant.branding.primaryColor}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Logo Text</p>
                                    <p className="text-xl font-bold">{tenant.branding.logoText}</p>
                                </div>
                                <Button variant="outline" className="w-full">Styles zurücksetzen</Button>
                            </div>
                        </Card>
                        
                        <Card title="System-Status">
                            <div className="space-y-4">
                                <DetailItem label="Tenant ID" value={tenant.id} />
                                <DetailItem label="Rechenzentrum" value="CH-ZH-1 (Tier IV)" />
                                <DetailItem label="API Status" value="Online" status="SUCCESS" />
                                <DetailItem label="Backup-Status" value="Zuletzt 02:00 Uhr" status="SUCCESS" />
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </Layout>
    );
};

const KPICard = ({ title, value, trend, icon, highlight }: any) => (
    <div className={`p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md ${highlight ? 'bg-brand-50 border-brand-100 dark:bg-brand-900/10 dark:border-brand-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${highlight ? 'bg-brand-100 dark:bg-brand-800/50' : 'bg-slate-50 dark:bg-slate-800'}`}>
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{trend}</span>
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{value}</h3>
        </div>
    </div>
);

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap
      ${active 
        ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
      }`}
  >
    {icon}
    {label}
  </button>
);

const DetailItem = ({ label, value, status }: { label: string, value: string, status?: 'SUCCESS' | 'ERROR' }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
            {status === 'SUCCESS' && <CheckCircle size={12} className="text-emerald-500" />}
            <span className="text-sm font-bold text-slate-900 dark:text-white">{value}</span>
        </div>
    </div>
);
