-- =============================================================================
-- SWISSBROKER OS - AUDIT-LOG (Compliance-Aktivitätshistorie)
-- =============================================================================
-- Run after database_rls.sql. Idempotent.
-- Nachvollziehbare Historie sicherheits-/compliance-relevanter Aktionen
-- (Datenänderungen, Dokumentzugriff, Auszahlungen). Append-only:
-- niemand darf Einträge ändern oder löschen (auch keine Broker-Admins);
-- nur SaaS-Plattformadmins dürfen löschen (Aufbewahrungs-Management).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT,                    -- denormalisiert (bleibt nach User-Löschung lesbar)

    action TEXT NOT NULL,               -- z.B. CLIENT_UPDATE, POLICY_DELETE, DOCUMENT_DELETE, PAYOUT, DOCUMENT_DOWNLOAD
    entity_type TEXT,                   -- CLIENT | POLICY | DOCUMENT | COMMISSION | TENANT | …
    entity_id TEXT,
    summary TEXT,                       -- menschenlesbare Kurzbeschreibung
    detail JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_time ON public.audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Lesen: Broker-Admin des Mandanten oder SaaS-Admin.
DROP POLICY IF EXISTS "audit_select_admin" ON public.audit_logs;
CREATE POLICY "audit_select_admin" ON public.audit_logs
  FOR SELECT USING (
    public.is_saas_admin()
    OR (tenant_id = public.current_tenant_id() AND public.is_broker_admin())
  );

-- Schreiben: jede:r authentifizierte Nutzer:in im eigenen Mandanten (die App
-- protokolliert die Aktion des Handelnden). Service-Role/SaaS ebenfalls.
DROP POLICY IF EXISTS "audit_insert_same_tenant" ON public.audit_logs;
CREATE POLICY "audit_insert_same_tenant" ON public.audit_logs
  FOR INSERT WITH CHECK (
    public.is_saas_admin() OR tenant_id = public.current_tenant_id()
  );

-- Append-only: KEINE UPDATE-Policy (niemand darf Einträge verändern).
-- Löschen nur SaaS-Admin (Retention).
DROP POLICY IF EXISTS "audit_delete_saas" ON public.audit_logs;
CREATE POLICY "audit_delete_saas" ON public.audit_logs
  FOR DELETE USING (public.is_saas_admin());
