import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, User, Shield, FileText, ChevronRight, LayoutDashboard,
  Calendar, Target, Wallet, Calculator, Landmark, Loader2, Users, Home,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, Client, Policy, Lead, ClientDocument } from '../../types';
import { db } from '../../src/services/db';
import { leadsService } from '../../src/services/leads';

/**
 * Global command palette (Ctrl/Cmd-K). Searches the LIVE data layer (mock or
 * Supabase) scoped to the signed-in user's tenant — clients, policies, leads,
 * documents — plus quick navigation. Replaces the previous version that read
 * hardcoded MOCK_* arrays and showed unfiltered nav items.
 */

interface SearchResult {
  id: string;
  type: 'KLIENT' | 'POLICE' | 'LEAD' | 'DOKUMENT' | 'SEITE';
  title: string;
  subtitle?: string;
  path: string;
  icon: React.ReactNode;
}

interface NavTarget { title: string; path: string; icon: React.ReactNode; roles?: UserRole[]; }

const NAV_TARGETS: NavTarget[] = [
  { title: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
  { title: 'Kalender / Termine', path: '/calendar', icon: <Calendar size={16} /> },
  { title: 'Klienten', path: '/clients', icon: <Users size={16} /> },
  { title: 'Policen', path: '/policies', icon: <Shield size={16} /> },
  { title: 'Hypotheken', path: '/mortgages', icon: <Home size={16} /> },
  { title: 'Steuern', path: '/tax', icon: <Calculator size={16} /> },
  { title: 'Provisionen & Courtagen', path: '/commissions', icon: <Wallet size={16} /> },
  { title: 'Lead Radar', path: '/leads', icon: <Target size={16} /> },
  { title: 'Analysen & Reports', path: '/analytics', icon: <Landmark size={16} /> },
];

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Tenant-scoped datasets, loaded once the palette opens.
  const [clients, setClients] = useState<Client[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    let active = true;
    setLoading(true);
    const tenantId = user.tenantId;
    Promise.all([
      db.clients.getAll(tenantId ? { tenantId } : undefined).catch(() => []),
      db.policies.getAll().catch(() => []),
      role !== UserRole.CLIENT ? leadsService.getAll(tenantId).catch(() => []) : Promise.resolve([]),
      db.documents.getAll().catch(() => []),
    ]).then(([c, p, l, d]) => {
      if (!active) return;
      setClients(c as Client[]);
      setPolicies(p as Policy[]);
      setLeads(l as Lead[]);
      setDocuments(d as ClientDocument[]);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isOpen, user, role]);

  // For a CLIENT, restrict to their own client record.
  const ownClientId = useMemo(
    () => (role === UserRole.CLIENT ? clients.find((c) => c.username === user?.username || c.id === user?.id)?.id : undefined),
    [role, clients, user],
  );

  const results = useMemo<SearchResult[]>(() => {
    if (!user) return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: SearchResult[] = [];

    // 1. Navigation — now FILTERED by the query.
    for (const n of NAV_TARGETS) {
      if (role === UserRole.CLIENT && !['Dashboard', 'Policen', 'Hypotheken'].includes(n.title)) continue;
      if (n.title.toLowerCase().includes(q)) {
        out.push({ id: `nav_${n.path}`, type: 'SEITE', title: n.title, path: n.path, icon: n.icon });
      }
    }

    // 2. Clients (brokers only; admin sees all tenant clients, agent sees own).
    if (role !== UserRole.CLIENT) {
      const visible = clients.filter((c) =>
        role === UserRole.BROKER_ADMIN || role?.startsWith('SAAS_') || c.advisorId === user.id);
      for (const c of visible) {
        const name = `${c.firstName} ${c.lastName}`;
        if (name.toLowerCase().includes(q) || (c.companyName?.toLowerCase().includes(q)) || (c.zipCity?.toLowerCase().includes(q))) {
          out.push({ id: `c_${c.id}`, type: 'KLIENT', title: c.companyName || name, subtitle: c.companyName ? name : c.zipCity, path: `/client/${c.id}`, icon: <User size={16} /> });
        }
      }
    }

    // 3. Policies (scoped: client -> own; broker -> visible clients).
    const visibleClientIds = new Set(clients.filter((c) =>
      role === UserRole.CLIENT ? c.id === ownClientId
        : (role === UserRole.BROKER_ADMIN || role?.startsWith('SAAS_') || c.advisorId === user.id)
    ).map((c) => c.id));
    for (const p of policies) {
      if (!visibleClientIds.has(p.clientId)) continue;
      if ((p.policyNumber || '').toLowerCase().includes(q) || p.insurer.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)) {
        out.push({ id: `p_${p.id}`, type: 'POLICE', title: `${p.type} · ${p.insurer}`, subtitle: p.policyNumber ? `Nr. ${p.policyNumber}` : undefined, path: `/policy/${p.id}`, icon: <Shield size={16} /> });
      }
    }

    // 4. Leads (brokers only).
    if (role !== UserRole.CLIENT) {
      for (const l of leads) {
        if ((l.name || '').toLowerCase().includes(q) || (l.city || '').toLowerCase().includes(q)) {
          out.push({ id: `l_${l.id}`, type: 'LEAD', title: l.name, subtitle: l.city, path: '/leads', icon: <Target size={16} /> });
        }
      }
    }

    // 5. Documents (scoped by visible clients).
    for (const d of documents) {
      if (!d.clientId || !visibleClientIds.has(d.clientId)) continue;
      if ((d.title || '').toLowerCase().includes(q)) {
        out.push({ id: `d_${d.id}`, type: 'DOKUMENT', title: d.title, subtitle: d.fileName, path: `/client/${d.clientId}`, icon: <FileText size={16} /> });
      }
    }

    return out.slice(0, 30);
  }, [query, user, role, clients, policies, leads, documents, ownClientId]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!results.length && e.key !== 'Escape') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((p) => (p + 1) % results.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((p) => (p - 1 + results.length) % results.length); }
      else if (e.key === 'Enter') { e.preventDefault(); if (results[selectedIndex]) handleSelect(results[selectedIndex]); }
      else if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Reset query when closing.
  useEffect(() => { if (!isOpen) setQuery(''); }, [isOpen]);

  const handleSelect = (result: SearchResult) => {
    onClose();
    navigate(result.path);
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="text-slate-400 w-5 h-5 mr-3" />
          <input
            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            placeholder="Klienten, Policen, Leads, Dokumente …"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {loading && <Loader2 className="animate-spin text-slate-400 mr-2" size={16} />}
          <kbd className="hidden sm:inline-flex items-center h-5 px-2 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              {query ? 'Keine Ergebnisse gefunden.' : 'Tippen Sie los …'}
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => handleSelect(result)}
                  className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors ${index === selectedIndex
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-900 dark:text-brand-100'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <div className={`p-2 rounded-md ${index === selectedIndex ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{result.title}</div>
                    {result.subtitle && <div className="text-xs opacity-70 truncate">{result.subtitle}</div>}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-50">{result.type}</div>
                  {index === selectedIndex && <ChevronRight size={16} className="text-brand-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {query && (
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span><strong>{results.length}</strong> Treffer</span>
            <span>↑↓ navigieren · ↵ öffnen</span>
          </div>
        )}
      </div>
    </div>
  );
};
