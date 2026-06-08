import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LeadOffer } from '../types';
import { MOCK_LEAD_OFFERS } from '../constants';

const env = (import.meta as any).env || {};
const forceMock = String(env.VITE_USE_MOCK_DATA ?? 'true').toLowerCase() !== 'false';
const USE_MOCK = forceMock || !isSupabaseConfigured;

const toCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const camelKeys = (o: Record<string, any>) => {
  const out: Record<string, any> = {};
  for (const k of Object.keys(o)) out[toCamel(k)] = o[k];
  return out;
};
const snakeKeys = (o: Record<string, any>) => {
  const out: Record<string, any> = {};
  for (const k of Object.keys(o)) if (o[k] !== undefined) out[toSnake(k)] = o[k];
  return out;
};

const store: LeadOffer[] = MOCK_LEAD_OFFERS.map((o) => ({ ...o }));
const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`);

export const leadOffersService = {
  // Marketplace is browsable by all brokers (no tenant filter).
  getAll: async (): Promise<LeadOffer[]> => {
    if (USE_MOCK) return store;
    const { data, error } = await supabase.from('lead_offers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => camelKeys(r) as LeadOffer);
  },

  create: async (offer: Partial<LeadOffer>): Promise<LeadOffer> => {
    if (USE_MOCK) {
      const record = { ...(offer as LeadOffer), id: offer.id ?? uid() };
      store.unshift(record);
      return record;
    }
    const { id, ...rest } = offer as any;
    const { data, error } = await supabase.from('lead_offers').insert(snakeKeys(rest)).select('*').single();
    if (error) throw error;
    return camelKeys(data) as LeadOffer;
  },

  markSold: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const o = store.find((x) => x.id === id);
      if (o) o.status = 'SOLD';
      return;
    }
    const { error } = await supabase.from('lead_offers').update({ status: 'SOLD' }).eq('id', id);
    if (error) throw error;
  },
};
