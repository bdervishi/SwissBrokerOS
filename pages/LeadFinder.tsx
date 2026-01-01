import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    MapPin, 
    Globe, 
    Plus, 
    Loader2, 
    Building2, 
    Phone, 
    MoreHorizontal,
    ArrowRight,
    Target,
    DollarSign,
    X,
    MessageSquare,
    Clock,
    History,
    UserPlus,
    Tag,
    Zap,
    TrendingUp,
    FileText,
    Bell,
    CheckCircle2,
    Users,
    Sparkles,
    Mail,
    PhoneCall,
    CalendarPlus,
    Trash2,
    Edit3,
    ExternalLink,
    ShieldAlert,
    ChevronRight,
    Map as MapIcon,
    AlertCircle
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';

interface Contact {
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
}

interface Activity {
    id: string;
    type: 'NOTE' | 'CALL' | 'EMAIL' | 'TASK';
    content: string;
    date: string;
    user: string;
}

interface Lead {
    id: string;
    name: string;
    city: string;
    address: string;
    status: 'NEW' | 'CONTACTED' | 'OFFER';
    note: string;
    potential: number;
    type: 'BROKER' | 'TAX' | 'WEALTH' | 'LEASING' | 'OTHER';
    website?: string;
    contacts: Contact[];
    history: Activity[];
    interests: string[];
    suggestedServices: string[];
    nextSteps: { id: string; label: string; completed: boolean }[];
}

const MOCK_LEADS: Lead[] = [
    { 
        id: 'l1', 
        name: 'AlpenTech Solutions', 
        city: 'Zürich', 
        address: 'Hardturmstrasse 161, 8005 Zürich',
        status: 'NEW', 
        note: 'Gefunden via News "Series A Funding"', 
        potential: 5000,
        type: 'OTHER',
        website: 'https://alpentech.ch',
        contacts: [{ id: 'c1', name: 'Dr. Marc Wenger', role: 'CEO', email: 'm.wenger@alpentech.ch', phone: '+41 44 123 45 67' }],
        history: [{ id: 'h1', type: 'NOTE', content: 'Lead automatisch identifiziert.', date: '01.06.2024 09:00', user: 'System' }],
        interests: ['Wachstumsfinanzierung', 'Flottenleasing', 'Cyber-Versicherung'],
        suggestedServices: ['Berufshaftpflicht IT', 'Pensionskassen-Optimierung', 'KMU Leasing'],
        nextSteps: [
            { id: 's1', label: 'Erstgespräch führen', completed: false },
            { id: 's2', label: 'Bedarfsanalyse senden', completed: false }
        ]
    },
    { 
        id: 'l2', 
        name: 'Bäckerei Müller & Söhne', 
        city: 'Bern', 
        address: 'Kramgasse 12, 3011 Bern',
        status: 'CONTACTED', 
        note: 'Lokale Suche', 
        potential: 1200,
        type: 'OTHER',
        contacts: [{ id: 'c2', name: 'Hans Müller', role: 'Inhaber', phone: '+41 31 999 88 77' }],
        history: [
            { id: 'h2', type: 'CALL', content: 'Erstkontakt via Telefon. Interesse an Sachversicherung.', date: '02.06.2024 14:20', user: 'Felix Agent' }
        ],
        interests: ['Nachfolgeplanung', 'Gebäudeversicherung'],
        suggestedServices: ['Betriebsunterbrechung', 'Pillar 3a für Inhaber'],
        nextSteps: [{ id: 's3', label: 'Offerte bis Freitag erstellen', completed: false }]
    },
];

