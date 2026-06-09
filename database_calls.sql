-- =============================================================================
-- SWISSBROKER OS - CALLS (Call Agent: post-call pipeline)
-- =============================================================================
-- Stores call records + transcripts + AI outcome. Run after database_rls.sql.
-- (Telephony provider integration is Phase 2; this phase is transcript-driven.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES public.profiles(id),
    direction TEXT DEFAULT 'OUTBOUND',
    to_number TEXT,
    status TEXT DEFAULT 'COMPLETED',     -- QUEUED|RINGING|IN_PROGRESS|COMPLETED|FAILED|NO_ANSWER
    provider TEXT,                       -- vapi|retell|twilio|manual
    provider_call_id TEXT,
    recording_url TEXT,
    transcript TEXT,
    summary TEXT,
    outcome JSONB,                       -- { sentiment, intent, actions:[...] }
    duration_seconds INTEGER,
    consent_captured BOOLEAN DEFAULT false
);

ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "calls_tenant_isolation" ON public.calls;
CREATE POLICY "calls_tenant_isolation" ON public.calls
  FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_saas_admin())
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_saas_admin());
