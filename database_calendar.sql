-- =============================================================================
-- SWISSBROKER OS - CALENDAR EVENTS
-- =============================================================================
-- Appointments / deadlines / tasks shown in the calendar. Run after
-- database_rls.sql.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),
    user_id UUID REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    type TEXT DEFAULT 'MEETING',
    related_id TEXT,
    related_type TEXT,
    is_all_day BOOLEAN DEFAULT false,
    description TEXT
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "calendar_events_tenant_isolation" ON public.calendar_events;
CREATE POLICY "calendar_events_tenant_isolation" ON public.calendar_events
  FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_saas_admin())
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_saas_admin());
