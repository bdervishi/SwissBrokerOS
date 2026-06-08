
import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { MOCK_PARTNERS } from '../constants';
import { usePolicies, useClients } from '../hooks/useData';
import { ArrowRightLeft, Save, Loader2, List as ListIcon, LayoutGrid, Presentation, Wand2, CheckCircle2, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { PartnerCategory, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { SensitiveData } from '../components/ui/SensitiveData';
import { motion, AnimatePresence } from 'framer-motion';
import { generateContentWithRetry } from '../services/aiService';

export const Policies: React.FC = () => {
  const { user, role } = useAuth();
  const { data: policies } = usePolicies();
  const { data: clients } = useClients();
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');

  // Switch Scenario State
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [isSavingScenario, setIsSavingScenario] = useState(false);
  
  // Pitch Mode State
  const [isPitchMode, setIsPitchMode] = useState(false);
  const [pitchStep, setPitchStep] = useState(0);
  const [aiArguments, setAiArguments] = useState<string[]>([]);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

  // Broker Form State
  const [newOffer, setNewOffer] = useState({
    insurer: '',
    premium: 0,
    deductible: 0,
    highlights: ''
  });

  // Client / Pitch Simulation State
  const [simulatedDeductible, setSimulatedDeductible] = useState(500);

  // --- DATA ISOLATION ---
  const displayedPolicies = useMemo(() => {
      if (role === UserRole.CLIENT && user) {
          const clientProfile = clients.find(c => c.username === user.username);
          if (clientProfile) return policies.filter(p => p.clientId === clientProfile.id);
          return [];
      }
      return policies;
  }, [role, user, policies, clients]);

  const getClientName = (id: string) => {
    const c = clients.find(client => client.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Unbekannt';
  };

  const activePolicies = displayedPolicies.filter(p => p.status === 'ACTIVE');
  const selectedPolicy = displayedPolicies.find(p => p.id === selectedPolicyId);
  
  // Calculations
  const calculatePitchPremium = (basePrem: number, currentDed: number, simDed: number) => {
      const deductibleDiffSteps = (simDed - currentDed) / 500; 
      return Math.round(basePrem * (1 - (deductibleDiffSteps * 0.05)));
  };
  
  const pitchNewPremium = selectedPolicy ? calculatePitchPremium(newOffer.premium, newOffer.deductible, simulatedDeductible) : 0;
  const pitchSavings = selectedPolicy ? selectedPolicy.premiumAmount - pitchNewPremium : 0;
  
  const insurerOptions = MOCK_PARTNERS.filter(p => p.category === PartnerCategory.INSURANCE).map(p => p.name);

  // AUTO SELECT FIRST POLICY WHEN MODAL OPENS (For easier demo)
  useEffect(() => {
      if (isSwitchModalOpen && activePolicies.length > 0 && !selectedPolicyId) {
          const first = activePolicies[0];
          setSelectedPolicyId(first.id);
          // Set default offer to demonstrate functionality immediately
          setNewOffer({
              insurer: 'Baloise', // Default example
              premium: Math.round(first.premiumAmount * 0.9),
              deductible: first.deductible || 0,
              highlights: 'Optimierte Deckung'
          });
      }
  }, [isSwitchModalOpen, activePolicies, selectedPolicyId]);

  // AI PITCH GENERATOR
  const handleStartPitch = async () => {
      if (!selectedPolicy) return;
      setIsPitchMode(true);
      setPitchStep(0);
      setIsGeneratingPitch(true);
      setSimulatedDeductible(newOffer.deductible); // Reset slider

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'PENDING': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Policen Verwaltung</h1>
        <div className="flex gap-2">
            <Button variant="secondary" icon={<ArrowRightLeft size={16} />} onClick={() => setIsSwitchModalOpen(true)}>
                Wechsel-Rechner
            </Button>
        </div>
      </div>
      
      {/* Policy List */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Nr.</th>
                <th className="px-6 py-3">Versicherer</th>
                <th className="px-6 py-3">Typ</th>
                {role !== UserRole.CLIENT && <th className="px-6 py-3">Klient</th>}
                <th className="px-6 py-3 text-right">Prämie</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedPolicies.map(policy => (
                <tr key={policy.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-6 py-4 font-mono text-xs">{policy.policyNumber}</td>
                  <td className="px-6 py-4 font-bold">{policy.insurer}</td>
                  <td className="px-6 py-4">{policy.type}</td>
                  {role !== UserRole.CLIENT && (
                    <td className="px-6 py-4 text-brand-600"><Link to={`/client/${policy.clientId}`}>{getClientName(policy.clientId)}</Link></td>
                  )}
                  <td className="px-6 py-4 text-right"><SensitiveData>CHF {policy.premiumAmount.toFixed(2)}</SensitiveData></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(policy.status)}`}>{policy.status}</span></td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/policy/${policy.id}`}><Button size="sm" variant="ghost">Details</Button></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insurance Switch Modal */}
      <Modal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        title="Wechsel-Rechner & Angebot"
        maxWidth="max-w-5xl"
      >
          <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                  {/* Current Policy */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                      <h4 className="font-bold mb-4">1. Aktuelle Police</h4>
                      <div className="space-y-4">
                          <select 
                            className="w-full p-2 border rounded"
                            value={selectedPolicyId}
                            onChange={(e) => {
                                const pid = e.target.value;
                                setSelectedPolicyId(pid);
                                const pol = displayedPolicies.find(p => p.id === pid); 
                                if(pol) setNewOffer({ insurer: '', premium: Math.round(pol.premiumAmount * 0.9), deductible: pol.deductible || 0, highlights: '' });
                            }}
                          >
                            <option value="">-- Wählen --</option>
                            {activePolicies.map(p => <option key={p.id} value={p.id}>{p.type} - {p.insurer}</option>)}
                          </select>
                          {selectedPolicy && (
                              <div className="p-4 bg-white dark:bg-slate-900 rounded border">
                                  <div className="flex justify-between font-bold"><span>Prämie:</span> <span>CHF {selectedPolicy.premiumAmount}</span></div>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* New Offer */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-brand-200 shadow-lg">
                      <h4 className="font-bold text-brand-600 mb-4">2. Neues Angebot</h4>
                      <div className="space-y-4">
                          <select className="w-full p-2 border rounded" value={newOffer.insurer} onChange={(e) => setNewOffer({...newOffer, insurer: e.target.value})}>
                            <option value="">-- Partner --</option>
                            {insurerOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            <option value="Baloise">Baloise (Demo)</option>
                          </select>
                          <div className="grid grid-cols-2 gap-4">
                              <input type="number" className="p-2 border rounded" value={newOffer.premium} onChange={(e) => setNewOffer({...newOffer, premium: Number(e.target.value)})} placeholder="Prämie" />
                              <input type="number" className="p-2 border rounded" value={newOffer.deductible} onChange={(e) => setNewOffer({...newOffer, deductible: Number(e.target.value)})} placeholder="Selbstbehalt" />
                          </div>
                          <textarea className="w-full p-2 border rounded h-20" placeholder="Vorteile..." value={newOffer.highlights} onChange={(e) => setNewOffer({...newOffer, highlights: e.target.value})} />
                      </div>
                  </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsSwitchModalOpen(false)}>Schliessen</Button>
                  <div className="flex gap-2">
                    <Button 
                        variant="secondary" 
                        disabled={!selectedPolicy || !newOffer.insurer} 
                        onClick={handleStartPitch}
                        icon={<Presentation size={18}/>}
                        className="bg-purple-600 text-white hover:bg-purple-700"
                    >
                        Pitch Presentation starten
                    </Button>
                    <Button icon={<Save size={18} />}>Offerte speichern</Button>
                  </div>
              </div>
          </div>
      </Modal>

      {/* PITCH MODE OVERLAY (FULLSCREEN) - Z-Index 200 */}
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
    </Layout>
  );
};
