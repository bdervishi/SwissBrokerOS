import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
import { UserRole, Lead, LeadContact, LeadActivity, LeadTask, LeadOfferConfig } from '../types';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, MapPin, Globe, Plus, Loader2, Building2, Phone, 
    ArrowRight, Target, DollarSign, X, MessageSquare, Clock, 
    History, UserPlus, Tag, Zap, TrendingUp, CheckCircle2, 
    Users, Sparkles, Mail, PhoneCall, CalendarPlus, Trash2, 
    Edit3, ExternalLink, ShieldAlert, Map as MapIcon, 
    ChevronRight, Save, Database, BarChart3, Coins, Cpu, Lock
} from 'lucide-react';

const MOCK_LEADS: Lead[] = [
    { 
        id: 'l1', 
        tenantId: 't1',
        name: 'AlpenTech Solutions', 
        city: 'Zürich', 
        address: 'Hardturmstrasse 161, 8005 Zürich',
        status: 'NEW', 
        potentialValue: 5000,
        type: 'OTHER',
        website: 'https://alpentech.ch',
        createdAt: '2024-06-01',
        updatedAt: '2024-06-02',
        source: 'Radar',
        aiInsightScore: 85,
        contacts: [{ id: 'c1', name: 'Dr. Marc Wenger', role: 'CEO', email: 'm.wenger@alpentech.ch', phone: '+41 44 123 45 67', isPrimary: true }],
        activities: [{ id: 'h1', type: 'SYSTEM', title: 'Lead erstellt', description: 'Radar-Match: Series A Funding News.', timestamp: '01.06.2024 09:00', authorName: 'System' }],
        interests: ['Cyber-Versicherung', 'PK-Optimierung'],
        tasks: [{ id: 't1', label: 'Inhaber anrufen', dueDate: '2024-06-10', isCompleted: false, priority: 'HIGH' }],
        offers: [],
    }
];

