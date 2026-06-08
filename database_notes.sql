-- =============================================================================
-- SWISSBROKER OS - CLIENT NOTES TABLE
-- =============================================================================
-- Adds persistent client notes (journal). Run AFTER database_schema.sql and
-- database_rls.sql. Isolated per tenant via the owning client (like assets).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.client_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    author_id UUID,
    author_name TEXT,
    content TEXT NOT NULL
);

ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_notes_tenant_isolation" ON public.client_notes;
CREATE POLICY "client_notes_tenant_isolation" ON public.client_notes
  FOR ALL
  USING (
    public.is_saas_admin()
    OR EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_notes.client_id AND c.tenant_id = public.current_tenant_id()
    )
  )
  WITH CHECK (
    public.is_saas_admin()
    OR EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_notes.client_id AND c.tenant_id = public.current_tenant_id()
    )
  );
