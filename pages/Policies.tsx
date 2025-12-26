import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { MOCK_POLICIES, MOCK_CLIENTS, MOCK_PARTNERS } from '../constants';
import { FileText, Filter, Download, ArrowRightLeft, Check, X, TrendingDown, ArrowRight, Save, Eye, EyeOff, Wallet, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link, Navigate } from 'react-router-dom';
import { InsuranceSwitchScenario, PartnerCategory, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const Policies: React.FC = () => {
  const { user, role } = useAuth();
  
  // Switch Scenario State
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [isSavingScenario, setIsSavingScenario] = useState(false);
  const [newOffer, setNewOffer] = useState({
    insurer: '',
    premium: 0,
    deductible: 0,
    highlights: ''
  });
  
  // Commission Visibility State
  const [showCommission, setShowCommission] = useState(false);

  // DATA FILTERING (Rational Database Logic)
  let displayedPolicies = MOCK_POLICIES;
  if (role === UserRole.CLIENT && user) {
      displayedPolicies = MOCK_POLICIES.filter(p => p.clientId === user.id);
  }

  const getClientName = (id: string) => {
    const c = MOCK_CLIENTS.find(client => client.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Unbekannt';
  };

  const activePolicies = displayedPolicies.filter(p => p.status === 'ACTIVE');
  const selectedPolicy = displayedPolicies.find(p => p.id === selectedPolicyId);
  
  // Calculate Savings
  const currentPremium = selectedPolicy ? selectedPolicy.premiumAmount : 0;
  const savings = currentPremium - newOffer.premium;
  const isSaving = savings > 0;

  // Calculate Mock Commission
  // Standard commission approx 15% for new business
  const commissionRate = 0.15;
  const oldCommission = currentPremium * 0.10; // Recurring is usually lower (e.g. 10% or less)
  const newCommission = newOffer.premium * commissionRate;
  const commissionDelta = newCommission - oldCommission;

  // Mock Insurers for dropdown
  const insurerOptions = MOCK_PARTNERS
    .filter(p => p.category === PartnerCategory.INSURANCE)
    .map(p => p.name);

  const handleSaveScenario = () => {
      setIsSavingScenario(true);
      // Simulate API call
      setTimeout(() => {
          setIsSavingScenario(false);
          setIsSwitchModalOpen(false);
          // In a real app, show toast notification here
          console.log("Scenario saved", { selectedPolicyId, newOffer });
      }, 1000);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {role === UserRole.CLIENT ? 'Meine Policen' : 'Policen Verwaltung'}
        </h1>
        <div className="flex gap-2">
            {/* Show Switch Calculator to everyone, but hide internal details later */}
            <Button variant="secondary" icon={<ArrowRightLeft size={16} />} onClick={() => setIsSwitchModalOpen(true)}>
                {role === UserRole.CLIENT ? 'Sparpotenzial prüfen' : 'Wechsel-Rechner'}
            </Button>
            
            {role !== UserRole.CLIENT && (
                <>
                    <Button variant="outline" icon={<Download size={16} />}>Export</Button>
                    <Button variant="outline" icon={<Filter size={16} />}>Filter</Button>
                </>
            )}
        </div>
      </div>
      
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
                  <td className="px-6 py-4 text-right font-medium">CHF {policy.premiumAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {policy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
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

      {/* Insurance Switch Modal */}
      <Modal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        title="Versicherungs-Wechsel Szenario"
        maxWidth="max-w-4xl"
      >
          <div className="space-y-8">
              {/* 1. Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                  
                  {/* Left: Existing Policy */}
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
                                        {p.type} - {p.insurer} ({role !== UserRole.CLIENT && getClientName(p.clientId)})
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

                  {/* Right: New Offer Input */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-brand-200 dark:border-brand-900 shadow-lg shadow-brand-500/5 relative flex flex-col">
                      <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1.5 shadow-sm z-10 hidden md:block">
                          <ArrowRight size={20} className="text-slate-400" />
                      </div>

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

              {/* Result Area */}
              {selectedPolicy && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Customer View */}
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

                      {/* Internal Broker View - HIDDEN FOR CLIENTS */}
                      {role !== UserRole.CLIENT && (
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
                      )}
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
      </Modal>
    </Layout>
  );
};