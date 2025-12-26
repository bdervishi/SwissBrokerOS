import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MOCK_MORTGAGES, MOCK_CLIENTS } from '../constants';
import { 
  ArrowLeft, 
  Home, 
  TrendingDown, 
  Calendar, 
  Percent,
  FileText,
  PieChart as PieIcon,
  Download
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export const MortgageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AMORTIZATION' | 'DOCUMENTS'>('OVERVIEW');

  const mortgage = MOCK_MORTGAGES.find(m => m.id === id);
  
  if (!mortgage) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-slate-500 mb-4">Hypothek nicht gefunden</p>
          <Button onClick={() => navigate(-1)}>Zurück</Button>
        </div>
      </Layout>
    );
  }

  const client = MOCK_CLIENTS.find(c => c.id === mortgage.clientId);

  // Data for Charts
  const LTV_DATA = [
    { name: 'Hypothek', value: mortgage.loanAmount },
    { name: 'Eigenkapital', value: mortgage.propertyValue - mortgage.loanAmount }
  ];
  const LTV_COLORS = ['#6366f1', '#cbd5e1'];
  
  const ltvRatio = (mortgage.loanAmount / mortgage.propertyValue) * 100;

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
             <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
               <Home size={32} />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{mortgage.propertyName}</h1>
               <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                 <span>CHF {mortgage.propertyValue.toLocaleString()} Marktwert</span>
                 <span>•</span>
                 <span>{mortgage.type === 'FIXED' ? 'Festhypothek' : 'SARON / Flex'}</span>
               </div>
             </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline">Verlängern</Button>
             <Button variant="outline">Ablösen</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <TabButton active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} icon={<PieIcon size={16} />} label="Übersicht & Finanzierung" />
        <TabButton active={activeTab === 'AMORTIZATION'} onClick={() => setActiveTab('AMORTIZATION')} icon={<TrendingDown size={16} />} label="Amortisation" />
        <TabButton active={activeTab === 'DOCUMENTS'} onClick={() => setActiveTab('DOCUMENTS')} icon={<FileText size={16} />} label="Dokumente" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main */}
         <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'OVERVIEW' && (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Finanzierungsstruktur">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={LTV_DATA}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {LTV_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={LTV_COLORS[index % LTV_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value: number) => `CHF ${value.toLocaleString()}`} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-slate-500">Belehnung (LTV)</p>
                            <p className={`text-2xl font-bold ${ltvRatio > 80 ? 'text-red-600' : 'text-slate-900 dark:text-slate-100'}`}>
                                {ltvRatio.toFixed(1)}%
                            </p>
                        </div>
                    </Card>

                    <Card title="Konditionen">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                                <span className="text-slate-500 flex items-center gap-2"><Percent size={16}/> Zinssatz</span>
                                <span className="font-bold">{mortgage.interestRate}%</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                                <span className="text-slate-500 flex items-center gap-2"><Calendar size={16}/> Startdatum</span>
                                <span className="font-medium">{mortgage.startDate}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                                <span className="text-slate-500 flex items-center gap-2"><Calendar size={16}/> Enddatum</span>
                                <span className="font-medium">{mortgage.endDate}</span>
                            </div>
                             <div className="flex justify-between items-center py-2">
                                <span className="text-slate-500">Laufzeit</span>
                                <span className="font-medium">{mortgage.durationYears} Jahre</span>
                            </div>
                        </div>
                    </Card>
                </div>
                
                <Card title="Monatliche Kosten">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">CHF {mortgage.monthlyCost.toFixed(2)}</p>
                            <p className="text-sm text-slate-500">Indikative Belastung</p>
                        </div>
                        <Button variant="outline">Zahlungsplan</Button>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                        <p>Die Tragbarkeit liegt bei ca. <strong>24%</strong> (basierend auf kalkulatorischem Zins von 5%). Das ist im grünen Bereich.</p>
                    </div>
                </Card>
                </>
            )}

            {activeTab === 'AMORTIZATION' && (
                <Card title="Amortisationsplan">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg mb-6">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Amortisationsart: {mortgage.amortizationMethod === 'INDIRECT' ? 'Indirekt (Säule 3a)' : 'Direkt'}</strong>
                            <br/>
                            {mortgage.amortizationMethod === 'INDIRECT' 
                             ? 'Die Amortisation erfolgt über Einzahlungen in die verpfändete Säule 3a. Die Hypothekarschuld bleibt konstant, das Steuerprivileg wird maximiert.' 
                             : 'Die Hypothekarschuld wird laufend reduziert, was die Zinslast senkt, aber die Steuerbelastung erhöhen kann.'}
                        </p>
                    </div>
                    
                    <table className="w-full text-sm text-left">
                        <thead className="text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="pb-3">Jahr</th>
                                <th className="pb-3">Restschuld</th>
                                <th className="pb-3">Zinszahlung</th>
                                <th className="pb-3">Amortisation</th>
                                <th className="pb-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[0, 1, 2, 3, 4].map((year) => {
                                const debt = mortgage.loanAmount - (mortgage.amortizationMethod === 'DIRECT' ? year * 5000 : 0);
                                const interest = debt * (mortgage.interestRate / 100);
                                const amort = mortgage.amortizationMethod === 'DIRECT' ? 5000 : 6883; // approx max 3a
                                return (
                                    <tr key={year}>
                                        <td className="py-3 font-medium">202{4 + year}</td>
                                        <td className="py-3">CHF {debt.toLocaleString()}</td>
                                        <td className="py-3">CHF {interest.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                        <td className="py-3">CHF {amort.toLocaleString()} {mortgage.amortizationMethod === 'INDIRECT' && '(3a)'}</td>
                                        <td className="py-3 text-right font-medium">CHF {(interest + amort).toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Card>
            )}

            {activeTab === 'DOCUMENTS' && (
                 <Card title="Vertragsdokumente">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                         <div className="py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 -mx-6 px-6 transition-colors">
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"><FileText size={20} /></div>
                                <div>
                                   <p className="font-medium text-slate-900 dark:text-slate-100">Rahmenvertrag Hypothek</p>
                                   <p className="text-xs text-slate-500">01.07.2020 • PDF • 2.4 MB</p>
                                </div>
                             </div>
                             <Button variant="ghost" size="sm" icon={<Download size={16} />}>Download</Button>
                         </div>
                         <div className="py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 -mx-6 px-6 transition-colors">
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"><FileText size={20} /></div>
                                <div>
                                   <p className="font-medium text-slate-900 dark:text-slate-100">Schätzungsgutachten</p>
                                   <p className="text-xs text-slate-500">15.06.2020 • PDF • 5.1 MB</p>
                                </div>
                             </div>
                             <Button variant="ghost" size="sm" icon={<Download size={16} />}>Download</Button>
                         </div>
                    </div>
                 </Card>
            )}
         </div>

         {/* Sidebar Stats */}
         <div className="space-y-6">
            <Card title="Hypotheken-Details">
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Hypothekarbetrag</span>
                      <span className="font-bold">CHF {mortgage.loanAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Eigenkapital</span>
                      <span className="font-medium">CHF {(mortgage.propertyValue - mortgage.loanAmount).toLocaleString()}</span>
                  </div>
                   <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Total Objektwert</span>
                      <span className="font-bold">CHF {mortgage.propertyValue.toLocaleString()}</span>
                  </div>
               </div>
            </Card>

            <div className="bg-indigo-600 rounded-xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Markt-Radar</h3>
                <p className="text-indigo-100 text-sm mb-4">
                    Die Festhypotheken für 10 Jahre sind seit Abschluss um <strong>0.35%</strong> gestiegen. Ihr aktueller Zinssatz von {mortgage.interestRate}% performt überdurchschnittlich.
                </p>
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