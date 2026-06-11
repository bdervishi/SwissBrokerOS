import { supabase, isSupabaseConfigured } from '../lib/supabase';

const env = (import.meta as any).env || {};
const forceMock = String(env.VITE_USE_MOCK_DATA ?? 'true').toLowerCase() !== 'false';
const USE_MOCK = forceMock || !isSupabaseConfigured;

export interface AuditEntry {
  id: string;
  tenantId?: string;
  actorId?: string | null;
  actorName?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  summary?: string | null;
  detail?: Record<string, any>;
  createdAt?: string;
}

export interface LogInput {
  tenantId?: string;
  actorId?: string | null;
  actorName?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  summary?: string;
  detail?: Record<string, any>;
}

const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : `a-${Date.now()}-${Math.random()}`);
const store: AuditEntry[] = [];

const rowToEntry = (r: any): AuditEntry => ({
  id: r.id, tenantId: r.tenant_id, actorId: r.actor_id, actorName: r.actor_name,
  action: r.action, entityType: r.entity_type, entityId: r.entity_id,
  summary: r.summary, detail: r.detail ?? {}, createdAt: r.created_at,
});

export const auditService = {
  /**
   * Records a compliance event. Never throws – auditing must not break the
   * user action it accompanies (failures are logged to the console only).
   */
  log: async (e: LogInput): Promise<void> => {
    try {
      if (USE_MOCK) {
        store.unshift({ ...e, id: uid(), createdAt: new Date().toISOString() } as AuditEntry);
        return;
      }
      await supabase.from('audit_logs').insert({
        tenant_id: e.tenantId, actor_id: e.actorId ?? null, actor_name: e.actorName ?? null,
        action: e.action, entity_type: e.entityType ?? null, entity_id: e.entityId ?? null,
        summary: e.summary ?? null, detail: e.detail ?? {},
      });
    } catch (err) {
      console.warn('[Audit] log failed:', (err as Error).message);
    }
  },

  list: async (tenantId?: string, limit = 200): Promise<AuditEntry[]> => {
    if (USE_MOCK) return store.slice(0, limit);
    let q = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (tenantId) q = q.eq('tenant_id', tenantId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(rowToEntry);
  },
};
