import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { db } from '../../src/services/db';
import { absencesService } from '../../src/services/absences';
import { useAuth } from '../../contexts/AuthContext';
import { Absence, User, UserRole } from '../../types';
import { Loader2, ArrowRightLeft, Plane } from 'lucide-react';

/**
 * Reusable handover dialog: pick a colleague (absent ones flagged, their deputy
 * suggested) + optional note, then confirm. Used for calendar events and leads.
 */

interface HandoverDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** What is being handed over, e.g. the event/lead title – shown for context. */
  subjectLabel: string;
  tenantId?: string;
  /** User id currently responsible (excluded + pre-deputy lookup). */
  currentUserId?: string | null;
  onConfirm: (toUserId: string, toUserName: string, note: string) => Promise<void>;
  confirmLabel?: string;
}

export const HandoverDialog: React.FC<HandoverDialogProps> = ({
  isOpen, onClose, title, subjectLabel, tenantId, currentUserId, onConfirm, confirmLabel = 'Übergeben',
}) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [toUserId, setToUserId] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null); setNote(''); setToUserId('');
    (async () => {
      const [profiles, abs] = await Promise.all([
        db.profiles.getAll(tenantId ? { tenantId } : undefined),
        absencesService.list(tenantId).catch(() => []),
      ]);
      setMembers((profiles as User[]).filter((u) =>
        u.id !== currentUserId &&
        (u.role === UserRole.BROKER_ADMIN || u.role === UserRole.BROKER_AGENT || u.role === UserRole.BROKER_ADMINISTRATION)));
      setAbsences(abs);
    })();
  }, [isOpen, tenantId, currentUserId]);

  const absentIds = useMemo(() => absencesService.currentlyAbsent(absences), [absences]);

  const confirm = async () => {
    setError(null);
    if (!toUserId) { setError('Bitte eine Person wählen.'); return; }
    const target = members.find((m) => m.id === toUserId);
    setSaving(true);
    try {
      await onConfirm(toUserId, target ? `${target.firstName} ${target.lastName}` : 'Kollege', note.trim());
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Übergabe fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <ArrowRightLeft size={18} className="text-brand-600" />
          <span className="text-sm text-slate-600 dark:text-slate-300">{subjectLabel}</span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">An Kollegin/Kollege *</label>
          <select value={toUserId} onChange={(e) => setToUserId(e.target.value)} className={inputCls}>
            <option value="">– wählen –</option>
            {members.map((m) => {
              const absent = absentIds.has(m.id);
              return (
                <option key={m.id} value={m.id} disabled={absent}>
                  {m.firstName} {m.lastName}{absent ? ' — abwesend' : ''}
                </option>
              );
            })}
          </select>
          {toUserId && absentIds.has(toUserId) && (
            <p className="text-xs text-amber-600 flex items-center gap-1"><Plane size={12} /> Diese Person ist aktuell abwesend.</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notiz (optional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className={`${inputCls} min-h-[70px]`}
            placeholder="z.B. Grund der Übergabe, was zu beachten ist…" />
        </div>

        {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={saving}>Abbrechen</Button>
          <Button onClick={confirm} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={18} /> : confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
};

const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm';
