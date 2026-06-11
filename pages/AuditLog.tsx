import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auditService, AuditEntry } from '../src/services/audit';
import { UserRole } from '../types';
import {
  ScrollText, Search, FileText, Trash2, Download, Upload, UserCog,
  Wallet, Loader2, ShieldCheck,
} from 'lucide-react';

/**
 * Audit-Log-Viewer (Compliance): nachvollziehbare Historie der protokollierten
 * Aktionen im Mandanten. Nur für Broker-Admins / SaaS-Admins (RLS erzwingt das
 * zusätzlich serverseitig). Append-only – hier rein lesend.
 */

const ACTION_META: Record<string, { label: string; icon: React.ReactNode; tone: string }> = {
  CLIENT_UPDATE: { label: 'Stammdaten geändert', icon: <UserCog size={15} />, tone: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  POLICY_DELETE: { label: 'Police gelöscht', icon: <Trash2 size={15} />, tone: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
  DOCUMENT_UPLOAD: { label: 'Dokument hochgeladen', icon: <Upload size={15} />, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  DOCUMENT_DOWNLOAD: { label: 'Dokument heruntergeladen', icon: <Download size={15} />, tone: 'text-slate-600 bg-slate-100 dark:bg-slate-800' },
  DOCUMENT_DELETE: { label: 'Dokument gelöscht', icon: <Trash2 size={15} />, tone: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
  PAYOUT: { label: 'Auszahlung', icon: <Wallet size={15} />, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
};
const fallbackMeta = { label: 'Aktion', icon: <FileText size={15} />, tone: 'text-slate-600 bg-slate-100 dark:bg-slate-800' };

export const AuditLog: React.FC = () => {
  const { user, role } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    auditService.list(user?.tenantId)
      .then((e) => { if (active) setEntries(e); })
      .catch(() => { if (active) setEntries([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.tenantId]);

  const filtered = useMemo(() => entries.filter((e) => {
    if (actionFilter && e.action !== actionFilter) return false;
    if (!q.trim()) return true;
    const hay = `${e.summary} ${e.actorName} ${e.action}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  }), [entries, q, actionFilter]);

  const actions = useMemo(() => [...new Set(entries.map((e) => e.action))], [entries]);

  // Access control (RLS also enforces this server-side).
  if (role !== UserRole.BROKER_ADMIN && role !== UserRole.SAAS_SUPER_ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  const fmt = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ScrollText className="text-brand-600" /> Audit-Log
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Revisionssichere Historie sicherheits- und compliance-relevanter Aktionen (Art. nDSG/revDSG, FINMA).</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suchen (Beschreibung, Person)…"
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">Alle Aktionen</option>
          {actions.map((a) => <option key={a} value={a}>{(ACTION_META[a] ?? fallbackMeta).label}</option>)}
        </select>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="p-10 text-center text-slate-400"><Loader2 className="animate-spin inline" size={22} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{entries.length === 0 ? 'Noch keine protokollierten Aktionen.' : 'Keine Treffer für die aktuellen Filter.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((e) => {
              const meta = ACTION_META[e.action] ?? fallbackMeta;
              return (
                <div key={e.id} className="px-6 py-3 flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.tone}`}>{meta.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-slate-100">{e.summary || meta.label}</p>
                    <p className="text-xs text-slate-400">{e.actorName || 'System'} · {meta.label}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono whitespace-nowrap">{fmt(e.createdAt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </Layout>
  );
};
