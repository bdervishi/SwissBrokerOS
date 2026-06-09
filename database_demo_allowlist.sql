-- =============================================================================
-- SWISSBROKER OS - DEMO ACCESS ALLOWLIST
-- =============================================================================
-- Emails allowed to access the shared demo tenant via a magic link.
-- Managed by the operator (Supabase table editor or SaaS admin). The backend
-- reads it with the service role. Run after database_rls.sql.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.demo_allowlist (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    note TEXT
);

ALTER TABLE public.demo_allowlist ENABLE ROW LEVEL SECURITY;

-- App access only for SaaS staff; the backend uses the service role (bypasses RLS).
DROP POLICY IF EXISTS "demo_allowlist_saas" ON public.demo_allowlist;
CREATE POLICY "demo_allowlist_saas" ON public.demo_allowlist
  FOR ALL
  USING (public.is_saas_admin())
  WITH CHECK (public.is_saas_admin());

-- Add allowed demo emails like this (lowercase):
-- INSERT INTO public.demo_allowlist (email, note) VALUES ('partner@example.com', 'Pilot');
