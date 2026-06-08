-- =============================================================================
-- SWISSBROKER OS - PRODUCTION ROW LEVEL SECURITY
-- =============================================================================
-- Replaces the permissive "Enable all for demo" policies from
-- database_schema.sql with real tenant isolation.
--
-- Run this AFTER database_schema.sql (and after profiles are seeded).
-- Model:
--   * Every authenticated user belongs to a tenant (profiles.tenant_id).
--   * Users may only see/modify rows belonging to their own tenant.
--   * SaaS staff (role starting with 'SAAS_') bypass tenant isolation.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. HELPER FUNCTIONS (SECURITY DEFINER to avoid recursive RLS on profiles)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_saas_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role LIKE 'SAAS_%' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- 1. DROP DEMO POLICIES
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Enable all for demo" ON public.tenants;
DROP POLICY IF EXISTS "Enable all for demo" ON public.profiles;
DROP POLICY IF EXISTS "Enable all for demo" ON public.clients;
DROP POLICY IF EXISTS "Enable all for demo" ON public.policies;
DROP POLICY IF EXISTS "Enable all for demo" ON public.mortgages;
DROP POLICY IF EXISTS "Enable all for demo" ON public.assets;
DROP POLICY IF EXISTS "Enable all for demo" ON public.leads;
DROP POLICY IF EXISTS "Enable all for demo" ON public.commissions;
DROP POLICY IF EXISTS "Enable all for demo" ON public.time_entries;

-- ---------------------------------------------------------------------------
-- 2. TENANTS: a user sees only their own tenant; SaaS staff see all.
-- ---------------------------------------------------------------------------
CREATE POLICY "tenant_self_select" ON public.tenants
  FOR SELECT USING (id = public.current_tenant_id() OR public.is_saas_admin());
CREATE POLICY "tenant_saas_write" ON public.tenants
  FOR ALL USING (public.is_saas_admin()) WITH CHECK (public.is_saas_admin());

-- ---------------------------------------------------------------------------
-- 3. PROFILES: see colleagues in the same tenant; edit only your own row.
-- ---------------------------------------------------------------------------
CREATE POLICY "profile_tenant_select" ON public.profiles
  FOR SELECT USING (tenant_id = public.current_tenant_id() OR public.is_saas_admin());
CREATE POLICY "profile_self_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_saas_admin())
  WITH CHECK (id = auth.uid() OR public.is_saas_admin());
CREATE POLICY "profile_saas_insert" ON public.profiles
  FOR INSERT WITH CHECK (public.is_saas_admin());
CREATE POLICY "profile_saas_delete" ON public.profiles
  FOR DELETE USING (public.is_saas_admin());

-- ---------------------------------------------------------------------------
-- 4. TENANT-SCOPED BUSINESS TABLES
--    clients, policies, mortgages, leads, commissions, time_entries all carry
--    a tenant_id column -> isolate by it (SaaS staff bypass).
-- ---------------------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['clients','policies','mortgages','leads','commissions','time_entries']
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL USING (tenant_id = public.current_tenant_id() OR public.is_saas_admin()) WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_saas_admin());',
      t || '_tenant_isolation', t
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 5. ASSETS: no tenant_id column -> isolate via the owning client's tenant.
-- ---------------------------------------------------------------------------
CREATE POLICY "assets_tenant_isolation" ON public.assets
  FOR ALL
  USING (
    public.is_saas_admin()
    OR EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = assets.client_id AND c.tenant_id = public.current_tenant_id()
    )
  )
  WITH CHECK (
    public.is_saas_admin()
    OR EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = assets.client_id AND c.tenant_id = public.current_tenant_id()
    )
  );
