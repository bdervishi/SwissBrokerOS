import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { MOCK_MORTGAGES, MOCK_CLIENTS } from '../constants';
import { Link } from 'react-router-dom';
import { Plus, Building, Percent, Calculator, CheckCircle, AlertCircle, Save, X, Eye, EyeOff, Wallet } from 'lucide-react';
import { MortgageType, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const Mortgages: React.FC = () => {
  const { user, role } = useAuth();
  
  // Sidebar Quick Calculator State
  const [calcPrice, setCalcPrice] = useState(1000000);
  const [calcCapital, setCalcCapital] = useState(250000);
  const [calcIncome, setCalcIncome] = useState(180000);

  // Modal Scenario Creator State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCommission, setShowCommission] = useState(false);
  const [scenarioForm, setScenarioForm] = useState({
    propertyValue: 1200000,
    ownCapital: 300000,
    annualIncome: 160000,
    loanAmount: 900000,
    interestType: MortgageType.FIXED,
    interestRate: 1.85, // Actual rate for offer
  });

  // DATA FILTERING
  let displayedMortgages = MOCK_MORTGAGES;
  if (role === UserRole.CLIENT && user) {
      displayedMortgages = MOCK_MORTGAGES.filter(m => m.clientId === user.id);
  }

  // Calculate Quick Calc (Sidebar)
  const quickLoanAmount = calcPrice - calcCapital;
  const quickLtv = (quickLoanAmount / calcPrice) * 100;
  const quickAffordability = calculateAffordability(calcPrice, quickLoanAmount, calcIncome);

  // Calculate Scenario (Modal) - Swiss Standard Rules
  function calculateAffordability(price: number, loan: number, income: number) {
    if (income === 0) return 0;
    const imputedInterest = loan * 0.05; // 5% kalkulatorisch
    const maintenance = price * 0.01; // 1% Nebenkosten
    const amortization = loan * 0.01; // 1% Amortisation (Simplified rule of thumb)
    
    const totalCost = imputedInterest + maintenance + amortization;
    return (totalCost / income) * 100;
  }

  const scenarioLtv = (scenarioForm.loanAmount / scenarioForm.propertyValue) * 100;
  const scenarioAffordability = calculateAffordability(
    scenarioForm.propertyValue, 
    scenarioForm.loanAmount, 
    scenarioForm.annualIncome
  );
  
  // Commission Calculation (e.g. 0.35% Finder's Fee)
  const commissionRate = 0.35;
  const potentialCommission = scenarioForm.loanAmount * (commissionRate / 100);

  // Auto-update loan amount when property/equity changes in modal (optional convenience)
  useEffect(() => {
    // Only auto-calc if the difference makes sense (standard case)
    if (isModalOpen) {
       const diff = scenarioForm.propertyValue - scenarioForm.ownCapital;
       if (diff > 0) {
           setScenarioForm(prev => ({ ...prev, loanAmount: diff }));
       }
    }
  }, [scenarioForm.propertyValue, scenarioForm.ownCapital, isModalOpen]);


  const getClientName = (id: string) => {
    const c = MOCK_CLIENTS.find(client => client.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Unbekannt';
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Hypotheken & Finanzierung</h1>
        <Button icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>Neues Szenario</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Mortgages List */}
          <Card title="Laufende Finanzierungen" noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    {role !== UserRole.CLIENT && <th className="px-6 py-3">Klient</th>}
                    <th className="px-6 py-3">Objekt</th>
                    <th className="px-6 py-3">Volumen</th>
                    <th className="px-6 py-3">Zins</th>
                    <th className="px-6 py-3">Laufzeit</th>
                    <th className="px-6 py-3">Typ</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedMortgages.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      {role !== UserRole.CLIENT && (
                        <td className="px-6 py-4 font-medium text-brand-600 dark:text-brand-400">
                            <Link to={`/client/${m.clientId}`} className="hover:underline">
                                {getClientName(m.clientId)}
                            </Link>
                        </td>
                      )}
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{m.propertyName}</td>
                      <td className="px-6 py-4 font-mono">CHF {m.loanAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">{m.interestRate}%</td>
                      <td className="px-6 py-4">{m.durationYears} Jahre</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            m.type === 'FIXED' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {m.type === MortgageType.FIXED ? 'Festhypothek' : m.type === MortgageType.SARON ? 'SARON' : 'Mix'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/mortgage/${m.id}`}>
                           <Button size="sm" variant="ghost">Details</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {displayedMortgages.length === 0 && (
                      <tr>
                          <td colSpan={role !== UserRole.CLIENT ? 7 : 6} className="px-6 py-12 text-center text-slate-500 italic">
                              Keine Hypotheken gefunden.
                          </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-brand-600 rounded-xl text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                      <p className="text-brand-100 mb-1 font-medium">Totales Hypothekarvolumen</p>
                      <h3 className="text-3xl font-bold">CHF {(displayedMortgages.reduce((sum, m) => sum + m.loanAmount, 0)/1000000).toFixed(1)}M</h3>
                      <div className="mt-4 flex items-center gap-2 text-sm text-brand-100">
                          <Building size={16} />
                          <span>Verwaltet über Plattform</span>
                      </div>
                  </div>
                  <Building className="absolute -right-6 -bottom-6 text-brand-500 w-32 h-32 opacity-20" />
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                   <div className="flex items-center gap-3 mb-2">
                       <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                           <Percent size={20} />
                       </div>
                       <p className="text-slate-500 font-medium">Ø Zinssatz (Portfolio)</p>
                   </div>
                   <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">1.65%</h3>
                   <p className="text-xs text-slate-400 mt-2">Nächste Refinanzierung in 14 Monaten</p>
              </div>
          </div>

        </div>

        {/* Sidebar Calculator (Quick Check) */}
        <div>
           <Card title="Schnell-Check" className="sticky top-6">
              <div className="space-y-8">
                  <div className="space-y-6">
                      <SliderInput 
                        label="Kaufpreis" 
                        value={calcPrice} 
                        onChange={setCalcPrice} 
                        min={200000} 
                        max={3000000} 
                        step={10000} 
                      />
                      <SliderInput 
                        label="Eigenmittel" 
                        value={calcCapital} 
                        onChange={setCalcCapital} 
                        min={0} 
                        max={calcPrice} // Dynamisch
                        step={5000} 
                      />
                      <SliderInput 
                        label="Einkommen p.a." 
                        value={calcIncome} 
                        onChange={setCalcIncome} 
                        min={40000} 
                        max={400000} 
                        step={1000} 
                      />
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <ResultBar label="Belehnung (LTV)" value={quickLtv} threshold={80} invertThreshold />
                    <ResultBar label="Tragbarkeit" value={quickAffordability} threshold={33} invertThreshold />
                  </div>
              </div>
           </Card>
        </div>
      </div>

      {/* NEW SCENARIO MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Neues Finanzierungs-Szenario"
      >
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Inputs */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-brand-600 uppercase tracking-wide">Objekt & Mittel</h4>
                    
                    <div className="space-y-2">
                        <label className="text-sm text-slate-600 dark:text-slate-400">Objektwert</label>
                        <input 
                            type="number" 
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent"
                            value={scenarioForm.propertyValue}
                            onChange={e => setScenarioForm({...scenarioForm, propertyValue: Number(e.target.value)})}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm text-slate-600 dark:text-slate-400">Eigenkapital</label>
                        <input 
                            type="number" 
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent"
                            value={scenarioForm.ownCapital}
                            onChange={e => setScenarioForm({...scenarioForm, ownCapital: Number(e.target.value)})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-600 dark:text-slate-400">Hypothekarbetrag (Gesamt)</label>
                        <input 
                            type="number" 
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent font-bold"
                            value={scenarioForm.loanAmount}
                            onChange={e => setScenarioForm({...scenarioForm, loanAmount: Number(e.target.value)})}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-brand-600 uppercase tracking-wide">Kunde & Konditionen</h4>
                    
                    <div className="space-y-2">
                        <label className="text-sm text-slate-600 dark:text-slate-400">Bruttojahreseinkommen</label>
                        <input 
                            type="number" 
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent"
                            value={scenarioForm.annualIncome}
                            onChange={e => setScenarioForm({...scenarioForm, annualIncome: Number(e.target.value)})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-slate-600 dark:text-slate-400">Modell</label>
                            <select 
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent"
                                value={scenarioForm.interestType}
                                onChange={e => setScenarioForm({...scenarioForm, interestType: e.target.value as MortgageType})}
                            >
                                <option value={MortgageType.FIXED}>Fest</option>
                                <option value={MortgageType.SARON}>SARON</option>
                                <option value={MortgageType.MIXED}>Mix</option>
                            </select>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm text-slate-600 dark:text-slate-400">Richt-Zins %</label>
                            <input 
                                type="number" 
                                step="0.01"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent"
                                value={scenarioForm.interestRate}
                                onChange={e => setScenarioForm({...scenarioForm, interestRate: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section in Modal */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Calculator size={16} />
                    Analyse nach Schweizer Tragbarkeits-Norm
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LTV */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-slate-500">Belehnung (LTV)</span>
                            <span className={`font-bold ${scenarioLtv <= 80 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {scenarioLtv.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                             <div 
                                className={`h-full ${scenarioLtv <= 80 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                                style={{ width: `${Math.min(scenarioLtv, 100)}%` }}
                             />
                        </div>
                        <div className="mt-2 text-xs text-slate-400 flex justify-between">
                            <span>Limit: 80%</span>
                            <span>2. Hypothek ab 66%</span>
                        </div>
                    </div>

                    {/* Affordability */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-slate-500">Tragbarkeit</span>
                            <span className={`font-bold ${scenarioAffordability <= 33 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {scenarioAffordability.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                             <div 
                                className={`h-full ${scenarioAffordability <= 33 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                                style={{ width: `${Math.min(scenarioAffordability, 100)}%` }}
                             />
                        </div>
                         <div className="mt-2 text-xs text-slate-400">
                             Basis: 5% Zins, 1% Amort., 1% Unterhalt
                        </div>
                    </div>
                </div>

                {/* Conclusion Box */}
                <div className={`mt-6 p-4 rounded-lg border flex gap-3 ${
                    scenarioLtv <= 80 && scenarioAffordability <= 33 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400'
                }`}>
                    {scenarioLtv <= 80 && scenarioAffordability <= 33 
                        ? <CheckCircle className="shrink-0" /> 
                        : <AlertCircle className="shrink-0" />
                    }
                    <div>
                        <p className="font-bold text-sm">
                            {scenarioLtv <= 80 && scenarioAffordability <= 33 
                                ? 'Szenario ist tragbar.' 
                                : 'Achtung: Richtlinien nicht erfüllt.'}
                        </p>
                        <p className="text-xs opacity-90 mt-1">
                             {scenarioLtv > 80 && 'Eigenmittel erhöhen. '}
                             {scenarioAffordability > 33 && 'Einkommen zu tief für diese Hypothekarsumme bei kalkulatorischem Zins von 5%.'}
                        </p>
                    </div>
                </div>

                {/* Broker Commission Section - HIDDEN FOR CLIENTS */}
                {role !== UserRole.CLIENT && (
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Wallet size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Vermittlungsprovision (Intern)</span>
                            </div>
                            <button onClick={() => setShowCommission(!showCommission)} className="text-slate-400 hover:text-slate-600">
                                {showCommission ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {showCommission ? (
                            <div className="mt-2 flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-lg p-3">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Finder's Fee ({commissionRate}%)</span>
                                <span className="font-bold text-emerald-600">CHF {potentialCommission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                        ) : (
                            <div className="mt-2 h-10 flex items-center justify-center text-slate-400 italic text-sm bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                Wird berechnet...
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Abbrechen</Button>
                <Button icon={<Save size={18} />}>Szenario speichern</Button>
            </div>
        </div>
      </Modal>
    </Layout>
  );
};

// Helper for slider + input combo
const SliderInput = ({ label, value, onChange, min, max, step }: any) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
            <input 
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-28 px-2 py-1 text-right text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded hover:border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />
        </div>
        <input 
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
        />
    </div>
);

// Helper Component for Sidebar Results
const ResultBar = ({ label, value, threshold, invertThreshold }: { label: string, value: number, threshold: number, invertThreshold?: boolean }) => {
    const isGood = invertThreshold ? value <= threshold : value >= threshold;
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                <span className={`font-bold ${isGood ? 'text-emerald-600' : 'text-red-600'}`}>
                    {value.toFixed(1)}%
                </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                className={`h-full ${isGood ? 'bg-emerald-500' : 'bg-red-500'}`} 
                style={{ width: `${Math.min(value, 100)}%` }}
                />
            </div>
        </div>
    );
}