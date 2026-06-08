import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  MOCK_CLIENTS,
  MOCK_POLICIES,
  MOCK_MORTGAGES,
  MOCK_ASSETS,
  MOCK_COMMISSIONS,
  MOCK_TIME_ENTRIES,
  MOCK_USERS,
  MOCK_TENANTS,
} from '../constants';
import {
  Client,
  Policy,
  MortgageScenario,
  Asset,
  Lead,
  Commission,
  TimeEntry,
  User,
  Tenant,
} from '../types';

// ==========================================================================
// MODE
// ==========================================================================
// Mock mode is the default. We only talk to a real Supabase backend when it is
// both configured AND the caller has not explicitly forced mock data via
// `VITE_USE_MOCK_DATA`. This keeps a fresh checkout fully functional offline.
const env = (import.meta as any).env || {};
const forceMock = String(env.VITE_USE_MOCK_DATA ?? 'true').toLowerCase() !== 'false';
export const USE_MOCK = forceMock || !isSupabaseConfigured;

// ==========================================================================
// snake_case <-> camelCase MAPPING
// ==========================================================================
// Postgres columns are snake_case; our TS interfaces are camelCase. We convert
// only TOP-LEVEL keys – JSONB column values (e.g. branding_config, trust_score)
// are stored in their original shape and must be left untouched.
const toCamel = (s: string): string => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const toSnake = (s: string): string => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

const mapKeys = (row: Record<string, any>, fn: (k: string) => string): Record<string, any> => {
  const out: Record<string, any> = {};
  for (const key of Object.keys(row)) out[fn(key)] = row[key];
  return out;
};

const rowToEntity = <T>(row: Record<string, any>): T => mapKeys(row, toCamel) as T;
const entityToRow = (entity: Record<string, any>): Record<string, any> => mapKeys(entity, toSnake);

// ==========================================================================
// GENERIC TABLE ACCESSOR
// ==========================================================================
type Filters = Record<string, string | number | boolean | undefined | null>;

const applyMockFilters = <T extends Record<string, any>>(rows: T[], filters?: Filters): T[] => {
  if (!filters) return rows;
  const active = Object.entries(filters).filter(([, v]) => v !== undefined && v !== null);
  if (active.length === 0) return rows;
  return rows.filter((row) => active.every(([k, v]) => row[k] === v));
};

/**
 * Builds a typed CRUD accessor for one table. In mock mode it operates on an
 * in-memory copy of the seed data (so the UI reflects changes within a session);
 * otherwise it queries Supabase and maps rows to/from camelCase.
 */
function createTable<T extends { id: string }>(table: string, seed: T[]) {
  // Local mutable store for mock mode – never touches the imported constants.
  const store: T[] = seed.map((r) => ({ ...r }));

  return {
    getAll: async (filters?: Filters): Promise<T[]> => {
      if (USE_MOCK) return applyMockFilters(store, filters);

      let query = supabase.from(table).select('*');
      if (filters) {
        for (const [k, v] of Object.entries(filters)) {
          if (v !== undefined && v !== null) query = query.eq(toSnake(k), v);
        }
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((row) => rowToEntity<T>(row));
    },

    getById: async (id: string): Promise<T | undefined> => {
      if (USE_MOCK) return store.find((r) => r.id === id);

      const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? rowToEntity<T>(data) : undefined;
    },

    create: async (entity: Partial<T>): Promise<T> => {
      if (USE_MOCK) {
        const record = { ...entity, id: entity.id ?? crypto.randomUUID() } as T;
        store.unshift(record);
        return record;
      }

      const { data, error } = await supabase
        .from(table)
        .insert(entityToRow(entity))
        .select()
        .single();
      if (error) throw error;
      return rowToEntity<T>(data);
    },

    update: async (id: string, patch: Partial<T>): Promise<T> => {
      if (USE_MOCK) {
        const idx = store.findIndex((r) => r.id === id);
        if (idx === -1) throw new Error(`${table} ${id} not found`);
        store[idx] = { ...store[idx], ...patch };
        return store[idx];
      }

      const { data, error } = await supabase
        .from(table)
        .update(entityToRow(patch))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return rowToEntity<T>(data);
    },

    remove: async (id: string): Promise<void> => {
      if (USE_MOCK) {
        const idx = store.findIndex((r) => r.id === id);
        if (idx !== -1) store.splice(idx, 1);
        return;
      }

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
  };
}

// ==========================================================================
// PUBLIC DATA ACCESS LAYER
// ==========================================================================
// One accessor per Postgres table. Leads have no mock seed yet, so they start
// empty in mock mode.
export const db = {
  tenants: createTable<Tenant>('tenants', MOCK_TENANTS),
  profiles: createTable<User>('profiles', MOCK_USERS),
  clients: createTable<Client>('clients', MOCK_CLIENTS),
  policies: createTable<Policy>('policies', MOCK_POLICIES),
  mortgages: createTable<MortgageScenario>('mortgages', MOCK_MORTGAGES),
  assets: createTable<Asset>('assets', MOCK_ASSETS),
  leads: createTable<Lead>('leads', []),
  commissions: createTable<Commission>('commissions', MOCK_COMMISSIONS),
  timeEntries: createTable<TimeEntry>('time_entries', MOCK_TIME_ENTRIES),
};

export type Database = typeof db;
