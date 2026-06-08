-- =============================================================================
-- SWISSBROKER OS - LEADS (full model with child tables)
-- =============================================================================
-- Extends the existing leads table with the fields the LeadFinder uses and adds
-- child tables for contacts / activities / tasks. Run after database_rls.sql.
-- =============================================================================

-- 1. Extend the existing leads table (keep marketplace columns intact)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ai_insight_score INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interests TEXT[];

-- 2. Child tables
CREATE TABLE IF NOT EXISTS public.lead_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    is_primary BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT,
    description TEXT,
    timestamp TEXT,
    author_name TEXT,
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.lead_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    label TEXT,
    due_date DATE,
    is_completed BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'MEDIUM'
);

-- 3. RLS: isolate each child by its parent lead's tenant
ALTER TABLE public.lead_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['lead_contacts','lead_activities','lead_tasks']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_tenant_isolation', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL USING (public.is_saas_admin() OR EXISTS (SELECT 1 FROM public.leads l WHERE l.id = %I.lead_id AND l.tenant_id = public.current_tenant_id())) WITH CHECK (public.is_saas_admin() OR EXISTS (SELECT 1 FROM public.leads l WHERE l.id = %I.lead_id AND l.tenant_id = public.current_tenant_id()));',
      t || '_tenant_isolation', t, t, t
    );
  END LOOP;
END $$;
