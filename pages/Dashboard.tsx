
import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { MOCK_CLIENTS, MOCK_EVENTS, MOCK_COMMISSIONS, MOCK_POLICIES, MOCK_TENANTS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, CommissionStatus, EventType, PolicyStatus } from '../types';
import { SensitiveData } from '../components/ui/SensitiveData';
import { 
  Users, 
  TrendingUp, 
  ChevronRight,
  Briefcase,
  Calendar,
  Wallet,
  Plus,
  ArrowRightLeft,
  Calculator,
  Globe,
  Server,
  Shield,
  FileText,
  AlertTriangle,
  Target,
  Zap,
  PhoneCall,
  CheckCircle2,
  Trophy
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

// Mock Chart Data for Sales Performance
const salesData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mär', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'Mai', value: 6000 },
  { name: 'Jun', value: 5500 },
];

const saasGrowthData = [
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 135 },
    { name: 'Mär', value: 160 },
    { name: 'Apr', value: 190 },
    { name: 'Mai', value: 240 },
    { name: 'Jun', value: 310 },
];

const hunterPipelineData = [
    { stage: 'Prospects', count: 45, value: 4500 }, // CHF MRR Potential
    { stage: 'Demo', count: 12, value: 3800 },
    { stage: 'Contract', count: 4, value: 1200 },
    { stage: 'Won (MTD)', count: 2, value: 450 },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const today = new Date();

  // --- CLIENT DASHBOARD ---
  if (role === UserRole.CLIENT) {
      const myPolicies = MOCK_POLICIES; // In a real app, filter by user.id
      const totalPremium = myPolicies.reduce((sum, p) => sum + p.premiumAmount, 0);

      return (
          <Layout>
              <div className="mb-8">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Willkommen zurück, {user?.firstName}.</h1>
                  <p className="text-slate-500 dark:text-slate-400">Hier ist Ihre persönliche Versicherungs- und Finanzübersicht.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <KPICard title="Aktive Policen" value={myPolicies.length.toString()} icon={<Shield className="text-brand-600"/>} />
                  <KPICard title="Jahresprämien Total" value={<SensitiveData>CHF {totalPremium.toFixed(2)}</SensitiveData>} icon={<Wallet className="text-emerald-600"/>} />
                  <KPICard title="Nächster Termin" value="15. Mai" change="Jahresgespräch" icon={<Calendar className="text-amber-600"/>} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card title="Meine Policen">
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {myPolicies.map(p => (
                              <div key={p.id} className="py-4 flex justify-between items-center">
                                  <div>
                                      <p className="font-medium text-slate-900 dark:text-slate-100">{p.type}</p>
                                      <p className="text-xs text-slate-500">{p.insurer}</p>
                                  </div>
                                  <Link to={`/policy/${p.id}`}>
                                    <Button size="sm" variant="outline">Details</Button>
                                  </Link>
                              </div>
                          ))}
                      </div>
                  </Card>
                  <Card title="Kontakt Berater">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">MM</div>
                          <div>
                              <p className="font-bold">Max Muster</p>
                              <p className="text-sm text-slate-500">Ihr persönlicher Betreuer</p>
                              <div className="flex gap-2 mt-2">
                                  <Button size="sm">Nachricht</Button>
                                  <Button size="sm" variant="outline">Termin</Button>
                              </div>
                          </div>
                      </div>
                  </Card>
              </div>
          </Layout>
      );
  }

  // --- HUNTER (SALES) DASHBOARD ---
  if (role === UserRole.SAAS_ACQUISITION) {
      return (
          <Layout>
              <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Target className="text-red-600" /> 
                          Hunter Cockpit
                      </h1>
                      <p className="text-slate-500 dark:text-slate-400">Jage den Schweizer Brokermarkt. Fokus: Neukunden-Akquise.</p>
                  </div>
                  <div className="flex gap-3">
                      <Link to="/leads">
                          <Button className="bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-500/20" icon={<Zap size={18}/>}>
                              Broker Radar starten
                          </Button>
                      </Link>
                      <Link to="/saas/demo">
                          <Button variant="outline" icon={<Briefcase size={18}/>}>Demo Center</Button>
                      </Link>
                  </div>
              </div>

              {/* Sales KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <KPICard title="Pipeline Value (MRR)" value="CHF 9,950" change="+12% WoM" icon={<TrendingUp className="text-emerald-500"/>} />
                  <KPICard title="Demos Scheduled" value="8" change="Diese Woche" icon={<Calendar className="text-blue-500"/>} />
                  <KPICard title="Hot Leads" value="12" change="High Priority" icon={<Zap className="text-amber-500"/>} highlight />
                  <KPICard title="Provision (Q2)" value="CHF 4,200" change="On Track" icon={<Trophy className="text-yellow-500"/>} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Pipeline Funnel */}
                  <div className="lg:col-span-2 space-y-6">
                      <Card title="Sales Pipeline (B2B)">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                              {hunterPipelineData.map((stage, idx) => (
                                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-center relative overflow-hidden group hover:border-red-200 dark:hover:border-red-900 transition-colors">
                                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{stage.stage}</div>
                                      <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">{stage.count}</div>
                                      <div className="text-xs font-medium text-emerald-600">CHF {stage.value}</div>
                                      <div className="absolute bottom-0 left-0 h-1 bg-red-500 transition-all duration-500" style={{width: `${(idx+1)*25}%`}}></div>
                                  </div>
                              ))}
                          </div>
                          
                          <h4 className="font-bold text-sm mb-4">Hot Prospects (Action Required)</h4>
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {[
                                  { name: 'Zürichsee Finanz AG', status: 'Demo geplant', date: 'Morgen 14:00', prob: '80%' },
                                  { name: 'Berner Oberland Treuhand', status: 'Rückruf', date: 'Heute 16:00', prob: '60%' },
                                  { name: 'Geneva Risk Solutions', status: 'Offerte gesendet', date: 'Vor 2 Tagen', prob: '90%' },
                              ].map((prospect, i) => (
                                  <div key={i} className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 -mx-4 px-4 transition-colors cursor-pointer">
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">{prospect.name.substring(0,1)}</div>
                                          <div>
                                              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{prospect.name}</p>
                                              <p className="text-xs text-slate-500">{prospect.status} • {prospect.date}</p>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <div className="text-xs font-bold text-emerald-600">{prospect.prob} Win</div>
                                          <Button size="sm" variant="ghost" className="h-6 text-xs">Aktion</Button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </Card>
                  </div>

                  {/* Sidebar Tools */}
                  <div className="space-y-6">
                      <div className="bg-gradient-to-br from-red-600 to-orange-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                          <div className="relative z-10">
                              <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><PhoneCall size={20}/> Call Blitz</h3>
                              <p className="text-red-100 text-sm mb-4">Du hast noch 5 Anrufe offen, um dein Tagesziel zu erreichen.</p>
                              <Link to="/saas/call-agent">
                                  <Button size="sm" className="bg-white text-red-600 hover:bg-red-50 border-none font-bold w-full">
                                      AI Call Agent öffnen
                                  </Button>
                              </Link>
                          </div>
                          <Target className="absolute -right-6 -bottom-6 w-32 h-32 text-red-900 opacity-30" />
                      </div>

                      <Card title="Quick Links">
                          <div className="space-y-2">
                              <Link to="/saas/pitch" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded"><FileText size={16}/></div>
                                  <span className="text-sm font-medium">Pitch Deck (Investor)</span>
                              </Link>
                              <Link to="/saas/case-studies" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded"><CheckCircle2 size={16}/></div>
                                  <span className="text-sm font-medium">Case Studies</span>
                              </Link>
                          </div>
                      </Card>
                  </div>
              </div>
          </Layout>
      );
  }

  // --- SAAS SUPER ADMIN DASHBOARD ---
  if (role === UserRole.SAAS_SUPER_ADMIN || role === UserRole.SAAS_FINANCE) {
      return (
          <Layout>
              <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">SaaS Platform Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400">Systemweite Metriken und Tenant-Performance.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <KPICard title="Total Makler" value="48" change="+3 diesen Monat" icon={<Briefcase className="text-blue-600"/>} />
                  <KPICard title="Aktive Nutzer" value="1,240" change="+12% WoM" icon={<Users className="text-purple-600"/>} />
                  <KPICard title="MRR (CHF)" value={<SensitiveData>42,500</SensitiveData>} change="+8.5%" icon={<TrendingUp className="text-emerald-600"/>} />
                  <KPICard title="System Region" value="CH-ZH" change="Zurich (Tier IV)" icon={<Server className="text-red-600"/>} />
              </div>

              <Card title="Wachstum (Active Tenants)">
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={saasGrowthData}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', border:'none', color:'#fff'}} />
                            <Area type="monotone" dataKey="value" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorVal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </Card>
          </Layout>
      );
  }

  // --- BROKER (DEFAULT) DASHBOARD ---
  // Shared logic for Broker Admin, Admin Staff, Marketing

  // 1. Calculate dynamic KPIs
  const activeClientsCount = MOCK_CLIENTS.length;
  
  const pendingCommissions = MOCK_COMMISSIONS
    .filter(c => c.status === CommissionStatus.PENDING)
    .reduce((sum, c) => sum + c.amount, 0);

  // 2. Calculate Storno Risk for Dashboard Alert
  const policiesWithRisk = MOCK_POLICIES.filter(p => 
      p.status === PolicyStatus.ACTIVE && 
      (p.liabilityDurationMonths || 0) > 0 && 
      p.initialCommission && p.initialCommission > 0
  );
  
  const stornoRiskAmount = policiesWithRisk.reduce((sum, p) => {
      // Simplified calc for dashboard summary
      const start = new Date(p.startDate);
      const liabilityMonths = p.liabilityDurationMonths || 0;
      const diffYears = today.getFullYear() - start.getFullYear();
      const diffMonths = today.getMonth() - start.getMonth();
      const monthsPassed = (diffYears * 12) + diffMonths;
      const remainingMonths = Math.max(0, liabilityMonths - monthsPassed);
      if (remainingMonths <= 0) return sum;
      return sum + ((p.initialCommission || 0) * (remainingMonths / liabilityMonths));
  }, 0);

  // 3. Get upcoming events
  const upcomingEvents = MOCK_EVENTS
    .filter(e => {
        const eventDate = new Date(e.start);
        eventDate.setHours(23, 59, 59); // Include today
        return eventDate >= new Date(today.setHours(0,0,0,0));
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 4);

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Guten Morgen, {user?.firstName}.</h1>
            <p className="text-slate-500 dark:text-slate-400">
                {role === UserRole.BROKER_MARKETING 
                 ? 'Hier sind die aktuellen Kampagnen-Metriken.' 
                 : `Hier ist Ihre Tagesübersicht für den ${new Date().toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`}
            </p>
        </div>
        
        {/* Only show Quick Actions for Admin/Staff */}
        {role !== UserRole.BROKER_MARKETING && (
            <div className="flex gap-2">
                <Button size="sm" icon={<Plus size={16}/>} onClick={() => navigate('/calendar')}>Termin</Button>
                <Button size="sm" variant="outline" icon={<Calculator size={16}/>} onClick={() => navigate('/mortgages')}>Hypothek</Button>
            </div>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/clients" className="block">
            <KPICard 
            title="Aktive Klienten" 
            value={activeClientsCount.toString()} 
            change="+3 diesen Monat" 
            icon={<Users className="text-brand-600" size={24} />} 
            />
        </Link>
        <Link to="/mortgages" className="block">
            <KPICard 
            title="Verwaltetes Volumen" 
            value={<SensitiveData>CHF 4.2M</SensitiveData>}
            change="+12% YTD" 
            icon={<Briefcase className="text-emerald-600" size={24} />} 
            />
        </Link>
        
        {/* Conditional KPI: Show Storno Risk if present, otherwise Commissions */}
        {stornoRiskAmount > 0 ? (
            <Link to="/commissions" state={{ tab: 'STORNO' }} className="block">
                <KPICard 
                title="Storno Risiko" 
                value={<SensitiveData>CHF {stornoRiskAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}</SensitiveData>}
                change="Handlungsbedarf" 
                icon={<AlertTriangle className="text-red-600" size={24} />} 
                urgent
                />
            </Link>
        ) : (
            role === UserRole.BROKER_MARKETING ? (
                <KPICard 
                title="Neue Leads" 
                value="12" 
                change="Kampagne Q3" 
                icon={<TrendingUp className="text-purple-600" size={24} />} 
                />
            ) : (
                <Link to="/commissions" className="block">
                    <KPICard 
                    title="Offene Provisionen" 
                    value={<SensitiveData>CHF {pendingCommissions.toLocaleString()}</SensitiveData>}
                    change="Erwartet" 
                    icon={<Wallet className="text-purple-600" size={24} />} 
                    />
                </Link>
            )
        )}

        <Link to="/calendar" className="block">
            <KPICard 
            title="Nächste Termine" 
            value={upcomingEvents.length.toString()} 
            change="Diese Woche" 
            icon={<Calendar className="text-amber-600" size={24} />} 
            urgent={upcomingEvents.length > 0}
            />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          <Card title={role === UserRole.BROKER_MARKETING ? "Lead Generierung" : "Abschluss-Performance (YTD)"} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {salesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === salesData.length - 1 ? '#0ea5e9' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {role !== UserRole.BROKER_MARKETING && (
            <Card title="Klienten-Liste (Auszug)" noPadding>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {MOCK_CLIENTS.slice(0, 5).map((client) => (
                    <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="flex items-center gap-4">
                        <img src={client.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{client.firstName} {client.lastName}</p>
                        <p className="text-xs text-slate-500">{client.zipCity}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to={`/client/${client.id}`}>
                        <Button size="sm" variant="outline">Details</Button>
                        </Link>
                    </div>
                    </div>
                ))}
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <Link to="/clients">
                    <Button variant="ghost" className="w-full text-brand-600 text-sm">Alle Klienten anzeigen</Button>
                </Link>
                </div>
            </Card>
          )}
        </div>

        {/* Side Panel: Tasks & Alerts */}
        <div className="space-y-6">
          <Card title="Nächste Ereignisse">
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                 <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700" onClick={() => navigate('/calendar')}>
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${event.type === EventType.DEADLINE ? 'bg-red-500' : event.type === EventType.MEETING ? 'bg-blue-500' : 'bg-slate-400'}`} />
                    <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{event.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {event.start.toLocaleDateString('de-CH', {day: '2-digit', month: '2-digit'})} • {event.type === EventType.DEADLINE ? 'Frist!' : event.type === EventType.BIRTHDAY ? 'Geburtstag' : 'Termin'}
                        </p>
                    </div>
                 </div>
              )) : (
                  <p className="text-sm text-slate-500 italic py-4 text-center">Keine anstehenden Termine.</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link to="/calendar" className="text-sm text-brand-600 hover:underline flex items-center justify-center gap-1 font-medium">
                    Zum Kalender <ChevronRight size={14} />
                </Link>
            </div>
          </Card>
          
          {/* Quick Actions / Profi Tipp */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-6 text-white shadow-lg border border-slate-800 dark:border-slate-700">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-brand-400" /> 
                Schnellzugriff
            </h3>
            <div className="space-y-3">
                <button onClick={() => navigate('/policies')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left group">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
                        <ArrowRightLeft size={18} />
                    </div>
                    <div>
                        <div className="font-medium text-sm">Policen-Vergleich</div>
                        <div className="text-xs text-slate-400">Wechsel-Szenario rechnen</div>
                    </div>
                </button>
                 <button onClick={() => navigate('/mortgages')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left group">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:bg-blue-500/30 transition-colors">
                        <Calculator size={18} />
                    </div>
                    <div>
                        <div className="font-medium text-sm">Hypothekar-Rechner</div>
                        <div className="text-xs text-slate-400">Tragbarkeit & LTV prüfen</div>
                    </div>
                </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const KPICard = ({ title, value, change, icon, urgent, highlight }: any) => (
  <div className={`p-6 rounded-xl border shadow-sm flex items-start justify-between transition-shadow hover:shadow-md ${urgent ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/50' : highlight ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{value}</h3>
      <p className={`text-xs font-medium ${urgent ? 'text-amber-600' : highlight ? 'text-red-600' : 'text-emerald-600'}`}>
        {change}
      </p>
    </div>
    <div className={`p-3 rounded-lg ${urgent ? 'bg-amber-100 dark:bg-amber-900/30' : highlight ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}>
      {icon}
    </div>
  </div>
);
