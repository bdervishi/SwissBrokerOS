
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MOCK_COMMISSIONS, MOCK_CLIENTS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, CommissionStatus } from '../types';
import { SensitiveData } from '../components/ui/SensitiveData';
import { 
    TrendingUp, 
    Wallet, 
    Users, 
    CheckCircle, 
    Clock, 
    DollarSign, 
    Target,
    Award
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

export const AgentDashboard: React.FC = () => {
    const { user } = useAuth();
    
    // Filter commissions linked to this agent
    const myCommissions = MOCK_COMMISSIONS.filter(c => c.agentId === user?.id);
    const myClients = MOCK_CLIENTS.filter(c => c.advisorId === user?.id);

    // Calculate Wallet States
    const totalVolume = myCommissions.reduce((sum, c) => sum + c.amount, 0);
    
    const myPendingEarnings = myCommissions
        .filter(c => c.status === CommissionStatus.PENDING)
        .reduce((sum, c) => sum + (c.amount * (c.agentSplitPercentage || 0.5)), 0);

    const myAvailableEarnings = myCommissions
        .filter(c => c.status === CommissionStatus.PAID)
        .reduce((sum, c) => sum + (c.amount * (c.agentSplitPercentage || 0.5)), 0);

    // Simulate "Settled" (Assume anything older than 30 days paid is settled for this mock)
    // For demo purposes, let's just say 20% of Paid is already settled/transferred
    const mySettledEarnings = myAvailableEarnings * 0.2;
    const myCurrentBalance = myAvailableEarnings - mySettledEarnings; // Ready to payout

    const monthlyData = [
        { name: 'Jan', value: 1200 },
        { name: 'Feb', value: 2400 },
        { name: 'Mar', value: 1800 },
        { name: 'Apr', value: 3200 },
        { name: 'Mai', value: myCurrentBalance + myPendingEarnings }, // Projection
    ];

    return (
        <Layout>
            <div className="mb-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sales Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400">Hallo {user?.firstName}, hier ist deine Performance-Übersicht.</p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Aktueller Split</p>
                        <p className="text-xl font-bold text-brand-600">70% <span className="text-slate-400 text-sm font-normal">/ Deal</span></p>
                    </div>
                </div>
            </div>

            {/* Wallet / Earnings Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-slate-300">
                            <Wallet size={18} />
                            <span className="text-sm font-medium">Verfügbares Guthaben</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1"><SensitiveData>CHF {myCurrentBalance.toFixed(2)}</SensitiveData></h3>
                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                            <CheckCircle size={12} /> Vom Versicherer bestätigt
                        </p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-2 translate-y-2">
                        <DollarSign size={100} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                        <Clock size={18} className="text-amber-500"/>
                        <span className="text-sm font-medium">Offen / Pending</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        <SensitiveData>CHF {myPendingEarnings.toFixed(2)}</SensitiveData>
                    </h3>
                    <p className="text-xs text-slate-400">Wartet auf Zahlungseingang</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                        <Target size={18} className="text-blue-500"/>
                        <span className="text-sm font-medium">Zielerreichung Q2</span>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">85%</h3>
                        <span className="text-sm text-slate-400 mb-1">von CHF 15k</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[85%]"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Commission List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Meine Abschlüsse">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-4 py-3">Datum</th>
                                        <th className="px-4 py-3">Kunde / Quelle</th>
                                        <th className="px-4 py-3 text-right">Volumen</th>
                                        <th className="px-4 py-3 text-center">Split</th>
                                        <th className="px-4 py-3 text-right">Mein Anteil</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {myCommissions.map(com => (
                                        <tr key={com.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{com.date}</td>
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{com.source}</td>
                                            <td className="px-4 py-3 text-right text-slate-500">
                                                <SensitiveData>CHF {com.amount.toFixed(0)}</SensitiveData>
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs font-mono bg-slate-50 dark:bg-slate-800 rounded">
                                                {(com.agentSplitPercentage || 0) * 100}%
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-emerald-600">
                                                <SensitiveData>CHF {(com.amount * (com.agentSplitPercentage || 0)).toFixed(2)}</SensitiveData>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    com.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {com.status === 'PAID' ? 'Freigegeben' : 'Offen'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {myCommissions.length === 0 && (
                                        <tr><td colSpan={6} className="text-center py-8 text-slate-500">Keine Provisionen gefunden.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <Card title="Performance Trend">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Meine Kunden">
                        <div className="space-y-4">
                            {myClients.map(client => (
                                <div key={client.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                                    <img src={client.avatarUrl} className="w-10 h-10 rounded-full bg-slate-200" alt="" />
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{client.firstName} {client.lastName}</p>
                                        <p className="text-xs text-slate-500">{client.zipCity}</p>
                                    </div>
                                    <Link to={`/client/${client.id}`}>
                                        <Button size="sm" variant="ghost" icon={<TrendingUp size={14}/>} />
                                    </Link>
                                </div>
                            ))}
                            {myClients.length === 0 && <p className="text-sm text-slate-500">Noch keine Kunden zugewiesen.</p>}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="outline" className="w-full" icon={<Users size={16}/>}>Alle Kunden</Button>
                        </div>
                    </Card>
                    
                    <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-sm flex gap-3">
                        <Award className="text-amber-400 shrink-0" />
                        <div>
                            <p className="font-bold text-white mb-1">Top Performer Club</p>
                            <p>Du bist nur noch CHF 2'500 vom Gold-Status entfernt. Bonus: +2% Split.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
