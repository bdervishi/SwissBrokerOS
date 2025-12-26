import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
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
    AlertTriangle
} from 'lucide-react';

export const BrokerAIConfig: React.FC = () => {
    const { role, user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'PERSONA' | 'KNOWLEDGE' | 'MODEL'>('PERSONA');

    // --- State: Persona ---
    const [persona, setPersona] = useState({
        tone: 'FORMAL', // FORMAL, CASUAL, EMPATHETIC
        roleName: 'Senior Risk Consultant',
        customInstructions: 'Antworte immer präzise. Vermeide Fachjargon, wo möglich. Erwähne immer, dass wir unabhängig sind.',
        forbiddenWords: 'Billig, Garantie, Versprechen'
    });

    // --- State: Knowledge Base (Context Caching Mock) ---
    const [documents, setDocuments] = useState([
        { id: 1, name: 'AGB Muster Broker AG 2024.pdf', size: '1.2 MB', tokens: 4500, status: 'CACHED' },
        { id: 2, name: 'Rahmenvertrag Allianz Spezial.pdf', size: '3.4 MB', tokens: 12500, status: 'CACHED' },
        { id: 3, name: 'Interner Leitfaden Hypotheken.pdf', size: '0.8 MB', tokens: 2100, status: 'PROCESSING' }
    ]);

    // --- State: Model Selection ---
    const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');

    // Access Control: Only Broker Admins (Inhaber)
    if (role !== UserRole.BROKER_ADMIN) {
        return <Navigate to="/dashboard" />;
    }

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            console.log("Broker AI Config Saved");
        }, 1000);
    };

    const handleDeleteDoc = (id: number) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    const handleUploadMock = () => {
        const newDoc = {
            id: Date.now(),
            name: 'Neues Dokument.pdf',
            size: '1.5 MB',
            tokens: 0,
            status: 'PROCESSING'
        };
        setDocuments([...documents, newDoc]);
        
        // Simulate Processing
        setTimeout(() => {
            setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'CACHED', tokens: 5000 } : d));
        }, 2000);
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <BrainCircuit className="text-brand-600" />
                        AI Studio: {user?.organizationName}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Konfigurieren Sie Ihr firmeneigenes KI-Gehirn.</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    icon={isSaving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18} />}
                    disabled={isSaving}
                >
                    {isSaving ? 'Trainieren & Speichern' : 'Modell aktualisieren'}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('PERSONA')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'PERSONA' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <MessageSquare size={16} /> Persona & Tonfall
                </button>
                <button
                    onClick={() => setActiveTab('KNOWLEDGE')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'KNOWLEDGE' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <FileText size={16} /> Wissensdatenbank (Context)
                </button>
                <button
                    onClick={() => setActiveTab('MODEL')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'MODEL' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <Bot size={16} /> Basis-Modell
                </button>
            </div>

            <div className="max-w-5xl">
                {/* --- PERSONA TAB --- */}
                {activeTab === 'PERSONA' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card title="System Instruktionen">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">KI Rollenname</label>
                                        <input 
                                            type="text" 
                                            value={persona.roleName}
                                            onChange={(e) => setPersona({...persona, roleName: e.target.value})}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Wie soll sich die KI intern nennen?</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Verhaltensregeln (System Prompt)</label>
                                        <textarea 
                                            value={persona.customInstructions}
                                            onChange={(e) => setPersona({...persona, customInstructions: e.target.value})}
                                            className="w-full h-32 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Verbotene Begriffe</label>
                                        <input 
                                            type="text" 
                                            value={persona.forbiddenWords}
                                            onChange={(e) => setPersona({...persona, forbiddenWords: e.target.value})}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg border-red-200 dark:border-red-900/30 text-sm"
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>
                        
                        <div className="space-y-6">
                            <Card title="Tonalität">
                                <div className="space-y-2">
                                    {[
                                        { id: 'FORMAL', label: 'Formell & Distanziert', desc: '"Sehr geehrter Herr..."' },
                                        { id: 'EMPATHETIC', label: 'Empathisch & Beratend', desc: '"Wir verstehen Ihre Sorge..."' },
                                        { id: 'CASUAL', label: 'Modern & Direkt', desc: '"Hallo Max, hier ist..."' }
                                    ].map(opt => (
                                        <div 
                                            key={opt.id}
                                            onClick={() => setPersona({...persona, tone: opt.id})}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all ${persona.tone === opt.id ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500 dark:bg-brand-900/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300'}`}
                                        >
                                            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{opt.label}</div>
                                            <div className="text-xs text-slate-500 italic mt-1">{opt.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                            
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                <h4 className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold text-sm mb-2">
                                    <Sparkles size={16} /> Live Vorschau
                                </h4>
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-400 shadow-sm border border-slate-100 dark:border-slate-800">
                                    "Guten Tag Herr Müller, basierend auf Ihren Angaben zur Hypothek empfehle ich eine Festhypothek..."
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- KNOWLEDGE BASE TAB --- */}
                {activeTab === 'KNOWLEDGE' && (
                    <div className="space-y-6">
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-4 rounded-xl flex gap-4">
                            <Zap className="text-amber-500 shrink-0" />
                            <div>
                                <h3 className="font-bold text-amber-900 dark:text-amber-200">Gemini Context Caching</h3>
                                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                                    Dokumente, die hier hochgeladen werden, sind für die KI <strong>sofort verfügbar</strong>, ohne dass sie bei jeder Anfrage neu gesendet werden müssen. Ideal für AGBs, Produktblätter und interne Richtlinien.
                                </p>
                            </div>
                        </div>

                        <Card title={`Aktiver Kontext (${documents.length} Dateien)`}>
                            <div className="mb-4 flex justify-end">
                                <Button variant="outline" icon={<Upload size={16}/>} onClick={handleUploadMock}>Dokument hochladen</Button>
                            </div>
                            
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3">Dateiname</th>
                                        <th className="px-6 py-3">Grösse</th>
                                        <th className="px-6 py-3">Tokens (Est.)</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {documents.map(doc => (
                                        <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <FileText size={18} className="text-slate-400" />
                                                <span className="font-medium text-slate-900 dark:text-slate-100">{doc.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{doc.size}</td>
                                            <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{doc.tokens > 0 ? doc.tokens : '-'}</td>
                                            <td className="px-6 py-4">
                                                {doc.status === 'CACHED' ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                                        <CheckCircle size={12} /> Im Cache
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded animate-pulse">
                                                        <RefreshCw size={12} className="animate-spin" /> Verarbeite...
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDeleteDoc(doc.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
                                <span>Total Cache Usage: ~19k Tokens</span>
                                <span>Kosten: CHF 0.50 / Tag (Geschätzt)</span>
                            </div>
                        </Card>
                    </div>
                )}

                {/* --- MODEL SELECTION TAB --- */}
                {activeTab === 'MODEL' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Flash Model */}
                            <div 
                                onClick={() => setSelectedModel('gemini-3-flash-preview')}
                                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedModel === 'gemini-3-flash-preview' ? 'bg-white dark:bg-slate-900 border-brand-500 ring-4 ring-brand-500/10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300'}`}
                            >
                                {selectedModel === 'gemini-3-flash-preview' && <div className="absolute top-4 right-4 text-brand-500"><CheckCircle size={24} /></div>}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg"><Zap size={24} /></div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Gemini 3 Flash</h3>
                                </div>
                                <p className="text-slate-500 text-sm mb-4">
                                    Das schnellste Modell. Ideal für einfache Aufgaben wie E-Mail Zusammenfassungen, Terminplanung und Extraktion von Daten.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/> Günstigste Option</li>
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/> Extrem niedrige Latenz</li>
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/> Context Caching Support</li>
                                </ul>
                            </div>

                            {/* Pro Model */}
                            <div 
                                onClick={() => setSelectedModel('gemini-3-pro-preview')}
                                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedModel === 'gemini-3-pro-preview' ? 'bg-white dark:bg-slate-900 border-purple-500 ring-4 ring-purple-500/10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300'}`}
                            >
                                {selectedModel === 'gemini-3-pro-preview' && <div className="absolute top-4 right-4 text-purple-500"><CheckCircle size={24} /></div>}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><BrainCircuit size={24} /></div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Gemini 3 Pro</h3>
                                </div>
                                <p className="text-slate-500 text-sm mb-4">
                                    Das intelligente Modell für komplexe Analysen. Notwendig für Steueroptimierung, Vertragsprüfung und komplexe Argumentation.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/> Tiefes Verständnis</li>
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/> Besserer Schreibstil</li>
                                    <li className="flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500"/> Höhere Kosten pro Token</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center text-xs text-slate-500">
                            Hinweis: Kosten werden basierend auf der SaaS-Konfiguration verrechnet (siehe Admin Dashboard).
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};