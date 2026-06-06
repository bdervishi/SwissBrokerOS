import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { MOCK_USERS, MOCK_TEAMS, MOCK_TIME_ENTRIES, MOCK_CLIENTS, MOCK_POLICIES, MOCK_TAX_RETURNS } from '../constants';
import { UserRole, EmployeeModule, TimeEntryStatus, TimeEntry } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';
import { SensitiveData } from '../components/ui/SensitiveData';
import { 
    ArrowLeft, 
    Mail, 
    Phone, 
    Clock, 
    Users, 
    ShieldAlert, 
    Calculator, 
    Briefcase, 
    Calendar, 
    Download, 
    FileText, 
    Shield, 
    Home, 
    Landmark, 
    User as UserIcon, 
    FileSignature, 
    Wallet, 
    Heart, 
    BadgeCheck, 
    Key, 
    AlertCircle, 
    CheckCircle, 
    XCircle, 
    MapPin, 
    CreditCard, 
    Loader2 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const EmployeeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { role, adminResetPassword } = useAuth();
    const { tenant } = useBranding();
    
    // Check Plan for Time Tracking Feature
    const hasTimeTracking = tenant?.plan === 'PROFESSIONAL' || tenant?.plan === 'ENTERPRISE';

    // Available Tab Keys
    type TabKey = 'TIME' | 'CLIENTS' | 'POLICIES' | 'TAX' | 'HR';
    
    // Default active tab based on availability
    const [activeTab, setActiveTab] = useState<TabKey>(hasTimeTracking ? 'TIME' : 'CLIENTS');
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [newTempPassword, setNewTempPassword] = useState<string | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    
    // Time Approval State
    const [localTimeEntries, setLocalTimeEntries] = useState<TimeEntry[]>([]);

    // Access Control: Broker Admins or SaaS Admins
    const canAccess = role?.includes('SAAS_') || role === UserRole.BROKER_ADMIN || role === UserRole.BROKER_ADMINISTRATION;
    
    // HR Visibility: Only Admins AND only if plan allows (Professional/Enterprise)
    const canSeeHR = (role === UserRole.SAAS_SUPER_ADMIN || role === UserRole.BROKER_ADMIN) && hasTimeTracking;

    if (!canAccess) {
        return <Navigate to="/dashboard" />;
    }

    const employee = MOCK_USERS.find(u => u.id === id);
    const team = MOCK_TEAMS.find(t => t.id === employee?.teamId);

    // Initial Load of Time Entries
    useEffect(() => {
        if(employee) {
            setLocalTimeEntries(MOCK_TIME_ENTRIES.filter(t => t.userId === employee.id));
        }
    }, [employee]);

    // Filter available tabs based on employee modules
    const getAvailableTabs = (): TabKey[] => {
        if (!employee) return hasTimeTracking ? ['TIME'] : ['CLIENTS'];
        
        const tabs: TabKey[] = [];
        
        // Time tracking only if plan allows
        if (hasTimeTracking) {
            tabs.push('TIME');
        }

        // HR tab only for admins and if plan allows
        if (canSeeHR) tabs.push('HR');

        // SaaS Employees usually only see Time tracking for now
        if (employee.role.startsWith('SAAS_')) {
            return hasTimeTracking ? ['TIME'] : []; // Fallback empty if no time tracking
        }

        tabs.push('CLIENTS');
        
        if (employee.modules) {
            if (employee.modules.includes('INSURANCE')) tabs.push('POLICIES');
            if (employee.modules.includes('TAX')) tabs.push('TAX');
        } else {
            tabs.push('POLICIES', 'TAX'); 
        }
        return tabs;
    };

    const availableTabs = getAvailableTabs();

    // Ensure active tab is valid
    useEffect(() => {
        if (!availableTabs.includes(activeTab) && availableTabs.length > 0) {
            setActiveTab(availableTabs[0]);
        }
    }, [id, employee, availableTabs, activeTab]);

    const handleResetPassword = async () => {
        if (!employee) return;
        setIsResetting(true);
        const pass = await adminResetPassword(employee.id);
        setNewTempPassword(pass);
        setIsResetting(false);
    };

    const updateTimeStatus = (entryId: string, status: TimeEntryStatus) => {
        setLocalTimeEntries(prev => prev.map(e => e.id === entryId ? { ...e, status } : e));
    };

    if (!employee) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-96">
                    <p className="text-slate-500 mb-4">Mitarbeiter nicht gefunden</p>
                    <Link to="/team"><Button>Zurück zur Übersicht</Button></Link>
                </div>
            </Layout>
        );
    }

    // --- DATA AGGREGATION ---
    
    const totalHours = localTimeEntries.reduce((sum, t) => sum + t.hours, 0);
    
    const timeData = [
        { name: 'Mo', hours: 8.5 },
        { name: 'Di', hours: 7.0 },
        { name: 'Mi', hours: 8.0 },
        { name: 'Do', hours: 9.0 },
        { name: 'Fr', hours: 6.5 },
    ];

    const assignedClients = MOCK_CLIENTS.filter(c => c.advisorId === employee.id);
    const managedPolicies = MOCK_POLICIES.filter(p => assignedClients.some(c => c.id === p.clientId));
    const taxReturns = MOCK_TAX_RETURNS.filter(t => assignedClients.some(c => c.id === t.clientId));

    const getModuleIcon = (mod: EmployeeModule) => {
        switch(mod) {
            case 'INSURANCE': return <Shield size={12} />;
            case 'MORTGAGE': return <Home size={12} />;
            case 'TAX': return <Calculator size={12} />;
            case 'PENSION': return <Landmark size={12} />;
        }
    }

    const getModuleLabel = (mod: EmployeeModule) => {
        switch(mod) {
            case 'INSURANCE': return 'Versicherungen';
            case 'MORTGAGE': return 'Hypotheken';
            case 'TAX': return 'Steuern';
            case 'PENSION': return 'Vorsorge';
        }
    }

    const getStatusBadge = (status: TimeEntryStatus) => {
        switch(status) {
            case 'DRAFT': return <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Entwurf</span>;
            case 'SUBMITTED': return <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Eingereicht</span>;
            case 'APPROVED': return <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1"><CheckCircle size={10}/> Genehmigt</span>;
            case 'REJECTED': return <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1"><AlertCircle size={10}/> Abgelehnt</span>;
        }
    }

    return (
        <Layout>
            {/* Header */}
            <div className="mb-6">
                <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Zurück zur Übersicht
                </button>
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm">
                    <div className="relative">
                        <img 
                            src={employee.avatarUrl || `https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}`} 
                            alt="" 
                            className="w-24 h-24 rounded-2xl object-cover bg-slate-200 shadow-inner" 
                        />
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-white dark:border-slate-900 w-6 h-6 rounded-full" title="Online"></div>
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {employee.modules?.map(mod => (
                                <span key={mod} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {getModuleIcon(mod)} {getModuleLabel(mod)}
                                </span>
                            ))}
                            {employee.role.startsWith('SAAS_') && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                                    SaaS Internal
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{employee.firstName} {employee.lastName}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">{employee.position || 'Mitarbeiter'} {team ? `• ${team.name}` : ''}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                            <a href={`mailto:${employee.email}`} className="flex items-center gap-2 hover:text-brand-600 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors">
                                <Mail size={16} /> {employee.email}
                            </a>
                            {employee.phone && (
                                <a href={`tel:${employee.phone}`} className="flex items-center gap-2 hover:text-brand-600 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors">
                                    <Phone size={16} /> {employee.phone}
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" icon={<Key size={16}/>} onClick={() => setIsResetModalOpen(true)}>Passwort Reset</Button>
                        <Button variant="outline">Bearbeiten</Button>
                    </div>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-slate-500 text-xs font-medium uppercase mb-1">Status</div>
                    <div className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Aktiv
                    </div>
                </div>
                
                {hasTimeTracking && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-slate-500 text-xs font-medium uppercase mb-1">Stunden (Woche)</div>
                        <div className="text-2xl font-bold text-brand-600">{totalHours}h</div>
                    </div>
                )}
                
                {availableTabs.includes('CLIENTS') && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-slate-500 text-xs font-medium uppercase mb-1">Kunden</div>
                        <div className="text-2xl font-bold">{assignedClients.length}</div>
                    </div>
                )}

                {availableTabs.includes('TAX') && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-slate-500 text-xs font-medium uppercase mb-1">Mandate</div>
                        <div className="text-2xl font-bold text-purple-600">{taxReturns.length}</div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
                {availableTabs.includes('TIME') && (
                    <TabButton active={activeTab === 'TIME'} onClick={() => setActiveTab('TIME')} icon={<Clock size={16} />} label="Stundenraport" />
                )}
                
                {availableTabs.includes('HR') && (
                    <TabButton active={activeTab === 'HR'} onClick={() => setActiveTab('HR')} icon={<UserIcon size={16} />} label="Personal & Vertrag" />
                )}

                {availableTabs.includes('CLIENTS') && (
                    <TabButton active={activeTab === 'CLIENTS'} onClick={() => setActiveTab('CLIENTS')} icon={<Users size={16} />} label="Kunden" />
                )}
                
                {availableTabs.includes('POLICIES') && (
                    <TabButton active={activeTab === 'POLICIES'} onClick={() => setActiveTab('POLICIES')} icon={<ShieldAlert size={16} />} label="Policen" />
                )}
                
                {availableTabs.includes('TAX') && (
                    <TabButton active={activeTab === 'TAX'} onClick={() => setActiveTab('TAX')} icon={<Calculator size={16} />} label="Steuererklärungen" />
                )}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                
                {/* 1. HR / CONTRACT FILE (Enhanced) */}
                {activeTab === 'HR' && canSeeHR && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                        <div className="lg:col-span-2 space-y-6">
                            <Card title="Adressdaten" noPadding>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <DetailRow label="Strasse / Nr." value={employee.street || 'Nicht hinterlegt'} icon={<MapPin size={14} />} />
                                    <DetailRow label="PLZ / Ort" value={`${employee.zipCode || ''} ${employee.city || ''}`} />
                                    <DetailRow label="Land" value={employee.country || 'Schweiz'} />
                                </div>
                            </Card>

                            <Card title="Bankverbindung" noPadding>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <DetailRow label="Bank" value={employee.bankName || 'Nicht hinterlegt'} icon={<CreditCard size={14} />} />
                                    <DetailRow label="IBAN" value={employee.iban || 'Nicht hinterlegt'} />
                                </div>
                            </Card>

                            <Card title="Vertrag & Anstellung" noPadding>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <DetailRow label="Eintrittsdatum" value={employee.entryDate || 'Unbekannt'} icon={<Calendar size={14} />} />
                                    <DetailRow label="Beschäftigungsgrad" value={employee.employmentPercentage ? `${employee.employmentPercentage}%` : '100%'} />
                                    <DetailRow label="Funktion" value={employee.position || 'Mitarbeiter'} />
                                    <DetailRow label="Kündigungsfrist" value={employee.noticePeriod || '3 Monate'} />
                                    <DetailRow label="Urlaubsanspruch" value="25 Tage" />
                                </div>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card title="Personalien & Lohn" className="border-l-4 border-l-emerald-500">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                                            <Heart size={14} /> Zivilstand & Kinder
                                        </p>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{employee.familyStatus || 'Ledig'}, {employee.childrenCount || 0} Kinder</p>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                                            <Wallet size={14} /> Grundgehalt (monatlich)
                                        </p>
                                        <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                                            <SensitiveData>CHF {employee.baseSalary?.toLocaleString() || '0'}.00</SensitiveData>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">Exkl. 13. Monatslohn</p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                                            <Shield size={14} /> AHV Nummer
                                        </p>
                                        <SensitiveData>{employee.ahvNumber || 'N/A'}</SensitiveData>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                                            <BadgeCheck size={14} className="text-brand-500" /> Provisionsvereinbarung
                                        </p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                            "{employee.bonusAgreement || 'Keine spezifische Vereinbarung hinterlegt.'}"
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <Button variant="outline" size="sm" className="w-full" icon={<FileSignature size={14}/>}>Vertrag downloaden (PDF)</Button>
                                    </div>
                                </div>
                            </Card>

                            <div className="bg-brand-900 text-white p-6 rounded-xl relative overflow-hidden shadow-lg">
                                <div className="relative z-10">
                                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                        <Shield size={16} className="text-brand-400" /> Vertraulichkeit
                                    </h4>
                                    <p className="text-[11px] text-brand-200 leading-relaxed">
                                        Diese Informationen sind nur für Administratoren sichtbar. Jegliche Weitergabe verstösst gegen die internen Datenschutzrichtlinien (nDSG).
                                    </p>
                                </div>
                                <UserIcon size={100} className="absolute -right-8 -bottom-8 opacity-10" />
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. TIME TRACKING (Enhanced with Approval) */}
                {activeTab === 'TIME' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                        <div className="lg:col-span-2">
                            <Card title="Eingereichte Zeiten & Genehmigung">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-4 py-3">Datum</th>
                                                <th className="px-4 py-3">Aktivität</th>
                                                <th className="px-4 py-3 text-right">Stunden</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3 text-right">Aktion</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {localTimeEntries.map(entry => (
                                                <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-4 py-3 whitespace-nowrap">{entry.date}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-bold text-sm">{entry.activity}</div>
                                                        <div className="text-xs text-slate-500">{entry.description}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono">{entry.hours}</td>
                                                    <td className="px-4 py-3">{getStatusBadge(entry.status)}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        {entry.status === 'SUBMITTED' && (
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => updateTimeStatus(entry.id, 'APPROVED')} className="p-1 hover:bg-emerald-100 text-emerald-600 rounded" title="Genehmigen">
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                                <button onClick={() => updateTimeStatus(entry.id, 'REJECTED')} className="p-1 hover:bg-red-100 text-red-600 rounded" title="Ablehnen">
                                                                    <XCircle size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                        <div className="space-y-6">
                            <Card title="Wochenübersicht">
                                <div className="h-[200px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={timeData}>
                                            <XAxis dataKey="name" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                                            <Bar dataKey="hours" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* 3. ASSIGNED CLIENTS */}
                {activeTab === 'CLIENTS' && availableTabs.includes('CLIENTS') && (
                    <Card title="Zugeordnete Mandate" noPadding>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-3">Klient</th>
                                    <th className="px-6 py-3">Wohnort</th>
                                    <th className="px-6 py-3">Kanton</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {assignedClients.map(client => (
                                    <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <img src={client.avatarUrl} className="w-8 h-8 rounded-full" alt="" />
                                            <span className="font-medium">{client.firstName} {client.lastName}</span>
                                        </td>
                                        <td className="px-6 py-4">{client.zipCity}</td>
                                        <td className="px-6 py-4">{client.taxDomicile}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/client/${client.id}`}>
                                                <Button size="sm" variant="ghost">Profil</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                )}

                {/* 4. MANAGED POLICIES */}
                {activeTab === 'POLICIES' && availableTabs.includes('POLICIES') && (
                    <Card title="Verwaltete Policen" noPadding>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-3">Typ</th>
                                    <th className="px-6 py-3">Versicherer</th>
                                    <th className="px-6 py-3">Ablauf</th>
                                    <th className="px-6 py-3 text-right">Prämie</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {managedPolicies.map(policy => (
                                    <tr key={policy.id}>
                                        <td className="px-6 py-4 font-medium">{policy.type}</td>
                                        <td className="px-6 py-4">{policy.insurer}</td>
                                        <td className="px-6 py-4">{policy.endDate}</td>
                                        <td className="px-6 py-4 text-right">CHF {policy.premiumAmount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                )}

                {/* 5. TAX RETURNS */}
                {activeTab === 'TAX' && availableTabs.includes('TAX') && (
                    <Card title="Steuer-Mandate" noPadding>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-3">Klient</th>
                                    <th className="px-6 py-3">Jahr</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Frist</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {taxReturns.map(tr => {
                                    const client = MOCK_CLIENTS.find(c => c.id === tr.clientId);
                                    return (
                                        <tr key={tr.id}>
                                            <td className="px-6 py-4 font-medium">{client?.firstName} {client?.lastName}</td>
                                            <td className="px-6 py-4">{tr.year}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">{tr.status}</span>
                                            </td>
                                            <td className="px-6 py-4">{tr.deadline || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Card>
                )}
            </div>

            {/* PASSWORD RESET MODAL */}
            <Modal isOpen={isResetModalOpen} onClose={() => { setIsResetModalOpen(false); setNewTempPassword(null); }} title="Sicherheits-Override: Passwort Reset" maxWidth="max-w-md">
                <div className="space-y-6">
                    {!newTempPassword ? (
                        <>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3 text-amber-800 dark:text-amber-300 text-sm">
                                <AlertCircle size={20} className="shrink-0" />
                                <p>Sie setzen das Passwort für <strong>{employee.firstName} {employee.lastName}</strong> zurück. Der Benutzer muss beim nächsten Login ein neues Passwort festlegen.</p>
                            </div>
                            <Button className="w-full" onClick={handleResetPassword} disabled={isResetting}>
                                {isResetting ? <Loader2 className="animate-spin" /> : "Neues Passwort generieren"}
                            </Button>
                        </>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle size={32} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Das temporäre Passwort lautet:</p>
                                <div className="mt-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-2xl font-mono font-bold tracking-widest text-slate-900 dark:text-white select-all">
                                    {newTempPassword}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2">Kopieren Sie dieses Passwort und geben Sie es dem Mitarbeiter sicher weiter.</p>
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => setIsResetModalOpen(false)}>Fertig</Button>
                        </div>
                    )}
                </div>
            </Modal>
        </Layout>
    );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
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
  </button>
);

const DetailRow = ({ label, value, icon }: { label: string, value: string | number, icon?: React.ReactNode }) => (
    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
            {icon} {label}
        </span>
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 sm:mt-0">
            {value}
        </span>
    </div>
);
