import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AppNotification, NotificationType } from '../types';

const env = (import.meta as any).env || {};
const forceMock = String(env.VITE_USE_MOCK_DATA ?? 'true').toLowerCase() !== 'false';
const USE_MOCK = forceMock || !isSupabaseConfigured;
const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `n-${Date.now()}`);

const toCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const rowToNotif = (r: any): AppNotification => {
  const out: any = {};
  for (const k of Object.keys(r)) out[toCamel(k)] = r[k];
  return out as AppNotification;
};

// In-memory store keeps mock notifications visible within a session.
const store: AppNotification[] = [];

export interface CreateNotification {
  tenantId?: string;
  recipientId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  relatedType?: string;
  relatedId?: string;
}

export const notificationsService = {
  list: async (recipientId: string): Promise<AppNotification[]> => {
    if (USE_MOCK) {
      return store
        .filter((n) => n.recipientId === recipientId)
        .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
    }
    const { data, error } = await supabase
      .from('notifications').select('*')
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []).map(rowToNotif);
  },

  create: async (n: CreateNotification): Promise<void> => {
    // Never notify yourself.
    if (n.actorId && n.actorId === n.recipientId) return;
    if (USE_MOCK) {
      store.unshift({ ...n, id: uid(), isRead: false, createdAt: new Date().toISOString() } as AppNotification);
      return;
    }
    const { error } = await supabase.from('notifications').insert({
      tenant_id: n.tenantId, recipient_id: n.recipientId, actor_id: n.actorId ?? null,
      type: n.type, title: n.title, body: n.body ?? null, link: n.link ?? null,
      related_type: n.relatedType ?? null, related_id: n.relatedId ?? null,
    });
    if (error) throw error;
  },

  markRead: async (id: string): Promise<void> => {
    if (USE_MOCK) { const n = store.find((x) => x.id === id); if (n) n.isRead = true; return; }
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  },

  markAllRead: async (recipientId: string): Promise<void> => {
    if (USE_MOCK) { store.forEach((n) => { if (n.recipientId === recipientId) n.isRead = true; }); return; }
    await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', recipientId).eq('is_read', false);
  },

  /**
   * Live updates: invokes `onChange` whenever a notification for this recipient
   * is inserted/updated (Supabase Realtime). Returns an unsubscribe function.
   * In mock mode there is no server channel -> no-op (the bell keeps polling).
   */
  subscribe: (recipientId: string, onChange: () => void): (() => void) => {
    if (USE_MOCK) return () => {};
    const channel = supabase
      .channel(`notifications:${recipientId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${recipientId}` },
        () => onChange(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },
};
