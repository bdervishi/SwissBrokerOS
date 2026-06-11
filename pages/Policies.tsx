
import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { MOCK_PARTNERS } from '../constants';
import { usePolicies, useClients } from '../src/hooks/useData';
import { FileText, Filter, Download, ArrowRightLeft, Check, X, TrendingDown, ArrowRight, Save, Eye, EyeOff, Wallet, Loader2, LayoutGrid, List as ListIcon, Calendar, Shield, Sparkles, AlertCircle, ThumbsUp, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link, Navigate } from 'react-router-dom';
import { InsuranceSwitchScenario, PartnerCategory, UserRole, Policy } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { SensitiveData } from '../components/ui/SensitiveData';
import { PolicyForm } from '../components/forms/PolicyForm';

export const Policies: React.FC = () => {
  const { user, role } = useAuth();
  const { data: policies, refetch: refetchPolicies } = usePolicies();
  const { data: clients } = useClients();

  // Detailed create/edit policy form (components/forms/PolicyForm.tsx)
  const [isPolicyFormOpen, setIsPolicyFormOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null);

  // View State
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');

  // Switch Scenario State
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [isSavingScenario, setIsSavingScenario] = useState(false);
  
  // Broker Form State
  const [newOffer, setNewOffer] = useState({
    insurer: '',
    premium: 0,
    deductible: 0,
    highlights: ''
  });

  // Client Simulation State
  const [simulatedDeductible, setSimulatedDeductible] = useState(500);
  const [simulationStep, setSimulationStep] = useState(0); // For animation intro
  
  // Commission Visibility State
  const [showCommission, setShowCommission] = useState(false);

  // --- STRICT DATA ISOLATION LOGIC ---
  const displayedPolicies = useMemo(() => {
      if (role === UserRole.CLIENT && user) {
          const clientProfile = clients.find(c => c.username === user.username);
          if (clientProfile) {
              return policies.filter(p => p.clientId === clientProfile.id);
          }
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
  
  // -- CALCULATIONS --

  // 1. Broker View Calc
  const currentPremium = selectedPolicy ? selectedPolicy.premiumAmount : 0;
  const savings = currentPremium - newOffer.premium;
  const isSaving = savings > 0;

  const commissionRate = 0.15;
  const oldCommission = currentPremium * 0.10;
  const newCommission = newOffer.premium * commissionRate;
  const commissionDelta = newCommission - oldCommission;

  // 2. Client View Calc (Simulation)
  // We simulate a base offer that is 15% cheaper than current
  const baseOfferPremium = selectedPolicy ? selectedPolicy.premiumAmount * 0.85 : 0;
  
  // Dynamic Premium Calculation based on Slider
  // Logic: For every 500 CHF deductible increase, premium drops by ~5%
  const currentDeductible = selectedPolicy?.deductible || 0;
  const deductibleDiffSteps = (simulatedDeductible - currentDeductible) / 500; 
  const simulatedPremium = Math.round(baseOfferPremium * (1 - (deductibleDiffSteps * 0.05)));
  
  const clientSavings = selectedPolicy ? selectedPolicy.premiumAmount - simulatedPremium : 0;

  // Mock Insurers for dropdown
  const insurerOptions = MOCK_PARTNERS
    .filter(p => p.category === PartnerCategory.INSURANCE)
    .map(p => p.name);

  // Reset simulation when modal opens
  useEffect(() => {
      if(isSwitchModalOpen && role === UserRole.CLIENT) {
          // Auto-select first policy for demo if none selected
          if (!selectedPolicyId && activePolicies.length > 0) {
              setSelectedPolicyId(activePolicies[0].id);
              setSimulatedDeductible(activePolicies[0].deductible || 500);
          }
          // Reset animation
          setSimulationStep(0);
          setTimeout(() => setSimulationStep(1), 300);
      }
  }, [isSwitchModalOpen, role]);

  const handleSaveScenario = () => {
      setIsSavingScenario(true);
      setTimeout(() => {
          setIsSavingScenario(false);
          setIsSwitchModalOpen(false);
          console.log("Scenario saved");
      }, 1000);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {role === UserRole.CLIENT ? 'Meine Policen' : 'Policen Verwaltung'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
                {displayedPolicies.length} Verträge gefunden.
            </p>
        </div>
        <div className="flex gap-2 items-center">
            <div className="flex bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 mr-2">
                <button 
                    onClick={() => setViewMode('LIST')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'LIST' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Liste"
                >
                    <ListIcon size={18} />
                </button>
                <button 
                    onClick={() => setViewMode('GRID')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'GRID' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Kacheln"
                >
                    <LayoutGrid size={18} />
                </button>
            </div>

            <Button variant="secondary" icon={<ArrowRightLeft size={16} />} onClick={() => setIsSwitchModalOpen(true)}>
                {role === UserRole.CLIENT ? 'Sparpotenzial prüfen' : 'Wechsel-Rechner'}
            </Button>
            
            {role !== UserRole.CLIENT && (
                <>
                    <Button variant="outline" icon={<Download size={16} />}>Export</Button>
                    <Button variant="outline" icon={<Filter size={16} />}>Filter</Button>
                    <Button icon={<Plus size={16} />} onClick={() => { setEditPolicy(null); setIsPolicyFormOpen(true); }}>Police anlegen</Button>
                </>
            )}
        </div>
      </div>
      
      {viewMode === 'LIST' ? (
          <Card noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3">Policen-Nr.</th>
                    <th className="px-6 py-3">Versicherer</th>
                    <th className="px-6 py-3">Typ</th>
                    {role !== UserRole.CLIENT && <th className="px-6 py-3">Klient</th>}
                    <th className="px-6 py-3">Ablauf</th>
                    <th className="px-6 py-3 text-right">Prämie</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedPolicies.length > 0 ? displayedPolicies.map(policy => (
                    <tr key={policy.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{policy.policyNumber}</td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{policy.insurer}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{policy.type}</td>
                      
                      {role !== UserRole.CLIENT && (
                        <td className="px-6 py-4 text-brand-600 dark:text-brand-400">
                            <Link to={`/client/${policy.clientId}`} className="hover:underline">
                            {getClientName(policy.clientId)}
                            </Link>
                        </td>
                      )}

                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{policy.endDate}</td>
                      <td className="px-6 py-4 text-right font-medium"><SensitiveData>CHF {policy.premiumAmount.toFixed(2)}</SensitiveData></td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                          {policy.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {role !== UserRole.CLIENT && (
                          <Button size="sm" variant="ghost" onClick={() => { setEditPolicy(policy); setIsPolicyFormOpen(true); }}>Bearbeiten</Button>
                        )}
                        <Link to={`/policy/${policy.id}`}>
                          <Button size="sm" variant="ghost">Details</Button>
                        </Link>
                      </td>
                    </tr>
                  )) : (
                      <tr>
                          <td colSpan={role !== UserRole.CLIENT ? 8 : 7} className="px-6 py-12 text-center text-slate-500 italic">
                              Keine Policen gefunden.
                          </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPolicies.length > 0 ? displayedPolicies.map(policy => (
                  <div key={policy.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 text-lg">
                                  {policy.insurer.substring(0,2).toUpperCase()}
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{policy.type}</h3>
                                  <p className="text-xs text-slate-500">{policy.insurer}</p>
                              </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(policy.status)}`}>
                              {policy.status}
                          </span>
                      </div>
                      
                      <div className="space-y-3 mb-6 flex-1">
                          <div className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-2">
                              <span className="text-slate-500">Prämie</span>
                              <span className="font-bold"><SensitiveData>CHF {policy.premiumAmount.toFixed(2)}</SensitiveData></span>
                          </div>
                          <div className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-2">
                              <span className="text-slate-500">Ablauf</span>
                              <span className="font-medium">{policy.endDate}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Police Nr.</span>
                              <span className="font-mono text-xs">{policy.policyNumber}</span>
                          </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                          {role !== UserRole.CLIENT && (
                            <Button variant="ghost" onClick={() => { setEditPolicy(policy); setIsPolicyFormOpen(true); }}>Bearbeiten</Button>
                          )}
                          <Link to={`/policy/${policy.id}`} className="block flex-1">
                              <Button variant="outline" className="w-full justify-between group">
                                  Details ansehen
                                  <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                              </Button>
                          </Link>
                      </div>
                  </div>
              )) : (
                  <div className="col-span-full py-12 text-center text-slate-500 italic bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                      <Shield size={48} className="mx-auto mb-4 opacity-20" />
                      <p>Keine Policen gefunden.</p>
                  </div>
              )}
          </div>
      )}

      {/* Create/edit policy – full detail form */}
      <PolicyForm
        isOpen={isPolicyFormOpen}
        onClose={() => { setIsPolicyFormOpen(false); setEditPolicy(null); }}
        onSaved={refetchPolicies}
        clients={clients}
        initial={editPolicy}
      />

      {/* Insurance Switch Modal */}
      <Modal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        title={role === UserRole.CLIENT ? "Optimierungs-Vorschlag" : "Versicherungs-Wechsel Szenario"}
        maxWidth="max-w-5xl"
      >
          {role === UserRole.CLIENT ? (
              // --- CLIENT INTERACTIVE MODE ---
              <div className={`space-y-8 transition-opacity duration-700 ${simulationStep > 0 ? 'opacity-100' : 'opacity-0'}`}>
                  
                  {/* Header Intro */}
                  <div className="flex items-center gap-4 bg-brand-50 dark:bg-brand-900/10 p-4 rounded-xl border border-brand-100 dark:border-brand-800/30">
                      <div className="w-12 h-12 bg-white dark:bg-brand-900 rounded-full flex items-center justify-center text-brand-600 shadow-sm shrink-0">
                          <Sparkles size={24} />
                      </div>
                      <div>
                          <h3 className="font-bold text-brand-900 dark:text-brand-100">Ihr Berater hat eine Optimierung gefunden</h3>
                          <p className="text-sm text-brand-700 dark:text-brand-300">
                              Basierend auf Ihrem Profil könnten Sie durch einen Wechsel zur {newOffer.insurer || 'Baloise'} (Beispiel) sparen, ohne auf Leistung zu verzichten.
                          </p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative">
                      {/* VS Badge */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 text-slate-300 font-black text-xl w-12 h-12 rounded-full flex items-center justify-center border-4 border-slate-50 dark:border-slate-900 shadow-lg hidden md:flex">
                          VS
                      </div>

                      {/* Left: Current (Greyed) */}
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100 transition-opacity">
                          <div className="flex justify-between items-start mb-6">
                              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Aktuell</span>
                              <div className="text-right">
                                  <div className="font-bold text-slate-700 dark:text-slate-300">{selectedPolicy?.insurer}</div>
                                  <div className="text-xs text-slate-500">{selectedPolicy?.type}</div>
                              </div>
                          </div>
                          
                          <div className="space-y-4">
                              <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700/50">
                                  <span className="text-sm text-slate-500">Jahresprämie</span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">CHF {selectedPolicy?.premiumAmount.toFixed(0)}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700/50">
                                  <span className="text-sm text-slate-500">Selbstbehalt</span>
                                  <span className="font-mono">CHF {selectedPolicy?.deductible}</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                  <span className="text-sm text-slate-500">Glasbruch</span>
                                  <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">Teilweise</span>
                              </div>
                          </div>
                      </div>

                      {/* Right: New (Highlighted) */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-brand-500 shadow-2xl shadow-brand-500/10 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">EMPFEHLUNG</div>
                          
                          <div className="flex justify-between items-start mb-6">
                              <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Neu</span>
                              <div className="text-right">
                                  <div className="font-bold text-slate-900 dark:text-white">Baloise (Simuliert)</div>
                                  <div className="text-xs text-slate-500">SafePlan Plus</div>
                              </div>
                          </div>

                          <div className="space-y-6">
                              {/* Interactive Slider */}
                              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                  <div className="flex justify-between mb-2">
                                      <label className="text-xs font-bold text-slate-500 uppercase">Ihr Selbstbehalt (Wählbar)</label>
                                      <span className="font-bold text-brand-600">CHF {simulatedDeductible}</span>
                                  </div>
                                  <input 
                                    type="range" min="0" max="2000" step="100" 
                                    value={simulatedDeductible}
                                    onChange={(e) => setSimulatedDeductible(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                                  />
                                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                      <span>CHF 0</span>
                                      <span>CHF 2000</span>
                                  </div>
                              </div>

                              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                                  <span className="text-sm text-slate-500">Neue Prämie (Est.)</span>
                                  <span className="font-mono font-black text-xl text-brand-600">CHF {simulatedPremium}</span>
                              </div>

                              {/* AI Benefits */}
                              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                                  <div className="flex items-center gap-2 mb-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                                      <Sparkles size={12} /> KI-Analyse
                                  </div>
                                  <ul className="space-y-1 text-xs text-emerald-700 dark:text-emerald-300">
                                      <li className="flex items-center gap-2"><Check size={12}/> Grobfahrlässigkeit inklusive</li>
                                      <li className="flex items-center gap-2"><Check size={12}/> Parkschaden unbegrenzt</li>
                                  </ul>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Bottom: Result & CTA */}
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${clientSavings > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                              {clientSavings > 0 ? <TrendingDown size={32} /> : <Shield size={32} />}
                          </div>
                          <div>
                              <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Ihr Vorteil</p>
                              {clientSavings > 0 ? (
                                  <div className="text-3xl font-black text-emerald-600">
                                      CHF {clientSavings.toFixed(0)} <span className="text-sm font-medium text-slate-400">/ Jahr</span>
                                  </div>
                              ) : (
                                  <div className="text-xl font-bold text-slate-700 dark:text-slate-300">Bessere Leistung (Kostenneutral)</div>
                              )}
                          </div>
                      </div>
                      
                      <div className="flex gap-3 w-full md:w-auto">
                          <Button variant="outline" className="flex-1" onClick={() => setIsSwitchModalOpen(false)}>Später</Button>
                          <Button 
                            className="flex-1 md:px-8 bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20"
                            onClick={handleSaveScenario}
                            icon={isSavingScenario ? <Loader2 className="animate-spin" size={18}/> : <ThumbsUp size={18}/>}
                          >
                              {isSavingScenario ? 'Sende Anfrage...' : 'Angebot anfordern'}
                          </Button>
                      </div>
                  </div>
              </div>
          ) : (
              // --- BROKER ADMIN MODE (Original) ---
              <div className="space-y-8">
                  {/* ... Existing Broker Form Logic ... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                      {/* Current Policy */}
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs flex items-center justify-center">1</span>
                              Aktuelle Police
                          </h4>
                          
                          <div className="space-y-4 flex-1">
                              <div className="space-y-1">
                                  <label className="text-xs text-slate-500 uppercase font-medium">Police auswählen</label>
                                  <select 
                                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    value={selectedPolicyId}
                                    onChange={(e) => {
                                        const pid = e.target.value;
                                        setSelectedPolicyId(pid);
                                        const pol = displayedPolicies.find(p => p.id === pid); 
                                        if(pol) {
                                            setNewOffer({
                                                insurer: '',
                                                premium: Math.round(pol.premiumAmount * 0.9), 
                                                deductible: pol.deductible || 0,
                                                highlights: 'Gleiche Deckung'
                                            });
                                        }
                                    }}
                                  >
                                    <option value="">-- Bitte wählen --</option>
                                    {activePolicies.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.type} - {p.insurer} ({getClientName(p.clientId)})
                                        </option>
                                    ))}
                                  </select>
                              </div>

                              {selectedPolicy && (
                                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                      <div className="flex justify-between text-sm">
                                          <span className="text-slate-500">Versicherer</span>
                                          <span className="font-medium">{selectedPolicy.insurer}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                          <span className="text-slate-500">Jahresprämie</span>
                                          <span className="font-bold">CHF {selectedPolicy.premiumAmount.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                          <span className="text-slate-500">Selbstbehalt</span>
                                          <span className="font-medium">CHF {selectedPolicy.deductible?.toFixed(2) || '-'}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                          <span className="text-slate-500">Ablauf</span>
                                          <span className="font-medium text-amber-600">{selectedPolicy.endDate}</span>
                                      </div>
                                      <div className="mt-2 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-2 rounded border border-amber-100 dark:border-amber-800">
                                          Kündigungsfrist beachten: {selectedPolicy.cancellationNoticePeriod} Monate
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* New Offer Input */}
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-brand-200 dark:border-brand-900 shadow-lg shadow-brand-500/5 relative flex flex-col">
                          <h4 className="font-semibold text-brand-600 mb-4 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-xs flex items-center justify-center">2</span>
                              Neues Angebot
                          </h4>

                          <div className="space-y-4 flex-1">
                              <div className="space-y-1">
                                  <label className="text-xs text-slate-500 uppercase font-medium">Neuer Versicherer</label>
                                  <select 
                                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    value={newOffer.insurer}
                                    onChange={(e) => setNewOffer({...newOffer, insurer: e.target.value})}
                                    disabled={!selectedPolicy}
                                  >
                                    <option value="">-- Partner wählen --</option>
                                    {insurerOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                    <option value="Other">Andere...</option>
                                  </select>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                      <label className="text-xs text-slate-500 uppercase font-medium">Neue Prämie</label>
                                      <input 
                                        type="number" 
                                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold"
                                        value={newOffer.premium || ''}
                                        onChange={(e) => setNewOffer({...newOffer, premium: Number(e.target.value)})}
                                        disabled={!selectedPolicy}
                                      />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-xs text-slate-500 uppercase font-medium">Selbstbehalt</label>
                                      <input 
                                        type="number" 
                                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                        value={newOffer.deductible || ''}
                                        onChange={(e) => setNewOffer({...newOffer, deductible: Number(e.target.value)})}
                                        disabled={!selectedPolicy}
                                      />
                                  </div>
                              </div>

                              <div className="space-y-1">
                                  <label className="text-xs text-slate-500 uppercase font-medium">Leistungsunterschiede</label>
                                  <textarea 
                                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm h-24"
                                    placeholder="z.B. Grobfahrlässigkeit inklusive, Glasbruch gedeckt..."
                                    value={newOffer.highlights}
                                    onChange={(e) => setNewOffer({...newOffer, highlights: e.target.value})}
                                    disabled={!selectedPolicy}
                                  />
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Broker Result Area */}
                  {selectedPolicy && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className={`rounded-xl p-6 border flex items-center justify-between transition-colors ${
                              isSaving 
                              ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' 
                              : 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'
                          }`}>
                              <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-full ${isSaving ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                      {isSaving ? <TrendingDown size={24} /> : <X size={24} />}
                                  </div>
                                  <div>
                                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resultat für Kunde</p>
                                      <h3 className={`text-2xl font-bold ${isSaving ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                                          {isSaving ? 'Spart' : '+Kosten'}: CHF {Math.abs(savings).toFixed(2)}
                                      </h3>
                                  </div>
                              </div>
                          </div>

                          <div className="rounded-xl p-6 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
                              <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2 text-slate-500">
                                      <Wallet size={16} />
                                      <span className="text-xs font-bold uppercase tracking-wider">Makler Provision (Intern)</span>
                                  </div>
                                  <button onClick={() => setShowCommission(!showCommission)} className="text-slate-400 hover:text-slate-600">
                                      {showCommission ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                              </div>
                              
                              {showCommission ? (
                                  <div className="flex items-center justify-between">
                                      <div>
                                          <p className="text-xs text-slate-400">Abschlussprovision (Est.)</p>
                                          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">CHF {newCommission.toFixed(2)}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-xs text-slate-400">Delta vs. Alt</p>
                                          <p className={`font-mono font-medium ${commissionDelta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                              {commissionDelta >= 0 ? '+' : ''}{commissionDelta.toFixed(2)}
                                          </p>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="h-10 flex items-center justify-center text-slate-400 italic text-sm">
                                      Wert ausgeblendet
                                  </div>
                              )}
                          </div>
                      </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Button variant="outline" onClick={() => setIsSwitchModalOpen(false)}>Abbrechen</Button>
                      <Button 
                        icon={isSavingScenario ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                        disabled={!selectedPolicy || isSavingScenario}
                        onClick={handleSaveScenario}
                      >
                          {isSavingScenario ? 'Speichere...' : 'Vergleich speichern & Offerte erstellen'}
                      </Button>
                  </div>
              </div>
          )}
      </Modal>
    </Layout>
  );
};
