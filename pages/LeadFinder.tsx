import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
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
    Briefcase,
    Car,
    DollarSign,
    Landmark
} from 'lucide-react';

// Mock CRM Leads (Local state simulation)
const INITIAL_LEADS_BROKER = [
    { id: 'l1', name: 'AlpenTech Solutions', city: 'Zürich', status: 'NEW', note: 'Gefunden via News "Series A Funding"', potential: 5000 },
    { id: 'l2', name: 'Bäckerei Müller & Söhne', city: 'Bern', status: 'CONTACTED', note: 'Lokale Suche', potential: 1200 },
];

const INITIAL_LEADS_SAAS = [
    { id: 's1', name: 'Versicherungsbroker Meier AG', city: 'Luzern', status: 'NEW', note: 'Veraltete Webseite, Potenzial für Digitalisierung', potential: 250 },
    { id: 's2', name: 'Top Finanz Consulting', city: 'Zug', status: 'CONTACTED', note: 'Spezialisiert auf Expats', potential: 850 },
];

// Expanded Mock Data for Hunters (Broad Financial Services)
const INITIAL_LEADS_HUNTING = [
    { id: 'h1', name: 'Alpha Wealth Management', city: 'Zürich', status: 'NEW', note: 'Vermögensverwalter, benötigt Reporting-Tool', potential: 890 },
    { id: 'h2', name: 'Steuerberatung K. Müller', city: 'St. Gallen', status: 'OFFER', note: 'Macht viele Steuererklärungen, Cross-Selling Potenzial', potential: 450 },
    { id: 'h3', name: 'Auto-Leasing Express', city: 'Bern', status: 'NEW', note: 'Könnte Versicherungs-Modul integrieren', potential: 1200 },
];

interface LeadResult {
    name: string;
    description: string;
    city: string;
    reason: string;
    website?: string;
    estimatedRevenue?: string;
    type?: 'BROKER' | 'TAX' | 'WEALTH' | 'LEASING' | 'OTHER';
}

