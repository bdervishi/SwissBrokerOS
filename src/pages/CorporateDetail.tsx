
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ComplianceShield } from '../components/ui/ComplianceShield';
import { MOCK_CLIENTS, MOCK_POLICIES } from '../constants';
import { SensitiveData } from '../components/ui/SensitiveData';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  Users, 
  FileText, 
  Car, 
  Briefcase,
  ChevronRight,
  Landmark,
  Euro, // Using Euro icon as placeholder for Salary/Payroll
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const CorporateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HR_BVG' | 'FLEET' | 'POLICIES'>('OVERVIEW');

  const client = MOCK_CLIENTS.find(c => c.id === id);
  const policies = MOCK_POLICIES.filter(p => p.clientId === id);

  if (!client || client.type !== 'CORPORATE') {
      return (
          <Layout>
              <div className="p-8 text-center">
                  <h2 className="text-xl font-bold">Client not found or not a corporate entity.</h2>
                  <Link to="/clients"><Button className="mt-4">Back to List</Button></Link>
              </div>
          </Layout>
      );
  }

  // Calculations
  const bvgVolume = policies.filter(p => p.type.includes('BVG') || p.type.includes('Pensionskasse')).reduce((acc, p) => acc + p.premiumAmount, 0);
  const totalVolume = policies.reduce((acc, p) => acc + p.premiumAmount, 0);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <Link to="/clients" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors">
          <ArrowLeft size={16} />
          Zurück zur Liste
        </Link>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-3xl font-black text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                    {client.companyName?.substring(0,2).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">{client.companyName}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Building2 size={14}/> UID: {client.uidNumber}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14}/> {client.zipCity}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-xs font-bold uppercase tracking-wider">
                            Im Handelsregister
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" icon={<Globe size={16}/>}>Zefix öffnen</Button>
                <Button variant="primary">Aktion starten</Button>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto no-scrollbar">
        <TabButton active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} icon={<Briefcase size={16} />} label="Übersicht & Stammdaten" />
        <TabButton active={activeTab === 'HR_BVG'} onClick={() => setActiveTab('HR_BVG')} icon={<Users size={16} />} label="Personal & BVG" />
        <TabButton active={activeTab === 'FLEET'} onClick={() => setActiveTab('FLEET')} icon={<Car size={16} />} label="Flotten-Manager" />
        <TabButton active={activeTab === 'POLICIES'} onClick={() => setActiveTab('POLICIES')} icon={<ShieldCheck size={16} />} label={`Policen (${policies.length})`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-8">
              
              {activeTab === 'OVERVIEW' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Kontaktperson (HR / GF)">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                                    {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{client.firstName} {client.lastName}</p>
                                    <p className="text-sm text-slate-500">Geschäftsführer</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p className="flex justify-between"><span>Email:</span> <span className="font-medium text-brand-600">{client.email}</span></p>
                                <p className="flex justify-between"><span>Tel:</span> <span className="font-medium">+41 44 123 45 67</span></p>
                            </div>
                        </Card>

                        <Card title="Firmendaten (Zefix)">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Rechtsform</span>
                                    <span className="font-medium">Aktiengesellschaft (AG)</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">NOGA Code</span>
                                    <span className="font-medium">{client.nogaCode}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Kapital</span>
                                    <span className="font-medium">CHF 100'000</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">Domizil</span>
                                    <span className="font-medium">{client.address}</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card title="Risiko-Radar (B2B)">
                        <ComplianceShield score={client.trustScore} />
                        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-3 text-sm">
                            <AlertTriangle className="text-amber-600 shrink-0" />
                            <p className="text-amber-800 dark:text-amber-300">
                                <strong>Branchen-Hinweis:</strong> Für NOGA {client.nogaCode} (Baugewerbe/IT) empfehlen wir eine Überprüfung der Cyber-Deckung und Betriebshaftpflicht-Summen.
                            </p>
                        </div>
                    </Card>
                  </>
              )}

              {activeTab === 'HR_BVG' && (
                  <div className="space-y-6 animate-in fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <StatBox label="Mitarbeiter" value={client.employeeCount?.toString() || '0'} icon={<Users size={20} className="text-blue-500"/>} />
                          <StatBox label="Lohnsumme (CHF)" value={(client.totalPayrollSum || 0).toLocaleString()} icon={<TrendingUp size={20} className="text-emerald-500"/>} />
                          <StatBox label="BVG Prämie p.a." value={`CHF ${bvgVolume.toLocaleString()}`} icon={<Landmark size={20} className="text-purple-500"/>} />
                      </div>

                      <Card title="Lohnsummen-Meldung (UVG / KTG)">
                          <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer">
                              <FileText size={40} className="mx-auto text-slate-400 mb-4" />
                              <h3 className="font-bold text-lg mb-2">Deklaration 2024 ausstehend</h3>
                              <p className="text-sm text-slate-500 mb-6">Laden Sie die aktuelle Lohnliste (Excel) hoch, um die definitiven Prämien zu berechnen.</p>
                              <Button variant="outline">Datei hochladen</Button>
                          </div>
                      </Card>

                      <Card title="Personal-Mutations-Journal">
                          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                              <div className="py-3 flex justify-between">
                                  <span>Eintritt: Max Mustermann</span>
                                  <span className="text-slate-500">01.05.2024</span>
                              </div>
                              <div className="py-3 flex justify-between">
                                  <span>Austritt: Sarah Beispiel</span>
                                  <span className="text-slate-500">30.04.2024</span>
                              </div>
                              <div className="py-3 flex justify-between">
                                  <span>Lohnerhöhung: Team Sales</span>
                                  <span className="text-slate-500">01.01.2024</span>
                              </div>
                          </div>
                          <Button size="sm" variant="ghost" className="w-full mt-2">Alle anzeigen</Button>
                      </Card>
                  </div>
              )}

              {activeTab === 'POLICIES' && (
                  <Card title="Gewerbe-Policen" noPadding>
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
                              <tr>
                                  <th className="px-6 py-3">Sparte</th>
                                  <th className="px-6 py-3">Gesellschaft</th>
                                  <th className="px-6 py-3 text-right">Prämie</th>
                                  <th className="px-6 py-3">Ablauf</th>
                                  <th className="px-6 py-3"></th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {policies.map(p => (
                                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                      <td className="px-6 py-4 font-medium">{p.type}</td>
                                      <td className="px-6 py-4">{p.insurer}</td>
                                      <td className="px-6 py-4 text-right font-mono"><SensitiveData>CHF {p.premiumAmount.toLocaleString()}</SensitiveData></td>
                                      <td className="px-6 py-4 text-slate-500">{p.endDate}</td>
                                      <td className="px-6 py-4 text-right">
                                          <Link to={`/policy/${p.id}`}><ChevronRight size={16} className="ml-auto text-slate-400 hover:text-brand-600"/></Link>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </Card>
              )}

              {activeTab === 'FLEET' && (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                      <Car size={48} className="mx-auto text-slate-300 mb-4" />
                      <h3 className="text-lg font-bold text-slate-500">Keine Flotten-Daten</h3>
                      <p className="text-sm text-slate-400 mb-6">Importieren Sie Fahrzeugausweise, um den Flotten-Manager zu aktivieren.</p>
                      <Button variant="outline">Fahrzeug-Import starten</Button>
                  </div>
              )}

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
              <Card title="Key Account Management">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div>
                          <p className="font-bold text-sm">Betreuer: Max Muster</p>
                          <p className="text-xs text-slate-500">Senior Corporate Broker</p>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full">Termin vereinbaren</Button>
                      <Button size="sm" variant="outline" className="w-full">Notiz erstellen</Button>
                  </div>
              </Card>

              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-400"/> Portfolio Wert
                  </h3>
                  <div className="mb-2">
                      <p className="text-xs text-slate-400 uppercase font-bold">Prämienvolumen (p.a.)</p>
                      <p className="text-2xl font-black text-emerald-400">CHF {totalVolume.toLocaleString()}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                      <p className="text-xs text-slate-400 uppercase font-bold">Commission (Est.)</p>
                      <p className="text-lg font-bold">CHF {(totalVolume * 0.12).toLocaleString()}</p>
                  </div>
              </div>
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

const StatBox = ({ label, value, icon }: any) => (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">{label}</p>
            <p className="text-xl font-black text-slate-900 dark:text-slate-100">{value}</p>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            {icon}
        </div>
    </div>
);
