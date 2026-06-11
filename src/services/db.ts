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
  MOCK_CLIENT_NOTES,
  MOCK_TAX_RETURNS,
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
  ClientNote,
  TaxReturn,
  ClientDocument,
  CommissionAgreement,
  CommissionStatement,
  CommissionStatementItem,
  CommissionSplitRule,
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
function createTable<T extends { id: string }>(
  table: string,
  seed: T[],
  transform?: (entity: T) => T,
) {
  // Local mutable store for mock mode – never touches the imported constants.
  const store: T[] = seed.map((r) => ({ ...r }));
  // Normalises a row into the shape the UI expects (e.g. mapping JSONB columns
  // whose interface name differs from the column name). Idempotent on mock data.
  const finish = (entity: T): T => (transform ? transform(entity) : entity);

  return {
    getAll: async (filters?: Filters): Promise<T[]> => {
      if (USE_MOCK) return applyMockFilters(store, filters).map(finish);

      let query = supabase.from(table).select('*');
      if (filters) {
        for (const [k, v] of Object.entries(filters)) {
          if (v !== undefined && v !== null) query = query.eq(toSnake(k), v);
        }
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((row) => finish(rowToEntity<T>(row)));
    },

    getById: async (id: string): Promise<T | undefined> => {
      if (USE_MOCK) {
        const found = store.find((r) => r.id === id);
        return found ? finish(found) : undefined;
      }

      const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? finish(rowToEntity<T>(data)) : undefined;
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
// The tenants table stores branding/HR/compliance/quota as JSONB columns whose
// interface names differ (branding_config -> branding) and the UI also reads a
// few derived fields (usersCount/mrr) that are not columns. Normalise here so
// real DB rows match the Tenant interface the UI expects.
const tenantTransform = (t: any): Tenant => ({
  ...t,
  // branding_config column maps to brandingConfig; the interface field is `branding`.
  branding: t.branding ?? t.brandingConfig ?? { primaryColor: '#0ea5e9', logoText: t.name ?? 'Broker' },
  // Derived/aggregate fields that are not columns – default so the UI never crashes.
  usersCount: t.usersCount ?? 0,
  mrr: t.mrr ?? 0,
  joinedDate: t.joinedDate ?? t.createdAt ?? '',
});

// The commissions table stores the insurer in `source_partner`; the UI reads
// `partnerName`/`source`. Mock rows already carry those fields – normalise DB
// rows so both data sources match the Commission interface.
const commissionTransform = (c: any): Commission => ({
  ...c,
  partnerName: c.partnerName ?? c.sourcePartner ?? '',
  source: c.source ?? c.description ?? '',
  agentSplitPercentage: c.agentSplitPercentage ?? (c.splitRate != null ? c.splitRate / 100 : 0.5),
});

export const db = {
  tenants: createTable<Tenant>('tenants', MOCK_TENANTS, tenantTransform),
  profiles: createTable<User>('profiles', MOCK_USERS),
  clients: createTable<Client>('clients', MOCK_CLIENTS),
  policies: createTable<Policy>('policies', MOCK_POLICIES),
  mortgages: createTable<MortgageScenario>('mortgages', MOCK_MORTGAGES),
  assets: createTable<Asset>('assets', MOCK_ASSETS),
  leads: createTable<Lead>('leads', []),
  commissions: createTable<Commission>('commissions', MOCK_COMMISSIONS, commissionTransform),
  commissionAgreements: createTable<CommissionAgreement>('commission_agreements', []),
  commissionStatements: createTable<CommissionStatement>('commission_statements', []),
  commissionStatementItems: createTable<CommissionStatementItem>('commission_statement_items', []),
  commissionSplitRules: createTable<CommissionSplitRule>('commission_split_rules', []),
  timeEntries: createTable<TimeEntry>('time_entries', MOCK_TIME_ENTRIES),
  clientNotes: createTable<ClientNote>('client_notes', MOCK_CLIENT_NOTES),
  taxReturns: createTable<TaxReturn>('tax_returns', MOCK_TAX_RETURNS),
  // Native document registry (metadata rows; binaries live in Supabase Storage
  // – see src/services/documents.ts for upload/download).
  documents: createTable<ClientDocument>('documents', []),
};

export type Database = typeof db;
