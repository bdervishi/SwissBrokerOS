
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { SensitiveData } from '../components/ui/SensitiveData';
import { MOCK_CLIENTS, MOCK_TIME_ENTRIES } from '../constants';
import { TimeEntry, TimeEntryStatus } from '../types';
import { useBranding } from '../contexts/BrandingContext';
import { 
    User, 
    Home, 
    CreditCard, 
    Briefcase, 
    Save, 
    Clock, 
    Plus, 
    Calendar,
    Users,
    Heart,
    FileText,
    Shield,
    Wallet,
    Send,
    CheckCircle,
    AlertCircle,
    Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const MyProfile: React.FC = () => {
    const { user } = useAuth();
    const { tenant } = useBranding();
    const [activeTab, setActiveTab] = useState<'PERSONAL' | 'HR_FINANCE' | 'TIMESHEET'>('PERSONAL');
    const [isSaving, setIsSaving] = useState(false);

    // Check Plan for Time Tracking Feature
    const hasTimeTracking = tenant?.plan === 'PROFESSIONAL' || tenant?.plan === 'ENTERPRISE';

    // Local State for Profile Form
    const [profile, setProfile] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        street: user?.street || '',
        zipCode: user?.zipCode || '',
        city: user?.city || '',
        birthDate: user?.birthDate || '',
        familyStatus: user?.familyStatus || 'Ledig',
        childrenCount: user?.childrenCount || 0,
        bankName: user?.bankName || '',
        iban: user?.iban || '',
        ahvNumber: user?.ahvNumber || '',
        baseSalary: user?.baseSalary || 0
    });

    // Local State for Time Tracking
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(
        MOCK_TIME_ENTRIES.filter(t => t.userId === user?.id)
    );
    const [newTimeEntry, setNewTimeEntry] = useState({
        relatedClientId: '',
        activity: '',
        hours: 1.0,
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    // Filter Logic for Time Tab
    const pendingSubmission = timeEntries.filter(t => t.status === 'DRAFT').length;
    const canSubmit = tenant?.hrConfig?.requireTimeSubmission && pendingSubmission > 0;

    // Mock Clients for Dropdown
    const myClients = MOCK_CLIENTS.filter(c => c.advisorId === user?.id);

    const handleSaveProfile = () => {
        setIsSaving(true);
        // Simulate API Update
        setTimeout(() => {
            setIsSaving(false);
            alert("Profiländerungen gespeichert (Mock).");
        }, 1000);
    };

    const handleAddTimeEntry = () => {
        if (!newTimeEntry.relatedClientId || !newTimeEntry.activity) return;
        
        const entry: TimeEntry = {
            id: Date.now().toString(),
            userId: user?.id || '',
            ...newTimeEntry,
            hours: Number(newTimeEntry.hours),
            status: 'DRAFT'
        };
        
        setTimeEntries([entry, ...timeEntries]);
        setNewTimeEntry({ ...newTimeEntry, description: '', hours: 1.0 });
    };

    const handleSubmitWeek = () => {
        const updated = timeEntries.map(t => t.status === 'DRAFT' ? { ...t, status: 'SUBMITTED' as TimeEntryStatus } : t);
        setTimeEntries(updated);
        alert(`${pendingSubmission} Einträge zur Genehmigung eingereicht.`);
    };

    const getStatusBadge = (status: TimeEntryStatus) => {
        switch(status) {
            case 'DRAFT': return <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Entwurf</span>;
            case 'SUBMITTED': return <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Eingereicht</span>;
            case 'APPROVED': return <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1"><CheckCircle size={10}/> Genehmigt</span>;
            case 'REJECTED': return <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1"><AlertCircle size={10}/> Abgelehnt</span>;
        }
    }

    // Chart Data Preparation
    const weeklyData = [
        { name: 'Mo', hours: 8.0 },
        { name: 'Di', hours: 7.5 },
        { name: 'Mi', hours: 8.5 },
        { name: 'Do', hours: 9.0 },
        { name: 'Fr', hours: 6.0 },
    ];

    if (!user) return null;

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

    const InputGroup = ({ label, value, onChange, type = "text", placeholder, icon }: any) => (
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
            <div className="relative">
                <input 
                    type={type}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                />
                {icon && <div className="absolute right-3 top-2.5 pointer-events-none">{icon}</div>}
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <User className="text-brand-600" />
                        Mein Profil & HR
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Verwalten Sie Ihre persönlichen Daten, Finanzen und Arbeitszeiten.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={handleSaveProfile} 
                        icon={isSaving ? <Clock className="animate-spin" size={18}/> : <Save size={18} />}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Speichere...' : 'Alle Änderungen speichern'}
                    </Button>
                </div>
            </div>

            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto no-scrollbar">
                <TabButton 
                    active={activeTab === 'PERSONAL'} 
                    onClick={() => setActiveTab('PERSONAL')} 
                    icon={<User size={16} />} 
                    label="Stammdaten & Familie" 
                />
                <TabButton 
                    active={activeTab === 'HR_FINANCE'} 
                    onClick={() => setActiveTab('HR_FINANCE')} 
                    icon={<Wallet size={16} />} 
                    label="Lohn & Finanzen" 
                />
                {hasTimeTracking && (
                    <TabButton 
                        active={activeTab === 'TIMESHEET'} 
                        onClick={() => setActiveTab('TIMESHEET')} 
                        icon={<Clock size={16} />} 
                        label="Arbeitsrapport" 
                    />
                )}
            </div>

            <div className="max-w-5xl">
                {activeTab === 'PERSONAL' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
                        <Card title="Kontakt & Adresse">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup label="Vorname" value={profile.firstName} onChange={(v:any) => setProfile({...profile, firstName: v})} />
                                    <InputGroup label="Nachname" value={profile.lastName} onChange={(v:any) => setProfile({...profile, lastName: v})} />
                                </div>
                                <InputGroup label="E-Mail (Privat)" value={profile.email} onChange={(v:any) => setProfile({...profile, email: v})} />
                                <InputGroup label="Telefon / Mobil" value={profile.phone} onChange={(v:any) => setProfile({...profile, phone: v})} />
                                
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                                    <InputGroup label="Strasse / Nr." value={profile.street} onChange={(v:any) => setProfile({...profile, street: v})} placeholder="Musterstrasse 12" />
                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        <div className="col-span-1">
                                            <InputGroup label="PLZ" value={profile.zipCode} onChange={(v:any) => setProfile({...profile, zipCode: v})} placeholder="8000" />
                                        </div>
                                        <div className="col-span-2">
                                            <InputGroup label="Ort" value={profile.city} onChange={(v:any) => setProfile({...profile, city: v})} placeholder="Zürich" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Familie & Personalien">
                            <div className="space-y-6">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                                        <Heart size={16} className="text-pink-500" /> Zivilstand
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Geburtsdatum" type="date" value={profile.birthDate} onChange={(v:any) => setProfile({...profile, birthDate: v})} />
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                            <select 
                                                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                                value={profile.familyStatus}
                                                onChange={e => setProfile({...profile, familyStatus: e.target.value})}
                                            >
                                                <option>Ledig</option>
                                                <option>Verheiratet</option>
                                                <option>Geschieden</option>
                                                <option>Verwitwet</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                                        <Users size={16} className="text-blue-500" /> Kinder (Zulagen)
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Anzahl Kinder</label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                                value={profile.childrenCount}
                                                onChange={e => setProfile({...profile, childrenCount: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div className="flex-1 pt-6 text-xs text-slate-500">
                                            Bitte Geburtsurkunden im HR-Tab hochladen.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'HR_FINANCE' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
                        <Card title="Bankverbindung (Lohn)">
                            <div className="space-y-6">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-4">
                                    <div className="p-3 bg-emerald-100 dark:bg-emerald-800 rounded-full text-emerald-600 dark:text-emerald-300">
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Auszahlungskonto</p>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-300">Wird für die nächste Lohnzahlung verwendet.</p>
                                    </div>
                                </div>

                                <InputGroup 
                                    label="Bank Name" 
                                    value={profile.bankName} 
                                    onChange={(v:any) => setProfile({...profile, bankName: v})} 
                                    placeholder="z.B. Zürcher Kantonalbank"
                                />
                                <InputGroup 
                                    label="IBAN" 
                                    value={profile.iban} 
                                    onChange={(v:any) => setProfile({...profile, iban: v})} 
                                    placeholder="CH00 0000 0000 0000 0000 0"
                                    icon={<span className="text-xs font-bold text-slate-400">CH</span>}
                                />
                            </div>
                        </Card>

                        <div className="space-y-6">
                            <Card title="Lohndaten & Sozialversicherung">
                                <div className="space-y-6">
                                    <div className="relative group">
                                        <InputGroup 
                                            label="AHV-Nummer" 
                                            value={profile.ahvNumber} 
                                            onChange={(v:any) => setProfile({...profile, ahvNumber: v})} 
                                            placeholder="756.xxxx.xxxx.xx"
                                        />
                                        <div className="absolute right-3 top-8 text-slate-400">
                                            <Shield size={16} />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex justify-between">
                                            <span>Brutto Monatslohn (Basis)</span>
                                            <span className="text-brand-600 cursor-pointer hover:underline">Lohnausweis anfordern</span>
                                        </p>
                                        <div className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-1">
                                            <SensitiveData>CHF {profile.baseSalary.toLocaleString('de-CH', {minimumFractionDigits: 2})}</SensitiveData>
                                        </div>
                                        <p className="text-xs text-slate-400 italic">
                                            Änderungen am Grundgehalt können nur durch HR vorgenommen werden.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'TIMESHEET' && hasTimeTracking && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                        <div className="lg:col-span-2 space-y-6 min-w-0">
                            <Card title="Zeiterfassung erfassen">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kunde / Mandat</label>
                                        <select 
                                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                            value={newTimeEntry.relatedClientId}
                                            onChange={e => setNewTimeEntry({...newTimeEntry, relatedClientId: e.target.value})}
                                        >
                                            <option value="">-- Bitte wählen --</option>
                                            {myClients.map(c => (
                                                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                                            ))}
                                            <option value="INTERNAL">Intern / Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tätigkeit</label>
                                        <select 
                                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                            value={newTimeEntry.activity}
                                            onChange={e => setNewTimeEntry({...newTimeEntry, activity: e.target.value})}
                                        >
                                            <option value="">-- Bitte wählen --</option>
                                            <option>Beratung</option>
                                            <option>Administration</option>
                                            <option>Reisezeit</option>
                                            <option>Weiterbildung</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <InputGroup 
                                            label="Beschreibung" 
                                            placeholder="Details zur Tätigkeit..." 
                                            value={newTimeEntry.description} 
                                            onChange={(v:any) => setNewTimeEntry({...newTimeEntry, description: v})}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <InputGroup 
                                            label="Stunden" 
                                            type="number" 
                                            value={newTimeEntry.hours} 
                                            onChange={(v:any) => setNewTimeEntry({...newTimeEntry, hours: Number(v)})}
                                        />
                                    </div>
                                    <Button onClick={handleAddTimeEntry} icon={<Plus size={18}/>}>Erfassen</Button>
                                </div>
                            </Card>

                            <Card title="Wochenjournal" noPadding>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-4 py-3">Datum</th>
                                                <th className="px-4 py-3">Kunde</th>
                                                <th className="px-4 py-3">Tätigkeit</th>
                                                <th className="px-4 py-3 text-right">Stunden</th>
                                                <th className="px-4 py-3 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {timeEntries.map(entry => {
                                                const clientName = entry.relatedClientId === 'INTERNAL' ? 'Intern' : 
                                                    myClients.find(c => c.id === entry.relatedClientId)?.lastName || 'Unbekannt';
                                                
                                                return (
                                                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                        <td className="px-4 py-3 whitespace-nowrap">{entry.date}</td>
                                                        <td className="px-4 py-3 font-bold">{clientName}</td>
                                                        <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">{entry.activity}</span></td>
                                                        <td className="px-4 py-3 text-right font-mono">{entry.hours.toFixed(1)}</td>
                                                        <td className="px-4 py-3 text-right">{getStatusBadge(entry.status)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>

                        <div className="space-y-6 min-w-0">
                            <Card title="Wochenübersicht">
                                <div className="h-[200px] w-full min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={weeklyData}>
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                            <Bar dataKey="hours" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-4">
                                {canSubmit ? (
                                    <Button onClick={handleSubmitWeek} className="w-full" icon={<Send size={16}/>}>
                                        {pendingSubmission} Rapporte einreichen
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded justify-center">
                                        <CheckCircle size={14} /> Alle Zeiten aktuell
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};
