
import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { generateContentWithRetry } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, Lead, LeadContact, LeadActivity } from '../types';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, MapPin, Globe, Plus, Loader2, Building2, Phone, 
    ArrowRight, Target, X, MessageSquare, History, 
    UserPlus, Zap, Users, Mail, PhoneCall, CalendarPlus, Trash2, 
    Edit3, ExternalLink, Map as MapIcon, 
    CheckCircle2, Linkedin, Briefcase, Filter
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

type SearchMode = 'COMPANIES' | 'PEOPLE';

export const LeadFinder: React.FC = () => {
    const { role, user: currentUser } = useAuth();
    
    // Determine context based on role
    const isHunter = role === UserRole.SAAS_ACQUISITION || role === UserRole.SAAS_SALES || role === UserRole.SAAS_SUPER_ADMIN;
    
    // Search State
    const [searchMode, setSearchMode] = useState<SearchMode>('COMPANIES');
    const [criteria, setCriteria] = useState({
        roleOrIndustry: isHunter ? 'Versicherungsmakler' : 'Architekturbüro',
        location: 'Zürich',
        keywords: isHunter ? 'Inhaber OR Geschäftsführer' : 'KMU',
        exclude: isHunter ? 'AXA OR Allianz OR Zurich' : ''
    });

    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    
    // Pipeline State
    const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [activeDetailTab, setActiveDetailTab] = useState<'COCKPIT' | 'JOURNAL' | 'CONTACTS'>('COCKPIT');

    // Modals & Helpers
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<LeadContact | null>(null);
    const [objection, setObjection] = useState('');
    const [aiTip, setAiTip] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId), [selectedLeadId, leads]);

    const handleSearch = async () => {
        setIsSearching(true);
        setSearchResults([]);

        try {
            let prompt = "";

            if (searchMode === 'COMPANIES') {
                // GOOGLE MAPS / WEB SEARCH STRATEGY
                prompt = `
                    Suche via Google Search nach echten Unternehmen in der Schweiz.
                    Zielgruppe: ${criteria.roleOrIndustry}
                    Ort: ${criteria.location}
                    Stichworte: ${criteria.keywords}
                    Ignoriere: ${criteria.exclude}

                    Gib mir eine JSON Liste mit 6 Ergebnissen zurück.
                    Format: [{
                        "name": "Firmenname",
                        "address": "Adresse",
                        "description": "Kurze Beschreibung was sie tun",
                        "website": "URL (wenn gefunden)",
                        "matchReason": "Warum passt das?",
                        "type": "COMPANY"
                    }]
                `;
            } else {
                // LINKEDIN X-RAY STRATEGY
                prompt = `
                    Nutze Google Search, um LinkedIn Profile zu finden (X-Ray Search).
                    Such-Query Simulation: site:ch.linkedin.com/in/ AND "${criteria.roleOrIndustry}" AND "${criteria.location}" ${criteria.keywords ? `AND "${criteria.keywords}"` : ''} -inurl:dir
                    
                    Ignoriere Jobs-Seiten, suche nach Personen-Profilen.
                    
                    Gib mir eine JSON Liste mit 6 Ergebnissen zurück, basierend auf den Such-Snippets.
                    Format: [{
                        "name": "Name der Person",
                        "role": "Aktuelle Rolle / Titel",
                        "company": "Aktuelle Firma",
                        "profileUrl": "Link zum LinkedIn Profil",
                        "matchReason": "Warum passt diese Person?",
                        "type": "PERSON"
                    }]
                `;
            }

            // Use the new Rate-Limit protected service
            const response = await generateContentWithRetry(
                'gemini-3-pro-preview',
                prompt,
                { 
                    tools: [{ googleSearch: {} }], 
                    responseMimeType: 'application/json' 
                }
            );

            if (response.text) {
                setSearchResults(JSON.parse(response.text));
            }
        } catch (e) { 
            console.error("Search failed after retries:", e);
            // Optional: Show UI Error Toast here
        } finally { 
            setIsSearching(false); 
        }
    };

    const addLeadFromSearch = (res: any) => {
        const newLead: Lead = {
            id: Date.now().toString(),
            tenantId: 't1',
            name: res.type === 'PERSON' ? `${res.name} (${res.company})` : res.name,
            city: criteria.location,
            address: res.address || 'Adresse via LinkedIn ermitteln',
            status: 'NEW',
            potentialValue: 0, // TBD
            type: res.type === 'PERSON' ? 'LINKEDIN_IMPORT' : 'WEB_IMPORT',
            website: res.website || res.profileUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: searchMode === 'COMPANIES' ? 'Google' : 'LinkedIn',
            aiInsightScore: 70,
            contacts: res.type === 'PERSON' ? [{
                id: 'c_new',
                name: res.name,
                role: res.role,
                email: '',
                phone: '',
                isPrimary: true
            }] : [],
            activities: [],
            interests: [],
            tasks: [],
            offers: []
        };
        setLeads([newLead, ...leads]);
    };

    const handleObjectionHelp = async () => {
        if (!objection.trim()) return;
        setIsAiLoading(true);
        try {
            const context = `Einwand: "${objection}". Kontext: B2B Sales (SwissBroker OS). Gib 3 kurze, knackige Antworten.`;
            // Using protected service here too
            const response = await generateContentWithRetry(
                'gemini-3-flash-preview', 
                context
            );
            setAiTip(response.text || "Keine Antwort generiert.");
        } catch (e) { 
            console.error(e); 
            setAiTip("Service überlastet. Bitte warten.");
        } finally { 
            setIsAiLoading(false); 
        }
    };

    if (role === UserRole.CLIENT) return <Navigate to="/dashboard" />;

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Target className="text-brand-600" />
                    Hybrid Acquisition Engine
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Finden Sie Firmen via Google und Entscheider via LinkedIn – in einem Interface.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
                
                {/* LEFT: SEARCH CONFIG & RESULTS (4 Columns) */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
                    <Card className="flex-shrink-0">
                        {/* Mode Switcher Tabs */}
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-4">
                            <button 
                                onClick={() => setSearchMode('COMPANIES')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all ${searchMode === 'COMPANIES' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                <Building2 size={16}/> Firmen (Google)
                            </button>
                            <button 
                                onClick={() => setSearchMode('PEOPLE')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all ${searchMode === 'PEOPLE' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                <Linkedin size={16}/> Personen (LinkedIn)
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Branche / Rolle</label>
                                    <input 
                                        className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                        value={criteria.roleOrIndustry}
                                        onChange={e => setCriteria({...criteria, roleOrIndustry: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Ort / Region</label>
                                    <input 
                                        className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                        value={criteria.location}
                                        onChange={e => setCriteria({...criteria, location: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Keywords (Must Have)</label>
                                <input 
                                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                    value={criteria.keywords}
                                    onChange={e => setCriteria({...criteria, keywords: e.target.value})}
                                />
                            </div>
                            
                            <Button 
                                className={`w-full mt-2 ${searchMode === 'PEOPLE' ? 'bg-[#0077b5] hover:bg-[#006097]' : ''}`} 
                                onClick={handleSearch} 
                                disabled={isSearching}
                                icon={isSearching ? <Loader2 className="animate-spin" size={16}/> : <Search size={16}/>}
                            >
                                {searchMode === 'COMPANIES' ? 'Google Maps Scan' : 'LinkedIn X-Ray Scan'}
                            </Button>
                        </div>
                    </Card>

                    {/* Results List */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {searchResults.length > 0 && (
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                                {searchResults.length} Treffer gefunden
                            </p>
                        )}
                        
                        {searchResults.map((res, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:border-brand-500 transition-all group relative">
                                {res.type === 'PERSON' ? (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                            <Linkedin size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm truncate">{res.name}</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{res.role}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{res.company}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg flex items-center justify-center shrink-0">
                                            <Building2 size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm truncate">{res.name}</h4>
                                            <p className="text-xs text-slate-500 truncate">{res.address}</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mt-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => addLeadFromSearch(res)} 
                                        className="flex-1 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-xs font-bold rounded flex items-center justify-center gap-1 hover:bg-brand-100"
                                    >
                                        <Plus size={12}/> In Pipeline
                                    </button>
                                    <a 
                                        href={res.website || res.profileUrl} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded hover:text-slate-900 dark:hover:text-white"
                                    >
                                        <ExternalLink size={14}/>
                                    </a>
                                </div>
                            </div>
                        ))}
                        
                        {searchResults.length === 0 && !isSearching && (
                            <div className="text-center py-10 text-slate-400">
                                <Search size={32} className="mx-auto mb-2 opacity-20"/>
                                <p className="text-sm">Starten Sie einen Scan, um {searchMode === 'COMPANIES' ? 'Firmen' : 'Personen'} zu finden.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* MIDDLE & RIGHT: PIPELINE & DETAILS (8 Columns) */}
                <div className="lg:col-span-8 flex gap-6 h-full overflow-hidden">
                    
                    {/* Pipeline Kanban */}
                    {!selectedLeadId && (
                        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 h-full overflow-y-auto pr-2">
                            <PipelineColumn title="Neu" status="NEW" leads={leads} onSelect={setSelectedLeadId} color="text-blue-600" />
                            <PipelineColumn title="Kontaktiert" status="CONTACTED" leads={leads} onSelect={setSelectedLeadId} color="text-amber-600" />
                            <PipelineColumn title="Offerte" status="OFFER" leads={leads} onSelect={setSelectedLeadId} color="text-purple-600" />
                        </div>
                    )}

                    {/* Lead Detail View (Replaces Pipeline when selected) */}
                    {selectedLeadId && selectedLead && (
                        <div className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
                            {/* Detail Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl ${isHunter ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-brand-50 text-brand-600 dark:bg-brand-900/30'}`}>
                                        {selectedLead.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedLead.name}</h2>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                            <span className="flex items-center gap-1"><MapPin size={12}/> {selectedLead.city}</span>
                                            <span className="flex items-center gap-1"><Globe size={12}/> {selectedLead.source}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedLeadId(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20}/></button>
                            </div>

                            {/* Detail Tabs */}
                            <div className="flex border-b border-slate-100 dark:border-slate-900 px-6">
                                <DetailTab active={activeDetailTab === 'COCKPIT'} onClick={() => setActiveDetailTab('COCKPIT')} label="Aktionen" icon={<Zap size={14}/>} />
                                <DetailTab active={activeDetailTab === 'CONTACTS'} onClick={() => setActiveDetailTab('CONTACTS')} label="Kontakte" icon={<Users size={14}/>} />
                                <DetailTab active={activeDetailTab === 'JOURNAL'} onClick={() => setActiveDetailTab('JOURNAL')} label="Journal" icon={<History size={14}/>} />
                            </div>

                            {/* Detail Content */}
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-900/30">
                                {activeDetailTab === 'COCKPIT' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <ActionCard icon={<PhoneCall size={20}/>} label="Anrufen" sub="Direktwahl" color="bg-emerald-600" onClick={() => {/* Call */}} />
                                            <ActionCard icon={<Mail size={20}/>} label="LinkedIn Msg" sub="Via Social Selling" color="bg-blue-600" onClick={() => {/* Social */}} />
                                        </div>
                                        
                                        <Card title="Quick Tasks">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                                                    <div className="w-4 h-4 border-2 border-slate-300 rounded"></div>
                                                    <span className="text-sm">Erstkontakt via LinkedIn</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                                                    <div className="w-4 h-4 border-2 border-slate-300 rounded"></div>
                                                    <span className="text-sm">Webseite analysieren</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {activeDetailTab === 'CONTACTS' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-bold">Ansprechpartner</h3>
                                            <Button size="sm" variant="outline" icon={<Plus size={14}/>}>Neu</Button>
                                        </div>
                                        {selectedLead.contacts.map(c => (
                                            <div key={c.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">{c.name.charAt(0)}</div>
                                                    <div>
                                                        <div className="font-bold text-sm">{c.name}</div>
                                                        <div className="text-xs text-slate-500">{c.role}</div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-3">
                                                    <Button size="sm" variant="ghost" className="text-xs h-8">Email</Button>
                                                    <Button size="sm" variant="ghost" className="text-xs h-8">Anrufen</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeDetailTab === 'JOURNAL' && (
                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                                            <h3 className="text-xs font-black uppercase text-slate-400 mb-2">Live AI Coach</h3>
                                            <div className="flex gap-2 mb-2">
                                                <input className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm" placeholder="Einwand eingeben..." value={objection} onChange={e => setObjection(e.target.value)} />
                                                <Button size="sm" onClick={handleObjectionHelp} disabled={isAiLoading}>{isAiLoading ? '...' : 'Hilfe'}</Button>
                                            </div>
                                            {aiTip && <div className="text-xs text-slate-600 dark:text-slate-300 italic bg-brand-50 dark:bg-brand-900/20 p-2 rounded border border-brand-100 dark:border-brand-800">{aiTip}</div>}
                                        </div>
                                        {/* Timeline mock */}
                                        <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-4">
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                                                <p className="text-xs text-slate-400 mb-0.5">Heute, 09:00</p>
                                                <p className="text-sm font-medium">Lead erstellt aus {selectedLead.source} Suche.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

const PipelineColumn = ({ title, status, leads, onSelect, selectedId, color }: any) => {
    const colLeads = leads.filter((l: Lead) => l.status === status);
    return (
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col h-full">
            <div className={`flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-800 ${color}`}>
                <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
                <span className="text-[10px] font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">{colLeads.length}</span>
            </div>
            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {colLeads.map((lead: Lead) => (
                    <div key={lead.id} onClick={() => onSelect(lead.id)} className={`bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm cursor-pointer hover:border-brand-400 transition-all group ${selectedId === lead.id ? 'ring-2 ring-brand-500 border-transparent' : 'border-slate-200 dark:border-slate-800'}`}>
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">{lead.name}</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-medium">
                            <MapPin size={10}/> {lead.city}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DetailTab = ({ active, onClick, label, icon }: any) => (
    <button onClick={onClick} className={`flex items-center gap-2 py-4 px-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${active ? 'text-brand-600 border-brand-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
        {icon} {label}
    </button>
);

const ActionCard = ({ icon, label, sub, color, onClick }: any) => (
    <button onClick={onClick} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-300 transition-all text-left shadow-sm">
        <div className={`p-2 rounded-lg text-white ${color}`}>{icon}</div>
        <div>
            <div className="text-xs font-black uppercase tracking-wide text-slate-900 dark:text-white">{label}</div>
            <div className="text-[10px] text-slate-400">{sub}</div>
        </div>
    </button>
);
