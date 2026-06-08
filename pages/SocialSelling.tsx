
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
import { getAIClient } from '../services/aiService';
import { ObjectionDock } from '../components/sales/ObjectionDock';
import { 
    Linkedin, 
    Search, 
    Copy, 
    ExternalLink, 
    MessageCircle, 
    UserPlus, 
    Check, 
    Target,
    Filter,
    Briefcase,
    MapPin,
    Loader2
} from 'lucide-react';

export const SocialSelling: React.FC = () => {
    const { role } = useAuth();
    
    // --- STATE ---
    const [activeTab, setActiveTab] = useState<'SEARCH' | 'PROFILE' | 'CHAT'>('SEARCH');
    
    // Search Builder State
    const [searchCriteria, setSearchCriteria] = useState({
        role: 'Versicherungsmakler OR "Unabhängiger Finanzberater"',
        location: 'Zürich',
        keywords: 'Inhaber OR CEO',
        exclude: 'Allianz OR AXA OR Generali' // Exclude big corps
    });
    const [generatedBooleanString, setGeneratedBooleanString] = useState('');
    const [isGeneratingString, setIsGeneratingString] = useState(false);

    // Profile Analyzer State
    const [profileText, setProfileText] = useState('');
    const [generatedIcebreaker, setGeneratedIcebreaker] = useState('');
    const [isAnalyzingProfile, setIsAnalyzingProfile] = useState(false);

    // Access Control
    if (role !== UserRole.SAAS_ACQUISITION && role !== UserRole.SAAS_SALES && role !== UserRole.SAAS_SUPER_ADMIN) {
        return <Navigate to="/dashboard" />;
    }

    const handleGenerateSearch = async () => {
        setIsGeneratingString(true);
        
        try {
            const ai = getAIClient();
            const prompt = `
                Erstelle einen perfekten LinkedIn Boolean Search String für Sales Navigator oder die normale Suche.
                Zielgruppe: ${searchCriteria.role}
                Ort: ${searchCriteria.location}
                Muss enthalten: ${searchCriteria.keywords}
                Ausschliessen: ${searchCriteria.exclude}
                
                Gib mir NUR den String zurück, ohne Erklärungen. 
                Format: (Role) AND (Location) AND (Keywords) NOT (Exclude).
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            
            setGeneratedBooleanString(response.text || '');
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingString(false);
        }
    };

    const handleAnalyzeProfile = async () => {
        if (!profileText) return;
        setIsAnalyzingProfile(true);

        try {
            const ai = getAIClient();
            const prompt = `
                Analysiere diesen LinkedIn "Über Mich" Text eines potenziellen Kunden (Versicherungsmakler).
                Text: "${profileText}"
                
                Erstelle eine kurze, persönliche Vernetzungsanfrage (max 300 Zeichen für LinkedIn).
                Referenziere ein spezifisches Detail aus dem Text, um zu zeigen, dass ich es gelesen habe.
                Pitch: "SwissBroker OS" hilft bei Admin & Compliance.
                Tonalität: Professionell, aber locker. Nicht "Salesy".
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });

            setGeneratedIcebreaker(response.text || '');
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzingProfile(false);
        }
    };

    const openLinkedIn = () => {
        if (!generatedBooleanString) return;
        const encoded = encodeURIComponent(generatedBooleanString);
        window.open(`https://www.linkedin.com/search/results/people/?keywords=${encoded}`, '_blank');
    };

    return (
        <Layout>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Linkedin className="text-blue-600" />
                        Social Selling Cockpit
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Akquise, Recherche und Einwandbehandlung für LinkedIn.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-180px)]">
                
                {/* LEFT: TOOLS */}
                <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                    
                    {/* Tabs */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button 
                            onClick={() => setActiveTab('SEARCH')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'SEARCH' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <span className="flex items-center justify-center gap-2"><Target size={16}/> Target Builder</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('PROFILE')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'PROFILE' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <span className="flex items-center justify-center gap-2"><UserPlus size={16}/> Profile Analyzer</span>
                        </button>
                    </div>

                    {activeTab === 'SEARCH' && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-6">
                            <Card title="Zielgruppen-Definition">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-black uppercase text-slate-400 mb-1 flex items-center gap-1"><Briefcase size={12}/> Rolle / Titel</label>
                                            <input 
                                                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                                value={searchCriteria.role}
                                                onChange={e => setSearchCriteria({...searchCriteria, role: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black uppercase text-slate-400 mb-1 flex items-center gap-1"><MapPin size={12}/> Ort / Region</label>
                                            <input 
                                                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                                value={searchCriteria.location}
                                                onChange={e => setSearchCriteria({...searchCriteria, location: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase text-slate-400 mb-1 flex items-center gap-1"><Filter size={12}/> Must Haves (Keywords)</label>
                                        <input 
                                            className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                            value={searchCriteria.keywords}
                                            onChange={e => setSearchCriteria({...searchCriteria, keywords: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase text-slate-400 mb-1 flex items-center gap-1 text-red-400"><Filter size={12}/> Ausschliessen (Negative)</label>
                                        <input 
                                            className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                            value={searchCriteria.exclude}
                                            onChange={e => setSearchCriteria({...searchCriteria, exclude: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="pt-4 flex justify-end">
                                        <Button onClick={handleGenerateSearch} disabled={isGeneratingString} icon={isGeneratingString ? <Loader2 className="animate-spin" size={16}/> : <Search size={16}/>}>
                                            Boolean String generieren
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            {generatedBooleanString && (
                                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/50 p-6 rounded-xl animate-in zoom-in duration-300">
                                    <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Ihr Such-String ist bereit:</h3>
                                    <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-blue-100 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-300 break-all select-all">
                                        {generatedBooleanString}
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <Button onClick={openLinkedIn} className="bg-[#0077b5] hover:bg-[#006097] border-none text-white" icon={<ExternalLink size={16}/>}>
                                            Auf LinkedIn öffnen
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => navigator.clipboard.writeText(generatedBooleanString)} 
                                            icon={<Copy size={16}/>}
                                        >
                                            Kopieren
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'PROFILE' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                            <Card title="Profil-Analyse & Icebreaker">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-black uppercase text-slate-400 mb-1 block">LinkedIn 'Über mich' Text einfügen</label>
                                        <textarea 
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm h-32 focus:ring-2 focus:ring-brand-500 outline-none"
                                            placeholder="Hier den Profiltext des Leads einfügen..."
                                            value={profileText}
                                            onChange={e => setProfileText(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button 
                                            onClick={handleAnalyzeProfile} 
                                            disabled={!profileText || isAnalyzingProfile}
                                            icon={isAnalyzingProfile ? <Loader2 className="animate-spin" size={16}/> : <MessageCircle size={16}/>}
                                        >
                                            {isAnalyzingProfile ? 'Analysiere...' : 'Nachricht generieren'}
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            {generatedIcebreaker && (
                                <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 p-6 rounded-xl shadow-lg shadow-purple-500/5">
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                                        <UserPlus size={18} className="text-purple-600"/> 
                                        Vorschlag für Vernetzungsanfrage
                                    </h3>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 italic relative">
                                        "{generatedIcebreaker}"
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(generatedIcebreaker)}
                                            className="absolute top-2 right-2 p-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm hover:text-brand-600 transition-colors"
                                            title="Kopieren"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-3 text-right">
                                        {generatedIcebreaker.length} / 300 Zeichen
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT: OBJECTION DOCK */}
                <div className="h-full">
                    <ObjectionDock />
                </div>
            </div>
        </Layout>
    );
};
