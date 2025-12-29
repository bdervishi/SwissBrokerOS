
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MOCK_CLIENTS, MOCK_POLICIES, MOCK_ASSETS, MOCK_ADVICE, MOCK_CLIENT_NOTES, MOCK_ACTIVITY_LOGS } from '../constants';
import { WealthVis } from '../components/3d/WealthVis';
import { SensitiveData } from '../components/ui/SensitiveData';
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
  TrendingUp
} from 'lucide-react';
import { AssetType, ActivityType, ActivityLog, ClientNote } from '../types';

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'POLICIES' | 'WEALTH' | 'TAX' | 'JOURNAL'>('OVERVIEW');
  
  // Note State
  const [noteInput, setNoteInput] = useState('');
  const [localNotes, setLocalNotes] = useState<ClientNote[]>(MOCK_CLIENT_NOTES.filter(n => n.clientId === id));
  
  const client = MOCK_CLIENTS.find(c => c.id === id);
  const policies = MOCK_POLICIES.filter(p => p.clientId === id);
  const assets = MOCK_ASSETS.filter(a => a.clientId === id);
  const advice = MOCK_ADVICE.filter(a => a.clientId === id);
  const activities = MOCK_ACTIVITY_LOGS.filter(a => a.clientId === id).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  if (!client) return <Layout><div className="p-8">Klient nicht gefunden</div></Layout>;

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{client.firstName} {client.lastName}</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{client.zipCity}</span>
            <span>•</span>
            <span>Geb. {client.birthDate}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-3">
            <Button variant="outline">Nachricht senden</Button>
            <Button>Termin buchen</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto no-scrollbar">
        <TabButton active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} icon={<Shield size={16} />} label="Übersicht" />
        <TabButton active={activeTab === 'POLICIES'} onClick={() => setActiveTab('POLICIES')} icon={<FileText size={16} />} label="Versicherungen" />
        <TabButton active={activeTab === 'WEALTH'} onClick={() => setActiveTab('WEALTH')} icon={<Landmark size={16} />} label="Vermögen & Vorsorge" />
        <TabButton active={activeTab === 'TAX'} onClick={() => setActiveTab('TAX')} icon={<Calculator size={16} />} label="Steuern" />
        <TabButton active={activeTab === 'JOURNAL'} onClick={() => setActiveTab('JOURNAL')} icon={<History size={16} />} label="Journal & Historie" />
      </div>

      {/* Content */}
      <div className="space-y-6">
        
        {/* AI ADVICE BANNER (Visible on all tabs) */}
        {advice.length > 0 && (
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
            <div>
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
                             <div className="text-right hidden sm:block">
                                 <p className="text-sm text-slate-500">Status</p>
                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    {p.status}
                                 </span>
                             </div>
                             <Link to={`/policy/${p.id}`}>
                                <Button variant="outline">Details</Button>
                             </Link>
                        </div>
                     </div>
                 ))}
            </div>
        )}

        {activeTab === 'WEALTH' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Visualization Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
                   {/* 3D Visualization Component */}
                   <WealthVis assets={assets} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {assets.map(a => (
                    <div key={a.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-brand-200 dark:hover:border-brand-800 transition-colors">
                      <p className="text-xs text-slate-500 uppercase font-medium mb-1">{a.type.replace('_', ' ')}</p>
                      <p className="font-bold text-lg text-slate-900 dark:text-slate-100"><SensitiveData>CHF {a.value.toLocaleString()}</SensitiveData></p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        {a.provider || 'Diverse'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Stats Column */}
              <div className="space-y-6">
                 <Card title="Vorsorgelücken Analyse">
                    <div className="space-y-4">
                       <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold mb-1">
                            <AlertTriangle size={16} />
                            <span>Erwerbsunfähigkeit</span>
                          </div>
                          <p className="text-sm text-red-600 dark:text-red-300">Deckungslücke von 23% im Fall von Krankheit.</p>
                          <div className="mt-3">
                            <Button size="sm" variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/40">Offerte erstellen</Button>
                          </div>
                       </div>
                       <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
                            <Shield size={16} />
                            <span>Todesfall</span>
                          </div>
                          <p className="text-sm text-emerald-600 dark:text-emerald-300">Ausreichend gedeckt durch 3. Säule und Risiko-Lebensversicherung.</p>
                       </div>
                    </div>
                 </Card>
                 
                 <Card title="Strategie">
                   <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                     Empfohlene Aufteilung für konservatives Risikoprofil.
                   </p>
                   <div className="space-y-2">
                     <div className="flex justify-between text-xs font-medium dark:text-slate-300">
                       <span>Immobilien</span>
                       <span>60%</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 w-[60%]"></div>
                     </div>
                     
                     <div className="flex justify-between text-xs font-medium dark:text-slate-300 pt-2">
                       <span>BVG & 3a</span>
                       <span>25%</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 w-[25%]"></div>
                     </div>

                     <div className="flex justify-between text-xs font-medium dark:text-slate-300 pt-2">
                       <span>Liquidität</span>
                       <span>15%</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[15%]"></div>
                     </div>
                   </div>
                 </Card>
              </div>
           </div>
        )}

        {activeTab === 'TAX' && (
           <div className="max-w-4xl mx-auto">
             <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg flex gap-4">
               <div className="text-blue-600"><Calculator /></div>
               <div>
                 <h4 className="font-bold text-blue-900 dark:text-blue-100">Steuer-Support Modus</h4>
                 <p className="text-sm text-blue-800 dark:text-blue-200">Diese Ansicht aggregiert steuerrelevante Daten. Es handelt sich nicht um eine Steuerberatung.</p>
               </div>
             </div>

             <Card title="Steuerausweis 2023 (Vorschau)">
                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="pt-4 flex justify-between items-center">
                    <span>Versicherungsabzüge (KVG)</span>
                    <span className="font-mono"><SensitiveData>CHF 4,250.00</SensitiveData></span>
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                    <span>Beiträge Säule 3a</span>
                    <span className="font-mono"><SensitiveData>CHF 6,883.00</SensitiveData></span>
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                    <span>Schuldzinsen (Hypothek)</span>
                    <span className="font-mono"><SensitiveData>CHF 12,400.00</SensitiveData></span>
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                    <span>Berufsauslagen (Pauschal)</span>
                    <span className="font-mono"><SensitiveData>CHF 4,000.00</SensitiveData></span>
                  </div>
                  <div className="pt-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg flex justify-between items-center font-bold">
                     <span>Total Abzüge</span>
                     <span><SensitiveData>CHF 27,533.00</SensitiveData></span>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                   <Button icon={<Download size={16}/>}>PDF Exportieren</Button>
                </div>
             </Card>
           </div>
        )}

        {activeTab === 'JOURNAL' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Journal / History Column */}
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
                          <div className="flex gap-4">
                              <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors uppercase tracking-widest"><MessageSquare size={14}/> Gespräch</button>
                              <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors uppercase tracking-widest"><Clock size={14}/> Rückruf</button>
                              <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors uppercase tracking-widest"><Plus size={14}/> Aufgabe</button>
                          </div>
                      </div>
                  </Card>

                  <div className="space-y-4">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 px-2">
                        <History size={18} className="text-slate-400" /> Historie & Aktivitäten
                      </h3>
                      
                      <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                          {/* Combine local notes and activity logs for a unified timeline */}
                          {[...activities].map((item) => (
                              <div key={item.id} className="relative group">
                                  {/* Timeline Node */}
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

              {/* Sidebar: Notes Summary */}
              <div className="space-y-6">
                  <Card title="Wichtige Notizen" className="border-l-4 border-l-brand-500">
                      <div className="space-y-6">
                        {localNotes.map(note => (
                            <div key={note.id} className="group border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{note.createdAt}</span>
                                    <button className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={14} />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{note.content}"</p>
                                <p className="text-[10px] text-brand-600 font-bold mt-2">— {note.authorName}</p>
                            </div>
                        ))}
                        {localNotes.length === 0 && <p className="text-sm text-slate-400 italic">Keine manuellen Notizen erfasst.</p>}
                      </div>
                  </Card>

                  <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2 uppercase tracking-wider">
                          <ShieldCheck size={16} className="text-brand-600" /> Compliance Info
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Alle Journal-Einträge sind revisionssicher gespeichert und gemäss nDSG Anforderungen dokumentiert.
                      </p>
                  </div>
              </div>
           </div>
        )}
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

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2 last:border-0">
    <span className="text-slate-500 dark:text-slate-400 text-sm">{label}</span>
    <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">{value}</span>
  </div>
);

// Utility icon
const X = ({ className, size = 20 }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
