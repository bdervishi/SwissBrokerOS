
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, CaseStudy } from '../types';
import { Navigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { 
    Sparkles, 
    Send, 
    Loader2, 
    Trash2, 
    Eye, 
    Download, 
    Rocket, 
    Brain, 
    Palette, 
    Cpu, 
    Globe, 
    Zap, 
    CheckCircle2, 
    Copy, 
    // Fixed: Added FileText to imports
    Image as ImageIcon,
    FileText
} from 'lucide-react';

export const SaaSCaseStudies: React.FC = () => {
    const { role } = useAuth();
    
    // Form State
    const [clientName, setClientName] = useState('');
    const [projectTheme, setProjectTheme] = useState('');
    const [highlights, setHighlights] = useState('');
    
    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedCase, setGeneratedCase] = useState<CaseStudy | null>(null);
    const [history, setHistory] = useState<CaseStudy[]>([]);
    
    // View State
    const [language, setLanguage] = useState<'de' | 'en'>('de');

    useEffect(() => {
        const saved = localStorage.getItem('app_case_studies');
        if (saved) setHistory(JSON.parse(saved));
    }, []);

    if (role !== UserRole.SAAS_SUPER_ADMIN && role !== UserRole.SAAS_MARKETING) {
        return <Navigate to="/dashboard" />;
    }

    const handleGenerate = async () => {
        if (!clientName || !projectTheme || !process.env.API_KEY) return;
        
        setIsGenerating(true);
        setGeneratedCase(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Erstelle einen detaillierten Case Study (Success Story) Beitrag für die Agentur 'Trifti'.
                Trifti ist spezialisiert auf KI-Agenten, Web3-Entwicklung und High-End Webdesign.
                
                PROJEKT-DATEN:
                PROJEKT-NAME / KUNDE: ${clientName}
                THEMA: ${projectTheme}
                HIGHLIGHTS: ${highlights}
                
                ANFORDERUNGEN AN DIE STRUKTUR:
                - Sprache: Erstelle alle Texte sowohl in Deutsch (für die _de Felder) als auch in Englisch.
                - Tonalität: Innovativ, technologisch führend, ergebnisorientiert und seriös.
                - Bild-Prompt: Generiere eine detaillierte Beschreibung für ein passendes KI-Generations-Tool (DALL-E/Midjourney), um ein futuristisches Projektbild im 'Trifti-Look' (Glassmorphism, Dark Mode, Akzentfarben Indigo/Pink) zu erstellen.
                - Stats: Erstelle 3 beeindruckende Kennzahlen (z.B. 'Effizienz +40%').
                
                GIB DAS ERGEBNIS STRENG ALS JSON-OBJEKT AUS, DAS DIESER STRUKTUR FOLGT:
                {
                  "id": "${clientName.toLowerCase().replace(/\s+/g, '-')}",
                  "title": "Englischer Titel",
                  "title_de": "Deutscher Titel",
                  "client": "${clientName}",
                  "category": "AI",
                  "year": "2024",
                  "description": "...",
                  "description_de": "...",
                  "challenge": "...",
                  "challenge_de": "...",
                  "solution": "...",
                  "solution_de": "...",
                  "result": "...",
                  "result_de": "...",
                  "technologies": ["React", "Gemini AI", "Tailwind"],
                  "stats": [
                    { "label": "Label EN", "label_de": "Label DE", "value": "Wert" }
                  ],
                  "image_prompt": "..."
                }
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });

            const text = response.text;
            if (text) {
                const caseObj = JSON.parse(text);
                const finalCase = { ...caseObj, createdAt: new Date().toISOString() };
                setGeneratedCase(finalCase);
            }
        } catch (e) {
            console.error("AI Generation Error", e);
            alert("Fehler bei der Generierung. Bitte API-Key prüfen.");
        } finally {
            setIsGenerating(false);
        }
    };

    const saveToHistory = () => {
        if (!generatedCase) return;
        const newHistory = [generatedCase, ...history];
        setHistory(newHistory);
        localStorage.setItem('app_case_studies', JSON.stringify(newHistory));
        setGeneratedCase(null);
        setClientName('');
        setProjectTheme('');
        setHighlights('');
    };

    const deleteFromHistory = (id: string) => {
        const newHistory = history.filter(h => h.id !== id);
        setHistory(newHistory);
        localStorage.setItem('app_case_studies', JSON.stringify(newHistory));
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Rocket className="text-brand-600" />
                        Success Story Studio
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Generiere High-End Case Studies für das Trifti Portfolio.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button onClick={() => setLanguage('de')} className={`px-4 py-1.5 text-xs font-black uppercase rounded-md transition-all ${language === 'de' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-500'}`}>DE</button>
                    <button onClick={() => setLanguage('en')} className={`px-4 py-1.5 text-xs font-black uppercase rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-500'}`}>EN</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* LEFT: GENERATOR FORM */}
                <div className="space-y-6">
                    <Card title="Projektdetails eingeben">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase text-slate-400 mb-1 block">Kunde / Projektname</label>
                                <input 
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bold"
                                    placeholder="z.B. Global Logistics AG"
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase text-slate-400 mb-1 block">Thema / Hauptaufgabe</label>
                                <input 
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="z.B. KI-gestützte Routenoptimierung"
                                    value={projectTheme}
                                    onChange={e => setProjectTheme(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase text-slate-400 mb-1 block">Highlights (Optional)</label>
                                <textarea 
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none h-24"
                                    placeholder="z.B. 30% Zeitersparnis, Integration in SAP..."
                                    value={highlights}
                                    onChange={e => setHighlights(e.target.value)}
                                />
                            </div>
                            <Button 
                                className="w-full py-6 text-lg font-black bg-gradient-to-r from-indigo-600 to-pink-600 border-none shadow-xl shadow-indigo-500/20"
                                onClick={handleGenerate}
                                disabled={isGenerating || !clientName || !projectTheme}
                                icon={isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                            >
                                {isGenerating ? 'AI wird kreativ...' : 'Case Study generieren'}
                            </Button>
                        </div>
                    </Card>

                    {/* HISTORY LIST */}
                    {history.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest px-2">Archivierte Stories</h3>
                            {history.map(item => (
                                <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{language === 'de' ? item.title_de : item.title}</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-black">{item.client} • {item.year}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setGeneratedCase(item)} className="p-2 text-slate-400 hover:text-brand-600"><Eye size={18}/></button>
                                        <button onClick={() => deleteFromHistory(item.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: PREVIEW CARD (TRIFTI LOOK) */}
                <div className="relative">
                    {!generatedCase && !isGenerating ? (
                        <div className="h-96 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                            <Brain size={48} className="mb-4 opacity-10" />
                            <p className="text-sm">Vorschau erscheint nach Generierung</p>
                        </div>
                    ) : isGenerating ? (
                        <div className="h-96 flex flex-col items-center justify-center text-brand-500 border-2 border-brand-100 dark:border-brand-900 rounded-3xl animate-pulse">
                            <Loader2 size={48} className="mb-4 animate-spin" />
                            <p className="text-sm font-bold uppercase tracking-widest">Digitaler Zwilling arbeitet...</p>
                        </div>
                    ) : generatedCase && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                            {/* THE TRIFTI CARD */}
                            <div className="bg-[#020617] text-white rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative group">
                                {/* Gradient Background Elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/10 blur-[100px] rounded-full -ml-20 -mb-20"></div>
                                
                                <div className="p-10 relative z-10">
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 font-black">T</div>
                                            <span className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Trifti Showcase</span>
                                        </div>
                                        <div className="text-[10px] font-black uppercase px-3 py-1 bg-white/5 border border-white/10 rounded-full text-slate-400">
                                            {generatedCase.category} • {generatedCase.year}
                                        </div>
                                    </div>

                                    <h2 className="text-4xl font-black mb-6 tracking-tight leading-[0.95]">
                                        {language === 'de' ? generatedCase.title_de : generatedCase.title}
                                    </h2>
                                    
                                    <p className="text-slate-400 text-lg mb-12 leading-relaxed">
                                        {language === 'de' ? generatedCase.description_de : generatedCase.description}
                                    </p>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-6 mb-12 border-y border-white/5 py-8">
                                        {generatedCase.stats.map((stat, i) => (
                                            <div key={i}>
                                                <div className="text-2xl font-black text-indigo-400">{stat.value}</div>
                                                <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1">
                                                    {language === 'de' ? stat.label_de : stat.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black uppercase text-pink-500 tracking-[0.2em]">Herausforderung</h4>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                {language === 'de' ? generatedCase.challenge_de : generatedCase.challenge}
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">Lösung</h4>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                {language === 'de' ? generatedCase.solution_de : generatedCase.solution}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {generatedCase.technologies.map(tech => (
                                            <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* TOOLBOX CARD */}
                            <Card className="bg-slate-50 dark:bg-slate-900 border-dashed border-brand-200">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                            <ImageIcon size={14}/> Image-Gen Prompt
                                        </h4>
                                        <button className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1"><Copy size={12}/> Kopieren</button>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-500 italic">
                                        {generatedCase.image_prompt}
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <Button className="flex-1" icon={<CheckCircle2 size={18}/>} onClick={saveToHistory}>In Portfolio speichern</Button>
                                        <Button variant="outline" className="flex-1" icon={<Download size={18}/>}>JSON Export</Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};
