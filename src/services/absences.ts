import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Absence } from '../types';

const env = (import.meta as any).env || {};
const forceMock = String(env.VITE_USE_MOCK_DATA ?? 'true').toLowerCase() !== 'false';
const USE_MOCK = forceMock || !isSupabaseConfigured;
const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}`);

const toCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const rowTo = (r: any): Absence => {
  const out: any = {};
  for (const k of Object.keys(r)) out[toCamel(k)] = r[k];
  return out as Absence;
};

const store: Absence[] = [];

export const absencesService = {
  list: async (tenantId?: string): Promise<Absence[]> => {
    if (USE_MOCK) return tenantId ? store.filter((a) => a.tenantId === tenantId) : store;
    let q = supabase.from('absences').select('*').order('start_date', { ascending: false });
    if (tenantId) q = q.eq('tenant_id', tenantId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(rowTo);
  },

  create: async (a: Partial<Absence>): Promise<Absence> => {
    if (USE_MOCK) {
      const rec = { ...(a as Absence), id: uid(), createdAt: new Date().toISOString() };
      store.unshift(rec);
      return rec;
    }
    const { data, error } = await supabase.from('absences').insert({
      tenant_id: a.tenantId, user_id: a.userId, deputy_id: a.deputyId ?? null,
      reason: a.reason ?? 'VACATION', start_date: a.startDate, end_date: a.endDate, note: a.note ?? null,
    }).select('*').single();
    if (error) throw error;
    return rowTo(data);
  },

  remove: async (id: string): Promise<void> => {
    if (USE_MOCK) { const i = store.findIndex((x) => x.id === id); if (i !== -1) store.splice(i, 1); return; }
    const { error } = await supabase.from('absences').delete().eq('id', id);
    if (error) throw error;
  },

  /** Currently-absent user ids (today within [start,end]). */
  currentlyAbsent: (absences: Absence[]): Set<string> => {
    const today = new Date().toISOString().slice(0, 10);
    return new Set(absences.filter((a) => a.startDate <= today && a.endDate >= today).map((a) => a.userId));
  },
};
