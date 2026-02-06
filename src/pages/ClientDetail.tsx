
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ComplianceShield } from '../components/ui/ComplianceShield';
import { MOCK_CLIENTS, MOCK_POLICIES, MOCK_ASSETS, MOCK_ADVICE, MOCK_CLIENT_NOTES, MOCK_ACTIVITY_LOGS, MOCK_PARTNERS } from '../constants';
import { WealthVis } from '../components/3d/WealthVis';
import { SensitiveData } from '../components/ui/SensitiveData';
import { generateContentWithRetry } from '../services/aiService';
import { SignaturePad } from '../components/ui/SignaturePad';
import { 
  ArrowLeft, 
  Shield, 
  Landmark, 
  Calculator, 
  FileText, 
  Lightbulb, 
  ChevronRight, 
  History, 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  Scale, 
  FileSignature, 
  PenTool, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  Presentation, 
  Wand2, 
  X,
  Calendar
} from 'lucide-react';
import { ActivityType, ActivityLog, ClientNote, TrustScore, PartnerCategory } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'POLICIES' | 'WEALTH' | 'TAX' | 'JOURNAL' | 'COMPLIANCE' | 'PITCH'>('OVERVIEW');
  
  // Note State
  const [noteInput, setNoteInput] = useState('');
  const [localNotes, setLocalNotes] = useState<ClientNote[]>(MOCK_CLIENT_NOTES.filter(n => n.clientId === id));
  
  // Compliance State
  const clientData = MOCK_CLIENTS.find(c => c.id === id);
  const [client, setClient] = useState(clientData);
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

  // --- PITCH DECK STATE ---
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [newOffer, setNewOffer] = useState({
    insurer: '',
    premium: 0,
    deductible: 0,
    highlights: ''
  });
  const [isPitchMode, setIsPitchMode] = useState(false);
  const [pitchStep, setPitchStep] = useState(0);
  const [aiArguments, setAiArguments] = useState<string[]>([]);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [simulatedDeductible, setSimulatedDeductible] = useState(500);

  // Data Selectors
  const policies = MOCK_POLICIES.filter(p => p.clientId === id);
  const activePolicies = policies.filter(p => p.status === 'ACTIVE');
  const assets = MOCK_ASSETS.filter(a => a.clientId === id);
  const advice = MOCK_ADVICE.filter(a => a.clientId === id);
  const activities = MOCK_ACTIVITY_LOGS.filter(a => a.clientId === id).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  
  // Pitch Helper Data
  const selectedPolicy = policies.find(p => p.id === selectedPolicyId);
  const insurerOptions = MOCK_PARTNERS.filter(p => p.category === PartnerCategory.INSURANCE).map(p => p.name);

  // Calculations for Pitch
  const calculatePitchPremium = (basePrem: number, currentDed: number, simDed: number) => {
      const deductibleDiffSteps = (simDed - currentDed) / 500; 
      return Math.round(basePrem * (1 - (deductibleDiffSteps * 0.05)));
  };
  const pitchNewPremium = selectedPolicy ? calculatePitchPremium(newOffer.premium, newOffer.deductible, simulatedDeductible) : 0;
  const pitchSavings = selectedPolicy ? selectedPolicy.premiumAmount - pitchNewPremium : 0;

  if (!client) return <Layout><div className="p-8">Klient nicht gefunden</div></Layout>;

  // Handlers
  const handleAddNote = () => {
      if (!noteInput.trim()) return;
      const newNote: ClientNote = {
          id: Date.now().toString(),
          clientId: client.id,
          authorId: 'u_broker_1',
          authorName: 'Max Muster',
          content: noteInput,
          createdAt: new Date().toLocaleString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
      setLocalNotes([newNote, ...localNotes]);
      setNoteInput('');
  };

  const handleRunKycCheck = async () => {
      setIsCheckingCompliance(true);
      try {
          const prompt = `
            Führe einen simulierten Compliance / Due Diligence Check für folgenden Kunden durch:
            Name: ${client.firstName} ${client.lastName}
            Ort: ${client.zipCity}
            Firma: ${client.companyName || 'Privatperson'}
            Gib mir ein JSON Objekt zurück mit score, level und checks array.
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
            THEMA: ${protocolInput.topic}
            ROH-NOTIZEN: "${protocolInput.notes}"
            Formatierung: HTML.
          `;
          const response = await generateContentWithRetry('gemini-3-pro-preview', prompt);
          setGeneratedProtocol(response.text || "Fehler bei der Generierung.");
          setProtocolStep('REVIEW');
      } catch (e) {
          console.error(e);
          setProtocolStep('INPUT');
      }
  };

  const handleSaveProtocol = () => {
      if (!signatureData) return;
      const newActivity: ActivityLog = {
          id: Date.now().toString(),
          clientId: client.id,
          type: 'DOCUMENT_UPLOAD',
          title: 'Beratungsprotokoll signiert',
          description: `Thema: ${protocolInput.topic}. Elektronisch signiert (EES).`,
          timestamp: new Date().toLocaleString('de-CH'),
          authorName: 'Max Muster'
      };
      activities.unshift(newActivity); 
      setIsProtocolModalOpen(false);
      setProtocolInput({ topic: '', notes: '', productsDiscussed: [] });
      setSignatureData(null);
      setProtocolStep('INPUT');
      setActiveTab('JOURNAL');
  };

  const handleStartPitch = async () => {
      if (!selectedPolicy) return;
      setIsPitchMode(true);
      setPitchStep(0);
      setIsGeneratingPitch(true);
      setSimulatedDeductible(newOffer.deductible);

      try {
        const prompt = `
            Erstelle 3 kurze Verkaufsargumente für Versicherungswechsel.
            Aktuell: ${selectedPolicy.insurer}, ${selectedPolicy.premiumAmount} CHF
            Neu: ${newOffer.insurer}, ${newOffer.premium} CHF
            Vorteil: ${newOffer.highlights}
            Gib NUR 3 Sätze zurück, getrennt durch |.
        `;
        const response = await generateContentWithRetry('gemini-3-flash-preview', prompt);
        if (response.text) setAiArguments(response.text.split('|').map(s => s.trim()));
      } catch (error) {
          setAiArguments(["Ersparnis garantiert.", "Bessere Deckung.", "Alles aus einer Hand."]);
      } finally {
          setIsGeneratingPitch(false);
          setTimeout(() => setPitchStep(1), 500);
          setTimeout(() => setPitchStep(2), 1500);
      }
  };

  const getActivityIcon = (type: ActivityType) => {
      switch(type) {
          case 'NOTE': return <MessageSquare size={16} className="text-blue-500" />;
          case 'POLICY_ADD': return <Shield size={16} className="text-emerald-500" />;
          case 'MORTGAGE_ADD': return <Landmark size={16} className="text-purple-500" />;
          case 'MEETING': return <Calendar size={16} className="text-amber-500" />;
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
        <TabButton active={activeTab === 'JOURNAL'} onClick={() => setActiveTab('JOURNAL')} icon={<History size={16} />} label="Journal" />
        <TabButton active={activeTab === 'COMPLIANCE'} onClick={() => setActiveTab('COMPLIANCE')} icon={<Scale size={16} />} label="Due Diligence" />
        <TabButton 
            active={activeTab === 'PITCH'} 
            onClick={() => setActiveTab('PITCH')} 
            icon={<Presentation size={16} />} 
            label="Pitch Deck" 
            badge="NEU" 
        />
      </div>

      {/* Content */}
      <div className="space-y-6">
        
        {advice.length > 0 && activeTab !== 'COMPLIANCE' && activeTab !== 'PITCH' && (
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

        {/* OVERVIEW TAB */}
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
              <ComplianceShield score={client.trustScore} onRunCheck={handleRunKycCheck} isLoading={isCheckingCompliance} />
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

        {/* PITCH DECK TAB */}
        {activeTab === 'PITCH' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-6">
                      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden relative">
                          <div className="relative z-10">
                              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Presentation size={24} className="text-brand-400"/> Pitch Deck Generator</h3>
                              <p className="text-slate-300 text-sm mb-6">Erstellen Sie ein visuelles Vergleichsszenario für den Kunden und starten Sie die Präsentation.</p>
                              
                              <div className="space-y-4">
                                  <div className="space-y-1">
                                      <label className="text-xs text-slate-400 uppercase font-bold">1. Bestehende Police wählen</label>
                                      <select 
                                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
                                        value={selectedPolicyId}
                                        onChange={(e) => {
                                            const pid = e.target.value;
                                            setSelectedPolicyId(pid);
                                            const pol = policies.find(p => p.id === pid); 
                                            if(pol) {
                                                setNewOffer({
                                                    insurer: 'Baloise',
                                                    premium: Math.round(pol.premiumAmount * 0.9), 
                                                    deductible: pol.deductible || 0,
                                                    highlights: 'Bessere Deckung bei Glasbruch'
                                                });
                                            }
                                        }}
                                      >
                                        <option value="">-- Bitte wählen --</option>
                                        {activePolicies.map(p => (
                                            <option key={p.id} value={p.id}>{p.type} - {p.insurer} (CHF {p.premiumAmount})</option>
                                        ))}
                                      </select>
                                  </div>

                                  {selectedPolicy && (
                                    <div className="space-y-1 animate-in fade-in">
                                        <label className="text-xs text-slate-400 uppercase font-bold">2. Neues Angebot definieren</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <select 
                                                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-sm text-white"
                                                value={newOffer.insurer}
                                                onChange={(e) => setNewOffer({...newOffer, insurer: e.target.value})}
                                            >
                                                {insurerOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                <option value="Baloise">Baloise (Demo)</option>
                                            </select>
                                            <input 
                                                type="number" 
                                                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-sm text-white"
                                                placeholder="Neue Prämie"
                                                value={newOffer.premium}
                                                onChange={(e) => setNewOffer({...newOffer, premium: Number(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                  )}
                                  
                                  <div className="pt-4">
                                      <Button 
                                          className="w-full py-4 text-base font-bold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 border-none shadow-lg shadow-brand-500/20"
                                          disabled={!selectedPolicy}
                                          onClick={handleStartPitch}
                                          icon={<Sparkles size={20} />}
                                      >
                                          Präsentation starten
                                      </Button>
                                  </div>
                              </div>
                          </div>
                          <div className="absolute -bottom-10 -right-10 opacity-10">
                              <Presentation size={200} />
                          </div>
                      </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Vorschau</h3>
                      {!selectedPolicy ? (
                          <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                              <Presentation size={48} className="mb-2 opacity-50"/>
                              <p className="text-sm">Wählen Sie eine Police aus</p>
                          </div>
                      ) : (
                          <div className="space-y-4">
                              <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                  <div>
                                      <p className="text-xs text-slate-500 uppercase font-bold">Aktuell</p>
                                      <p className="font-bold text-slate-900 dark:text-white">{selectedPolicy.insurer}</p>
                                      <p className="text-sm">CHF {selectedPolicy.premiumAmount}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-xs text-brand-600 uppercase font-bold">Neu (Vorschlag)</p>
                                      <p className="font-bold text-slate-900 dark:text-white">{newOffer.insurer}</p>
                                      <p className="text-sm font-bold text-emerald-600">CHF {newOffer.premium}</p>
                                  </div>
                              </div>
                              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 text-sm rounded-xl border border-emerald-100 dark:border-emerald-800">
                                  <span className="font-bold block mb-1">Ersparnis für Kunden:</span>
                                  CHF {(selectedPolicy.premiumAmount - newOffer.premium).toFixed(2)} pro Jahr
                              </div>
                          </div>
                      )}
                  </div>
             </div>
        )}

        {/* COMPLIANCE TAB */}
        {activeTab === 'COMPLIANCE' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card title="KYC / AML Status">
                        <div className="flex items-center gap-6 mb-6">
                            <ComplianceShield score={client.trustScore} onRunCheck={handleRunKycCheck} isLoading={isCheckingCompliance} />
                        </div>
                    </Card>
                </div>
            </div>
        )}

        {activeTab === 'WEALTH' && <WealthVis assets={assets} />}
        
        {activeTab === 'TAX' && (
           <Card title="Steuerausweis 2023 (Vorschau)">
                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="pt-4 flex justify-between items-center">
                    <span>Versicherungsabzüge (KVG)</span>
                    <span className="font-mono"><SensitiveData>CHF 4,250.00</SensitiveData></span>
                  </div>
                </div>
             </Card>
        )}

        {activeTab === 'JOURNAL' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                  <Card title="Journal-Eintrag erfassen">
                      <div className="space-y-4">
                          <textarea 
                              className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all min-h-[120px]"
                              placeholder="Details zum Gespräch oder interne Notiz..."
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                          />
                          <div className="flex justify-end">
                              <Button size="sm" onClick={handleAddNote} disabled={!noteInput.trim()} icon={<Send size={14}/>}>Speichern</Button>
                          </div>
                      </div>
                  </Card>
                  <div className="space-y-4">
                      {activities.map((item) => (
                          <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                                  <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                          </div>
                      ))}
                  </div>
              </div>
           </div>
        )}
        
        {activeTab === 'POLICIES' && (
            <div className="grid grid-cols-1 gap-6">
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
                                 <p className="text-sm text-slate-500">Jahresprämie</p>
                                 <p className="font-semibold text-slate-900 dark:text-slate-100"><SensitiveData>CHF {p.premiumAmount.toFixed(2)}</SensitiveData></p>
                             </div>
                             <Link to={`/policy/${p.id}`}>
                                <Button variant="outline">Details</Button>
                             </Link>
                        </div>
                     </div>
                 ))}
            </div>
        )}
      </div>

      {/* PITCH MODE OVERLAY (FULLSCREEN) */}
      <AnimatePresence>
        {isPitchMode && selectedPolicy && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-slate-950 text-white flex flex-col font-sans"
            >
                <div className="h-20 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center font-bold">SB</div>
                        <div><h2 className="font-bold text-lg">Optimierungs-Vorschlag</h2></div>
                    </div>
                    <button onClick={() => setIsPitchMode(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
                </div>

                <div className="flex-1 p-8 flex items-center justify-center">
                    <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                        {/* Status Quo */}
                        <motion.div 
                            initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 0.6 }} transition={{ delay: 0.2 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 grayscale"
                        >
                            <h3 className="text-2xl font-bold text-slate-400 mb-8 text-center">{selectedPolicy.insurer}</h3>
                            <div className="space-y-6 opacity-70">
                                <div className="flex justify-between text-xl"><span>Prämie</span><span className="font-mono">CHF {selectedPolicy.premiumAmount}</span></div>
                                <div className="flex justify-between"><span>Selbstbehalt</span><span className="font-mono">CHF {selectedPolicy.deductible}</span></div>
                            </div>
                        </motion.div>

                        {/* Middle Logic */}
                        <div className="text-center space-y-12">
                            {pitchStep >= 1 && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <div className="text-5xl font-black text-emerald-500 mb-2">
                                        CHF {pitchSavings.toFixed(0)}
                                    </div>
                                    <p className="text-slate-400 uppercase tracking-widest">Ersparnis pro Jahr</p>
                                </motion.div>
                            )}
                            {pitchStep >= 2 && (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900/50 p-6 rounded-2xl text-left border border-slate-800">
                                    <div className="flex items-center gap-2 text-brand-400 font-bold mb-4"><Wand2 size={16}/> KI Analyse</div>
                                    <ul className="space-y-3">
                                        {aiArguments.map((arg, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-emerald-500 shrink-0"/> {arg}</li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                        </div>

                        {/* New Offer */}
                        <motion.div 
                            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                            className="bg-gradient-to-b from-brand-600 to-indigo-800 rounded-[2.5rem] p-1"
                        >
                             <div className="bg-slate-950 rounded-[2.3rem] p-8 h-full relative">
                                <div className="absolute top-0 right-0 bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl">EMPFEHLUNG</div>
                                <h3 className="text-2xl font-bold text-white text-center mb-8 mt-4">{newOffer.insurer}</h3>
                                <div className="space-y-8">
                                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                                        <div className="flex justify-between mb-4">
                                            <span className="text-xs font-bold uppercase text-slate-500">Wählbarer Selbstbehalt</span>
                                            <span className="font-bold text-brand-400">CHF {simulatedDeductible}</span>
                                        </div>
                                        <input type="range" min="0" max="2000" step="100" value={simulatedDeductible} onChange={(e) => setSimulatedDeductible(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-slate-400 text-sm mb-2">Neue Prämie</p>
                                        <div className="text-4xl font-black text-white">CHF {pitchNewPremium}</div>
                                    </div>
                                    <Button className="w-full py-4 bg-white text-brand-900 font-bold hover:bg-brand-50 border-none">Angebot annehmen</Button>
                                </div>
                             </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

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
                        placeholder="- Kunde wünscht Risiko-Check..."
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

                      <div 
                        className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-700"
                        dangerouslySetInnerHTML={{ __html: generatedProtocol }} 
                      />

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

const TabButton = ({ active, onClick, icon, label, badge }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap relative
      ${active 
        ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
  >
    {icon}
    {label}
    {badge && (
      <span className="absolute -top-1 right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
        {badge}
      </span>
    )}
  </button>
);

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2 last:border-0">
    <span className="text-slate-500 dark:text-slate-400 text-sm">{label}</span>
    <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">{value}</span>
  </div>
);