export const LeadFinder: React.FC = () => {
    const { role, user: currentUser } = useAuth();
    
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [activeDetailTab, setActiveDetailTab] = useState<'OVERVIEW' | 'HISTORY' | 'CONTACTS' | 'OFFERS'>('OVERVIEW');

    // Modals
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [configuringService, setConfiguringService] = useState<string | null>(null);

    // AI Sales Assist State
    const [objection, setObjection] = useState('');
    const [aiSalesTip, setAiSalesTip] = useState<string | null>(null);
    const [isAiTipLoading, setIsAiTipLoading] = useState(false);

    const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId), [selectedLeadId, leads]);

    const handleSearch = async () => {
        if (!query || !process.env.API_KEY) return;
        setIsSearching(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Finde 5 echte Unternehmen in der Schweiz für: "${query}". JSON: [{name, city, address, description, reason, website, estimatedRevenue, type}]`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: { tools: [{ googleSearch: {} }], responseMimeType: 'application/json' }
            });
            if (response.text) setSearchResults(JSON.parse(response.text));
        } catch (e) { console.error(e); } finally { setIsSearching(false); }
    };

    const handleAddContact = (contact: Partial<Contact>) => {
        if (!selectedLeadId) return;
        const newContact = { ...contact, id: Date.now().toString() } as Contact;
        setLeads(prev => prev.map(l => l.id === selectedLeadId ? { ...l, contacts: [...l.contacts, newContact] } : l));
        setIsContactModalOpen(false);
    };

    const handleUpdateContact = (contact: Contact) => {
        setLeads(prev => prev.map(l => l.id === selectedLeadId ? { ...l, contacts: l.contacts.map(c => c.id === contact.id ? contact : c) } : l));
        setIsContactModalOpen(false);
        setEditingContact(null);
    };

    const handleDeleteContact = (contactId: string) => {
        if (!window.confirm("Kontakt wirklich löschen?")) return;
        setLeads(prev => prev.map(l => l.id === selectedLeadId ? { ...l, contacts: l.contacts.filter(c => c.id !== contactId) } : l));
    };

    const handleObjectionHelp = async () => {
        if (!objection.trim() || !process.env.API_KEY) return;
        setIsAiTipLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Ein Lead bringt folgenden Einwand: "${objection}". Gib mir 3 schlagfertige, kundenorientierte Antworten für einen Makler (Schweizer Kontext). Kurz & prägnant.`;
            const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
            setAiSalesTip(response.text || "Keine Tipps verfügbar.");
        } catch (e) { console.error(e); } finally { setIsAiTipLoading(false); }
    };

    const toggleStep = (stepId: string) => {
        setLeads(prev => prev.map(l => l.id === selectedLeadId ? { ...l, nextSteps: l.nextSteps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s) } : l));
    };

    if (role === UserRole.CLIENT) return <Navigate to="/dashboard" />;

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Target className="text-brand-600" /> Lead Radar
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Akquise-Powerhouse mit KI-Unterstützung.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-200px)] overflow-hidden">
                <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    <Card title="Suche">
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-sm" placeholder="Architekten in Zürich..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                            </div>
                            <Button className="w-full" size="sm" onClick={handleSearch} disabled={isSearching} icon={isSearching ? <Loader2 className="animate-spin" /> : <Zap />}>Radar starten</Button>
                        </div>
                    </Card>
                    <div className="space-y-3">
                        {searchResults.map((res, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-sm">{res.name}</h4>
                                    <button onClick={() => {/* Add Logic */}} className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white rounded-lg transition-colors"><Plus size={14}/></button>
                                </div>
                                <p className="text-[10px] text-slate-500 line-clamp-2">{res.description}</p>
                                <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded-full w-fit">
                                    <TrendingUp size={10}/> {res.reason}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    <PipelineColumn title="Neu" status="NEW" leads={leads} onSelect={setSelectedLeadId} selectedId={selectedLeadId} colorClass="text-blue-600" />
                    <PipelineColumn title="Kontaktiert" status="CONTACTED" leads={leads} onSelect={setSelectedLeadId} selectedId={selectedLeadId} colorClass="text-amber-600" />
                    <PipelineColumn title="Angebot" status="OFFER" leads={leads} onSelect={setSelectedLeadId} selectedId={selectedLeadId} colorClass="text-purple-600" />
                </div>
            </div>

            <AnimatePresence>
                {selectedLeadId && selectedLead && (
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-slate-950 shadow-2xl z-[150] border-l border-slate-200 dark:border-slate-800 flex flex-col">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-900">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400"><Building2 size={32} /></div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedLead.name}</h2>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                            <span className="flex items-center gap-1.5"><MapPin size={14}/> {selectedLead.city}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedLeadId(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={24}/></button>
                            </div>
                            <div className="flex gap-6">
                                <DetailTab active={activeDetailTab === 'OVERVIEW'} onClick={() => setActiveDetailTab('OVERVIEW')} label="Übersicht" icon={<Target size={16}/>} />
                                <DetailTab active={activeDetailTab === 'HISTORY'} onClick={() => setActiveDetailTab('HISTORY')} label="Aktivitäten" icon={<History size={16}/>} />
                                <DetailTab active={activeDetailTab === 'CONTACTS'} onClick={() => setActiveDetailTab('CONTACTS')} label="Kontakte" icon={<Users size={16}/>} />
                                <DetailTab active={activeDetailTab === 'OFFERS'} onClick={() => setActiveDetailTab('OFFERS')} label="Angebote" icon={<DollarSign size={16}/>} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {activeDetailTab === 'OVERVIEW' && (
                                <div className="space-y-8 animate-in fade-in">
                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <ActionBtn icon={<PhoneCall size={20}/>} label="Anrufen" color="bg-emerald-600" sub="Direkt wählen" onClick={() => window.open(`tel:${selectedLead.contacts[0]?.phone || ''}`)} />
                                        <ActionBtn icon={<CalendarPlus size={20}/>} label="Termin" color="bg-brand-600" sub="Meeting buchen" onClick={() => {/* Open Calendar */}} />
                                        <ActionBtn icon={<Mail size={20}/>} label="E-Mail" color="bg-blue-600" sub="Vorlagen nutzen" onClick={() => window.open(`mailto:${selectedLead.contacts[0]?.email || ''}`)} />
                                    </div>

                                    {/* Address & Map */}
                                    <Card title="Standort & Adresse">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-2">
                                                <p className="text-sm font-bold">{selectedLead.address}</p>
                                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLead.address)}`} target="_blank" className="text-xs text-brand-600 flex items-center gap-1 hover:underline">
                                                    <MapIcon size={12}/> In Google Maps öffnen
                                                </a>
                                            </div>
                                            <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                                                <ExternalLink size={24}/>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Next Steps */}
                                    <Card title="Nächste Schritte">
                                        <div className="space-y-3">
                                            {selectedLead.nextSteps.map(s => (
                                                <div key={s.id} onClick={() => toggleStep(s.id)} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${s.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                                                        {s.completed && <CheckCircle2 size={14}/>}
                                                    </div>
                                                    <span className={`text-sm ${s.completed ? 'line-through text-slate-400' : 'font-medium'}`}>{s.label}</span>
                                                </div>
                                            ))}
                                            <button className="text-xs font-bold text-brand-600 flex items-center gap-1 mt-2 hover:underline"><Plus size={14}/> Schritt hinzufügen</button>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {activeDetailTab === 'HISTORY' && (
                                <div className="space-y-8 animate-in fade-in">
                                    {/* Objection Handler */}
                                    <div className="bg-slate-900 rounded-2xl p-6 border border-brand-500/20">
                                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><ShieldAlert size={16} className="text-brand-500"/> AI Sales Assist: Einwandbehandlung</h3>
                                        <div className="space-y-4">
                                            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:ring-1 focus:ring-brand-500" placeholder="Was sagt der Kunde? (z.B. Zu teuer, kein Bedarf...)" value={objection} onChange={e => setObjection(e.target.value)} />
                                            <Button size="sm" className="w-full" onClick={handleObjectionHelp} disabled={isAiTipLoading} icon={isAiTipLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}>Argumentation generieren</Button>
                                            {aiSalesTip && (
                                                <div className="mt-4 p-4 bg-brand-500/10 rounded-xl text-xs text-brand-200 border border-brand-500/20 prose prose-invert prose-xs" dangerouslySetInnerHTML={{ __html: aiSalesTip.replace(/\n/g, '<br/>') }} />
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {selectedLead.history.map(act => (
                                            <div key={act.id} className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-500"></div>
                                                <div className="text-[10px] text-slate-500 mb-1">{act.date} — {act.user}</div>
                                                <p className="text-sm font-medium">{act.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeDetailTab === 'CONTACTS' && (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-sm">Ansprechpartner</h3>
                                        <Button size="sm" variant="outline" icon={<Plus size={14}/>} onClick={() => { setEditingContact(null); setIsContactModalOpen(true); }}>Neu</Button>
                                    </div>
                                    {selectedLead.contacts.map((c) => (
                                        <div key={c.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center font-bold">{c.name.charAt(0)}</div>
                                                <div>
                                                    <p className="font-bold text-sm">{c.name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">{c.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => { setEditingContact(c); setIsContactModalOpen(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400" title="Bearbeiten"><Edit3 size={16}/></button>
                                                <button onClick={() => handleDeleteContact(c.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500" title="Löschen"><Trash2 size={16}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeDetailTab === 'OFFERS' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedLead.suggestedServices.map((service, i) => (
                                            <div key={i} className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between group hover:border-brand-300 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-brand-600"><Tag size={20}/></div>
                                                    <div><h4 className="font-bold text-sm">{service}</h4><p className="text-xs text-slate-500">Standard-Szenario aktiv</p></div>
                                                </div>
                                                <Button size="sm" variant="outline" onClick={() => { setConfiguringService(service); setIsConfigModalOpen(true); }}>Konfigurieren</Button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-8 bg-brand-600 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center gap-8 border-none">
                                        <div className="flex-1">
                                            <h4 className="font-black text-xl mb-2">Gesamt-Portfolio Offerte</h4>
                                            <p className="text-sm text-brand-100 opacity-90 leading-relaxed font-medium">Fassen Sie alle identifizierten Potenziale zu einem attraktiven Kombi-Paket für {selectedLead.name} zusammen.</p>
                                        </div>
                                        <Button className="bg-slate-950 text-white hover:bg-slate-900 border-none font-black px-8 py-6 shadow-2xl shrink-0" icon={<ArrowRight/>}>JETZT ERSTELLEN</Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/50 flex gap-4">
                            <Button variant="outline" className="flex-1" icon={<X size={18}/>} onClick={() => setSelectedLeadId(null)}>Schliessen</Button>
                            <Button className="flex-1" icon={<CheckCircle2 size={18}/>}>Status ändern</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Config Service Modal */}
            <Modal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} title={`Konfiguration: ${configuringService}`} maxWidth="max-w-md">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black uppercase text-slate-400 block mb-1">Versicherungssumme (CHF)</label>
                            <input type="number" defaultValue={1000000} className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono font-bold" />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-slate-400 block mb-1">Selbstbehalt</label>
                            <select className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <option>0 (Kein)</option>
                                <option>200</option>
                                <option>500</option>
                                <option>1000</option>
                            </select>
                        </div>
                    </div>
                    <Button className="w-full" onClick={() => setIsConfigModalOpen(false)}>Einstellung übernehmen</Button>
                </div>
            </Modal>

            {/* Contact Management Modal */}
            <Modal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} title={editingContact ? "Kontakt bearbeiten" : "Neuer Kontakt"} maxWidth="max-w-md">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = {
                        name: formData.get('name') as string,
                        role: formData.get('role') as string,
                        email: formData.get('email') as string,
                        phone: formData.get('phone') as string,
                    };
                    editingContact ? handleUpdateContact({ ...editingContact, ...data }) : handleAddContact(data);
                }} className="space-y-4">
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase block mb-1">Vollständiger Name</label>
                        <input name="name" required defaultValue={editingContact?.name} className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase block mb-1">Funktion / Rolle</label>
                        <input name="role" required defaultValue={editingContact?.role} className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase block mb-1">Email</label>
                            <input name="email" type="email" defaultValue={editingContact?.email} className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase block mb-1">Telefon</label>
                            <input name="phone" defaultValue={editingContact?.phone} className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsContactModalOpen(false)}>Abbrechen</Button>
                        <Button type="submit" className="flex-1">Speichern</Button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

const PipelineColumn = ({ title, status, leads, onSelect, selectedId, colorClass }: any) => {
    const colLeads = leads.filter((l: Lead) => l.status === status);
    return (
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col h-full min-h-[400px]">
            <div className={`flex justify-between items-center mb-6 pb-2 border-b border-slate-200 dark:border-slate-800 ${colorClass}`}>
                <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
                <span className="text-xs font-mono font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">{colLeads.length}</span>
            </div>
            <div className="space-y-4">
                {colLeads.map((lead: Lead) => (
                    <div key={lead.id} onClick={() => onSelect(lead.id)} className={`bg-white dark:bg-slate-900 p-4 rounded-xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${selectedId === lead.id ? 'border-brand-500 ring-2 ring-brand-500/10' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}>
                        <div className="flex justify-between items-start">
                            <div className="font-bold text-slate-900 dark:text-slate-100">{lead.name}</div>
                            <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">CHF {lead.potential}</div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1"><MapPin size={10} /> {lead.city}</div>
                    </div>
                ))}
                {colLeads.length === 0 && <div className="py-8 text-center text-slate-400 text-xs italic">Keine Leads</div>}
            </div>
        </div>
    );
};

const DetailTab = ({ active, onClick, label, icon }: any) => (
    <button onClick={onClick} className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${active ? 'text-brand-600 border-brand-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
        {icon} {label}
    </button>
);

const ActionBtn = ({ icon, label, color, sub, onClick }: any) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-brand-300 transition-all group">
        <div className={`p-3 rounded-xl text-white shadow-lg ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
        <div className="text-center">
            <div className="text-[10px] font-black uppercase tracking-wider">{label}</div>
            <div className="text-[8px] text-slate-400 font-medium">{sub}</div>
        </div>
    </button>
);
