-- =============================================================================
-- SWISSBROKER OS - TENANT SELF-UPDATE POLICY
-- =============================================================================
-- Lets a tenant's own members (broker admins) update their own tenant row
-- (e.g. branding / HR config) without granting SaaS-wide write access.
-- Run after database_rls.sql.
-- =============================================================================

DROP POLICY IF EXISTS "tenant_admin_self_update" ON public.tenants;
CREATE POLICY "tenant_admin_self_update" ON public.tenants
  FOR UPDATE
  USING (id = public.current_tenant_id())
  WITH CHECK (id = public.current_tenant_id());
