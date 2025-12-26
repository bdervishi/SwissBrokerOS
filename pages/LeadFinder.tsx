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
    Briefcase
} from 'lucide-react';

// Mock CRM Leads (Local state simulation)
const INITIAL_LEADS_BROKER = [
    { id: 'l1', name: 'AlpenTech Solutions', city: 'Zürich', status: 'NEW', note: 'Gefunden via News "Series A Funding"' },
    { id: 'l2', name: 'Bäckerei Müller & Söhne', city: 'Bern', status: 'CONTACTED', note: 'Lokale Suche' },
];

const INITIAL_LEADS_SAAS = [
    { id: 's1', name: 'Versicherungsbroker Meier AG', city: 'Luzern', status: 'NEW', note: 'Veraltete Webseite, Potenzial für Digitalisierung' },
    { id: 's2', name: 'Top Finanz Consulting', city: 'Zug', status: 'CONTACTED', note: 'Spezialisiert auf Expats' },
];

interface LeadResult {
    name: string;
    description: string;
    city: string;
    reason: string;
    website?: string;
}

export const LeadFinder: React.FC = () => {
    const { role } = useAuth();
    
    // Determine context (SaaS Hunting Brokers vs. Broker Hunting Clients)
    const isSaaSMode = role === UserRole.SAAS_ACQUISITION || role === UserRole.SAAS_SALES || role === UserRole.SAAS_SUPER_ADMIN;

    // Search State
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<LeadResult[]>([]);
    
    // CRM State
    const [leads, setLeads] = useState(isSaaSMode ? INITIAL_LEADS_SAAS : INITIAL_LEADS_BROKER);

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

            if (isSaaSMode) {
                // SaaS Context: Find Insurance Brokers / Financial Advisors
                prompt = `
                    Finde 5 echte Versicherungsbroker, Finanzberater oder Treuhandfirmen in der Schweiz, die auf folgende Beschreibung passen: "${query}".
                    
                    Gib mir die Antwort als JSON Array zurück. Jedes Objekt soll folgende Felder haben:
                    - name: Name der Firma
                    - city: Stadt/Ort
                    - description: Kurze Beschreibung (z.B. "Unabhängiger Broker", "Spezialist für BVG").
                    - reason: Ein kurzer Satz, warum sie eine neue Makler-Software (SaaS) brauchen könnten (z.B. "Webseite wirkt veraltet", "Wachsende Mitarbeiterzahl", "Fokus auf Tech-Startups").
                    - website: URL der Webseite (wenn gefunden, sonst leer).

                    Nutze Google Search, um aktuelle und reale Daten zu finden.
                `;
            } else {
                // Broker Context: Find End-Clients (Companies)
                prompt = `
                    Finde 5 echte Unternehmen in der Schweiz, die auf folgende Beschreibung passen: "${query}".
                    
                    Gib mir die Antwort als JSON Array zurück. Jedes Objekt soll folgende Felder haben:
                    - name: Name der Firma
                    - city: Stadt/Ort
                    - description: Sehr kurze Beschreibung was sie tun.
                    - reason: Ein kurzer Satz, warum sie Versicherungsbedarf haben könnten (z.B. "Hohes Haftpflichtrisiko", "Wachsende Mitarbeiterzahl").
                    - website: URL der Webseite (wenn gefunden, sonst leer).

                    Nutze Google Search, um aktuelle und reale Daten zu finden.
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
                // Ensure it's an array
                const results = Array.isArray(data) ? data : (data.companies || []);
                setSearchResults(results);
            }

        } catch (e) {
            console.error("Lead Search Error:", e);
            // Fallback Mock data if API fails or quota exceeded in demo
            const fallback = isSaaSMode ? [
                { name: 'Traditional Broker AG', city: 'St. Gallen', description: 'Familienbetrieb seit 1980', reason: 'Modernisierungsbedarf der IT-Infrastruktur', website: 'https://example.com' },
                { name: 'Finanz & Co.', city: 'Bern', description: 'Finanzplanung für Private', reason: 'Skalierungsprobleme ohne CRM', website: 'https://example.com' }
            ] : [
                { name: 'Demo Architekten AG', city: 'Zürich', description: 'Architekturbüro für Hochbau', reason: 'Berufshaftpflicht und Bauwesenversicherung', website: 'https://example.com' },
                { name: 'StartUp Velo', city: 'Basel', description: 'E-Bike Verleih', reason: 'Sachversicherung und Flottenlösung', website: 'https://example.com' }
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
            note: lead.reason
        }]);
        // Remove from search results to indicate it's added
        setSearchResults(prev => prev.filter(r => r.name !== lead.name));
    };

    const LeadColumn = ({ title, status, color }: { title: string, status: string, color: string }) => (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col h-full min-h-[300px]">
            <div className={`text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 ${color}`}>
                {title} ({leads.filter(l => l.status === status).length})
            </div>
            <div className="space-y-3">
                {leads.filter(l => l.status === status).map(lead => (
                    <div key={lead.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{lead.name}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <MapPin size={10} /> {lead.city}
                        </div>
                        {lead.note && <div className="text-xs text-slate-400 mt-2 italic line-clamp-2">"{lead.note}"</div>}
                        
                        <div className="mt-3 pt-2 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                            <Button size="sm" variant="ghost" className="h-6 text-xs">Details</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Target className="text-brand-600" />
                    {isSaaSMode ? 'Broker Radar (SaaS Acquisition)' : 'Lead Radar'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    {isSaaSMode 
                        ? 'Finden Sie Maklerbüros und Finanzberater, die SwissBroker OS nutzen könnten.'
                        : 'Finden Sie neue Firmenkunden durch KI-gestützte Google Suche & Maps Analyse.'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: SEARCH AREA */}
                <div className="space-y-6">
                    <Card title={isSaaSMode ? "Makler Suche" : "Akquise Suche"}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    {isSaaSMode ? 'Region / Spezialisierung' : 'Zielgruppe / Ort'}
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder={isSaaSMode ? "z.B. Makler in St. Gallen" : "z.B. Zahnärzte in Winterthur"} 
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {isSaaSMode 
                                        ? 'Tipp: Suchen Sie nach "Unabhängige Finanzberater" oder "KMU Versicherungsbroker".'
                                        : 'Tipp: Suchen Sie auch nach Ereignissen wie "Neue Firmengründungen Zug".'}
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
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 px-1">
                                {isSaaSMode ? 'Potenzielle Partner' : 'Gefundene Firmen'}
                            </h3>
                            {searchResults.map((result, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-900/50 rounded-xl p-4 shadow-sm hover:border-brand-400 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-lg flex items-center justify-center text-brand-600">
                                                <Building2 size={20} />
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
                                            title="Zu Leads hinzufügen"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{result.description}</p>
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-2 rounded text-xs text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 flex items-start gap-2">
                                        <Target size={12} className="mt-0.5 shrink-0" />
                                        {result.reason}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: LEAD BOARD */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Meine Pipeline</h3>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline">Import CSV</Button>
                            <Button size="sm" variant="ghost">Ansicht anpassen</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <LeadColumn title="Neu / Unbearbeitet" status="NEW" color="text-blue-600 border-blue-200" />
                        <LeadColumn title="Kontaktiert" status="CONTACTED" color="text-amber-600 border-amber-200" />
                        <LeadColumn title={isSaaSMode ? "Demo Gebucht" : "Angebot"} status="OFFER" color="text-purple-600 border-purple-200" />
                    </div>
                </div>

            </div>
        </Layout>
    );
};