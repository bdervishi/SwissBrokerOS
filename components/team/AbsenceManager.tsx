import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { db } from '../../src/services/db';
import { absencesService } from '../../src/services/absences';
import { calendarService } from '../../src/services/calendar';
import { leadsService } from '../../src/services/leads';
import { notificationsService } from '../../src/services/notifications';
import { useAuth } from '../../contexts/AuthContext';
import { Absence, AbsenceReason, User, UserRole } from '../../types';
import { Plane, Plus, Trash2, Loader2, ShieldCheck } from 'lucide-react';

/**
 * Abwesenheit + Vertretung: ein Mitarbeiter meldet Ferien/Krankheit, wählt eine
 * Stellvertretung und kann seine offenen Termine + Leads im Zeitraum mit einem
 * Klick an die Vertretung übergeben (inkl. Benachrichtigung).
 */

const REASON_LABELS: Record<AbsenceReason, string> = {
  VACATION: 'Ferien', SICK: 'Krankheit', OTHER: 'Sonstiges',
};

export const AbsenceManager: React.FC = () => {
  const { user } = useAuth();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ reason: 'VACATION' as AbsenceReason, startDate: '', endDate: '', deputyId: '', note: '', redistribute: true });

  const load = async () => {
    if (!user) return;
    const [abs, profiles] = await Promise.all([
      absencesService.list(user.tenantId).catch(() => []),
      db.profiles.getAll({ tenantId: user.tenantId }).catch(() => []),
    ]);
    setAbsences(abs.filter((a) => a.userId === user.id));
    setTeam((profiles as User[]).filter((u) => u.id !== user.id &&
      (u.role === UserRole.BROKER_ADMIN || u.role === UserRole.BROKER_AGENT || u.role === UserRole.BROKER_ADMINISTRATION)));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const save = async () => {
    setError(null);
    if (!form.startDate || !form.endDate) { setError('Zeitraum angeben.'); return; }
    if (form.endDate < form.startDate) { setError('Enddatum liegt vor dem Startdatum.'); return; }
    if (form.redistribute && !form.deputyId) { setError('Für die Übergabe bitte eine Stellvertretung wählen.'); return; }
    setSaving(true);
    try {
      await absencesService.create({
        tenantId: user!.tenantId, userId: user!.id, deputyId: form.deputyId || null,
        reason: form.reason, startDate: form.startDate, endDate: form.endDate, note: form.note.trim() || null,
      });

      // Optional: offene Termine im Zeitraum an die Stellvertretung übergeben.
      if (form.redistribute && form.deputyId) {
        const events = await calendarService.getAll(user!.tenantId);
        const mine = events.filter((e) => (e.userId === user!.id) && e.start >= new Date(form.startDate) && e.start <= new Date(`${form.endDate}T23:59:59`));
        for (const e of mine) await calendarService.reassign(e.id, form.deputyId);

        // offene Leads (nicht gewonnen/verloren) ebenfalls
        const leads = await leadsService.getAll(user!.tenantId);
        const myLeads = leads.filter((l) => l.assignedTo === user!.id && l.status !== 'WON' && l.status !== 'LOST');
        for (const l of myLeads) {
          await leadsService.assign(l.id, form.deputyId);
          await leadsService.addActivity(l.id, { type: 'SYSTEM', title: 'Vertretung', description: `Während Abwesenheit an Stellvertretung übergeben.`, authorName: `${user!.firstName} ${user!.lastName}` });
        }

        if (mine.length || myLeads.length) {
          await notificationsService.create({
            tenantId: user!.tenantId, recipientId: form.deputyId, actorId: user!.id,
            type: 'HANDOVER_EVENT', title: 'Vertretung übernommen',
            body: `${user!.firstName} ${user!.lastName} ist abwesend (${form.startDate}–${form.endDate}). ${mine.length} Termine und ${myLeads.length} Leads wurden an dich übergeben.`,
            link: '/calendar',
          });
        }
      }

      setIsOpen(false);
      setForm({ reason: 'VACATION', startDate: '', endDate: '', deputyId: '', note: '', redistribute: true });
      load();
    } catch (e: any) {
      setError(e?.message || 'Speichern fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Diese Abwesenheit löschen?')) return;
    await absencesService.remove(id);
    load();
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Card noPadding>
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Plane size={18} className="text-brand-600" /> Abwesenheiten & Vertretung</h3>
          <p className="text-xs text-slate-500">Melde Ferien/Krankheit und übergib offene Termine an deine Stellvertretung.</p>
        </div>
        <Button size="sm" icon={<Plus size={14} />} onClick={() => { setError(null); setIsOpen(true); }}>Abwesenheit melden</Button>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {absences.length === 0 && <div className="px-6 py-8 text-center text-slate-500 italic text-sm">Keine Abwesenheiten erfasst.</div>}
        {absences.map((a) => {
          const active = a.startDate <= today && a.endDate >= today;
          const deputy = team.find((u) => u.id === a.deputyId);
          return (
            <div key={a.id} className="px-6 py-3 flex items-center gap-4 group">
              <div className={`w-2 h-2 rounded-full ${active ? 'bg-amber-500' : 'bg-slate-300'}`} title={active ? 'aktuell abwesend' : ''} />
              <div className="flex-1">
                <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{REASON_LABELS[a.reason]} · {a.startDate} – {a.endDate}{active ? '  (aktiv)' : ''}</p>
                <p className="text-xs text-slate-500">{deputy ? `Vertretung: ${deputy.firstName} ${deputy.lastName}` : 'keine Vertretung'}{a.note ? ` · ${a.note}` : ''}</p>
              </div>
              <button onClick={() => remove(a.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={15} /></button>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Abwesenheit melden" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Grund</label>
              <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value as AbsenceReason })} className={inputCls}>
                {(Object.keys(REASON_LABELS) as AbsenceReason[]).map((r) => <option key={r} value={r}>{REASON_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Von</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bis</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Stellvertretung</label>
            <select value={form.deputyId} onChange={(e) => setForm({ ...form, deputyId: e.target.value })} className={inputCls}>
              <option value="">– keine –</option>
              {team.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" checked={form.redistribute} onChange={(e) => setForm({ ...form, redistribute: e.target.checked })} className="accent-brand-600" />
            <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-600" /> Offene Termine & Leads im Zeitraum an die Stellvertretung übergeben</span>
          </label>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notiz</label>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputCls} />
          </div>
          {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={saving}>Abbrechen</Button>
            <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={18} /> : 'Speichern'}</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm';
