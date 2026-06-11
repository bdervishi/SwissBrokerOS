import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { notificationsService } from '../src/services/notifications';
import { AppNotification } from '../types';
import {
  Bell, ArrowRightLeft, UserPlus, AtSign, AlertTriangle, Clock, Info, Check,
} from 'lucide-react';

/**
 * In-App notification bell. Polls the notifications service for the current
 * user, shows an unread badge, and opens a dropdown with the latest items.
 * Clicking an item marks it read and navigates to its link.
 */

const ICONS: Record<string, React.ReactNode> = {
  HANDOVER_EVENT: <ArrowRightLeft size={15} className="text-brand-600" />,
  LEAD_ASSIGNED: <UserPlus size={15} className="text-emerald-600" />,
  MENTION: <AtSign size={15} className="text-purple-600" />,
  COMMISSION_DISPUTE: <AlertTriangle size={15} className="text-amber-600" />,
  DEADLINE: <Clock size={15} className="text-red-600" />,
  SYSTEM: <Info size={15} className="text-slate-500" />,
};

const timeAgo = (iso?: string): string => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'gerade eben';
  if (m < 60) return `vor ${m} Min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std`;
  return `vor ${Math.floor(h / 24)} Tg`;
};

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!user) return;
    try { setItems(await notificationsService.list(user.id)); } catch { /* ignore */ }
  };

  // Initial load + light polling (every 30s) + reload when opening.
  useEffect(() => {
    if (!user) return;
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Close on outside click.
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const unread = items.filter((n) => !n.isRead).length;

  const openItem = async (n: AppNotification) => {
    if (!n.isRead) { await notificationsService.markRead(n.id); }
    setOpen(false);
    await load();
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    if (!user) return;
    await notificationsService.markAllRead(user.id);
    await load();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((o) => !o); if (!open) load(); }}
        className="relative w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        title="Benachrichtigungen"
      >
        <Bell size={16} />
        <span>Benachrichtigungen</span>
        {unread > 0 && (
          <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-[340px] max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Benachrichtigungen</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
                <Check size={12} /> Alle gelesen
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-slate-400 text-sm">Keine Benachrichtigungen.</div>
            ) : items.map((n) => (
              <button
                key={n.id}
                onClick={() => openItem(n)}
                className={`w-full text-left px-4 py-3 flex gap-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.isRead ? 'bg-brand-50/40 dark:bg-brand-900/10' : ''}`}
              >
                <div className="mt-0.5 shrink-0">{ICONS[n.type] ?? ICONS.SYSTEM}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? 'font-bold' : 'font-medium'} text-slate-900 dark:text-slate-100`}>{n.title}</p>
                  {n.body && <p className="text-xs text-slate-500 truncate">{n.body}</p>}
                  <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