export const LeadFinder: React.FC = () => {
    const { role } = useAuth();
    
    // Determine context
    const isSaaSAdmin = role === UserRole.SAAS_SUPER_ADMIN || role === UserRole.SAAS_SALES;
    const isHunter = role === UserRole.SAAS_ACQUISITION;
    
    // Search State
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<LeadResult[]>([]);
    
    // CRM State initialization based on role
    const getInitialLeads = () => {
        if (isHunter) return INITIAL_LEADS_HUNTING;
        if (isSaaSAdmin) return INITIAL_LEADS_SAAS;
        return INITIAL_LEADS_BROKER;
    };

    const [leads, setLeads] = useState(getInitialLeads());

    // Access Control
    if (role === UserRole.CLIENT) {
        return <Navigate to="/dashboard" />;
    }

    const handleSearch = async () => {
        if (!query || !process.env.API_KEY) return;
        
        setIsSearching(true);
        setSearchResults([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let prompt = "";

            if (isHunter) {
                // HUNTER CONTEXT: Broad Financial Services Search
                prompt = `
                    Finde 5 echte Unternehmen in der Schweiz im Bereich Finanzdienstleistung, die auf folgende Beschreibung passen: "${query}".
                    
                    Zielgruppe sind potenzielle B2B-Kunden für unsere SaaS-Software "SwissBroker OS".
                    Relevante Kategorien:
                    1. Versicherungsbroker (Einzelkämpfer oder Firmen)
                    2. Steuerberatungsbüros (die Versicherungen optimieren könnten)
                    3. Vermögensverwalter (Independent Asset Managers)
                    4. Leasing- oder Kreditvermittler
                    
                    Gib mir die Antwort als JSON Array zurück. Jedes Objekt soll folgende Felder haben:
                    - name: Name der Firma
                    - city: Stadt/Ort
                    - description: Kurze Beschreibung (z.B. "Unabhängiger Vermögensverwalter", "Treuhandbüro").
                    - reason: Ein kurzer Satz, warum sie SwissBroker OS brauchen könnten (z.B. "Manuelle Prozesse", "Veraltete Webseite", "Hohes Kundenvolumen").
                    - website: URL der Webseite (wenn gefunden, sonst leer).
                    - estimatedRevenue: Schätzung des monatlichen SaaS-Umsatzes für uns (Zahl zwischen 150 und 2000, als String).
                    - type: Eines der folgenden Keywords: 'BROKER', 'TAX', 'WEALTH', 'LEASING', 'OTHER'.

                    Nutze Google Search, um aktuelle und reale Daten zu finden. Priorisiere Firmen, die digitalisierungswürdig aussehen.
                `;
            } else if (isSaaSAdmin) {
                // SAAS ADMIN CONTEXT: Specific Brokers (Admin Focus)
                prompt = `
                    Finde 5 echte Versicherungsbroker in der Schweiz, passend zu: "${query}".
                    
                    Gib mir JSON zurück:
                    - name, city, description
                    - reason: Warum brauchen sie Digitalisierung?
                    - website
                    - estimatedRevenue: String
                    - type: 'BROKER'
                `;
            } else {
                // BROKER CONTEXT: Find End-Clients (Consumers/Companies)
                prompt = `
                    Finde 5 echte Unternehmen in der Schweiz (potenzielle Endkunden für Versicherung), passend zu: "${query}".
                    
                    Gib mir JSON zurück:
                    - name, city, description
                    - reason: Warum brauchen sie Versicherung / Beratung?
                    - website
                    - estimatedRevenue: "-"
                    - type: 'OTHER'
                `;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                    responseMimeType: 'application/json'
                }
            });

            const text = response.text;
            if (text) {
                const data = JSON.parse(text);
                const results = Array.isArray(data) ? data : (data.companies || []);
                setSearchResults(results);
            }

        } catch (e) {
            console.error("Lead Search Error:", e);
            // Fallback Mock data
            const fallback: LeadResult[] = isHunter ? [
                { name: 'Finanz Partner Zürich AG', city: 'Zürich', description: 'Unabhängige Vermögensberatung', reason: 'Könnten CRM für Portfolio-Tracking nutzen', website: 'https://example.com', estimatedRevenue: '850', type: 'WEALTH' },
                { name: 'Treuhand Müller & Co', city: 'Bern', description: 'Steuerberatung für KMU', reason: 'Cross-Selling Potenzial bei Firmenkunden', website: 'https://example.com', estimatedRevenue: '450', type: 'TAX' }
            ] : [
                { name: 'Beispiel Firma AG', city: 'Zürich', description: 'Architekturbüro', reason: 'Berufshaftpflicht', website: 'https://example.com', estimatedRevenue: '0', type: 'OTHER' }
            ];
            setSearchResults(fallback);
        } finally {
            setIsSearching(false);
        }
    };

    const addLead = (lead: LeadResult) => {
        setLeads(prev => [...prev, {
            id: Date.now().toString(),
            name: lead.name,
            city: lead.city,
            status: 'NEW',
            note: lead.reason,
            potential: parseInt(lead.estimatedRevenue || '0')
        }]);
        setSearchResults(prev => prev.filter(r => r.name !== lead.name));
    };

    const getTypeIcon = (type?: string) => {
        switch (type) {
            case 'BROKER': return <Briefcase size={20} />;
            case 'TAX': return <Building2 size={20} />;
            case 'WEALTH': return <Landmark size={20} />;
            case 'LEASING': return <Car size={20} />;
            default: return <Target size={20} />;
        }
    };

    const LeadColumn = ({ title, status, color }: { title: string, status: string, color: string }) => {
        const columnLeads = leads.filter(l => l.status === status);
        const totalPotential = columnLeads.reduce((sum, l) => sum + (l.potential || 0), 0);

        return (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col h-full min-h-[300px]">
                <div className={`flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 ${color}`}>
                    <div className="text-xs font-bold uppercase tracking-wider">{title} ({columnLeads.length})</div>
                    {(isHunter || isSaaSAdmin) && totalPotential > 0 && (
                        <div className="text-xs font-mono text-slate-500">CHF {totalPotential}/mt</div>
                    )}
                </div>
                <div className="space-y-3">
                    {columnLeads.map(lead => (
                        <div key={lead.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex justify-between items-start">
                                <div className="font-bold text-slate-900 dark:text-slate-100">{lead.name}</div>
                                {(isHunter || isSaaSAdmin) && (
                                    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                                        CHF {lead.potential}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                <MapPin size={10} /> {lead.city}
                            </div>
                            {lead.note && <div className="text-xs text-slate-400 mt-2 italic line-clamp-2">"{lead.note}"</div>}
                            
                            <div className="mt-3 pt-2 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-[10px] text-slate-400">{new Date().toLocaleDateString()}</span>
                                <Button size="sm" variant="ghost" className="h-6 text-xs">Aktion</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Target className="text-brand-600" />
                    {isHunter ? 'Partner Radar (B2B Vertrieb)' : isSaaSAdmin ? 'Broker Radar' : 'Lead Radar'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    {isHunter 
                        ? 'Identifizieren Sie Broker, Vermögensverwalter, Steuerberater und Leasing-Firmen für die SaaS-Plattform.'
                        : 'KI-gestützte Suche nach Neukunden.'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: SEARCH AREA */}
                <div className="space-y-6">
                    <Card title={isHunter ? "B2B Zielgruppen Suche" : "Suche"}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    {isHunter ? 'Branche / Region' : 'Zielgruppe / Ort'}
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder={isHunter ? "z.B. Vermögensverwalter in Zug oder Steuerbüro in Bern" : "z.B. Architekten in Bern"} 
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {isHunter && 'Tipp: Suche nach "Versicherungsbroker", "Leasing Vermittler" oder "Treuhandbüros".'}
                                </p>
                            </div>
                            
                            <Button 
                                className="w-full" 
                                onClick={handleSearch} 
                                disabled={isSearching || !query}
                                icon={isSearching ? <Loader2 className="animate-spin" size={18}/> : <Globe size={18}/>}
                            >
                                {isSearching ? 'Analysiere Web...' : 'Suche starten'}
                            </Button>
                        </div>
                    </Card>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 px-1">Gefundene Einträge</h3>
                            {searchResults.map((result, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-900/50 rounded-xl p-4 shadow-sm hover:border-brand-400 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-lg flex items-center justify-center text-brand-600">
                                                {getTypeIcon(result.type)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{result.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <MapPin size={10} /> {result.city}
                                                    {result.website && (
                                                        <>
                                                            <span>•</span>
                                                            <a href={result.website} target="_blank" rel="noreferrer" className="hover:underline hover:text-brand-600">Website</a>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => addLead(result)}
                                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 rounded-full transition-colors"
                                            title="Zu Pipeline hinzufügen"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{result.description}</p>
                                    
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="bg-blue-50 dark:bg-blue-900/10 p-1.5 rounded text-[10px] text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 flex items-start gap-1 max-w-[70%]">
                                            <Target size={10} className="mt-0.5 shrink-0" />
                                            <span className="truncate">{result.reason}</span>
                                        </div>
                                        {(isHunter || isSaaSAdmin) && result.estimatedRevenue && (
                                            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                <DollarSign size={12}/> {result.estimatedRevenue} MRR
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: LEAD BOARD */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                            {isHunter ? 'Partner Pipeline (Acquisition)' : 'Vertriebs Pipeline'}
                        </h3>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline">Import CSV</Button>
                            <Button size="sm" variant="ghost">Ansicht anpassen</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <LeadColumn title="Neu / Unbearbeitet" status="NEW" color="text-blue-600 border-blue-200" />
                        <LeadColumn title="Kontaktiert / Demo" status="CONTACTED" color="text-amber-600 border-amber-200" />
                        <LeadColumn title={isHunter ? "Onboarding" : "Angebot"} status="OFFER" color="text-purple-600 border-purple-200" />
                    </div>
                </div>

            </div>
        </Layout>
    );
};