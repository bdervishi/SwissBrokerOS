import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MOCK_USERS, MOCK_TEAMS, MOCK_TIME_ENTRIES, MOCK_CLIENTS, MOCK_POLICIES, MOCK_TAX_SUMMARIES } from '../constants';
import { UserRole, EmployeeModule } from '../types';
import { useAuth } from '../contexts/AuthContext';
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
    Landmark
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const EmployeeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { role } = useAuth();
    
    // Available Tab Keys
    type TabKey = 'TIME' | 'CLIENTS' | 'POLICIES' | 'TAX';
    
    const [activeTab, setActiveTab] = useState<TabKey>('TIME');

    // Access Control
    if (role !== UserRole.BROKER_ADMIN && role !== UserRole.BROKER_ADMINISTRATION) {
        return <Navigate to="/dashboard" />;
    }

    const employee = MOCK_USERS.find(u => u.id === id);
    const team = MOCK_TEAMS.find(t => t.id === employee?.teamId);

    // Filter available tabs based on employee modules
    // If no modules defined, assume basic access (Time & Clients)
    const getAvailableTabs = (): TabKey[] => {
        if (!employee) return ['TIME'];
        
        const tabs: TabKey[] = ['TIME', 'CLIENTS']; // Everyone has Time & Clients
        
        // If specific modules are assigned, restrict other tabs
        if (employee.modules) {
            if (employee.modules.includes('INSURANCE')) tabs.push('POLICIES');
            if (employee.modules.includes('TAX')) tabs.push('TAX');
        } else {
            // Legacy/Fallback: If no modules defined, show everything (or default set)
            // For safety in this demo, let's show all if undefined to not break old users
            tabs.push('POLICIES', 'TAX'); 
        }
        return tabs;
    };

    const availableTabs = getAvailableTabs();

    // Ensure active tab is valid when switching employees or if permissions change
    useEffect(() => {
        if (!availableTabs.includes(activeTab)) {
            setActiveTab(availableTabs[0]);
        }
    }, [id, employee, activeTab]);


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
    
    // 1. Time Reports
    const timeEntries = MOCK_TIME_ENTRIES.filter(t => t.userId === employee.id);
    const totalHours = timeEntries.reduce((sum, t) => sum + t.hours, 0);
    
    // Mock Chart Data for Time
    const timeData = [
        { name: 'Mo', hours: 8.5 },
        { name: 'Di', hours: 7.0 },
        { name: 'Mi', hours: 8.0 },
        { name: 'Do', hours: 9.0 },
        { name: 'Fr', hours: 6.5 },
    ];

    // 2. Assigned Clients
    const assignedClients = MOCK_CLIENTS.filter(c => c.advisorId === employee.id);

    // 3. Policies Managed (Indirectly via Clients usually, but let's assume we filter policies of assigned clients)
    const managedPolicies = MOCK_POLICIES.filter(p => assignedClients.some(c => c.id === p.clientId));

    // 4. Tax Returns
    const taxReturns = MOCK_TAX_SUMMARIES.filter(t => assignedClients.some(c => c.id === t.clientId));

    // Helper for Module Badges
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

    return (
        <Layout>
            {/* Header */}
            <div className="mb-6">
                <Link to="/team" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Zurück zum Team
                </Link>
                
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
                        <Button variant="outline">Bearbeiten</Button>
                        <Button variant="outline">Nachricht</Button>
                    </div>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-slate-500 text-xs font-medium uppercase mb-1">Kunden</div>
                    <div className="text-2xl font-bold">{assignedClients.length}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-slate-500 text-xs font-medium uppercase mb-1">Stunden (Woche)</div>
                    <div className="text-2xl font-bold text-brand-600">{totalHours}h</div>
                </div>
                
                {/* Only show Policy KPI if module active */}
                {availableTabs.includes('POLICIES') && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-slate-500 text-xs font-medium uppercase mb-1">Policen</div>
                        <div className="text-2xl font-bold">{managedPolicies.length}</div>
                    </div>
                )}

                {/* Only show Tax KPI if module active */}
                {availableTabs.includes('TAX') && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-slate-500 text-xs font-medium uppercase mb-1">Steuer-Mandate</div>
                        <div className="text-2xl font-bold text-purple-600">{taxReturns.length}</div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
                <TabButton active={activeTab === 'TIME'} onClick={() => setActiveTab('TIME')} icon={<Clock size={16} />} label="Stundenraport" />
                <TabButton active={activeTab === 'CLIENTS'} onClick={() => setActiveTab('CLIENTS')} icon={<Users size={16} />} label="Kunden" />
                
                {availableTabs.includes('POLICIES') && (
                    <TabButton active={activeTab === 'POLICIES'} onClick={() => setActiveTab('POLICIES')} icon={<ShieldAlert size={16} />} label="Policen" />
                )}
                
                {availableTabs.includes('TAX') && (
                    <TabButton active={activeTab === 'TAX'} onClick={() => setActiveTab('TAX')} icon={<Calculator size={16} />} label="Steuererklärungen" />
                )}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                
                {/* 1. TIME REPORTS */}
                {activeTab === 'TIME' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Card title="Arbeitszeit Woche 21">
                                <div className="h-[300px] w-full mb-6">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={timeData}>
                                            <XAxis dataKey="name" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                            <Bar dataKey="hours" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-end">
                                    <Button size="sm" variant="outline" icon={<Download size={14}/>}>Export PDF</Button>
                                </div>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                            <Card title="Letzte Einträge" noPadding>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
                                    {timeEntries.map(entry => (
                                        <div key={entry.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{entry.activity}</span>
                                                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">{entry.hours}h</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-1">{entry.description}</p>
                                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                                <Calendar size={12} /> {entry.date}
                                            </div>
                                        </div>
                                    ))}
                                    {timeEntries.length === 0 && <p className="p-4 text-sm text-slate-500 text-center">Keine Einträge vorhanden.</p>}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* 2. CLIENTS */}
                {activeTab === 'CLIENTS' && (
                    <Card noPadding>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Ort</th>
                                    <th className="px-6 py-3">Geburtsdatum</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {assignedClients.map(client => (
                                    <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                                                    {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                                                </div>
                                                {client.firstName} {client.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{client.zipCity}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{client.birthDate}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/client/${client.id}`}>
                                                <Button size="sm" variant="ghost">Profil öffnen</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {assignedClients.length === 0 && (
                                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">Keine zugewiesenen Kunden.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </Card>
                )}

                {/* 3. POLICIES (Conditional) */}
                {activeTab === 'POLICIES' && availableTabs.includes('POLICIES') && (
                    <Card noPadding>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-3">Kunde</th>
                                    <th className="px-6 py-3">Gesellschaft</th>
                                    <th className="px-6 py-3">Branche</th>
                                    <th className="px-6 py-3 text-right">Prämie</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {managedPolicies.map(policy => {
                                    const c = assignedClients.find(client => client.id === policy.clientId);
                                    return (
                                        <tr key={policy.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link to={`/client/${c?.id}`} className="text-brand-600 hover:underline">
                                                    {c ? `${c.firstName} ${c.lastName}` : 'Unbekannt'}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">{policy.insurer}</td>
                                            <td className="px-6 py-4">{policy.type}</td>
                                            <td className="px-6 py-4 text-right font-mono"><SensitiveData>CHF {policy.premiumAmount.toFixed(2)}</SensitiveData></td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${policy.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {policy.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {managedPolicies.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Keine Policen gefunden.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </Card>
                )}

                {/* 4. TAX RETURNS (Conditional) */}
                {activeTab === 'TAX' && availableTabs.includes('TAX') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {taxReturns.map((tax, idx) => {
                            const c = assignedClients.find(client => client.id === tax.clientId);
                            return (
                                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-slate-100">Steuer {tax.year}</h4>
                                                <p className="text-xs text-slate-500">{c?.firstName} {c?.lastName}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            tax.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                                            tax.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {tax.status === 'COMPLETED' ? 'Fertig' : tax.status === 'IN_PROGRESS' ? 'In Arbeit' : 'Offen'}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        <div className="flex justify-between">
                                            <span>Abzüge Total:</span>
                                            <span className="font-mono font-medium"><SensitiveData>CHF {(tax.deductiblePremiums + tax.pillar3aContributions + tax.debtInterest).toLocaleString()}</SensitiveData></span>
                                        </div>
                                    </div>

                                    <Button size="sm" variant="outline" className="w-full">Bearbeiten</Button>
                                </div>
                            );
                        })}
                        {taxReturns.length === 0 && (
                            <div className="col-span-full p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                Keine Steuer-Mandate zugewiesen.
                            </div>
                        )}
                    </div>
                )}

            </div>
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