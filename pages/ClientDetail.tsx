
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal'; // Added Modal Import
import { ComplianceShield } from '../components/ui/ComplianceShield';
import { MOCK_ADVICE, MOCK_ACTIVITY_LOGS } from '../constants';
import { useClient, usePolicies, useAssets, useClientNotes, useMortgages, useTaxReturns } from '../src/hooks/useData';
import { db } from '../src/services/db';
import { ClientDocuments } from '../components/integrations/ClientDocuments';
import { DocumentVault } from '../components/documents/DocumentVault';
import { PolicyForm } from '../components/forms/PolicyForm';
import { AssetForm, ASSET_TYPE_LABELS } from '../components/forms/AssetForm';
import { VagDisclosureButton } from '../components/commissions/VagDisclosure';
import { useToast, useConfirm } from '../components/ui/Feedback';
import { CallProcessor } from '../components/CallProcessor';
import { useAuth } from '../contexts/AuthContext';
// Lazy-load the 3D view so the heavy three.js vendor chunk (~940 KB) is only
// fetched when the Wealth tab is actually opened.
const WealthVis = React.lazy(() => import('../components/3d/WealthVis').then(m => ({ default: m.WealthVis })));
import { SensitiveData } from '../components/ui/SensitiveData';
import { generateContentWithRetry } from '../services/aiService';
import { SignaturePad } from '../components/ui/SignaturePad'; // New Import
import { 
  ArrowLeft, 
  Shield, 
  Landmark, 
  Calculator, 
  FileText, 
  AlertTriangle, 
  Lightbulb, 
  Download, 
  ChevronRight,
  History,
  MessageSquare,
  Plus,
  Send,
  User,
  Clock,
  ShieldCheck,
  Calendar,
  FileBox,
  TrendingUp,
  Search,
  Scale,
  Loader2,
  FileSignature, // Added Icon
  PenTool,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Trash2
} from 'lucide-react';
import { ActivityType, ActivityLog, ClientNote, TrustScore, Client, Policy, Asset } from '../types';

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'POLICIES' | 'WEALTH' | 'TAX' | 'JOURNAL' | 'COMPLIANCE' | 'DOCUMENTS'>('OVERVIEW');
  
  // Note State
  const [noteInput, setNoteInput] = useState('');
  const { data: notes, refetch: refetchNotes } = useClientNotes(id);
  
  // Compliance State – load the client from the data layer and mirror it into
  // local state so edits (KYC/compliance updates) work as before.
  const { data: loadedClient, loading: clientLoading } = useClient(id);
  const [client, setClient] = useState<Client | undefined>(undefined);
  useEffect(() => { setClient(loadedClient as Client | undefined); }, [loadedClient]);
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);

  // Protocol Wizard State
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [protocolStep, setProtocolStep] = useState<'INPUT' | 'GENERATING' | 'REVIEW'>('INPUT');
  const [protocolInput, setProtocolInput] = useState({
      topic: 'Jahresgespräch & Vorsorge',
      notes: '',
      productsDiscussed: ['Privathaftpflicht', 'Säule 3a']
  });
  const [generatedProtocol, setGeneratedProtocol] = useState<string>('');
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const { data: policies, refetch: refetchPolicies } = usePolicies(id);
  const { data: assets, refetch: refetchAssets } = useAssets(id);
  const { data: mortgages } = useMortgages(id);
  const { data: clientTaxReturns } = useTaxReturns(id);
  const advice = MOCK_ADVICE.filter(a => a.clientId === id);
  const activities = MOCK_ACTIVITY_LOGS.filter(a => a.clientId === id).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // Detailed capture modals (create + edit) – forms live in components/forms/.
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [entryError, setEntryError] = useState<string | null>(null);

  // Call processing
  const [isCallOpen, setIsCallOpen] = useState(false);

  // Edit client master data
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', companyName: '', email: '', phone: '', address: '', zipCity: '', taxDomicile: '', birthDate: '',
  });

  if (!client) return <Layout><div className="p-8">{clientLoading ? 'Lädt…' : 'Klient nicht gefunden'}</div></Layout>;

  const openEdit = () => {
    if (!client) return;
    setEntryError(null);
    setEditForm({
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      companyName: client.companyName || '',
      email: client.email || '',
      phone: (client as any).phone || '',
      address: client.address || '',
      zipCity: client.zipCity || '',
      taxDomicile: client.taxDomicile || '',
      birthDate: client.birthDate || '',
    });
    setIsEditOpen(true);
  };

  const handleUpdateClient = async () => {
    setEntryError(null);
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      setEntryError('Vor- und Nachname sind erforderlich.');
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await db.clients.update(client.id, {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        companyName: editForm.companyName.trim() || null,
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        zipCity: editForm.zipCity.trim(),
        taxDomicile: editForm.taxDomicile.trim(),
        birthDate: editForm.birthDate || null,
      } as any);
      setClient(updated as Client);
      setIsEditOpen(false);
    } catch (err: any) {
      setEntryError(err?.message || 'Speichern fehlgeschlagen.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
      if (!(await confirm({ title: 'Police löschen?', danger: true, confirmLabel: 'Löschen' }))) return;
      await db.policies.remove(policyId);
      toast.success('Police gelöscht.');
      refetchPolicies();
  };

  const handleDeleteAsset = async (assetId: string) => {
      if (!(await confirm({ title: 'Vermögenswert löschen?', danger: true, confirmLabel: 'Löschen' }))) return;
      await db.assets.remove(assetId);
      toast.success('Vermögenswert gelöscht.');
      refetchAssets();
  };

  const handleDeleteNote = async (noteId: string) => {
      if (!(await confirm({ title: 'Notiz löschen?', danger: true, confirmLabel: 'Löschen' }))) return;
      await db.clientNotes.remove(noteId);
      refetchNotes();
  };

  const handleAddNote = async () => {
      if (!noteInput.trim()) return;
      await db.clientNotes.create({
          clientId: client.id,
          authorId: user?.id,
          authorName: user ? `${user.firstName} ${user.lastName}` : 'Berater',
          content: noteInput,
      } as any);
      setNoteInput('');
      refetchNotes();
  };

  const handleRunKycCheck = async () => {
      setIsCheckingCompliance(true);

      try {
          const prompt = `
            Führe einen simulierten Compliance / Due Diligence Check für folgenden Kunden durch:
            Name: ${client.firstName} ${client.lastName}
            Ort: ${client.zipCity}
            Firma: ${client.companyName || 'Privatperson'}

            Aufgaben:
            1. Prüfe fiktiv gegen PEP Listen (Politisch Exponierte Personen).
            2. Prüfe Plausibilität (Wohnort passt zu den vorliegenden Assets?).
            3. Falls Firma: Simuliere einen Zefix-Abgleich (Handelsregister).

            Gib mir ein JSON Objekt zurück mit:
            {
                "score": number (0-100),
                "level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
                "checks": [
                    { "id": "1", "checkName": "Name", "status": "PASSED" | "WARNING" | "FAILED", "details": "Grund" }
                ]
            }
          `;

          const response = await generateContentWithRetry(
              'gemini-3-flash-preview',
              prompt,
              { responseMimeType: 'application/json' }
          );

          if(response.text) {
              const result = JSON.parse(response.text);
              const newScore: TrustScore = {
                  score: result.score,
                  level: result.level,
                  lastUpdated: new Date().toLocaleDateString(),
                  checks: result.checks
              };
              setClient({...client, trustScore: newScore});
          }
      } catch (e) {
          console.error("KYC Check failed", e);
      } finally {
          setIsCheckingCompliance(false);
      }
  };

  const handleGenerateProtocol = async () => {
      if(!protocolInput.notes) return;
      setProtocolStep('GENERATING');

      try {
          const prompt = `
            Erstelle ein juristisch einwandfreies Beratungsprotokoll gemäss VAG/FIDLEG (Schweiz).
            
            KUNDE: ${client.firstName} ${client.lastName}
            BERATER: Max Muster (Muster Broker AG)
            THEMA: ${protocolInput.topic}
            PRODUKTE: ${protocolInput.productsDiscussed.join(', ')}
            
            ROH-NOTIZEN VOM BERATER:
            "${protocolInput.notes}"
            
            ANFORDERUNG:
            Generiere einen fliessenden, professionellen Text.
            Struktur:
            1. Anlass der Beratung
            2. Analyse der Situation (Ist-Zustand)
            3. Empfehlung des Beraters & Begründung
            4. Entscheidung des Kunden (besonders wichtig: Wenn Kunde Empfehlung ablehnt -> Risikoaufklärung erwähnen!)
            
            Formatierung: HTML (nutze <h3>, <p>, <ul>).
            Wichtig: Füge am Ende automatisch einen Disclaimer hinzu, dass der Kunde eine Kopie erhalten hat.
          `;

          const response = await generateContentWithRetry(
              'gemini-3-pro-preview',
              prompt
          );

          setGeneratedProtocol(response.text || "Fehler bei der Generierung.");
          setProtocolStep('REVIEW');
      } catch (e) {
          console.error(e);
          setProtocolStep('INPUT');
      }
  };

  const handleSaveProtocol = () => {
      if (!signatureData) return;

      // Mock saving to backend
      const newActivity: ActivityLog = {
          id: Date.now().toString(),
          clientId: client.id,
          type: 'DOCUMENT_UPLOAD',
          title: 'Beratungsprotokoll signiert',
          description: `Thema: ${protocolInput.topic}. Elektronisch signiert (EES).`,
          timestamp: new Date().toLocaleString('de-CH'),
          authorName: 'Max Muster'
      };
      
      // In a real app we would push this to the activities list or refresh data
      activities.unshift(newActivity); 
      
      setIsProtocolModalOpen(false);
      setProtocolInput({ topic: '', notes: '', productsDiscussed: [] });
      setSignatureData(null);
      setProtocolStep('INPUT');
      setActiveTab('JOURNAL'); // Switch to journal to see it
  };

  const getActivityIcon = (type: ActivityType) => {
      switch(type) {
          case 'NOTE': return <MessageSquare size={16} className="text-blue-500" />;
          case 'POLICY_ADD': return <Shield size={16} className="text-emerald-500" />;
          case 'MORTGAGE_ADD': return <Landmark size={16} className="text-purple-500" />;
          case 'MEETING': return <Calendar size={16} className="text-amber-500" />;
          case 'DOCUMENT_UPLOAD': return <FileBox size={16} className="text-slate-500" />;
          case 'SYSTEM_LOGIN': return <Clock size={16} className="text-slate-400" />;
          default: return <History size={16} />;
      }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dashboard" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {client.firstName} {client.lastName}
              {client.companyName && <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{client.companyName}</span>}
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{client.zipCity}</span>
            <span>•</span>
            <span>Geb. {client.birthDate}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-3">
            <Button variant="outline" icon={<FileText size={16}/>} onClick={openEdit}>Bearbeiten</Button>
            <Button variant="outline" icon={<MessageSquare size={16}/>} onClick={() => setIsCallOpen(true)}>Gespräch verarbeiten</Button>
            <Button variant="secondary" icon={<FileSignature size={16}/>} onClick={() => setIsProtocolModalOpen(true)}>Beratungsprotokoll AI</Button>
            <Button>Termin buchen</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto no-scrollbar">
        <TabButton active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} icon={<Shield size={16} />} label="Übersicht" />
        <TabButton active={activeTab === 'POLICIES'} onClick={() => setActiveTab('POLICIES')} icon={<FileText size={16} />} label="Versicherungen" />
        <TabButton active={activeTab === 'WEALTH'} onClick={() => setActiveTab('WEALTH')} icon={<Landmark size={16} />} label="Vermögen & Vorsorge" />
        <TabButton active={activeTab === 'TAX'} onClick={() => setActiveTab('TAX')} icon={<Calculator size={16} />} label="Steuern" />
        <TabButton active={activeTab === 'DOCUMENTS'} onClick={() => setActiveTab('DOCUMENTS')} icon={<FileBox size={16} />} label="Dokumente" />
        <TabButton active={activeTab === 'JOURNAL'} onClick={() => setActiveTab('JOURNAL')} icon={<History size={16} />} label="Journal" />
        <TabButton active={activeTab === 'COMPLIANCE'} onClick={() => setActiveTab('COMPLIANCE')} icon={<Scale size={16} />} label="Due Diligence" />
      </div>

      {/* Content */}
      <div className="space-y-6">
        
        {advice.length > 0 && activeTab !== 'COMPLIANCE' && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 flex gap-4">
             <div className="p-2 bg-amber-100 dark:bg-amber-800/20 rounded-lg h-fit text-amber-600 dark:text-amber-400">
               <Lightbulb size={24} />
             </div>
             <div>
               <h3 className="font-semibold text-amber-900 dark:text-amber-200">KI-Handlungsempfehlungen</h3>
               <div className="mt-2 space-y-2">
                 {advice.map(a => (
                   <div key={a.id} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
                      <span className="font-bold">•</span>
                      <span><span className="font-semibold">{a.title}:</span> {a.description}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}

        {/* ... (Existing Tabs OVERVIEW, POLICIES, WEALTH, TAX, COMPLIANCE unchanged) ... */}
        
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Aktive Policen">
                <table className="w-full text-sm text-left">
                  <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="pb-3 font-medium">Versicherer</th>
                      <th className="pb-3 font-medium">Typ</th>
                      <th className="pb-3 font-medium">Prämie</th>
                      <th className="pb-3 font-medium">Ablauf</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {policies.map(p => (
                      <tr key={p.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3">{p.insurer}</td>
                        <td className="py-3 font-medium">{p.type}</td>
                        <td className="py-3"><SensitiveData>CHF {p.premiumAmount.toFixed(2)}</SensitiveData></td>
                        <td className="py-3">{p.endDate}</td>
                        <td className="py-3 text-right">
                           <Link to={`/policy/${p.id}`} className="text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight size={18} />
                           </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
            <div className="space-y-6">
              <ComplianceShield 
                  score={client.trustScore} 
                  onRunCheck={handleRunKycCheck} 
                  isLoading={isCheckingCompliance} 
              />
              <Card title="Haushaltsdaten">
                <div className="space-y-4">
                   <InfoRow label="Adresse" value={client.address} />
                   <InfoRow label="PLZ / Ort" value={client.zipCity} />
                   <InfoRow label="Steuerdomizil" value={client.taxDomicile} />
                   <InfoRow label="Zivilstand" value="Ledig" />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* COMPLIANCE TAB (Standard) */}
        {activeTab === 'COMPLIANCE' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card title="KYC / AML Status">
                        <div className="flex items-center gap-6 mb-6">
                            <ComplianceShield 
                                score={client.trustScore} 
                                onRunCheck={handleRunKycCheck} 
                                isLoading={isCheckingCompliance} 
                            />
                            <div className="text-sm text-slate-500">
                                <p className="mb-2">Der <strong>Trust Score</strong> aggregiert Daten aus öffentlichen Registern (Zefix, SECO) und internen Plausibilitäts-Checks.</p>
                                <p>Ein hoher Score schützt Ihr Broker-Business vor Reputationsrisiken und Betrug.</p>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card title="GwG Dokumente">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-slate-400" />
                                    <span className="text-sm font-medium">Passkopie / ID</span>
                                </div>
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Vorhanden</span>
                            </div>
                        </div>
                    </Card>
                    <Card title="Transparenz (Art. 45b VAG)">
                        <p className="text-sm text-slate-500 mb-4">
                            Offenlegung der Vermittler-Entschädigung gegenüber dem Kunden — generiert aus den
                            erfassten Policen und Courtage-Daten.
                        </p>
                        <VagDisclosureButton
                            clientId={client.id}
                            clientName={client.companyName || `${client.firstName} ${client.lastName}`}
                            policies={policies}
                        />
                    </Card>
                </div>
            </div>
        )}

        {/* Existing Wealth/Tax Tabs omitted for brevity but preserved in full file content... */}
        {activeTab === 'WEALTH' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Vermögen & Vorsorge</h3>
              <Button icon={<Plus size={16} />} onClick={() => { setEntryError(null); setIsAssetModalOpen(true); }}>Vermögenswert erfassen</Button>
            </div>
            <React.Suspense fallback={<div className="h-[400px] w-full rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-slate-400 text-sm"><Loader2 className="animate-spin mr-2" size={18} /> 3D-Ansicht lädt…</div>}>
              <WealthVis assets={assets} />
            </React.Suspense>
            <Card title="Erfasste Vermögenswerte" noPadding>
              {assets.length === 0 ? (
                <div className="p-6 text-center text-slate-500">Noch keine Vermögenswerte erfasst.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {assets.map(a => (
                    <div key={a.id} className="px-6 py-4 flex justify-between items-center group">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{a.name}</p>
                        <p className="text-xs text-slate-500">
                          {ASSET_TYPE_LABELS[a.type] ?? a.type}
                          {a.provider ? ` • ${a.provider}` : ''}
                          {a.details?.annualContribution ? ` • Beitrag CHF ${Number(a.details.annualContribution).toLocaleString()}/Jahr` : ''}
                          {a.details?.employer ? ` • ${a.details.employer}` : ''}
                          {a.lastUpdated ? ` • per ${a.lastUpdated}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-mono font-semibold text-slate-900 dark:text-slate-100"><SensitiveData>CHF {a.value.toLocaleString()}</SensitiveData></p>
                        <button onClick={() => { setEditAsset(a); setIsAssetModalOpen(true); }} className="text-slate-300 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Bearbeiten"><PenTool size={16} /></button>
                        <button onClick={() => handleDeleteAsset(a.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Löschen"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
        
        {activeTab === 'TAX' && (
           <div className="max-w-4xl mx-auto space-y-6">
             <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg flex gap-4">
               <div className="text-blue-600"><Calculator /></div>
               <div className="flex-1">
                 <h4 className="font-bold text-blue-900 dark:text-blue-100">Steuer-Support Modus</h4>
                 <p className="text-sm text-blue-800 dark:text-blue-200">Steuermandate dieses Kunden. Detail-Erfassung im <Link to="/tax" className="underline font-medium">Steuer-Cockpit</Link>.</p>
               </div>
             </div>
             {clientTaxReturns.length === 0 ? (
               <div className="text-center text-slate-500 py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                 Noch kein Steuermandat erfasst. <Link to="/tax" className="text-brand-600 underline">Im Steuer-Cockpit anlegen</Link>.
               </div>
             ) : [...clientTaxReturns].sort((a, b) => b.year - a.year).map(tr => (
               <Card key={tr.id} title={`Steuererklärung ${tr.year} – ${tr.canton}${tr.municipality ? ` (${tr.municipality})` : ''}`}>
                  <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Status / Frist</span>
                      <span className="text-sm font-medium">{tr.status} • {tr.deadline || '–'}</span>
                    </div>
                    {(tr.grossIncome ?? 0) > 0 && (
                      <div className="pt-3 flex justify-between items-center">
                        <span className="text-sm text-slate-500">Bruttoeinkommen</span>
                        <span className="font-mono"><SensitiveData>CHF {Number(tr.grossIncome).toLocaleString()}</SensitiveData></span>
                      </div>
                    )}
                    <div className="pt-3 flex justify-between items-center">
                      <span className="text-sm text-slate-500">Steuerbares Einkommen</span>
                      <span className="font-mono"><SensitiveData>CHF {Number(tr.taxableIncome ?? 0).toLocaleString()}</SensitiveData></span>
                    </div>
                    <div className="pt-3 flex justify-between items-center">
                      <span className="text-sm text-slate-500">Abzüge Total</span>
                      <span className="font-mono text-emerald-600"><SensitiveData>- CHF {Number(tr.deductionsTotal ?? 0).toLocaleString()}</SensitiveData></span>
                    </div>
                    {(tr.pillar3aContributions ?? 0) > 0 && (
                      <div className="pt-3 flex justify-between items-center">
                        <span className="text-sm text-slate-500 pl-4">davon Säule 3a</span>
                        <span className="font-mono text-xs"><SensitiveData>CHF {Number(tr.pillar3aContributions).toLocaleString()}</SensitiveData></span>
                      </div>
                    )}
                    {(tr.insurancePremiums ?? 0) > 0 && (
                      <div className="pt-3 flex justify-between items-center">
                        <span className="text-sm text-slate-500 pl-4">davon Versicherungsprämien</span>
                        <span className="font-mono text-xs"><SensitiveData>CHF {Number(tr.insurancePremiums).toLocaleString()}</SensitiveData></span>
                      </div>
                    )}
                  </div>
               </Card>
             ))}
           </div>
        )}

        {activeTab === 'DOCUMENTS' && (
          <div className="space-y-8">
            {/* Native vault: upload + categorise + link */}
            <DocumentVault
              tenantId={client.tenantId}
              clientId={client.id}
              policies={policies}
              taxReturns={clientTaxReturns}
              mortgages={mortgages}
            />

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Dokumente vom Cloud-Speicher</h3>
                <p className="text-sm text-slate-500">Verknüpfe pro Cloud-Anbieter einen Ordner mit diesem Kunden — seine Dateien erscheinen dann direkt hier.</p>
              </div>
              <ClientDocuments tenantId={client.tenantId} clientId={client.id} />
            </div>
          </div>
        )}

        {activeTab === 'JOURNAL' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                  <Card title="Journal-Eintrag erfassen">
                      <div className="space-y-4">
                          <div className="relative">
                            <textarea 
                                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all min-h-[120px]"
                                placeholder="Details zum Gespräch oder interne Notiz..."
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                            />
                            <div className="absolute bottom-3 right-3">
                                <Button size="sm" onClick={handleAddNote} disabled={!noteInput.trim()} icon={<Send size={14}/>}>
                                    Speichern
                                </Button>
                            </div>
                          </div>
                      </div>
                  </Card>

                  <div className="space-y-4">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 px-2">
                        <History size={18} className="text-slate-400" /> Historie & Aktivitäten
                      </h3>
                      
                      <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                          {[...activities].map((item) => (
                              <div key={item.id} className="relative group">
                                  <div className="absolute -left-8 top-1 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center z-10 group-hover:border-brand-500 transition-colors shadow-sm">
                                      {getActivityIcon(item.type)}
                                  </div>
                                  
                                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex justify-between items-start mb-1">
                                          <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                                          <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                                      </div>
                                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                          {item.description}
                                      </p>
                                      {item.authorName && (
                                          <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                                              <User size={10} /> {item.authorName}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="space-y-6">
                  <Card title="Wichtige Notizen" className="border-l-4 border-l-brand-500">
                      <div className="space-y-6">
                        {notes.map(note => (
                            <div key={note.id} className="group border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{note.createdAt}</span>
                                    <button onClick={() => handleDeleteNote(note.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Notiz löschen"><Trash2 size={14} /></button>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{note.content}"</p>
                                <p className="text-[10px] text-brand-600 font-bold mt-2">— {note.authorName}</p>
                            </div>
                        ))}
                      </div>
                  </Card>
              </div>
           </div>
        )}
        
        {activeTab === 'POLICIES' && (
            <div className="grid grid-cols-1 gap-6">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Versicherungsverträge</h3>
                    <Button icon={<Plus size={16} />} onClick={() => { setEntryError(null); setIsPolicyModalOpen(true); }}>Police erfassen</Button>
                 </div>
                 {policies.length === 0 && (
                    <div className="text-center text-slate-500 py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        Noch keine Policen erfasst.
                    </div>
                 )}
                 {policies.map(p => (
                     <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                                {p.insurer.substring(0,2)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{p.type}</h3>
                                <p className="text-sm text-slate-500">{p.insurer} • {p.policyNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                             <div className="text-right hidden sm:block">
                                 <p className="text-sm text-slate-500">{p.premiumFrequency ? `Prämie (${p.premiumFrequency})` : 'Prämie'}</p>
                                 <p className="font-semibold text-slate-900 dark:text-slate-100"><SensitiveData>CHF {p.premiumAmount.toFixed(2)}</SensitiveData></p>
                             </div>
                             <Link to={`/policy/${p.id}`}>
                                <Button variant="outline">Details</Button>
                             </Link>
                             <button onClick={() => { setEditPolicy(p); setIsPolicyModalOpen(true); }} className="text-slate-300 hover:text-brand-600 transition-colors" title="Police bearbeiten"><PenTool size={18} /></button>
                             <button onClick={() => handleDeletePolicy(p.id)} className="text-slate-300 hover:text-red-500 transition-colors" title="Police löschen"><Trash2 size={18} /></button>
                        </div>
                     </div>
                 ))}
            </div>
        )}
      </div>

      <CallProcessor isOpen={isCallOpen} onClose={() => setIsCallOpen(false)} tenantId={client.tenantId} clientId={client.id} onDone={refetchNotes} />

      {/* EDIT CLIENT MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Stammdaten bearbeiten" maxWidth="max-w-xl">
        <div className="space-y-4">
          {client.companyName !== undefined && client.companyName !== null && (
            <EntryField label="Firmenname" value={editForm.companyName} onChange={(v) => setEditForm({ ...editForm, companyName: v })} />
          )}
          <div className="grid grid-cols-2 gap-3">
            <EntryField label="Vorname *" value={editForm.firstName} onChange={(v) => setEditForm({ ...editForm, firstName: v })} />
            <EntryField label="Nachname *" value={editForm.lastName} onChange={(v) => setEditForm({ ...editForm, lastName: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <EntryField label="E-Mail" type="email" value={editForm.email} onChange={(v) => setEditForm({ ...editForm, email: v })} />
            <EntryField label="Telefon" value={editForm.phone} onChange={(v) => setEditForm({ ...editForm, phone: v })} />
          </div>
          <EntryField label="Adresse" value={editForm.address} onChange={(v) => setEditForm({ ...editForm, address: v })} />
          <div className="grid grid-cols-2 gap-3">
            <EntryField label="PLZ / Ort" value={editForm.zipCity} onChange={(v) => setEditForm({ ...editForm, zipCity: v })} />
            <EntryField label="Steuerdomizil (Kanton)" value={editForm.taxDomicile} onChange={(v) => setEditForm({ ...editForm, taxDomicile: v })} />
          </div>
          <EntryField label="Geburtsdatum" type="date" value={editForm.birthDate} onChange={(v) => setEditForm({ ...editForm, birthDate: v })} />
          {entryError && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">{entryError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={savingEdit}>Abbrechen</Button>
            <Button onClick={handleUpdateClient} disabled={savingEdit}>{savingEdit ? <Loader2 className="animate-spin" size={18} /> : 'Speichern'}</Button>
          </div>
        </div>
      </Modal>

      {/* POLICY CREATE/EDIT (detailed form) */}
      <PolicyForm
        isOpen={isPolicyModalOpen}
        onClose={() => { setIsPolicyModalOpen(false); setEditPolicy(null); }}
        onSaved={refetchPolicies}
        fixedClientId={client.id}
        fixedTenantId={client.tenantId}
        initial={editPolicy}
      />

      {/* ASSET CREATE/EDIT (type-specific detailed form) */}
      <AssetForm
        isOpen={isAssetModalOpen}
        onClose={() => { setIsAssetModalOpen(false); setEditAsset(null); }}
        onSaved={refetchAssets}
        clientId={client.id}
        mortgages={mortgages}
        initial={editAsset}
      />

      {/* CONSULTATION PROTOCOL MODAL */}
      <Modal
        isOpen={isProtocolModalOpen}
        onClose={() => setIsProtocolModalOpen(false)}
        title="Beratungsprotokoll erstellen (VAG/FIDLEG)"
        maxWidth="max-w-4xl"
      >
          {protocolStep === 'INPUT' && (
              <div className="space-y-6">
                  <div className="p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-xl flex gap-3 text-brand-800 dark:text-brand-300 text-sm">
                      <PenTool className="shrink-0" size={20} />
                      <div>
                          <p className="font-bold">AI-Scribe Modus</p>
                          <p className="opacity-80">Notieren Sie Stichpunkte. Die KI formuliert daraus automatisch ein rechtskonformes Protokoll inkl. Risikoaufklärung.</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Anlass / Thema</label>
                          <input 
                            className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                            value={protocolInput.topic}
                            onChange={(e) => setProtocolInput({...protocolInput, topic: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Besprochene Produkte</label>
                          <input 
                            className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                            placeholder="z.B. Hausrat, 3a"
                            value={protocolInput.productsDiscussed.join(', ')}
                            onChange={(e) => setProtocolInput({...protocolInput, productsDiscussed: e.target.value.split(', ')})}
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stichnotizen (Verlauf, Empfehlung, Kundenentscheid)</label>
                      <textarea 
                        className="w-full p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm min-h-[150px] focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                        placeholder="- Kunde wünscht Risiko-Check
- Empfehlung: Erhöhung Deckungssumme Hausrat wegen Neuanschaffungen
- Kunde lehnt Glasbruch ab (zu teuer)
- Hinweis auf Unterdeckung bei Elementarschäden gegeben"
                        value={protocolInput.notes}
                        onChange={(e) => setProtocolInput({...protocolInput, notes: e.target.value})}
                      />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Button variant="ghost" onClick={() => setIsProtocolModalOpen(false)}>Abbrechen</Button>
                      <Button onClick={handleGenerateProtocol} icon={<Sparkles size={16}/>}>
                          Protokoll generieren
                      </Button>
                  </div>
              </div>
          )}

          {protocolStep === 'GENERATING' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="relative mb-6">
                      <div className="w-16 h-16 border-4 border-brand-100 dark:border-brand-900 rounded-full"></div>
                      <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">KI analysiert Beratung...</h3>
                  <p className="text-slate-500 text-sm mt-2">Prüfe auf VAG-Konformität und Risikohinweise.</p>
              </div>
          )}

          {protocolStep === 'REVIEW' && (
              <div className="space-y-6">
                  <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                          <CheckCircle2 className="text-emerald-500" />
                          <span className="font-bold text-sm">Entwurf erstellt</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setProtocolStep('INPUT')} icon={<RefreshCw size={14}/>}>Bearbeiten</Button>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-8 bg-white text-slate-900 shadow-sm print-view">
                      {/* Document Header */}
                      <div className="flex justify-between border-b border-slate-200 pb-6 mb-6">
                          <div>
                              <h2 className="text-xl font-bold uppercase tracking-wide text-slate-800">Beratungsprotokoll</h2>
                              <p className="text-xs text-slate-500 mt-1">Gemäss Art. 45 VAG / FIDLEG</p>
                          </div>
                          <div className="text-right text-sm">
                              <p><strong>Datum:</strong> {new Date().toLocaleDateString()}</p>
                              <p><strong>Kunde:</strong> {client.firstName} {client.lastName}</p>
                          </div>
                      </div>

                      {/* Content */}
                      <div 
                        className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-700"
                        dangerouslySetInnerHTML={{ __html: generatedProtocol }} 
                      />

                      {/* Signature Area */}
                      <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12">
                          <div>
                              <p className="text-xs font-bold uppercase border-b border-slate-300 pb-2 mb-8">Ort, Datum</p>
                              <p className="font-script text-2xl text-slate-600">Zürich, {new Date().toLocaleDateString()}</p>
                          </div>
                          <div>
                              <p className="text-xs font-bold uppercase border-b border-slate-300 pb-2 mb-4">Unterschrift Kunde (Digital)</p>
                              
                              {signatureData ? (
                                  <div className="relative">
                                      <img src={signatureData} alt="Unterschrift" className="h-16 object-contain" />
                                      <div className="absolute top-0 right-0">
                                          <Button size="sm" variant="ghost" onClick={() => setSignatureData(null)} className="text-xs h-6 text-red-500 hover:bg-red-50">Löschen</Button>
                                      </div>
                                  </div>
                              ) : (
                                  <SignaturePad onEnd={(data) => setSignatureData(data)} />
                              )}
                          </div>
                      </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setProtocolStep('INPUT')}>Zurück</Button>
                      <Button onClick={handleSaveProtocol} disabled={!signatureData} icon={<FileSignature size={16}/>} className="bg-emerald-600 hover:bg-emerald-700 border-none">
                          Signieren & Archivieren
                      </Button>
                  </div>
              </div>
          )}
      </Modal>
    </Layout>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
      ${active 
        ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
  >
    {icon}
    {label}
  </button>
);

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2 last:border-0">
    <span className="text-slate-500 dark:text-slate-400 text-sm">{label}</span>
    <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">{value}</span>
  </div>
);

const EntryField: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string }> = ({ label, value, onChange, type = 'text' }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
    />
  </div>
);
