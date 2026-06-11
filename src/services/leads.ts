import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Lead, LeadContact } from '../types';

const env = (import.meta as any).env || {};
const forceMock = String(env.VITE_USE_MOCK_DATA ?? 'true').toLowerCase() !== 'false';
const USE_MOCK = forceMock || !isSupabaseConfigured;

// ---- key mapping (shallow) ----
const toCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const camelKeys = (o: Record<string, any>) => {
  const out: Record<string, any> = {};
  for (const k of Object.keys(o)) out[toCamel(k)] = o[k];
  return out;
};
const snakeKeys = (o: Record<string, any>) => {
  const out: Record<string, any> = {};
  for (const k of Object.keys(o)) out[toSnake(k)] = o[k];
  return out;
};

// Assemble a Lead from a DB row with embedded children.
const rowToLead = (row: any): Lead => {
  const { lead_contacts, lead_activities, lead_tasks, interests, ...rest } = row;
  return {
    ...(camelKeys(rest) as any),
    interests: interests ?? [],
    contacts: (lead_contacts ?? []).map(camelKeys),
    activities: (lead_activities ?? []).map(camelKeys),
    tasks: (lead_tasks ?? []).map(camelKeys),
    offers: [],
  } as Lead;
};

const SELECT = '*, lead_contacts(*), lead_activities(*), lead_tasks(*)';

// ---- mock store ----
const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-mock-1', tenantId: 't1', name: 'AlpenTech Solutions',
    city: 'Zürich', address: 'Hardturmstrasse 161, 8005 Zürich', status: 'NEW', potentialValue: 5000,
    type: 'OTHER', website: 'https://alpentech.ch', createdAt: '2024-06-01', updatedAt: '2024-06-02',
    source: 'Radar', aiInsightScore: 85, interests: ['Cyber-Versicherung', 'PK-Optimierung'],
    contacts: [{ id: 'c1', name: 'Dr. Marc Wenger', role: 'CEO', email: 'm.wenger@alpentech.ch', phone: '+41 44 123 45 67', isPrimary: true }],
    activities: [], tasks: [], offers: [],
  },
  {
    id: 'lead-mock-2', tenantId: 't1', name: 'Brunner Bau GmbH',
    city: 'Winterthur', address: 'Industriestrasse 5, 8400 Winterthur', status: 'CONTACTED', potentialValue: 8200,
    type: 'OTHER', website: '', createdAt: '2024-05-20', updatedAt: '2024-06-01',
    source: 'LinkedIn', aiInsightScore: 72, interests: ['BVG', 'Betriebshaftpflicht'],
    contacts: [], activities: [], tasks: [], offers: [],
  },
];
const store: Lead[] = MOCK_LEADS.map((l) => ({ ...l }));

const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random()}`);

export const leadsService = {
  getAll: async (tenantId?: string): Promise<Lead[]> => {
    if (USE_MOCK) return tenantId ? store.filter((l) => l.tenantId === tenantId) : store;

    let query = supabase.from('leads').select(SELECT);
    if (tenantId) query = query.eq('tenant_id', tenantId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(rowToLead);
  },

  create: async (lead: Partial<Lead>): Promise<Lead> => {
    if (USE_MOCK) {
      const record: Lead = {
        offers: [], activities: [], tasks: [], interests: [], contacts: [],
        ...(lead as Lead), id: lead.id ?? uid(),
      };
      store.unshift(record);
      return record;
    }

    const { contacts = [], activities = [], tasks = [], offers, id: _ignoreId, ...flat } = lead as any;
    const { data, error } = await supabase
      .from('leads')
      .insert(snakeKeys({ ...flat, updatedAt: new Date().toISOString() }))
      .select('id')
      .single();
    if (error) throw error;
    const leadId = data.id as string;

    if (contacts.length) {
      await supabase.from('lead_contacts').insert(contacts.map((c: any) => snakeKeys({ ...c, leadId, id: undefined })));
    }
    if (activities.length) {
      await supabase.from('lead_activities').insert(activities.map((a: any) => snakeKeys({ ...a, leadId, id: undefined })));
    }
    if (tasks.length) {
      await supabase.from('lead_tasks').insert(tasks.map((t: any) => snakeKeys({ ...t, leadId, id: undefined })));
    }

    const { data: full, error: e2 } = await supabase.from('leads').select(SELECT).eq('id', leadId).single();
    if (e2) throw e2;
    return rowToLead(full);
  },

  updateStatus: async (leadId: string, status: Lead['status']): Promise<void> => {
    if (USE_MOCK) {
      const l = store.find((x) => x.id === leadId);
      if (l) l.status = status;
      return;
    }
    const { error } = await supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', leadId);
    if (error) throw error;
  },

  /** Assign / hand over a lead to a team member. */
  assign: async (leadId: string, toUserId: string | null): Promise<void> => {
    if (USE_MOCK) {
      const l = store.find((x) => x.id === leadId);
      if (l) l.assignedTo = toUserId;
      return;
    }
    const { error } = await supabase.from('leads')
      .update({ assigned_to: toUserId, updated_at: new Date().toISOString() }).eq('id', leadId);
    if (error) throw error;
  },

  /** Append a lead activity (e.g. handover note) to the timeline. */
  addActivity: async (leadId: string, activity: { type: string; title: string; description?: string; authorName?: string }): Promise<void> => {
    const entry = {
      id: uid(), type: activity.type, title: activity.title,
      description: activity.description ?? '', authorName: activity.authorName ?? 'System',
      timestamp: new Date().toLocaleString('de-CH'),
    };
    if (USE_MOCK) {
      const l = store.find((x) => x.id === leadId);
      if (l) l.activities = [entry as any, ...(l.activities || [])];
      return;
    }
    const { error } = await supabase.from('lead_activities').insert(snakeKeys({ ...entry, leadId, id: undefined }));
    if (error) throw error;
  },

  addContact: async (leadId: string, contact: Partial<LeadContact>): Promise<void> => {
    if (USE_MOCK) {
      const l = store.find((x) => x.id === leadId);
      if (l) l.contacts = [...(l.contacts || []), { ...(contact as LeadContact), id: uid() }];
      return;
    }
    const { error } = await supabase.from('lead_contacts').insert(snakeKeys({ ...contact, leadId, id: undefined }));
    if (error) throw error;
  },

  remove: async (leadId: string): Promise<void> => {
    if (USE_MOCK) {
      const i = store.findIndex((x) => x.id === leadId);
      if (i !== -1) store.splice(i, 1);
      return;
    }
    const { error } = await supabase.from('leads').delete().eq('id', leadId);
    if (error) throw error;
  },
};
