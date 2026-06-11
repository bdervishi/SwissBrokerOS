import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CalendarEvent } from '../types';

const env = (import.meta as any).env || {};
const forceMock = String(env.VITE_USE_MOCK_DATA ?? 'true').toLowerCase() !== 'false';
const USE_MOCK = forceMock || !isSupabaseConfigured;

const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`);

// DB row (snake, start_time/end_time as ISO) <-> CalendarEvent (start/end Date).
const rowToEvent = (row: any): CalendarEvent => ({
  id: row.id,
  title: row.title,
  start: row.start_time ? new Date(row.start_time) : new Date(),
  end: row.end_time ? new Date(row.end_time) : new Date(row.start_time),
  type: row.type,
  relatedId: row.related_id,
  relatedType: row.related_type,
  isAllDay: row.is_all_day ?? false,
  description: row.description ?? undefined,
  userId: row.user_id ?? null,
  tenantId: row.tenant_id ?? undefined,
});

const eventToRow = (e: Partial<CalendarEvent> & { tenantId?: string; userId?: string }) => ({
  tenant_id: e.tenantId,
  user_id: e.userId,
  title: e.title,
  start_time: e.start instanceof Date ? e.start.toISOString() : e.start,
  end_time: e.end instanceof Date ? e.end.toISOString() : e.end,
  type: e.type,
  related_id: e.relatedId,
  related_type: e.relatedType,
  is_all_day: e.isAllDay ?? false,
  description: e.description,
});

// Mock seed: a couple of upcoming events relative to today.
const seed = (): CalendarEvent[] => {
  const d = (offset: number) => { const x = new Date(); x.setDate(x.getDate() + offset); return x; };
  return [
    { id: 'evt-1', title: 'Jahresgespräch Hans Meier', start: d(2), end: d(2), type: 'MEETING' as any, relatedId: '', relatedType: 'CLIENT' as any, isAllDay: false },
    { id: 'evt-2', title: 'Offerte nachfassen', start: d(4), end: d(4), type: 'TASK' as any, relatedId: '', relatedType: 'CLIENT' as any, isAllDay: false },
  ];
};
const store: CalendarEvent[] = seed();

export const calendarService = {
  getAll: async (tenantId?: string): Promise<CalendarEvent[]> => {
    if (USE_MOCK) return store;
    let query = supabase.from('calendar_events').select('*');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(rowToEvent);
  },

  create: async (event: Partial<CalendarEvent> & { tenantId?: string; userId?: string }): Promise<CalendarEvent> => {
    if (USE_MOCK) {
      const record = { offers: [], ...(event as CalendarEvent), id: event.id ?? uid() } as CalendarEvent;
      store.unshift(record);
      return record;
    }
    const { data, error } = await supabase.from('calendar_events').insert(eventToRow(event)).select('*').single();
    if (error) throw error;
    return rowToEvent(data);
  },

  /** Reassign a calendar event to another team member (handover). */
  reassign: async (eventId: string, toUserId: string): Promise<void> => {
    if (USE_MOCK) {
      const e = store.find((x) => x.id === eventId);
      if (e) e.userId = toUserId;
      return;
    }
    const { error } = await supabase.from('calendar_events').update({ user_id: toUserId }).eq('id', eventId);
    if (error) throw error;
  },
};
