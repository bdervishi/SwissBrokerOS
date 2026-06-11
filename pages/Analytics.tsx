import React, { useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  useClients, usePolicies, useCommissions, useLeadsFull, useProfiles,
} from '../src/hooks/useData';
import { CommissionStatus, PolicyStatus, UserRole, Policy, User } from '../types';
import { SensitiveData } from '../components/ui/SensitiveData';
import {
  BarChart3, Users, FileText, Wallet, TrendingUp, AlertTriangle, Target,
  Sparkles, ShieldAlert, ChevronRight,
} from 'lucide-react';

/**
 * Analysen & Reports – Broker-Cockpit. Alles wird client-seitig aus der
 * echten Datenschicht berechnet (Kunden, Policen, Courtagen, Leads, Team) und
 * funktioniert damit identisch im Mock- und Real-Modus.
 *
 * Innovationskern: Cross-Selling-Radar (Deckungslücken je Kunde als konkrete
 * Verkaufschancen) + Klumpenrisiko-Analyse + Courtage Soll/Ist-Verlauf.
 */

const COLORS = ['#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6', '#ef4444'];

// Jahresprämie aus Betrag + Zahlungsrhythmus.
const annualPremium = (p: Policy): number => {
  const amt = Number(p.premiumAmount) || 0;
  switch ((p.premiumFrequency || '').toLowerCase()) {
    case 'monatlich': return amt * 12;
    case 'vierteljährlich': return amt * 4;
    case 'halbjährlich': return amt * 2;
    default: return amt; // Jährlich
  }
};

// Standard-Deckungen eines Privatkunden + grobe Jahresprämien-Richtwerte (CHF)
// für die Potenzialschätzung im Cross-Selling-Radar.
const STANDARD_LINES: { label: string; match: RegExp; potential: number }[] = [
  { label: 'Privathaftpflicht', match: /haftpflicht/i, potential: 150 },
  { label: 'Hausrat', match: /hausrat/i, potential: 250 },
  { label: 'Krankenzusatz', match: /kranken|kvg|vvg/i, potential: 1200 },
  { label: 'Rechtsschutz', match: /rechtsschutz/i, potential: 300 },
  { label: 'Säule 3a', match: /3a|leben|vorsorge/i, potential: 3500 },
];

