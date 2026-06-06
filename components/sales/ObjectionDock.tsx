
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { GoogleGenAI } from "@google/genai";
import { 
    MessageSquare, 
    Zap, 
    ShieldAlert, 
    Clock, 
    DollarSign, 
    Copy, 
    Check, 
    Sparkles, 
    Loader2,
    RefreshCw
} from 'lucide-react';

const COMMON_OBJECTIONS = [
    { id: 'price', label: 'Zu teuer', icon: <DollarSign size={16}/>, prompt: 'Der Kunde sagt, die Software ist zu teuer. Argumentiere mit ROI (Zeitersparnis) und Compliance-Sicherheit.' },
    { id: 'competitor', label: 'Nutzen BrokerStar/Sobrado', icon: <ShieldAlert size={16}/>, prompt: 'Der Kunde nutzt bereits eine Konkurrenz-Software (z.B. BrokerStar). Fokus auf: Modernes UI, AI-Features, All-in-One (HR, Web, CRM).' },
    { id: 'timing', label: 'Keine Zeit', icon: <Clock size={16}/>, prompt: 'Der Kunde hat keine Zeit für eine Migration. Erkläre den "Smart Import" Service (CSV Upload, AI Mapping) der nur 1 Stunde dauert.' },
    { id: 'need', label: 'Brauche ich nicht', icon: <MessageSquare size={16}/>, prompt: 'Der Kunde sieht den Bedarf nicht (nutzt Excel). Fokus auf: nDSG Haftungsrisiken bei Excel und Automatisierung.' },
];

export const ObjectionDock: React.FC = () => {
    const [activeResponse, setActiveResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const [copied, setCopied] = useState(false);

    const handleObjection = async (promptContext: string) => {
        if (!process.env.API_KEY) return;
        setIsLoading(true);
        setActiveResponse(null);
        setCopied(false);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `
                Du bist ein Top-Performer im B2B SaaS Sales. Du verkaufst "SwissBroker OS".
                
                Methode: L.A.E.R. (Listen, Acknowledge, Explore, Respond).
                
                Struktur der Antwort (HTML):
                1. <p class="font-bold text-emerald-600 mb-1">Empathie & Bestätigung:</p> "Ich verstehe..."
                2. <p class="font-bold text-brand-600 mb-1 mt-3">Reframing / Frage:</p> Eine Frage, die das Problem neu beleuchtet.
                3. <p class="font-bold text-slate-700 dark:text-slate-300 mb-1 mt-3">Lösung / Proof:</p> Das Killer-Argument für SwissBroker OS.
                
                Halte es kurz und gesprächsorientiert (Schweizer Hochdeutsch).
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: promptContext,
                config: { systemInstruction }
            });

            setActiveResponse(response.text);
        } catch (e) {
            console.error(e);
            setActiveResponse("Fehler bei der Generierung.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (activeResponse) {
            const plainText = activeResponse.replace(/<[^>]+>/g, ''); // Strip HTML for clipboard
            navigator.clipboard.writeText(plainText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-900 text-white rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-xs animate-pulse">
                    <Zap size={14} fill="currentColor" /> Live Battle Station
                </div>
                <div className="text-[10px] text-slate-500 font-mono">AI: Gemini 3 Flash</div>
            </div>

            {/* Quick Actions Grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
                {COMMON_OBJECTIONS.map(obj => (
                    <button
                        key={obj.id}
                        onClick={() => handleObjection(obj.prompt)}
                        disabled={isLoading}
                        className="flex items-center gap-2 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all text-left group"
                    >
                        <div className="text-slate-400 group-hover:text-white transition-colors">{obj.icon}</div>
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white">{obj.label}</span>
                    </button>
                ))}
            </div>

            {/* Custom Input */}
            <div className="px-4 pb-2">
                <div className="relative">
                    <input 
                        type="text" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-3 pr-10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-600 transition-colors"
                        placeholder="Benutzerdefinierter Einwand..."
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleObjection(`Kunde sagt: "${customInput}". Entkräfte diesen Einwand.`)}
                    />
                    <button 
                        onClick={() => handleObjection(`Kunde sagt: "${customInput}". Entkräfte diesen Einwand.`)}
                        className="absolute right-2 top-2.5 text-slate-500 hover:text-white transition-colors"
                        disabled={!customInput.trim()}
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                    </button>
                </div>
            </div>

            {/* Response Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-800/50">
                {activeResponse ? (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-black uppercase text-brand-400 tracking-wider flex items-center gap-1">
                                <Sparkles size={10} /> Empfohlene Antwort
                            </span>
                            <button 
                                onClick={copyToClipboard} 
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Kopieren"
                            >
                                {copied ? <Check size={14} className="text-emerald-500"/> : <Copy size={14} />}
                            </button>
                        </div>
                        <div 
                            className="text-sm leading-relaxed text-slate-300"
                            dangerouslySetInnerHTML={{ __html: activeResponse }}
                        />
                        <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                            <button onClick={() => setActiveResponse(null)} className="text-xs text-slate-500 hover:text-white flex items-center gap-1">
                                <RefreshCw size={10} /> Reset
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-4">
                        <MessageSquare size={32} className="mb-2 opacity-20" />
                        <p className="text-xs">Wähle einen Einwand oder tippe ihn ein, um Live-Support zu erhalten.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
