import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { MOCK_TAX_RETURNS, MOCK_CLIENTS } from '../constants';
import { TaxReturn, TaxReturnStatus, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSecurity } from '../contexts/SecurityContext';
import { getAIClient } from '../services/aiService';
import { 
    Calculator, 
    FileText, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    Filter,
    Plus,
    Search,
    ChevronRight,
    Sparkles,
    Loader2,
    MapPin,
    Calendar,
    Download,
    Building2,
    User,
    ArrowRight,
    Map,
    CheckSquare,
    TrendingDown
} from 'lucide-react';
import { SensitiveData } from '../components/ui/SensitiveData';
import { Navigate } from 'react-router-dom';

export const TaxManagement: React.FC = () => {
    const { role } = useAuth();
    const { isAIEnabled } = useSecurity();
    
    // View State
    const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
    const [selectedYear, setSelectedYear] = useState<number>(2023);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReturn, setSelectedReturn] = useState<TaxReturn | null>(null);
    
    // Simulator State
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
    const [simEntityType, setSimEntityType] = useState<'PRIVATE' | 'BUSINESS'>('BUSINESS');
    const [simFromCanton, setSimFromCanton] = useState('Zürich');
    const [simToCanton, setSimToCanton] = useState('Zug');
    const [simIncome, setSimIncome] = useState(250000); // Default profit/income
    const [relocationChecklist, setRelocationChecklist] = useState<string | null>(null);
    const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);

    // AI State (Advice)
    const [aiAdvice, setAiAdvice] = useState<string | null>(null);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    // Access Control
    if (role === UserRole.CLIENT) {
        return <Navigate to="/dashboard" />;
    }

    // Filter Logic
    const filteredReturns = MOCK_TAX_RETURNS.filter(tr => {
        const client = MOCK_CLIENTS.find(c => c.id === tr.clientId);
        const matchesSearch = client 
            ? `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
            : false;
        return tr.year === selectedYear && matchesSearch;
    });

    const getClient = (id: string) => MOCK_CLIENTS.find(c => c.id === id);

    // --- Simulation Logic (Heuristic Mock) ---
    const calculateTaxLoad = (canton: string, amount: number, type: 'PRIVATE' | 'BUSINESS') => {
        // Simplified multipliers for visualization
        const factors: Record<string, number> = {
            'Zürich': 1.0,
            'Bern': 1.25,
            'Luzern': 0.75,
            'Zug': 0.60,
            'Schwyz': 0.65,
            'Aargau': 0.95
        };
        const factor = factors[canton] || 1.0;
        
        // Base rate approx 15% for business, 20% for private (progressive simplified)
        const baseRate = type === 'BUSINESS' ? 0.15 : 0.20;
        return amount * baseRate * factor;
    };

    const taxFrom = calculateTaxLoad(simFromCanton, simIncome, simEntityType);
    const taxTo = calculateTaxLoad(simToCanton, simIncome, simEntityType);
    const savings = taxFrom - taxTo;

    // --- AI Logic ---
    const handleAiAnalysis = async () => {
        if (!selectedReturn) return;
        
        setIsGeneratingAi(true);
        setAiAdvice(null);

        const client = getClient(selectedReturn.clientId);
        if (!client) return;

        try {
            const ai = getAIClient();
            const prompt = `
                Handel als Schweizer Steuerexperte für den Kanton ${selectedReturn.canton}.
                Analysiere die Situation für den Kunden:
                - Wohnort: ${client.zipCity}
                - Kanton: ${selectedReturn.canton}
                - Steuerbares Einkommen (approx): CHF ${selectedReturn.taxableIncome}
                
                Gib mir 3 konkrete, kantonsspezifische Tipps, um die Steuerlast zu optimieren.
                Erwähne spezifische Pauschalen oder Regeln für den Kanton ${selectedReturn.canton}.
                
                Formatierung:
                Gib die Antwort als HTML-Liste (<ul> <li>) zurück. Nutze <strong> für wichtige Begriffe.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setAiAdvice(response.text || "Keine Tipps gefunden.");
        } catch (e) {
            console.error(e);
            setAiAdvice("KI-Service momentan nicht verfügbar.");
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const handleGenerateRelocationChecklist = async () => {
        setIsGeneratingChecklist(true);
        setRelocationChecklist(null);

        try {
            const ai = getAIClient();
            const prompt = `
                Erstelle eine detaillierte Checkliste für eine Sitzverlegung / Umzug in der Schweiz.
                
                Szenario:
                - Typ: ${simEntityType === 'BUSINESS' ? 'Juristische Person (GmbH/AG)' : 'Privatperson'}
                - Von: Kanton ${simFromCanton}
                - Nach: Kanton ${simToCanton}
                
                Aufgabe:
                Liste alle notwendigen Schritte auf, unterteilt in:
                1. Behördengänge & Register (z.B. Handelsregister, Notar, Einwohnerkontrolle)
                2. Steueramt (Abmeldungen, unterjährige Steuerpflicht)
                3. Dokumente (Was muss vorbereitet/geändert werden, z.B. Statuten)
                4. Sonstiges (AHV, Versicherungen)

                Gib für jeden Punkt eine kurze Schätzung des Aufwands oder der Kosten an, falls bekannt.
                Formatierung: HTML, strukturiert mit <h4> und <ul>.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setRelocationChecklist(response.text || "Keine Checkliste generiert.");
        } catch (e) {
            console.error(e);
            setRelocationChecklist("Fehler bei der KI-Generierung.");
        } finally {
            setIsGeneratingChecklist(false);
        }
    };

    // --- Render Helpers ---
    const StatusBadge = ({ status }: { status: TaxReturnStatus }) => {
        const styles = {
            'OPEN': 'bg-slate-100 text-slate-600',
            'DOCS_MISSING': 'bg-red-100 text-red-700',
            'IN_PROGRESS': 'bg-blue-100 text-blue-700',
            'REVIEW': 'bg-purple-100 text-purple-700',
            'SUBMITTED': 'bg-emerald-100 text-emerald-700',
            'ARCHIVED': 'bg-slate-200 text-slate-500'
        };
        const labels = {
            'OPEN': 'Offen',
            'DOCS_MISSING': 'Unterlagen fehlen',
            'IN_PROGRESS': 'In Bearbeitung',
            'REVIEW': 'Review',
            'SUBMITTED': 'Eingereicht',
            'ARCHIVED': 'Archiviert'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const KanbanColumn = ({ title, status, items }: { title: string, status: TaxReturnStatus, items: TaxReturn[] }) => (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/30 rounded-xl p-3 border border-slate-200 dark:border-slate-800 min-w-[280px]">
            <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">{title}</h3>
                <span className="bg-white dark:bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">{items.length}</span>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto">
                {items.map(tr => {
                    const client = getClient(tr.clientId);
                    return (
                        <div 
                            key={tr.id} 
                            onClick={() => setSelectedReturn(tr)}
                            className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-brand-300 group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{client?.firstName} {client?.lastName}</span>
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                    {tr.canton.substring(0,2).toUpperCase()}
                                </div>
                            </div>
                            <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                <Clock size={12} className={new Date(tr.deadline || '') < new Date() ? 'text-red-500' : ''} />
                                <span className={new Date(tr.deadline || '') < new Date() ? 'text-red-500 font-medium' : ''}>
                                    Frist: {tr.deadline}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <FileText size={12} /> {tr.documentsCount} Docs
                                </div>
                                <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Calculator className="text-brand-600" />
                        Steuer-Cockpit
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Verwaltung der Steuererklärungen {selectedYear}.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={<MapPin size={18} />} onClick={() => setIsSimulatorOpen(true)}>Sitzverlegung simulieren</Button>
                    <div className="w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
                    <div className="flex bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                        <button 
                            onClick={() => setSelectedYear(selectedYear - 1)}
                            className="px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-sm"
                        >
                            {selectedYear - 1}
                        </button>
                        <span className="px-3 py-1 font-bold text-brand-600 text-sm">{selectedYear}</span>
                        <button 
                            onClick={() => setSelectedYear(selectedYear + 1)}
                            className="px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-sm"
                        >
                            {selectedYear + 1}
                        </button>
                    </div>
                    <Button icon={<Plus size={18} />}>Neues Mandat</Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Kunden suchen..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </div>
                <div className="flex gap-2 ml-auto">
                    <Button 
                        variant={viewMode === 'KANBAN' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setViewMode('KANBAN')}
                    >
                        Kanban
                    </Button>
                    <Button 
                        variant={viewMode === 'LIST' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setViewMode('LIST')}
                    >
                        Liste
                    </Button>
                </div>
            </div>

            {/* Content View */}
            {viewMode === 'KANBAN' && (
                <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
                    <KanbanColumn title="Offen" status="OPEN" items={filteredReturns.filter(r => r.status === 'OPEN')} />
                    <KanbanColumn title="Unterlagen fehlen" status="DOCS_MISSING" items={filteredReturns.filter(r => r.status === 'DOCS_MISSING')} />
                    <KanbanColumn title="In Bearbeitung" status="IN_PROGRESS" items={filteredReturns.filter(r => r.status === 'IN_PROGRESS')} />
                    <KanbanColumn title="Review" status="REVIEW" items={filteredReturns.filter(r => r.status === 'REVIEW')} />
                    <KanbanColumn title="Eingereicht" status="SUBMITTED" items={filteredReturns.filter(r => r.status === 'SUBMITTED')} />
                </div>
            )}

            {/* SIMULATOR MODAL */}
            {isSimulatorOpen && (
                <Modal
                    isOpen={isSimulatorOpen}
                    onClose={() => setIsSimulatorOpen(false)}
                    title="Simulator: Sitzverlegung / Umzug"
                    maxWidth="max-w-5xl"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Input & Visualization */}
                        <div className="space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                                    <Map size={18} className="text-brand-600" />
                                    Szenario Konfiguration
                                </h3>
                                
                                <div className="space-y-4">
                                    {/* Entity Switch */}
                                    <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                                        <button 
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${simEntityType === 'BUSINESS' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-slate-500 hover:text-slate-700'}`}
                                            onClick={() => setSimEntityType('BUSINESS')}
                                        >
                                            <Building2 size={16} /> Firma (AG/GmbH)
                                        </button>
                                        <button 
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${simEntityType === 'PRIVATE' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-slate-500 hover:text-slate-700'}`}
                                            onClick={() => setSimEntityType('PRIVATE')}
                                        >
                                            <User size={16} /> Privatperson
                                        </button>
                                    </div>

                                    {/* Cantons */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Aktueller Kanton</label>
                                            <select 
                                                value={simFromCanton} 
                                                onChange={e => setSimFromCanton(e.target.value)}
                                                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                            >
                                                {['Zürich', 'Bern', 'Luzern', 'Zug', 'Schwyz', 'Aargau'].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Ziel Kanton</label>
                                            <select 
                                                value={simToCanton} 
                                                onChange={e => setSimToCanton(e.target.value)}
                                                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                            >
                                                {['Zürich', 'Bern', 'Luzern', 'Zug', 'Schwyz', 'Aargau'].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Income Slider */}
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">
                                            {simEntityType === 'BUSINESS' ? 'Reingewinn vor Steuern' : 'Steuerbares Einkommen'}
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="range" 
                                                min={50000} 
                                                max={1000000} 
                                                step={10000}
                                                value={simIncome}
                                                onChange={e => setSimIncome(Number(e.target.value))}
                                                className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                                            />
                                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 min-w-[100px] text-right">
                                                CHF {(simIncome/1000).toFixed(0)}k
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Result Visualization */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-6">Geschätzte Steuerlast (pro Jahr)</h4>
                                
                                {/* Comparison Bars */}
                                <div className="space-y-6">
                                    {/* From */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500">{simFromCanton} (Aktuell)</span>
                                            <span className="font-mono font-medium">CHF {taxFrom.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                        </div>
                                        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-400" style={{ width: '100%' }}></div>
                                        </div>
                                    </div>

                                    {/* To */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500">{simToCanton} (Ziel)</span>
                                            <span className="font-mono font-bold text-brand-600">CHF {taxTo.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                        </div>
                                        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand-500" style={{ width: `${(taxTo / taxFrom) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Delta */}
                                <div className={`mt-6 p-4 rounded-lg flex items-center justify-between ${savings > 0 ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-red-50 border border-red-100 text-red-800'}`}>
                                    <div className="flex items-center gap-2">
                                        {savings > 0 ? <TrendingDown size={20}/> : <ArrowRight size={20} className="rotate-45"/>}
                                        <span className="font-bold">{savings > 0 ? 'Potenzielle Ersparnis' : 'Mehrkosten'}</span>
                                    </div>
                                    <span className="text-xl font-bold font-mono">CHF {Math.abs(savings).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 italic">*Schätzung basierend auf indikativen Steuerfüssen. Ohne Gewähr.</p>
                            </div>
                        </div>

                        {/* Right: Action Plan (AI) */}
                        <div className="flex flex-col h-full">
                            <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <CheckSquare size={18} className="text-purple-600" />
                                        Umzugs-Fahrplan
                                    </h3>
                                    {isAIEnabled && (
                                        <Button 
                                            size="sm" 
                                            variant="secondary" 
                                            className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-none"
                                            onClick={handleGenerateRelocationChecklist}
                                            disabled={isGeneratingChecklist}
                                            icon={isGeneratingChecklist ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>}
                                        >
                                            {isGeneratingChecklist ? 'Plane...' : 'Plan erstellen'}
                                        </Button>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {!relocationChecklist ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8">
                                            <MapPin size={48} className="mb-4 opacity-20" />
                                            <p className="text-sm">
                                                Lassen Sie die KI eine massgeschneiderte Checkliste für den Wechsel von <strong>{simFromCanton}</strong> nach <strong>{simToCanton}</strong> erstellen.
                                            </p>
                                            <p className="text-xs mt-2 opacity-60">Berücksichtigt: Handelsregister, Notar, Steueramt & AHV.</p>
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                                            <div dangerouslySetInnerHTML={{ __html: relocationChecklist }} />
                                        </div>
                                    )}
                                </div>
                                
                                {relocationChecklist && (
                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                                        <Button variant="outline" icon={<Download size={16}/>}>Als PDF Exportieren</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* DETAIL MODAL */}
            {selectedReturn && (
                <Modal
                    isOpen={!!selectedReturn}
                    onClose={() => { setSelectedReturn(null); setAiAdvice(null); }}
                    title="Steuermandat Details"
                    maxWidth="max-w-4xl"
                >
                    <div className="space-y-6">
                        {/* Header Info */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-xl font-bold text-brand-600 shadow-sm">
                                    {selectedReturn.canton.substring(0,2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        {getClient(selectedReturn.clientId)?.firstName} {getClient(selectedReturn.clientId)?.lastName}
                                    </h2>
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><MapPin size={12}/> {selectedReturn.canton}</span>
                                        <span className="flex items-center gap-1"><Calendar size={12}/> Steuerjahr {selectedReturn.year}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <StatusBadge status={selectedReturn.status} />
                                <span className="text-xs text-slate-400">Deadline: {selectedReturn.deadline}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Financials */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    Eckdaten (Vorläufig)
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <span className="text-sm text-slate-500">Nettoeinkommen</span>
                                        <span className="font-mono font-medium"><SensitiveData>CHF {selectedReturn.taxableIncome?.toLocaleString()}</SensitiveData></span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <span className="text-sm text-slate-500">Abzüge Total</span>
                                        <span className="font-mono font-medium text-emerald-600"><SensitiveData>- CHF {selectedReturn.deductionsTotal?.toLocaleString()}</SensitiveData></span>
                                    </div>
                                    
                                    {selectedReturn.notes && (
                                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg">
                                            <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-1">Interne Notiz:</p>
                                            <p className="text-sm text-amber-700 dark:text-amber-300">{selectedReturn.notes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <Button variant="outline" className="w-full" icon={<FileText size={16}/>}>Dokumente ({selectedReturn.documentsCount})</Button>
                                </div>
                            </div>

                            {/* Right: AI Tax Genius */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-6 border border-indigo-100 dark:border-slate-700 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Sparkles size={80} className="text-indigo-600" />
                                </div>
                                
                                <div className="relative z-10">
                                    <h3 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-4">
                                        <Sparkles size={18} />
                                        AI Tax Genius
                                    </h3>
                                    
                                    {!aiAdvice ? (
                                        <div className="text-center py-6">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                                Lassen Sie die KI basierend auf dem Kanton <strong>{selectedReturn.canton}</strong> spezifische Optimierungsmöglichkeiten prüfen.
                                            </p>
                                            <Button 
                                                onClick={handleAiAnalysis} 
                                                disabled={isGeneratingAi || !isAIEnabled}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                                            >
                                                {isGeneratingAi ? <><Loader2 className="animate-spin mr-2" size={16} /> Analysiere...</> : 'Vorschläge generieren'}
                                            </Button>
                                            {!isAIEnabled && <p className="text-xs text-slate-400 mt-2">AI-Features sind in den Einstellungen deaktiviert.</p>}
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <div 
                                                className="prose prose-sm dark:prose-invert text-slate-700 dark:text-slate-300 max-h-64 overflow-y-auto pr-2 custom-scrollbar"
                                                dangerouslySetInnerHTML={{ __html: aiAdvice }}
                                            />
                                            <div className="mt-4 flex gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => setAiAdvice(null)}>Zurücksetzen</Button>
                                                <Button size="sm" variant="outline" icon={<Download size={14}/>}>Als Notiz speichern</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="outline" onClick={() => setSelectedReturn(null)}>Schliessen</Button>
                            <Button>Mandat öffnen</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </Layout>
    );
};