export const LeadFinder: React.FC = () => {
    const { role, user: currentUser } = useAuth();
    
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [activeDetailTab, setActiveDetailTab] = useState<'COCKPIT' | 'JOURNAL' | 'CONTACTS' | 'STRATEGY'>('COCKPIT');

    // Modals
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<LeadContact | null>(null);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [configuringOffer, setConfiguringOffer] = useState<LeadOfferConfig | null>(null);

    // AI Logic
    const [objection, setObjection] = useState('');
    const [aiTip, setAiTip] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId), [selectedLeadId, leads]);

    const handleSearch = async () => {
        if (!query || !process.env.API_KEY) return;
        setIsSearching(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Finde 5 echte Unternehmen in der Schweiz für: "${query}". JSON: [{name, city, address, description, reason, website, type}]`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: { tools: [{ googleSearch: {} }], responseMimeType: 'application/json' }
            });
            if (response.text) setSearchResults(JSON.parse(response.text));
        } catch (e) { console.error(e); } finally { setIsSearching(false); }
    };

    const logAction = (type: LeadActivity['type'], title: string, description: string, tokens = 0) => {
        if (!selectedLeadId) return;
        const newAct: LeadActivity = {
            id: Date.now().toString(),
            type,
            title,
            description,
            timestamp: new Date().toLocaleString(),
            authorName: currentUser?.firstName || 'User',
            metadata: { tokenUsage: tokens }
        };
        setLeads(prev => prev.map(l => l.id === selectedLeadId ? { ...l, activities: [newAct, ...l.activities], updatedAt: new Date().toISOString() } : l));
    };

    const handleCall = () => {
        const phone = selectedLead?.contacts[0]?.phone;
        if (phone) {
            window.open(`tel:${phone}`);
            logAction('CALL', 'Ausgehender Anruf', `Anruf an Primärkontakt ${selectedLead?.contacts[0]?.name} gestartet.`);
        }
    };

    const handleObjectionHelp = async () => {
        if (!objection.trim() || !process.env.API_KEY) return;
        setIsAiLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Lead Einwand: "${objection}". Branche: ${selectedLead?.type}. Rolle: Makler. Gib 3 schlagfertige Antworten (Schweizer Kontext).`;
            const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
            setAiTip(response.text);
            logAction('AI_GENERATION', 'Einwandbehandlung generiert', `Input: ${objection}`, 150);
        } catch (e) { console.error(e); } finally { setIsAiLoading(false); }
    };

    if (role === UserRole.CLIENT) return <Navigate to="/dashboard" />;

    return (
        <Layout>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Target className="text-brand-600" /> Sales Cockpit
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Proaktives Lead-Management mit Enterprise Intelligence.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-200px)] overflow-hidden">
                {/* Search Sidebar */}
                <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    <Card title="Radar">
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-sm" placeholder="z.B. Treuhand Luzern..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                            </div>
                            <Button className="w-full" size="sm" onClick={handleSearch} disabled={isSearching} icon={isSearching ? <Loader2 className="animate-spin" /> : <Zap />}>Radar starten</Button>
                        </div>
                    </Card>
                    <div className="space-y-3">
                        {searchResults.map((res, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:border-brand-500 transition-all cursor-pointer">
                                <h4 className="font-bold text-sm">{res.name}</h4>
                                <p className="text-[10px] text-slate-500 mt-1">{res.address}</p>
                                <button className="mt-3 text-[10px] font-black text-brand-600 uppercase flex items-center gap-1"><Plus size={12}/> Hinzufügen</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pipeline View */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    <PipelineColumn title="Neu" status="NEW" leads={leads} onSelect={setSelectedLeadId} selectedId={selectedLeadId} color="text-blue-600" />
                    <PipelineColumn title="Kontaktiert" status="CONTACTED" leads={leads} onSelect={setSelectedLeadId} selectedId={selectedLeadId} color="text-amber-600" />
                    <PipelineColumn title="Offerte" status="OFFER" leads={leads} onSelect={setSelectedLeadId} selectedId={selectedLeadId} color="text-purple-600" />
                </div>
            </div>

            {/* DETAIL PANEL (SLIDE-OVER) */}
            <AnimatePresence>
                {selectedLeadId && selectedLead && (
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-full max-w-3xl bg-white dark:bg-slate-950 shadow-2xl z-[150] border-l border-slate-200 dark:border-slate-800 flex flex-col">
                        
                        {/* Panel Header */}
                        <div className="p-8 border-b border-slate-100 dark:border-slate-900">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center text-brand-600 font-black text-2xl">{selectedLead.name.charAt(0)}</div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedLead.name}</h2>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                            <span className="flex items-center gap-1.5"><MapPin size={14}/> {selectedLead.city}</span>
                                            <span className="flex items-center gap-1.5 text-emerald-600 font-bold"><Zap size={14}/> Score: {selectedLead.aiInsightScore}%</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedLeadId(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={24}/></button>
                            </div>
                            <div className="flex gap-6">
                                <DetailTab active={activeDetailTab === 'COCKPIT'} onClick={() => setActiveDetailTab('COCKPIT')} label="Cockpit" icon={<Zap size={16}/>} />
                                <DetailTab active={activeDetailTab === 'JOURNAL'} onClick={() => setActiveDetailTab('JOURNAL')} label="Audit & History" icon={<History size={16}/>} />
                                <DetailTab active={activeDetailTab === 'CONTACTS'} onClick={() => setActiveDetailTab('CONTACTS')} label="Kontakte" icon={<Users size={16}/>} />
                                <DetailTab active={activeDetailTab === 'STRATEGY'} onClick={() => setActiveDetailTab('STRATEGY')} label="Stakeholder View" icon={<ShieldAlert size={16}/>} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {activeDetailTab === 'COCKPIT' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    {/* Action Hub */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <ActionCard icon={<PhoneCall size={20}/>} label="Anrufen" sub="Direktwahl" color="bg-emerald-600" onClick={handleCall} />
                                        <ActionCard icon={<CalendarPlus size={20}/>} label="Termin" sub="Kalender Sync" color="bg-brand-600" onClick={() => {/* Calendar Logic */}} />
                                        <ActionCard icon={<Mail size={20}/>} label="E-Mail" sub="Template" color="bg-blue-600" onClick={() => window.open(`mailto:${selectedLead.contacts[0]?.email}`)} />
                                    </div>

                                    {/* Address & Maps */}
                                    <Card title="Standort & Route">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedLead.address}</p>
                                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLead.address)}`} target="_blank" className="text-xs text-brand-600 flex items-center gap-1 mt-2 hover:underline">
                                                    <MapIcon size={12}/> In Google Maps öffnen
                                                </a>
                                            </div>
                                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 border border-slate-200 dark:border-slate-800">
                                                <ExternalLink size={32} />
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Next Steps Tasks */}
                                    <Card title="Nächste Schritte">
                                        <div className="space-y-3">
                                            {selectedLead.tasks.map(t => (
                                                <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-3">
                                                        <input type="checkbox" checked={t.isCompleted} readOnly className="rounded text-brand-600" />
                                                        <span className="text-sm font-medium">{t.label}</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-mono">{t.dueDate}</span>
                                                </div>
                                            ))}
                                            <button className="text-xs font-bold text-brand-600 flex items-center gap-1 mt-2 hover:underline"><Plus size={14}/> Task hinzufügen</button>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {activeDetailTab === 'JOURNAL' && (
                                <div className="space-y-8 animate-in fade-in">
                                    {/* Objection AI Widget */}
                                    <div className="bg-slate-900 rounded-2xl p-6 border border-brand-500/20 shadow-2xl">
                                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><Cpu size={16} className="text-brand-500"/> AI Sales Coach: Einwandbehandlung</h3>
                                        <div className="flex gap-2">
                                            <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:ring-1 focus:ring-brand-500" placeholder="Was sagt der Kunde? (z.B. Zu teuer...)" value={objection} onChange={e => setObjection(e.target.value)} />
                                            <Button size="sm" onClick={handleObjectionHelp} disabled={isAiLoading} icon={isAiLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}>Coach</Button>
                                        </div>
                                        {aiTip && <div className="mt-4 p-4 bg-brand-500/10 rounded-xl text-xs text-brand-200 border border-brand-500/20 whitespace-pre-wrap leading-relaxed">{aiTip}</div>}
                                    </div>
                                    {/* Timeline */}
                                    <div className="space-y-6">
                                        {selectedLead.activities.map(act => (
                                            <div key={act.id} className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ${act.type === 'AI_GENERATION' ? 'bg-purple-500' : 'bg-brand-500'}`}></div>
                                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-black mb-1">
                                                    <span>{act.type} • {act.authorName}</span>
                                                    <span>{act.timestamp}</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{act.title}</p>
                                                <p className="text-xs text-slate-500 mt-1">{act.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeDetailTab === 'CONTACTS' && (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-sm">Entscheidungsträger</h3>
                                        <Button size="sm" variant="outline" icon={<UserPlus size={14}/>} onClick={() => { setEditingContact(null); setIsContactModalOpen(true); }}>Neu</Button>
                                    </div>
                                    {selectedLead.contacts.map(c => (
                                        <div key={c.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between group shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400">{c.name.charAt(0)}</div>
                                                <div>
                                                    <p className="font-bold text-sm">{c.name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{c.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400" onClick={() => { setEditingContact(c); setIsContactModalOpen(true); }}><Edit3 size={16}/></button>
                                                <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400"><Trash2 size={16}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeDetailTab === 'STRATEGY' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <StakeholderCard 
                                            icon={<Database size={20}/>} 
                                            title="Architect View" 
                                            points={[`Tenant ID: ${selectedLead.tenantId}`, "Isolated Schema: Active", "Data Region: CH-ZH-1"]}
                                        />
                                        <StakeholderCard 
                                            icon={<Lock size={20}/>} 
                                            title="Ops & Compliance" 
                                            points={["nDSG Audit Trail: Logged", "Retention: 10y", "Encryption: AES-256"]}
                                        />
                                        <StakeholderCard 
                                            icon={<Cpu size={20}/>} 
                                            title="AI Architect" 
                                            points={["Model: Gemini 3 Flash", "Context Caching: Active", "Grounding: FINMA Regs"]}
                                        />
                                        <StakeholderCard 
                                            icon={<Coins size={20}/>} 
                                            title="Finance & Profit" 
                                            points={[`Tokens spent: 450`, `COGS Est: CHF 0.02`, `CAC: CHF 12.50`]}
                                        />
                                    </div>
                                    <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h4 className="font-black text-xl mb-4">Business Analyst Intelligence</h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-400 italic">Conversion Wahrscheinlichkeit</span>
                                                    <span className="font-bold text-emerald-400">74% (Szenario A)</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 w-[74%]"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <BarChart3 className="absolute right-0 bottom-0 p-8 opacity-10" size={160} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/50 flex gap-4">
                            <Button variant="outline" className="flex-1" icon={<X size={18}/>} onClick={() => setSelectedLeadId(null)}>Schliessen</Button>
                            <Button className="flex-1" icon={<CheckCircle2 size={18}/>}>Pipeline-Status ändern</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contact CRUD Modal */}
            <Modal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} title={editingContact ? "Kontakt bearbeiten" : "Neuer Kontakt"} maxWidth="max-w-md">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const contact: LeadContact = {
                        id: editingContact?.id || Date.now().toString(),
                        name: formData.get('name') as string,
                        role: formData.get('role') as string,
                        email: formData.get('email') as string,
                        phone: formData.get('phone') as string,
                        isPrimary: editingContact?.isPrimary || false
                    };
                    setLeads(prev => prev.map(l => l.id === selectedLeadId ? { ...l, contacts: editingContact ? l.contacts.map(c => c.id === contact.id ? contact : c) : [...l.contacts, contact] } : l));
                    setIsContactModalOpen(false);
                }} className="space-y-4">
                    <InputGroup name="name" label="Name" defaultValue={editingContact?.name} required />
                    <InputGroup name="role" label="Funktion" defaultValue={editingContact?.role} required />
                    <InputGroup name="email" label="E-Mail" type="email" defaultValue={editingContact?.email} />
                    <InputGroup name="phone" label="Telefon" defaultValue={editingContact?.phone} />
                    <Button type="submit" className="w-full">Kontakt speichern</Button>
                </form>
            </Modal>
        </Layout>
    );
};

const PipelineColumn = ({ title, status, leads, onSelect, selectedId, color }: any) => {
    const colLeads = leads.filter((l: Lead) => l.status === status);
    return (
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] p-5 border border-slate-200 dark:border-slate-800 flex flex-col h-full min-h-[400px]">
            <div className={`flex justify-between items-center mb-6 pb-2 border-b border-slate-200 dark:border-slate-800 ${color}`}>
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">{title}</h3>
                <span className="text-[10px] font-black bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">{colLeads.length}</span>
            </div>
            <div className="space-y-4">
                {colLeads.map((lead: Lead) => (
                    <div key={lead.id} onClick={() => onSelect(lead.id)} className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${selectedId === lead.id ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{lead.name}</div>
                            <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">CHF {lead.potentialValue}</div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-black tracking-widest"><MapPin size={10}/> {lead.city}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DetailTab = ({ active, onClick, label, icon }: any) => (
    <button onClick={onClick} className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${active ? 'text-brand-600 border-brand-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
        {icon} {label}
    </button>
);

const ActionCard = ({ icon, label, sub, color, onClick }: any) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-brand-300 transition-all group shadow-sm">
        <div className={`p-3 rounded-xl text-white ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
        <div className="text-center">
            <div className="text-[10px] font-black uppercase tracking-widest">{label}</div>
            <div className="text-[8px] text-slate-400 font-medium">{sub}</div>
        </div>
    </button>
);

const StakeholderCard = ({ icon, title, points }: any) => (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3 text-slate-500">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
        </div>
        <ul className="space-y-1">
            {points.map((p: string, i: number) => (
                <li key={i} className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-start gap-2">
                    <span className="text-brand-600">•</span> {p}
                </li>
            ))}
        </ul>
    </div>
);

const InputGroup = ({ name, label, type = "text", ...props }: any) => (
    <div>
        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">{label}</label>
        <input name={name} type={type} {...props} className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
    </div>
);