const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const Analytics: React.FC = () => {
  const { user, role } = useAuth();
  const tenantId = user?.tenantId;
  const { data: clients } = useClients(tenantId ? { tenantId } : undefined);
  const { data: policies } = usePolicies();
  const { data: commissions } = useCommissions();
  const { data: leads } = useLeadsFull(tenantId);
  const { data: team } = useProfiles(tenantId);

  if (role === UserRole.CLIENT) return <Navigate to="/dashboard" />;

  // ----- Kernzahlen ---------------------------------------------------------
  const activePolicies = policies.filter((p) => p.status === PolicyStatus.ACTIVE);
  const premiumVolume = activePolicies.reduce((s, p) => s + annualPremium(p), 0);
  const commissionPaid = commissions
    .filter((c) => c.status === CommissionStatus.PAID || c.status === CommissionStatus.MATCHED)
    .reduce((s, c) => s + c.amount, 0);
  const density = clients.length ? activePolicies.length / clients.length : 0;

  // ----- Courtage Soll/Ist: 6 Monate zurück + 6 voraus ------------------------
  const commissionTrend = useMemo(() => {
    const out: { name: string; Ist: number; Soll: number }[] = [];
    for (let i = -5; i <= 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      const key = ym(d);
      out.push({
        name: key.slice(2),
        Ist: Math.round(commissions
          .filter((c) => (c.status === CommissionStatus.PAID || c.status === CommissionStatus.MATCHED) && (c.period ?? c.date?.slice(0, 7)) === key)
          .reduce((s, c) => s + c.amount, 0)),
        Soll: Math.round(commissions
          .filter((c) => c.status === CommissionStatus.EXPECTED && c.period === key)
          .reduce((s, c) => s + (c.expectedAmount ?? 0), 0)),
      });
    }
    return out;
  }, [commissions]);
  const forecast12 = commissions
    .filter((c) => c.status === CommissionStatus.EXPECTED)
    .reduce((s, c) => s + (c.expectedAmount ?? 0), 0);

  // ----- Portfolio-Mix (Prämie je Sparte) ------------------------------------
  const byLine = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of activePolicies) m.set(p.type, (m.get(p.type) || 0) + annualPremium(p));
    return [...m.entries()].map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value).slice(0, 8);
  }, [activePolicies]);

  // ----- Klumpenrisiko Versicherer -------------------------------------------
  const byInsurer = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of activePolicies) m.set(p.insurer, (m.get(p.insurer) || 0) + annualPremium(p));
    const total = [...m.values()].reduce((s, v) => s + v, 0) || 1;
    return [...m.entries()]
      .map(([name, value]) => ({ name, value: Math.round(value), share: value / total }))
      .sort((a, b) => b.value - a.value);
  }, [activePolicies]);
  const topInsurerShare = byInsurer[0]?.share ?? 0;

  // ----- Cross-Selling-Radar ⭐ ------------------------------------------------
  const opportunities = useMemo(() => {
    return clients.map((c) => {
      const own = policies.filter((p) => p.clientId === c.id && p.status === PolicyStatus.ACTIVE);
      const missing = STANDARD_LINES.filter((l) => !own.some((p) => l.match.test(p.type)));
      const potential = missing.reduce((s, l) => s + l.potential, 0);
      return { client: c, policyCount: own.length, missing, potential };
    })
      .filter((o) => o.missing.length > 0)
      .sort((a, b) => b.potential - a.potential)
      .slice(0, 6);
  }, [clients, policies]);
  const totalPotential = opportunities.reduce((s, o) => s + o.potential, 0);

  // ----- Lead-Funnel ----------------------------------------------------------
  const funnel = useMemo(() => {
    const count = (s: string) => leads.filter((l) => l.status === s).length;
    const stages = [
      { name: 'Neu', value: count('NEW') + count('CONTACTED') + count('OFFER') + count('WON') },
      { name: 'Kontaktiert', value: count('CONTACTED') + count('OFFER') + count('WON') },
      { name: 'Offerte', value: count('OFFER') + count('WON') },
      { name: 'Gewonnen', value: count('WON') },
    ];
    return stages;
  }, [leads]);
  const conversion = funnel[0].value ? Math.round((funnel[3].value / funnel[0].value) * 100) : 0;

  // ----- Team-Leistung --------------------------------------------------------
  const byAdvisor = useMemo(() => {
    const advisors = (team as User[]).filter((u) =>
      u.role === UserRole.BROKER_ADMIN || u.role === UserRole.BROKER_AGENT);
    return advisors.map((a) => {
      const clientIds = new Set(clients.filter((c) => c.advisorId === a.id).map((c) => c.id));
      const pols = activePolicies.filter((p) => clientIds.has(p.clientId));
      return { name: `${a.firstName} ${a.lastName.charAt(0)}.`, Prämienvolumen: Math.round(pols.reduce((s, p) => s + annualPremium(p), 0)), Policen: pols.length };
    }).filter((x) => x.Prämienvolumen > 0 || x.Policen > 0);
  }, [team, clients, activePolicies]);

  // ----- Storno-Exposure ------------------------------------------------------
  const stornoExposure = useMemo(() => {
    const now = new Date();
    return activePolicies.reduce((sum, p) => {
      const liab = p.liabilityDurationMonths || 0;
      const comm = p.initialCommission || 0;
      if (!liab || !comm || !p.startDate) return sum;
      const passed = (now.getFullYear() - new Date(p.startDate).getFullYear()) * 12 + (now.getMonth() - new Date(p.startDate).getMonth());
      const remaining = Math.max(0, liab - passed);
      return sum + comm * (remaining / liab);
    }, 0);
  }, [activePolicies]);

  const tooltipStyle = { backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' };
  const chf = (n: number) => `CHF ${Math.round(n).toLocaleString()}`;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="text-brand-600" /> Analysen & Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Live berechnet aus deinem Bestand — Kunden, Policen, Courtagen, Leads.</p>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <Kpi icon={<Users size={18} className="text-brand-600" />} label="Kunden" value={String(clients.length)} sub={`Ø ${density.toFixed(1)} Policen/Kunde`} />
        <Kpi icon={<FileText size={18} className="text-emerald-600" />} label="Aktive Policen" value={String(activePolicies.length)} sub={`${policies.length - activePolicies.length} inaktiv`} />
        <Kpi icon={<Wallet size={18} className="text-indigo-600" />} label="Prämienvolumen p.a." value={<SensitiveData>{chf(premiumVolume)}</SensitiveData>} sub="annualisiert" />
        <Kpi icon={<TrendingUp size={18} className="text-amber-600" />} label="Courtage erhalten" value={<SensitiveData>{chf(commissionPaid)}</SensitiveData>} sub="Ist, abgeglichen" />
        <Kpi icon={<Sparkles size={18} className="text-purple-600" />} label="Courtage-Forecast" value={<SensitiveData>{chf(forecast12)}</SensitiveData>} sub="offenes Soll" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Courtage Soll/Ist Verlauf */}
        <Card title="Courtage-Verlauf: Ist vs. Soll (±6 Monate)" className="lg:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commissionTrend}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="Ist" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Soll" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Klumpenrisiko */}
        <Card title="Versicherer-Konzentration">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byInsurer.slice(0, 6)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {byInsurer.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => chf(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {byInsurer.length > 0 && (
            topInsurerShare > 0.4 ? (
              <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span><strong>Klumpenrisiko:</strong> {Math.round(topInsurerShare * 100)}% des Prämienvolumens liegen bei {byInsurer[0].name}. Diversifikation stärkt deine Verhandlungsposition.</span>
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-400 text-center">Grösster Anteil: {byInsurer[0].name} ({Math.round(topInsurerShare * 100)}%) — gut diversifiziert.</p>
            )
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Cross-Selling-Radar */}
        <Card className="lg:col-span-2" noPadding>
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Target size={18} className="text-brand-600" /> Cross-Selling-Radar</h3>
              <p className="text-xs text-slate-500">Deckungslücken im Bestand — konkrete Verkaufschancen.</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-black">Potenzial</p>
              <p className="font-mono font-bold text-emerald-600"><SensitiveData>{chf(totalPotential)}</SensitiveData> <span className="text-[10px] text-slate-400">p.a.</span></p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {opportunities.length === 0 && (
              <div className="px-6 py-10 text-center text-slate-500 italic text-sm">Keine Deckungslücken gefunden — der Bestand ist voll durchdrungen. 🎯</div>
            )}
            {opportunities.map((o) => (
              <Link key={o.client.id} to={`/client/${o.client.id}`} className="px-6 py-3 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {(o.client.companyName || o.client.firstName).charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{o.client.companyName || `${o.client.firstName} ${o.client.lastName}`} <span className="text-xs text-slate-400">· {o.policyCount} Policen</span></p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {o.missing.map((m) => (
                      <span key={m.label} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-dashed border-slate-300 dark:border-slate-600">{m.label} fehlt</span>
                    ))}
                  </div>
                </div>
                <span className="font-mono text-sm text-emerald-600 shrink-0"><SensitiveData>+{chf(o.potential)}</SensitiveData></span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500 shrink-0" />
              </Link>
            ))}
          </div>
        </Card>

        {/* Lead funnel + Storno */}
        <div className="space-y-6">
          <Card title="Lead-Funnel">
            <div className="space-y-2">
              {funnel.map((s, i) => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">{s.name}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{s.value}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${funnel[0].value ? (s.value / funnel[0].value) * 100 : 0}%`, backgroundColor: COLORS[i] }} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-slate-400 pt-2">Conversion Neu → Gewonnen: <strong className="text-slate-600 dark:text-slate-300">{conversion}%</strong></p>
            </div>
          </Card>

          <Link to="/commissions" state={{ tab: 'STORNO' }} className="block">
            <div className="p-5 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm mb-1"><ShieldAlert size={16} /> Storno-Exposure</div>
              <p className="text-xl font-bold text-red-700 dark:text-red-400 font-mono"><SensitiveData>{chf(stornoExposure)}</SensitiveData></p>
              <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">Provision in offener Haftungszeit → Storno-Überwachung öffnen</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio mix */}
        <Card title="Portfolio-Mix (Prämie je Sparte)">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byLine} layout="vertical" margin={{ left: 30 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={120} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle} formatter={(v: any) => chf(Number(v))} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {byLine.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Team performance */}
        <Card title="Team-Leistung (Prämienvolumen je Berater)">
          {byAdvisor.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm italic">Noch keine Zuordnung Kunden → Berater.</div>
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byAdvisor}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle} formatter={(v: any, n: any) => n === 'Prämienvolumen' ? chf(Number(v)) : v} />
                  <Legend />
                  <Bar dataKey="Prämienvolumen" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Policen" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

const Kpi: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string }> = ({ icon, label, value, sub }) => (
  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
    <div className="flex items-center gap-2 mb-1.5">
      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">{icon}</div>
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
  </div>
);
