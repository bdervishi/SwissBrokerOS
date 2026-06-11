import React, { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { db } from '../../src/services/db';
import { leadsService } from '../../src/services/leads';
import { calendarService } from '../../src/services/calendar';
import { absencesService } from '../../src/services/absences';
import { notificationsService } from '../../src/services/notifications';
import {
  useClients, useLeadsFull, useCalendarEvents, useAbsences,
} from '../../src/hooks/useData';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { Users, Briefcase, Calendar, Target, ArrowRightLeft, Loader2, Plane } from 'lucide-react';

/**
 * Team-Steuerung für den Broker-Admin: Auslastung pro Mitarbeiter (Kunden /
 * offene Leads / anstehende Termine) + Bulk-Übertragung aller Kunden, Leads
 * und Termine eines Mitarbeiters auf eine andere Person (Austritt/Nachfolge).
 */

interface TeamWorkloadProps {
  employees: User[];
}

export const TeamWorkload: React.FC<TeamWorkloadProps> = ({ employees }) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  const { data: clients, refetch: refetchClients } = useClients(tenantId ? { tenantId } : undefined);
  const { data: leads, refetch: refetchLeads } = useLeadsFull(tenantId);
  const { data: events, refetch: refetchEvents } = useCalendarEvents(tenantId);
  const { data: absences } = useAbsences(tenantId);

  const [isOpen, setIsOpen] = useState(false);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const absentIds = useMemo(() => absencesService.currentlyAbsent(absences), [absences]);
  const now = new Date();

  const stats = useMemo(() => employees.map((e) => ({
    user: e,
    clients: clients.filter((c) => c.advisorId === e.id).length,
    leads: leads.filter((l) => l.assignedTo === e.id && l.status !== 'WON' && l.status !== 'LOST').length,
    events: events.filter((v) => v.userId === e.id && v.start >= now).length,
    absent: absentIds.has(e.id),
  })), [employees, clients, leads, events, absentIds]);

  const openReassign = () => { setError(null); setResult(null); setFromId(''); setToId(''); setIsOpen(true); };

  const runReassign = async () => {
    setError(null);
    if (!fromId || !toId) { setError('Quelle und Ziel wählen.'); return; }
    if (fromId === toId) { setError('Quelle und Ziel müssen verschieden sein.'); return; }
    setBusy(true);
    try {
      let movedClients = 0, movedLeads = 0, movedEvents = 0;

      for (const c of clients.filter((c) => c.advisorId === fromId)) {
        await db.clients.update(c.id, { advisorId: toId } as any);
        movedClients++;
      }
      for (const l of leads.filter((l) => l.assignedTo === fromId)) {
        await leadsService.assign(l.id, toId);
        movedLeads++;
      }
      for (const v of events.filter((v) => v.userId === fromId && v.start >= now)) {
        await calendarService.reassign(v.id, toId);
        movedEvents++;
      }

      await notificationsService.create({
        tenantId, recipientId: toId, actorId: user?.id,
        type: 'HANDOVER_EVENT', title: 'Bestand übertragen',
        body: `Dir wurden ${movedClients} Kunden, ${movedLeads} Leads und ${movedEvents} Termine übertragen.`,
        link: '/clients',
      });

      setResult(`${movedClients} Kunden, ${movedLeads} Leads, ${movedEvents} Termine übertragen.`);
      refetchClients(); refetchLeads(); refetchEvents();
    } catch (e: any) {
      setError(e?.message || 'Übertragung fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  };

  const name = (id: string) => { const u = employees.find((e) => e.id === id); return u ? `${u.firstName} ${u.lastName}` : ''; };

  return (
    <Card noPadding className="mb-6">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Users size={18} className="text-brand-600" /> Auslastung & Bestände</h3>
          <p className="text-xs text-slate-500">Kunden, offene Leads und anstehende Termine pro Mitarbeiter.</p>
        </div>
        <Button size="sm" variant="outline" icon={<ArrowRightLeft size={14} />} onClick={openReassign}>Bestand übertragen</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3">Mitarbeiter</th>
              <th className="px-6 py-3 text-right"><span className="inline-flex items-center gap-1"><Briefcase size={12} /> Kunden</span></th>
              <th className="px-6 py-3 text-right"><span className="inline-flex items-center gap-1"><Target size={12} /> Offene Leads</span></th>
              <th className="px-6 py-3 text-right"><span className="inline-flex items-center gap-1"><Calendar size={12} /> Termine</span></th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.map((s) => (
              <tr key={s.user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">{s.user.firstName} {s.user.lastName}</td>
                <td className="px-6 py-3 text-right font-mono">{s.clients}</td>
                <td className="px-6 py-3 text-right font-mono">{s.leads}</td>
                <td className="px-6 py-3 text-right font-mono">{s.events}</td>
                <td className="px-6 py-3">
                  {s.absent
                    ? <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600"><Plane size={12} /> abwesend</span>
                    : <span className="text-xs text-emerald-600">verfügbar</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Bestand übertragen" maxWidth="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Überträgt <strong>alle Kunden, offenen Leads und anstehenden Termine</strong> von einer Person auf eine andere — z.B. bei Austritt oder Nachfolge.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Von</label>
              <select value={fromId} onChange={(e) => setFromId(e.target.value)} className={inputCls}>
                <option value="">– wählen –</option>
                {employees.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Auf</label>
              <select value={toId} onChange={(e) => setToId(e.target.value)} className={inputCls}>
                <option value="">– wählen –</option>
                {employees.filter((u) => u.id !== fromId).map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
          </div>
          {fromId && (
            <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
              {name(fromId)} hat aktuell:
              {' '}{stats.find((s) => s.user.id === fromId)?.clients ?? 0} Kunden,
              {' '}{stats.find((s) => s.user.id === fromId)?.leads ?? 0} offene Leads,
              {' '}{stats.find((s) => s.user.id === fromId)?.events ?? 0} Termine.
            </div>
          )}
          {result && <p className="text-sm text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded">{result}</p>}
          {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={busy}>Schliessen</Button>
            <Button onClick={runReassign} disabled={busy || !!result}>{busy ? <Loader2 className="animate-spin" size={18} /> : 'Übertragen'}</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm';
