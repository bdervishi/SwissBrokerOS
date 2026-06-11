import React, { useState, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
import { getAIClient } from '../services/aiService';
import { db } from '../src/services/db';
import { leadsService } from '../src/services/leads';
import { auditService } from '../src/services/audit';
import { useToast } from '../components/ui/Feedback';
import { 
    Upload, 
    FileSpreadsheet, 
    CheckCircle, 
    AlertCircle, 
    ArrowRight, 
    Download, 
    Database, 
    Loader2,
    Sparkles,
    FileType
} from 'lucide-react';

type ImportType = 'CLIENTS' | 'POLICIES' | 'LEADS' | 'TENANTS';

// Expected Fields Definition for Mapping
const SCHEMA_DEFINITIONS: Record<ImportType, { key: string; label: string; required: boolean }[]> = {
    CLIENTS: [
        { key: 'firstName', label: 'Vorname', required: true },
        { key: 'lastName', label: 'Nachname', required: true },
        { key: 'email', label: 'Email', required: true },
        { key: 'address', label: 'Strasse / Nr', required: false },
        { key: 'zipCity', label: 'PLZ / Ort', required: true },
        { key: 'birthDate', label: 'Geburtsdatum', required: false },
    ],
    POLICIES: [
        { key: 'insurer', label: 'Versicherer', required: true },
        { key: 'type', label: 'Branche / Typ', required: true },
        { key: 'policyNumber', label: 'Policen-Nr.', required: true },
        { key: 'premiumAmount', label: 'Jahresprämie', required: true },
        { key: 'startDate', label: 'Beginn', required: true },
        { key: 'endDate', label: 'Ablauf', required: true },
    ],
    LEADS: [
        { key: 'company', label: 'Firmenname', required: true },
        { key: 'contactPerson', label: 'Kontaktperson', required: false },
        { key: 'email', label: 'Email', required: false },
        { key: 'city', label: 'Ort', required: true },
        { key: 'status', label: 'Status', required: false },
    ],
    TENANTS: [
        { key: 'name', label: 'Firmenname', required: true },
        { key: 'adminEmail', label: 'Admin Email', required: true },
        { key: 'plan', label: 'SaaS Plan', required: true },
    ]
};

export const DataImport: React.FC = () => {
    const { role, user } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [activeType, setActiveType] = useState<ImportType>(role === UserRole.SAAS_SUPER_ADMIN ? 'TENANTS' : 'CLIENTS');
    const [step, setStep] = useState<'UPLOAD' | 'MAPPING' | 'REVIEW' | 'SUCCESS'>('UPLOAD');
    const [file, setFile] = useState<File | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvPreview, setCsvPreview] = useState<string[][]>([]);
    const [csvRows, setCsvRows] = useState<string[][]>([]); // ALL data rows
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);

    // Access Control
    if (role === UserRole.CLIENT) {
        return <Navigate to="/dashboard" />;
    }

    // Determine available types based on role
    const availableTypes: { id: ImportType; label: string }[] = [];
    if (role?.includes('BROKER')) {
        availableTypes.push({ id: 'CLIENTS', label: 'Klienten & Stammdaten' });
        availableTypes.push({ id: 'POLICIES', label: 'Versicherungspolicen' });
        availableTypes.push({ id: 'LEADS', label: 'Leads & Interessenten' });
    }
    if (role?.includes('SAAS')) {
        availableTypes.push({ id: 'TENANTS', label: 'Tenants (Maklerfirmen)' });
        // SaaS might also want to import leads for acquisition
        availableTypes.push({ id: 'LEADS', label: 'SaaS Leads' });
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            parseCSV(uploadedFile);
        }
    };

    // CSV parser supporting quoted fields, commas and semicolons, CRLF.
    const splitLine = (line: string, delim: string): string[] => {
        const out: string[] = []; let cur = ''; let inQ = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ;
            } else if (ch === delim && !inQ) { out.push(cur); cur = ''; }
            else cur += ch;
        }
        out.push(cur);
        return out.map(c => c.trim());
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = (evt.target?.result as string).replace(/\r/g, '');
            const lines = text.split('\n').filter(l => l.trim().length > 0);
            if (lines.length === 0) return;
            const delim = (lines[0].match(/;/g)?.length || 0) > (lines[0].match(/,/g)?.length || 0) ? ';' : ',';
            const headers = splitLine(lines[0], delim);
            const rows = lines.slice(1).map(l => splitLine(l, delim));
            setCsvHeaders(headers);
            setCsvRows(rows);
            setCsvPreview(rows.slice(0, 3));
            suggestMappingWithAI(headers);
            setStep('MAPPING');
        };
        reader.readAsText(file);
    };

    // Build an entity object from a CSV row using the column mapping.
    const rowToEntity = (row: string[]): Record<string, string> => {
        const e: Record<string, string> = {};
        for (const f of SCHEMA_DEFINITIONS[activeType]) {
            const header = Object.keys(columnMapping).find(k => columnMapping[k] === f.key);
            const idx = header ? csvHeaders.indexOf(header) : -1;
            e[f.key] = idx >= 0 ? (row[idx] ?? '').trim() : '';
        }
        return e;
    };

    const suggestMappingWithAI = async (headers: string[]) => {
        setIsAnalyzing(true);

        try {
            const ai = getAIClient();
            const targetFields = SCHEMA_DEFINITIONS[activeType].map(f => f.key);
            
            const prompt = `
                Ich importiere eine CSV Datei. Mappe die CSV-Header auf meine internen Datenbank-Felder.
                
                CSV Header: ${JSON.stringify(headers)}
                Meine Datenbank Felder: ${JSON.stringify(targetFields)}
                
                Regeln:
                - Versuche Synonyme zu finden (z.B. "Strasse" -> "address", "Prämie" -> "premiumAmount").
                - Wenn du dir nicht sicher bist, lasse das Feld leer.
                
                Gib mir NUR ein JSON Objekt zurück: { "csvHeaderName": "databaseFieldName" }
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });

            const text = response.text;
            if (text) {
                const mapping = JSON.parse(text);
                setColumnMapping(mapping);
            }
        } catch (e) {
            console.error("AI Mapping Error", e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleImport = async () => {
        setIsImporting(true);
        const tenantId = user?.tenantId;
        const errors: string[] = [];
        let created = 0, skipped = 0;

        try {
            for (let i = 0; i < csvRows.length; i++) {
                const e = rowToEntity(csvRows[i]);
                // required-field validation
                const missing = SCHEMA_DEFINITIONS[activeType].filter(f => f.required && !e[f.key]);
                if (missing.length) { skipped++; if (errors.length < 5) errors.push(`Zeile ${i + 2}: ${missing.map(m => m.label).join(', ')} fehlt`); continue; }
                try {
                    if (activeType === 'CLIENTS') {
                        await db.clients.create({
                            tenantId, advisorId: user?.id, type: 'PRIVATE',
                            firstName: e.firstName, lastName: e.lastName, email: e.email,
                            address: e.address || '', zipCity: e.zipCity, birthDate: e.birthDate || null,
                            taxDomicile: '', username: `${e.firstName}.${e.lastName}`.toLowerCase().replace(/\s+/g, ''),
                            role: UserRole.CLIENT, avatarUrl: '',
                        } as any);
                        created++;
                    } else if (activeType === 'LEADS') {
                        await leadsService.create({
                            tenantId, name: e.company, city: e.city,
                            status: (e.status as any) || 'NEW', source: 'Import', potentialValue: 0,
                            address: '', type: 'OTHER', aiInsightScore: 0, interests: [],
                            contacts: e.contactPerson || e.email ? [{ id: '', name: e.contactPerson || e.company, role: '', email: e.email || '', phone: '', isPrimary: true } as any] : [],
                            activities: [], tasks: [], offers: [],
                        } as any);
                        created++;
                    } else if (activeType === 'POLICIES') {
                        await db.policies.create({
                            tenantId, insurer: e.insurer, type: e.type, policyNumber: e.policyNumber,
                            premiumAmount: Number((e.premiumAmount || '').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0,
                            premiumFrequency: 'Jährlich', status: 'ACTIVE',
                            startDate: e.startDate || null, endDate: e.endDate || null,
                        } as any);
                        created++;
                    } else {
                        skipped++;
                    }
                } catch (rowErr: any) {
                    skipped++;
                    if (errors.length < 5) errors.push(`Zeile ${i + 2}: ${rowErr?.message || 'Fehler'}`);
                }
            }

            auditService.log({ tenantId, actorId: user?.id, actorName: user ? `${user.firstName} ${user.lastName}` : null, action: 'BULK_IMPORT', entityType: activeType, summary: `Import ${activeType}: ${created} erstellt, ${skipped} übersprungen` });
            setResult({ created, skipped, errors });
            if (created > 0) toast.success(`${created} Datensätze importiert.`);
            if (created === 0) toast.warning('Keine Datensätze importiert — bitte Mapping prüfen.');
            setStep('SUCCESS');
        } finally {
            setIsImporting(false);
        }
    };

    const resetImport = () => {
        setFile(null);
        setCsvHeaders([]);
        setCsvRows([]);
        setCsvPreview([]);
        setColumnMapping({});
        setResult(null);
        setStep('UPLOAD');
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Database className="text-brand-600" />
                    Data Import Center
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Migrieren Sie bestehende Daten via CSV. Die KI hilft beim Zuordnen der Spalten.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Steps Sidebar */}
                <div className="space-y-2">
                    <StepItem number={1} label="Typ wählen" active={step === 'UPLOAD'} completed={step !== 'UPLOAD'} />
                    <StepItem number={2} label="Mapping" active={step === 'MAPPING'} completed={step === 'REVIEW' || step === 'SUCCESS'} />
                    <StepItem number={3} label="Überprüfung" active={step === 'REVIEW'} completed={step === 'SUCCESS'} />
                    <StepItem number={4} label="Import" active={step === 'SUCCESS'} completed={step === 'SUCCESS'} />
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    
                    {step === 'UPLOAD' && (
                        <div className="space-y-6">
                            <Card title="1. Was möchten Sie importieren?">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    {availableTypes.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setActiveType(t.id)}
                                            className={`p-4 rounded-xl border text-left transition-all ${
                                                activeType === t.id 
                                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500' 
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-300'
                                            }`}
                                        >
                                            <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">{t.label}</div>
                                            <div className="text-xs text-slate-500">CSV Import</div>
                                        </button>
                                    ))}
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <input 
                                            type="file" 
                                            accept=".csv" 
                                            className="hidden" 
                                            ref={fileInputRef} 
                                            onChange={handleFileUpload} 
                                        />
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
                                            <Upload size={32} />
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">CSV Datei hier ablegen</h3>
                                        <p className="text-slate-500 text-sm mb-6">oder klicken zum Auswählen</p>
                                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); /* Mock Download */ }}>
                                            <Download size={14} className="mr-2" />
                                            Muster-Vorlage herunterladen
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {step === 'MAPPING' && (
                        <Card title="2. Spalten zuordnen">
                            <div className="mb-6 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                <div className="flex items-center gap-3">
                                    {isAnalyzing ? <Loader2 className="animate-spin text-blue-600" /> : <Sparkles className="text-blue-600" />}
                                    <div>
                                        <p className="font-bold text-blue-900 dark:text-blue-100 text-sm">
                                            {isAnalyzing ? 'KI analysiert Datei...' : 'KI-Vorschlag angewendet'}
                                        </p>
                                        {!isAnalyzing && <p className="text-xs text-blue-700 dark:text-blue-300">Bitte überprüfen Sie die Zuordnung.</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {SCHEMA_DEFINITIONS[activeType].map((field) => {
                                    // Find which CSV header is mapped to this field
                                    const mappedHeader = Object.keys(columnMapping).find(key => columnMapping[key] === field.key);
                                    
                                    return (
                                        <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-3 border border-slate-100 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900 dark:text-slate-100">{field.label}</span>
                                                    {field.required && <span className="text-xs text-red-500 font-bold">*</span>}
                                                </div>
                                                <span className="text-xs text-slate-400 font-mono">{field.key}</span>
                                            </div>
                                            <div>
                                                <select 
                                                    className={`w-full p-2 rounded-lg border text-sm ${mappedHeader ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}
                                                    value={mappedHeader || ''}
                                                    onChange={(e) => {
                                                        const header = e.target.value;
                                                        // Update mapping: Remove old mapping for this field, add new
                                                        const newMap = { ...columnMapping };
                                                        // Remove any existing mapping pointing to this field
                                                        Object.keys(newMap).forEach(k => { if(newMap[k] === field.key) delete newMap[k] });
                                                        if (header) newMap[header] = field.key;
                                                        setColumnMapping(newMap);
                                                    }}
                                                >
                                                    <option value="">-- Nicht importieren --</option>
                                                    {csvHeaders.map(h => (
                                                        <option key={h} value={h}>{h} (CSV)</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex justify-between">
                                <Button variant="ghost" onClick={resetImport}>Abbrechen</Button>
                                <Button onClick={() => setStep('REVIEW')} icon={<ArrowRight size={18}/>}>Weiter zur Vorschau</Button>
                            </div>
                        </Card>
                    )}

                    {step === 'REVIEW' && (
                        <Card title="3. Vorschau & Import">
                            <div className="mb-6">
                                <p className="text-sm text-slate-500 mb-4">
                                    Die ersten 3 Zeilen, basierend auf Ihrem Mapping:
                                </p>
                                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-900 font-medium text-slate-500">
                                            <tr>
                                                {SCHEMA_DEFINITIONS[activeType].map(f => (
                                                    <th key={f.key} className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                                                        {f.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {csvPreview.map((row, idx) => (
                                                <tr key={idx}>
                                                    {SCHEMA_DEFINITIONS[activeType].map(f => {
                                                        // Find CSV index for this field
                                                        const headerName = Object.keys(columnMapping).find(k => columnMapping[k] === f.key);
                                                        const colIndex = headerName ? csvHeaders.indexOf(headerName) : -1;
                                                        const val = colIndex >= 0 ? row[colIndex] : '-';
                                                        return <td key={f.key} className="px-4 py-2 text-slate-700 dark:text-slate-300">{val}</td>
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                                <div className="text-sm">
                                    <span className="font-bold text-slate-900 dark:text-slate-100">Total Datensätze:</span> {csvRows.length}
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="ghost" onClick={() => setStep('MAPPING')}>Zurück</Button>
                                    <Button 
                                        onClick={handleImport} 
                                        disabled={isImporting}
                                        icon={isImporting ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={18}/>}
                                    >
                                        {isImporting ? 'Importiere...' : 'Import starten'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {step === 'SUCCESS' && (
                        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Import abgeschlossen</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-4 text-center max-w-md">
                                <span className="font-bold text-emerald-600">{result?.created ?? 0}</span> Datensätze importiert
                                {(result?.skipped ?? 0) > 0 && <> · <span className="font-bold text-amber-600">{result?.skipped}</span> übersprungen</>}.
                                Sie finden die Daten nun in der entsprechenden Übersicht.
                            </p>
                            {result && result.errors.length > 0 && (
                                <div className="mb-8 w-full max-w-md text-xs bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 text-amber-700 dark:text-amber-300">
                                    <p className="font-bold mb-1">Übersprungene Zeilen (Auszug):</p>
                                    <ul className="list-disc list-inside space-y-0.5">{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                                </div>
                            )}
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={resetImport}>Weitere Datei importieren</Button>
                                <Button onClick={() => window.location.href = '/dashboard'}>Zum Dashboard</Button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
};

const StepItem = ({ number, label, active, completed }: { number: number, label: string, active: boolean, completed: boolean }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${active ? 'bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800' : 'opacity-60'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            completed ? 'bg-emerald-500 text-white' : 
            active ? 'bg-brand-600 text-white' : 
            'bg-slate-200 dark:bg-slate-800 text-slate-500'
        }`}>
            {completed ? <CheckCircle size={16} /> : number}
        </div>
        <span className={`font-medium ${active ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>{label}</span>
    </div>
);
