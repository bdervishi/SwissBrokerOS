import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MOCK_BANK_OFFERS } from '../constants';
import { CreditType, BankOffer, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
    CreditCard, 
    Car, 
    Calculator, 
    Percent, 
    CheckCircle, 
    ArrowRight, 
    Info, 
    Settings, 
    DollarSign, 
    ShieldCheck
} from 'lucide-react';
import { SensitiveData } from '../components/ui/SensitiveData';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const CreditSimulation: React.FC = () => {
    const { role } = useAuth();
    const [mode, setMode] = useState<CreditType>(CreditType.PRIVATE);
    
    // --- INPUT STATE ---
    const [amount, setAmount] = useState(30000);
    const [duration, setDuration] = useState(36); // Months
    const [residualValue, setResidualValue] = useState(0); // For Leasing only
    
    // --- BROKER CONFIG (Dynamic Pricing) ---
    const [brokerMargin, setBrokerMargin] = useState(0.5); // % added to bank rate
    const [showInternalInfo, setShowInternalInfo] = useState(false);

    // Access Control
    if (role === UserRole.CLIENT) {
        // Clients can see calculator but NOT internal margin tools
        // Logic handled in render
    } else if (role !== UserRole.BROKER_ADMIN && role !== UserRole.BROKER_AGENT && role !== UserRole.SAAS_SUPER_ADMIN) {
        return <Navigate to="/dashboard" />;
    }

    // --- CALCULATIONS ---
    
    const calculateMonthlyRate = (offer: BankOffer) => {
        // Simple Annuity Formula for Credit
        // Rate = P * (r * (1+r)^n) / ((1+r)^n - 1)
        // Note: Swiss Consumer Credit is usually simple interest calculation for estimation
        // Here we use a standard simplified formula for UI demo
        
        const effectiveRate = offer.interestRateRange[0] + brokerMargin;
        const monthlyRate = effectiveRate / 12 / 100;
        
        if (mode === CreditType.LEASING) {
            // Simplified Leasing Formula: (NetPrice - Residual) / Months + Interest
            const depreciation = (amount - residualValue) / duration;
            const interestPart = ((amount + residualValue) / 2) * monthlyRate;
            return depreciation + interestPart;
        } else {
            // Standard Credit
            if (monthlyRate === 0) return amount / duration;
            return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -duration));
        }
    };

    const offers = MOCK_BANK_OFFERS.filter(o => o.type === mode);

    // Amortization Chart Data
    const generateChartData = () => {
        const data = [];
        const bestOffer = offers[0]; // Baseline
        if (!bestOffer) return [];
        
        const monthlyPayment = calculateMonthlyRate(bestOffer);
        let balance = amount;
        
        for (let i = 0; i <= duration; i++) {
            data.push({ month: i, balance: Math.max(0, balance) });
            // Approximate reduction
            if (mode === CreditType.LEASING) {
                balance -= (amount - residualValue) / duration;
            } else {
                // Interest part
                const effectiveRate = (bestOffer.interestRateRange[0] + brokerMargin) / 12 / 100;
                const interest = balance * effectiveRate;
                const principal = monthlyPayment - interest;
                balance -= principal;
            }
        }
        return data;
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {mode === CreditType.LEASING ? <Car className="text-brand-600" /> : <CreditCard className="text-brand-600" />}
                        {mode === CreditType.LEASING ? 'Fahrzeug Leasing' : 'Privatkredit Vergleich'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Echtzeit-Konditionen von {offers.length} Finanzierungspartnern.
                    </p>
                </div>
                
                {/* Mode Switcher */}
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex border border-slate-200 dark:border-slate-700">
                    <button 
                        onClick={() => setMode(CreditType.PRIVATE)}
                        className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${mode === CreditType.PRIVATE ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <CreditCard size={16} /> Barkredit
                    </button>
                    <button 
                        onClick={() => { setMode(CreditType.LEASING); setResidualValue(amount * 0.3); }} // Default residual
                        className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${mode === CreditType.LEASING ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <Car size={16} /> Leasing
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: CALCULATOR */}
                <div className="space-y-6">
                    <Card title="Finanzierungsbedarf">
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {mode === CreditType.LEASING ? 'Fahrzeugpreis (Netto)' : 'Kreditbetrag'}
                                    </label>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">CHF {amount.toLocaleString()}</span>
                                </div>
                                <input 
                                    type="range" min={1000} max={150000} step={500} 
                                    value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                                />
                            </div>

                            {mode === CreditType.LEASING && (
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Restwert</label>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">CHF {residualValue.toLocaleString()}</span>
                                    </div>
                                    <input 
                                        type="range" min={0} max={amount * 0.6} step={500} 
                                        value={residualValue} onChange={(e) => setResidualValue(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                                    />
                                    <div className="flex justify-end mt-1">
                                        <span className="text-xs text-slate-500">{((residualValue/amount)*100).toFixed(0)}% vom Neupreis</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Laufzeit</label>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{duration} Monate</span>
                                </div>
                                <input 
                                    type="range" min={12} max={84} step={12} 
                                    value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                                />
                                <div className="flex justify-between mt-2 text-xs text-slate-400">
                                    <span>12 M</span>
                                    <span>84 M</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* BROKER MARGIN TOOL (Hidden for Clients) */}
                    {role !== UserRole.CLIENT && (
                        <Card className="border-l-4 border-l-purple-500">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Settings size={16} /> Dynamic Pricing
                                </h3>
                                <button onClick={() => setShowInternalInfo(!showInternalInfo)} className="text-xs text-brand-600 hover:underline">
                                    {showInternalInfo ? 'Verbergen' : 'Anzeigen'}
                                </button>
                            </div>
                            
                            {showInternalInfo ? (
                                <div className="space-y-4 animate-in fade-in">
                                    <div>
                                        <div className="flex justify-between mb-2 text-sm">
                                            <span>Ihr Zinsaufschlag (Marge)</span>
                                            <span className="font-bold text-purple-600">+{brokerMargin.toFixed(2)}%</span>
                                        </div>
                                        <input 
                                            type="range" min={0} max={2.0} step={0.1} 
                                            value={brokerMargin} onChange={(e) => setBrokerMargin(Number(e.target.value))}
                                            className="w-full h-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                        <p className="text-xs text-slate-500 mt-2">
                                            Erhöht den Endkunden-Zins. Ihre Marge wird zusätzlich zur Bank-Provision ausbezahlt.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 italic">Klicken Sie auf Anzeigen, um Ihre Marge anzupassen.</p>
                            )}
                        </Card>
                    )}

                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-4">Verlauf Restschuld</h4>
                        <div className="h-[150px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={generateChartData()}>
                                    <defs>
                                        <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="balance" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorBal)" strokeWidth={2} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* RIGHT: OFFERS LIST */}
                <div className="lg:col-span-2 space-y-4">
                    {offers.map(offer => {
                        const monthlyRate = calculateMonthlyRate(offer);
                        const brokerCommission = amount * (offer.commissionPercentage / 100);
                        const marginBonus = amount * (brokerMargin / 100) * (duration / 12); // Rough calc of interest margin value over time
                        
                        // SaaS Fee Calculation (Transparent for Admin/Broker)
                        const saasFee = brokerCommission * 0.10; // 10% Platform Fee
                        const netEarnings = brokerCommission + marginBonus - saasFee;

                        return (
                            <div key={offer.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-brand-300 transition-all group">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    
                                    {/* Bank Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-400 border border-slate-100 dark:border-slate-700">
                                            {offer.bankName.substring(0, 2)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{offer.bankName}</h3>
                                            <p className="text-sm text-slate-500">{offer.productName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                                                    Max. {offer.maxDuration} Monate
                                                </span>
                                                <span className="text-xs flex items-center gap-1 text-emerald-600">
                                                    <CheckCircle size={10} /> Sofortzusage
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cost Info */}
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
                                            CHF {monthlyRate.toFixed(2)}
                                        </div>
                                        <p className="text-xs text-slate-500 mb-1">Monatsrate (Indikativ)</p>
                                        <div className="inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded text-xs font-bold">
                                            <Percent size={10} />
                                            {(offer.interestRateRange[0] + brokerMargin).toFixed(2)}% Effektivzins
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                        <Button icon={<ArrowRight size={16} />}>
                                            Offerte anfragen
                                        </Button>
                                        <button className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1">
                                            <Info size={12} /> Details
                                        </button>
                                    </div>
                                </div>

                                {/* INTERNAL BROKER/SAAS INFO (Hidden for Clients) */}
                                {role !== UserRole.CLIENT && showInternalInfo && (
                                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 -mx-6 px-6 -mb-6 pb-4 rounded-b-xl animate-in slide-in-from-top-2">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                            <div>
                                                <span className="block text-slate-400">Bank Kickback ({offer.commissionPercentage}%)</span>
                                                <span className="font-mono font-medium">CHF {brokerCommission.toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <span className="block text-slate-400">Ihre Marge (Zinsaufschlag)</span>
                                                <span className="font-mono font-medium text-purple-600">+ CHF {marginBonus.toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <span className="block text-slate-400">Platform Fee (SaaS)</span>
                                                <span className="font-mono font-medium text-red-400">- CHF {saasFee.toFixed(2)}</span>
                                            </div>
                                            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded border border-emerald-200 dark:border-emerald-800">
                                                <span className="block text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Ihr Total Profit</span>
                                                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                                                    <SensitiveData>CHF {netEarnings.toFixed(2)}</SensitiveData>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

            </div>
            
            {/* Legal Disclaimer */}
            <div className="mt-12 text-xs text-slate-400 text-center max-w-2xl mx-auto">
                <p className="flex items-center justify-center gap-2 mb-1">
                    <ShieldCheck size={14} />
                    Hinweis gemäss KKG
                </p>
                <p>
                    Die Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG). 
                    Angezeigte Zinsen sind indikativ und bonitätsabhängig.
                </p>
            </div>
        </Layout>
    );
};