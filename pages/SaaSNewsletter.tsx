import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
import { 
    Mail, 
    Users, 
    TrendingUp, 
    Download, 
    Search, 
    Filter, 
    Send, 
    CheckCircle, 
    Clock, 
    XCircle,
    MoreHorizontal,
    Trash2,
    MailCheck
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

// Mock Subscriber Data
const MOCK_SUBSCRIBERS = [
    { id: 1, email: 'beat.makler@beispiel.ch', date: '2024-05-20', status: 'ACTIVE', source: 'Landing Page Footer' },
    { id: 2, email: 'contact@swiss-finance.com', date: '2024-05-18', status: 'ACTIVE', source: 'Lead Radar Opt-in' },
    { id: 3, email: 'info@zuerich-broker.ch', date: '2024-05-15', status: 'PENDING', source: 'Landing Page Footer' },
    { id: 4, email: 'admin@beratung-plus.ch', date: '2024-05-10', status: 'ACTIVE', source: 'Whitepaper Download' },
    { id: 5, email: 'claudia.muster@me.com', date: '2024-05-05', status: 'UNSUBSCRIBED', source: 'Landing Page Footer' },
];

const GROWTH_DATA = [
    { name: 'Jan', count: 120 },
    { name: 'Feb', count: 180 },
    { name: 'Mar', count: 250 },
    { name: 'Apr', count: 310 },
    { name: 'Mai', count: 450 },
];

export const SaaSNewsletter: React.FC = () => {
    const { role } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    // Access Control
    if (role !== UserRole.SAAS_SUPER_ADMIN && role !== UserRole.SAAS_MARKETING && role !== UserRole.SAAS_SALES) {
        return <Navigate to="/dashboard" />;
    }

    const filteredSubscribers = MOCK_SUBSCRIBERS.filter(s => 
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Aktiv</span>;
            case 'PENDING':
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Wartet</span>;
            case 'UNSUBSCRIBED':
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Abgemeldet</span>;
            default:
                return null;
        }
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <MailCheck className="text-brand-600" />
                        Newsletter & Marketing
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Verwalten Sie Interessenten und Marketing-Abonnenten der Landingpage.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={<Download size={16}/>}>CSV Export</Button>
                    <Button icon={<Send size={16}/>}>Kampagne erstellen</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <KPICard title="Gesamt Abonnenten" value="452" trend="+18% MoM" icon={<Users className="text-blue-600" />} />
                <KPICard title="Conversion Rate" value="3.4%" trend="+0.2%" icon={<TrendingUp className="text-emerald-600" />} />
                <KPICard title="Öffnungsrate (Ø)" value="42%" trend="Stabil" icon={<Mail className="text-purple-600" />} />
                <KPICard title="Abmelderate" value="0.8%" trend="-0.1%" icon={<XCircle className="text-red-600" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List View */}
                <div className="lg:col-span-2">
                    <Card title="Abonnenten-Liste" noPadding>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Email suchen..." 
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="sm" icon={<Filter size={16}/>}>Filter</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-950/30 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th className="px-6 py-4">Email Adresse</th>
                                        <th className="px-6 py-4">Datum</th>
                                        <th className="px-6 py-4">Quelle</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredSubscribers.map(sub => (
                                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{sub.email}</td>
                                            <td className="px-6 py-4 text-slate-500">{sub.date}</td>
                                            <td className="px-6 py-4 text-xs text-slate-400">{sub.source}</td>
                                            <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-slate-400 hover:text-slate-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <Card title="Wachstum">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={GROWTH_DATA}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" hide />
                                    <Tooltip contentStyle={{backgroundColor: '#1e293b', border:'none', borderRadius: '8px', color:'#fff'}} />
                                    <Area type="monotone" dataKey="count" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-slate-500 text-center mt-4">Abonnenten-Zuwachs letzte 5 Monate</p>
                    </Card>

                    <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Send size={18} className="text-brand-400" />
                            Nächste Schritte
                        </h3>
                        <div className="space-y-4">
                            <button className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left border border-white/10 group">
                                <div className="text-xs font-black uppercase text-brand-400 mb-1">Automatisch</div>
                                <div className="text-sm font-bold">Willkommens-Serie prüfen</div>
                            </button>
                            <button className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left border border-white/10 group">
                                <div className="text-xs font-black uppercase text-emerald-400 mb-1">Kampagne</div>
                                <div className="text-sm font-bold">Juni-Release Ankündigung</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const KPICard = ({ title, value, icon, trend }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider text-[10px]">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{value}</h3>
            <p className="text-xs font-bold text-emerald-600">{trend}</p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            {icon}
        </div>
    </div>
);
