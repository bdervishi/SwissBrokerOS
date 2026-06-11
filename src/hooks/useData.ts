import { useEffect, useState } from 'react';
import { db } from '../services/db';
import { leadsService } from '../services/leads';
import { calendarService } from '../services/calendar';
import { emailsService } from '../services/emails';
import { leadOffersService } from '../services/leadOffers';
import { CalendarEvent, TaxReturn, Email, LeadOffer, ClientDocument } from '../types';
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
} from '../types';

export interface AsyncCollection<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface AsyncItem<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Generic loader for a list of rows. Starts with an empty array so pages can
 * render immediately, then fills in once the (mock or Supabase) query resolves.
 */
function useCollection<T>(loader: () => Promise<T[]>, deps: unknown[]): AsyncCollection<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loader()
      .then((rows) => {
        if (active) {
          setData(rows);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) setError(err as Error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, loading, error, refetch: () => setTick((t) => t + 1) };
}

function useItem<T>(loader: () => Promise<T | undefined>, deps: unknown[]): AsyncItem<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loader()
      .then((row) => {
        if (active) {
          setData(row);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) setError(err as Error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

// ---- Collections --------------------------------------------------------
export const useClients = (filters?: { advisorId?: string; tenantId?: string }) =>
  useCollection<Client>(() => db.clients.getAll(filters), [filters?.advisorId, filters?.tenantId]);

export const usePolicies = (clientId?: string) =>
  useCollection<Policy>(() => db.policies.getAll(clientId ? { clientId } : undefined), [clientId]);

export const useMortgages = (clientId?: string) =>
  useCollection<MortgageScenario>(
    () => db.mortgages.getAll(clientId ? { clientId } : undefined),
    [clientId],
  );

export const useAssets = (clientId?: string) =>
  useCollection<Asset>(() => db.assets.getAll(clientId ? { clientId } : undefined), [clientId]);

export const useCommissions = (agentId?: string) =>
  useCollection<Commission>(() => db.commissions.getAll(agentId ? { agentId } : undefined), [agentId]);

export const useTimeEntries = (userId?: string) =>
  useCollection<TimeEntry>(() => db.timeEntries.getAll(userId ? { userId } : undefined), [userId]);

export const useTenants = () => useCollection<Tenant>(() => db.tenants.getAll(), []);

export const useProfiles = (tenantId?: string) =>
  useCollection<User>(() => db.profiles.getAll(tenantId ? { tenantId } : undefined), [tenantId]);

export const useLeads = (tenantId?: string) =>
  useCollection<Lead>(() => db.leads.getAll(tenantId ? { tenantId } : undefined), [tenantId]);

// Full leads (with embedded contacts/activities/tasks) via the leads service.
export const useLeadsFull = (tenantId?: string) =>
  useCollection<Lead>(() => leadsService.getAll(tenantId), [tenantId]);

export const useCalendarEvents = (tenantId?: string) =>
  useCollection<CalendarEvent>(() => calendarService.getAll(tenantId), [tenantId]);

export const useEmails = (tenantId?: string) =>
  useCollection<Email>(() => emailsService.getAll(tenantId), [tenantId]);

export const useLeadOffers = () =>
  useCollection<LeadOffer>(() => leadOffersService.getAll(), []);

export const useTaxReturns = (clientId?: string) =>
  useCollection<TaxReturn>(() => db.taxReturns.getAll(clientId ? { clientId } : undefined), [clientId]);

export const useClientNotes = (clientId?: string) =>
  useCollection<ClientNote>(
    () => db.clientNotes.getAll(clientId ? { clientId } : undefined),
    [clientId],
  );

export const useDocuments = (clientId?: string) =>
  useCollection<ClientDocument>(
    () => (clientId ? db.documents.getAll({ clientId }) : Promise.resolve([])),
    [clientId],
  );

// ---- Single items -------------------------------------------------------
export const useClient = (id?: string) =>
  useItem<Client>(() => (id ? db.clients.getById(id) : Promise.resolve(undefined)), [id]);

export const useTenant = (id?: string) =>
  useItem<Tenant>(() => (id ? db.tenants.getById(id) : Promise.resolve(undefined)), [id]);
