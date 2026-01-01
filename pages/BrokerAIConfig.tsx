
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, AIProviderType } from '../types';
import { Navigate } from 'react-router-dom';
/* Fix: Added ShieldCheck to imports */
import { 
    BrainCircuit, 
    MessageSquare, 
    FileText, 
    Save, 
    RefreshCw, 
    Upload, 
    Trash2, 
    Zap, 
    Bot,
    Sparkles,
    CheckCircle,
    AlertTriangle,
    Globe,
    Server,
    Lock,
    Cpu,
    Activity,
    Key,
    ShieldCheck
} from 'lucide-react';

export const BrokerAIConfig: React.FC = () => {
    const { role, user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'PROVIDER' | 'KNOWLEDGE' | 'PERSONA'>('PROVIDER');

    // --- State: Provider & Model ---
    const [aiSettings, setAiSettings] = useState({
        provider: 'GOOGLE_GEMINI' as AIProviderType,
        modelName: 'gemini-3-pro-preview',
        customEndpoint: '',
        customApiKey: '',
        useFallback: true
    });

    const [persona, setPersona] = useState({
        tone: 'FORMAL',
        roleName: 'Senior Risk Consultant',
        customInstructions: 'Antworte immer präzise. Erwähne immer unsere Unabhängigkeit.',
    });

    if (role !== UserRole.BROKER_ADMIN) return <Navigate to="/dashboard" />;

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1200);
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <BrainCircuit className="text-brand-600" />
                        AI Studio & Orchestration
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Verwalten Sie Provider, eigene Modelle und die KI-Persönlichkeit.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} icon={isSaving ? <Loader2 className="animate-spin" /> : <Save />}>
                    {isSaving ? 'Konfiguration wird geladen...' : 'System synchronisieren'}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto no-scrollbar">
                <TabButton active={activeTab === 'PROVIDER'} onClick={() => setActiveTab('PROVIDER')} icon={<Server size={16}/>} label="AI Provider & Infrastruktur" />
                <TabButton active={activeTab === 'PERSONA'} onClick={() => setActiveTab('PERSONA')} icon={<MessageSquare size={16}/>} label="Persona & Tuning" />
                <TabButton active={activeTab === 'KNOWLEDGE'} onClick={() => setActiveTab('KNOWLEDGE')} icon={<FileText size={16}/>} label="Wissensdatenbank" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'PROVIDER' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                            <Card title="Provider Auswahl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ProviderCard 
                                        id="GOOGLE_GEMINI" 
                                        active={aiSettings.provider === 'GOOGLE_GEMINI'} 
                                        title="Google Gemini (Standard)" 
                                        desc="Native Audio & Google Search Integration."
                                        icon={<Zap className="text-amber-500" />}
                                        onClick={() => setAiSettings({...aiSettings, provider: 'GOOGLE_GEMINI'})}
                                    />
                                    <ProviderCard 
                                        id="CUSTOM_OPEN_SOURCE" 
                                        active={aiSettings.provider === 'CUSTOM_OPEN_SOURCE'} 
                                        title="Eigenes Modell (Private)" 
                                        desc="Llama 3 / Mistral via OpenAI-kompatibler API."
                                        icon={<Cpu className="text-blue-500" />}
                                        onClick={() => setAiSettings({...aiSettings, provider: 'CUSTOM_OPEN_SOURCE'})}
                                    />
                                </div>

                                {aiSettings.provider === 'CUSTOM_OPEN_SOURCE' && (
                                    <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-2">
                                            <Globe size={16} /> Endpoint Konfiguration
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Base URL</label>
                                                <input 
                                                    className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-mono"
                                                    placeholder="https://ai.ihre-firma.ch/v1"
                                                    value={aiSettings.customEndpoint}
                                                    onChange={e => setAiSettings({...aiSettings, customEndpoint: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Custom API Key</label>
                                                <div className="relative">
                                                    <Key className="absolute left-3 top-2.5 text-slate-400" size={14} />
                                                    <input 
                                                        type="password"
                                                        className="w-full pl-9 pr-2 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                                        placeholder="sk-..."
                                                        value={aiSettings.customApiKey}
                                                        onChange={e => setAiSettings({...aiSettings, customApiKey: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>

                            <Card title="Sicherheits-Layer">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Lock className="text-emerald-600" />
                                            <div>
                                                <p className="font-bold text-sm">PII Masking (Anonymisierung)</p>
                                                <p className="text-xs text-slate-500">Namen und Beträge werden vor dem Senden an die KI maskiert.</p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-5 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl opacity-50">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="text-slate-400" />
                                            <div>
                                                <p className="font-bold text-sm">Enterprise Data Shield</p>
                                                <p className="text-xs text-slate-500">Modell-Training mit Ihren Daten ist global deaktiviert.</p>
                                            </div>
                                        </div>
                                        <CheckCircle size={20} className="text-emerald-500" />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'PERSONA' && (
                        <Card title="Modell-Verhalten" className="animate-in fade-in slide-in-from-left-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-black uppercase text-slate-400 mb-1 block">Rollenname</label>
                                    <input className="w-full p-2 border rounded-lg" value={persona.roleName} onChange={e => setPersona({...persona, roleName: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-slate-400 mb-1 block">Basis Instruktionen</label>
                                    <textarea className="w-full p-2 border rounded-lg h-32" value={persona.customInstructions} onChange={e => setPersona({...persona, customInstructions: e.target.value})} />
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* SIDEBAR: Performance & Health */}
                <div className="space-y-6">
                    <Card title="AI Health Status">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Latenz (P95)</span>
                                <span className="font-bold text-emerald-600">420ms</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Uptime</span>
                                <span className="font-bold">99.98%</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between mb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Token Budget (Monat)</span>
                                    <span className="text-[10px] font-bold">75%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-500 w-[75%]"></div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-black text-xl mb-4">Enterprise Hub</h4>
                            <p className="text-xs text-slate-400 leading-relaxed mb-6">
                                Durch die Nutzung eigener Modelle behalten Sie die volle Souveränität über Ihre Datenflüsse. Ideal für Firmen mit strengen Compliance-Vorgaben.
                            </p>
                            <Button variant="secondary" size="sm" className="w-full bg-white/10 border-none text-white hover:bg-white/20">
                                Dokumentation ansehen
                            </Button>
                        </div>
                        <Activity className="absolute right-0 bottom-0 p-8 opacity-10" size={140} />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${active ? 'text-brand-600 border-brand-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
        {icon} {label}
    </button>
);

const ProviderCard = ({ active, title, desc, icon, onClick }: any) => (
    <div 
        onClick={onClick}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${active ? 'bg-white dark:bg-slate-950 border-brand-500 ring-4 ring-brand-500/10 shadow-lg' : 'bg-slate-50 dark:bg-slate-900 border-transparent grayscale opacity-70'}`}
    >
        <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">{icon}</div>
            {active && <CheckCircle size={16} className="text-brand-500" />}
        </div>
        <h4 className="font-bold text-sm">{title}</h4>
        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{desc}</p>
    </div>
);

const Loader2 = ({ className }: any) => <RefreshCw className={`animate-spin ${className}`} size={18} />;
