
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MOCK_POLICIES, MOCK_CLIENTS, MOCK_DOCUMENTS, MOCK_CLAIMS } from '../constants';
import { SensitiveData } from '../components/ui/SensitiveData';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
import { useSecurity } from '../contexts/SecurityContext';
import { UserRole } from '../types';
import { 
  ArrowLeft, 
  FileText, 
  AlertCircle, 
  Download, 
  Calendar, 
  ShieldCheck, 
  CreditCard,
  FileBox,
  Activity,
  CheckCircle,
  Clock,
  Lock,
  Sparkles,
  Loader2,
  Scale,
  TrendingDown,
  TrendingUp,
  Search
} from 'lucide-react';

export const PolicyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { isAIEnabled } = useSecurity();

  const activeTabDefault = 'DETAILS';
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'DOCUMENTS' | 'CLAIMS' | 'REVIEW'>('DETAILS');
  
  // AI Summary State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Contract Review State
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<string | null>(null);

  const policy = MOCK_POLICIES.find(p => p.id === id);
  
  if (!policy) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-slate-500 mb-4">Police nicht gefunden</p>
          <Button onClick={() => navigate(-1)}>Zurück</Button>
        </div>
      </Layout>
    );
  }

  const client = MOCK_CLIENTS.find(c => c.id === policy.clientId);
  const documents = MOCK_DOCUMENTS.filter(d => d.policyId === policy.id);
  const claims = MOCK_CLAIMS.filter(c => c.policyId === policy.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'PENDING': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const handleGenerateSummary = async () => {
    if (!policy) return;
    setIsGeneratingSummary(true);
    setAiSummary(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        Erstelle eine kundenfreundliche Zusammenfassung für folgende Versicherungspolice.
        Zielgruppe: Der Endkunde (Laie).
        Sprache: Deutsch (Schweiz), höflich, "Sie"-Form.
        Formatierung: Nutze Markdown (Fettgedrucktes für Beträge und Daten).
        
        Struktur der Antwort:
        1. Ein freundlicher Einleitungssatz.
        2. "Das Wichtigste in Kürze": Liste mit 3-4 Bullet Points (Was ist versichert, was kostet es, Selbstbehalt).
        3. Ein Hinweis zur Kündigungsfrist.
        
        Daten:
        ${JSON.stringify(policy)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiSummary(response.text || "Konnte keine Zusammenfassung generieren.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiSummary("Entschuldigung, der AI-Service ist momentan nicht erreichbar.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleContractReview = async () => {
      if (!policy || !process.env.API_KEY) return;
      setIsReviewing(true);
      setReviewResult(null);

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `
            Führe eine Due Diligence Prüfung (Contract Review) für diese Police durch.
            Suche nach "Red Flags" oder unüblichen Klauseln.
            
            Police: ${JSON.stringify(policy)}
            
            Prüfpunkte:
            1. Selbstbehalt im Marktvergleich (Ist er ungewöhnlich hoch?)
            2. Kündigungsfrist (Standard ist 3 Monate, alles darüber ist eine Warnung).
            3. Laufzeit (Verträge > 3 Jahre sind oft nachteilig).
            
            Gib das Ergebnis als HTML-Liste zurück. Markiere kritische Punkte mit einem ⚠️ Emoji.
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: prompt,
          });

          setReviewResult(response.text || "Prüfung fehlgeschlagen.");
      } catch (e) {
          console.error("Review Error", e);
          setReviewResult("Fehler bei der KI-Analyse.");
      } finally {
          setIsReviewing(false);
      }
  };

  // Only show AI button if User is Client AND AI is enabled in Settings
  const showAiButton = role === UserRole.CLIENT && isAIEnabled;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <Link to={`/client/${client?.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors">
          <ArrowLeft size={16} />
          Zurück zu {client?.firstName} {client?.lastName}
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
             <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 text-xl font-bold text-slate-700 dark:text-slate-300">
               {policy.insurer.substring(0, 2).toUpperCase()}
             </div>
             <div>
               <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{policy.type}</h1>
               <div className="flex items-center gap-3 mt-1">
                 <span className="text-slate-500 font-mono text-sm">Nr. {policy.policyNumber}</span>
                 <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                   {policy.status}
                 </span>
               </div>
             </div>
          </div>
          <div className="flex gap-3">
             {showAiButton && (
                 <Button 
                    variant="secondary" 
                    className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-100 dark:border-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40"
                    icon={isGeneratingSummary ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                 >
                    {isGeneratingSummary ? 'Analysiere...' : 'KI-Zusammenfassung'}
                 </Button>
             )}
             <Button variant="outline">Änderung beantragen</Button>
             <Button variant="danger" size="sm">Kündigen</Button>
          </div>
        </div>
      </div>

      {/* Security Banner (Swiss Vault) */}
      <div className="mb-6 bg-slate-800 text-slate-200 p-3 rounded-lg flex items-center justify-between text-sm shadow-inner">
          <div className="flex items-center gap-3">
              <div className="p-1.5 bg-slate-700 rounded-md">
                  <Lock size={16} className="text-emerald-400" />
              </div>
              <div>
                  <span className="font-semibold text-white">Swiss Secure Vault</span>
                  <span className="mx-2">•</span>
                  <span className="text-slate-400">End-to-End Encrypted Storage (AES-256)</span>
              </div>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
              Verifiziert
          </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <TabButton active={activeTab === 'DETAILS'} onClick={() => setActiveTab('DETAILS')} icon={<FileText size={16} />} label="Vertragsdetails" />
        <TabButton active={activeTab === 'DOCUMENTS'} onClick={() => setActiveTab('DOCUMENTS')} icon={<FileBox size={16} />} label={`Dokumente (${documents.length})`} />
        <TabButton active={activeTab === 'CLAIMS'} onClick={() => setActiveTab('CLAIMS')} icon={<Activity size={16} />} label={`Schadenfälle (${claims.length})`} />
        {role !== UserRole.CLIENT && <TabButton active={activeTab === 'REVIEW'} onClick={() => setActiveTab('REVIEW')} icon={<Scale size={16} />} label="Due Diligence" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'DETAILS' && (
            <>
              {/* AI SUMMARY CARD */}
              {(aiSummary || isGeneratingSummary) && showAiButton && (
                  <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 rounded-xl p-6 shadow-lg shadow-purple-500/5 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center gap-2 mb-4 text-purple-700 dark:text-purple-400 font-bold">
                          <Sparkles size={18} />
                          <h3>Smart Summary</h3>
                      </div>
                      
                      {isGeneratingSummary ? (
                          <div className="space-y-3 animate-pulse">
                              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                          </div>
                      ) : (
                          <div className="prose dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300">
                              <div dangerouslySetInnerHTML={{ 
                                  __html: aiSummary ? aiSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') : '' 
                              }} />
                          </div>
                      )}
                  </div>
              )}

              <Card title="Deckungsumfang">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <p className="text-sm font-medium text-slate-500 mb-2">Versicherte Risiken</p>
                      <ul className="space-y-2">
                        {policy.coverageDetails?.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                            {detail}
                          </li>
                        )) || <li className="text-sm text-slate-400 italic">Keine Details verfügbar</li>}
                      </ul>
                   </div>
                   <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Selbstbehalt</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">CHF {policy.deductible?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Versicherungssumme</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Unbegrenzt</p>
                      </div>
                   </div>
                </div>
              </Card>

              <Card title="Laufzeit & Fristen">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                       <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <Calendar size={16} />
                          <span className="text-sm">Vertragsbeginn</span>
                       </div>
                       <p className="font-medium">{policy.startDate}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                       <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <Calendar size={16} />
                          <span className="text-sm">Vertragsablauf</span>
                       </div>
                       <p className="font-medium">{policy.endDate}</p>
                    </div>
                 </div>
                 <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg flex items-start gap-3">
                    <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
                    <div>
                       <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Kündigungsfrist: {policy.cancellationNoticePeriod} Monate</p>
                       <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                         Spätester Kündigungstermin für dieses Jahr: <span className="font-semibold">30. September 2024</span>
                       </p>
                    </div>
                 </div>
              </Card>
            </>
          )}

          {activeTab === 'DOCUMENTS' && (
             <Card title="Dokumentenablage">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                   {documents.length > 0 ? documents.map(doc => (
                      <div key={doc.id} className="py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 -mx-6 px-6 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                               <FileText size={20} />
                            </div>
                            <div>
                               <p className="font-medium text-slate-900 dark:text-slate-100">{doc.title}</p>
                               <p className="text-xs text-slate-500">{doc.date} • {doc.type} • {doc.size}</p>
                            </div>
                         </div>
                         <Button variant="ghost" size="sm" icon={<Download size={16} />}>
                            Download
                         </Button>
                      </div>
                   )) : (
                     <div className="py-12 text-center text-slate-500">
                        <FileBox size={40} className="mx-auto mb-3 opacity-20" />
                        <p>Keine Dokumente vorhanden.</p>
                     </div>
                   )}
                </div>
                <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                   <Button variant="outline" className="w-full">Dokument hochladen</Button>
                </div>
             </Card>
          )}

          {activeTab === 'CLAIMS' && (
             <Card title="Schadenhistorie">
                <div className="space-y-4">
                   {claims.length > 0 ? claims.map(claim => (
                      <div key={claim.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                         <div className="flex items-start gap-4">
                            <div className={`mt-1 p-2 rounded-full ${
                               claim.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 
                               claim.status === 'PENDING' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 
                               'bg-slate-100 text-slate-600'
                            }`}>
                               {claim.status === 'CLOSED' ? <CheckCircle size={16} /> : <Clock size={16} />}
                            </div>
                            <div>
                               <p className="font-medium text-slate-900 dark:text-slate-100">{claim.description}</p>
                               <p className="text-xs text-slate-500">{claim.date}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="font-bold">CHF {claim.amount.toFixed(2)}</p>
                            <span className="text-xs text-slate-400">{claim.status}</span>
                         </div>
                      </div>
                   )) : (
                     <div className="py-12 text-center text-slate-500">
                        <ShieldCheck size={40} className="mx-auto mb-3 opacity-20" />
                        <p>Keine Schäden gemeldet. Ausgezeichnet!</p>
                     </div>
                   )}
                </div>
                <div className="mt-6">
                   <Button className="w-full">Neuen Schaden melden</Button>
                </div>
             </Card>
          )}

          {activeTab === 'REVIEW' && (
              <div className="space-y-6">
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 flex gap-4">
                      <Search className="text-indigo-600 shrink-0" />
                      <div>
                          <h3 className="font-bold text-indigo-900 dark:text-indigo-200">AI Contract Review</h3>
                          <p className="text-sm text-indigo-800 dark:text-indigo-300">
                              Prüfen Sie das Kleingedruckte und vergleichen Sie die Konditionen mit dem Marktstandard.
                          </p>
                      </div>
                  </div>

                  <Card title="Automatische Prüfung (Due Diligence)">
                      {!reviewResult ? (
                          <div className="text-center py-8">
                              <p className="text-slate-500 mb-4">Lassen Sie die KI nach kritischen Klauseln und Markt-Anomalien suchen.</p>
                              <Button 
                                onClick={handleContractReview} 
                                disabled={isReviewing}
                                icon={isReviewing ? <Loader2 className="animate-spin" /> : <Search />}
                              >
                                  {isReviewing ? 'Prüfe Vertrag...' : 'Analyse starten'}
                              </Button>
                          </div>
                      ) : (
                          <div className="prose dark:prose-invert prose-sm">
                              <div dangerouslySetInnerHTML={{ __html: reviewResult }} />
                              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                  <Button size="sm" variant="outline" onClick={() => setReviewResult(null)}>Reset</Button>
                              </div>
                          </div>
                      )}
                  </Card>

                  <Card title="Markt-Benchmark (Preis/Leistung)">
                      <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium">Prämie vs. Markt</span>
                          {policy.marketBenchmarkDelta && (
                              <span className={`text-sm font-bold ${policy.marketBenchmarkDelta < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {policy.marketBenchmarkDelta > 0 ? '+' : ''}{policy.marketBenchmarkDelta}%
                              </span>
                          )}
                      </div>
                      <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full mb-2">
                          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400"></div>
                          {/* Marker based on delta */}
                          <div 
                            className={`absolute top-0 bottom-0 w-2 rounded-full ${policy.marketBenchmarkDelta && policy.marketBenchmarkDelta < 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{ 
                                left: `${50 + (policy.marketBenchmarkDelta || 0)}%`, 
                                transform: 'translateX(-50%)'
                            }}
                          ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                          <span>Günstiger</span>
                          <span>Markt-Schnitt</span>
                          <span>Teurer</span>
                      </div>
                  </Card>
              </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card title="Zahlungsinformationen">
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-sm text-slate-500">Jahresprämie</span>
                   <span className="font-bold text-lg"><SensitiveData>CHF {policy.premiumAmount.toFixed(2)}</SensitiveData></span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Zahlweise</span>
                   <span>{policy.premiumFrequency}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                   <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent">
                      <span className="flex items-center gap-2 text-brand-600"><CreditCard size={16}/> Rechnung 2024</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Bezahlt</span>
                   </Button>
                </div>
             </div>
          </Card>

          <Card title="Kontakt Versicherer">
             <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                     {policy.insurer.substring(0, 1)}
                   </div>
                   <div>
                      <p className="font-medium text-sm">{policy.insurer} Schadenabteilung</p>
                      <p className="text-xs text-slate-500">+41 800 123 456</p>
                   </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">Anruf starten</Button>
             </div>
          </Card>
        </div>
      </div>
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
