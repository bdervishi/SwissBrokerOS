-- =============================================================================
-- SWISSBROKER OS - LEAD MARKETPLACE OFFERS
-- =============================================================================
-- Cross-tenant marketplace: brokers list leads for sale and browse others'.
-- Unlike the rest of the schema this is intentionally browsable by all
-- authenticated brokers; only the seller tenant may write its own offers.
-- Run after database_rls.sql.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.lead_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    type TEXT NOT NULL,                 -- MORTGAGE | INSURANCE | INVESTMENT
    title TEXT NOT NULL,
    description TEXT,
    volume NUMERIC DEFAULT 0,
    price NUMERIC DEFAULT 0,
    canton TEXT,
    date_posted TEXT,
    status TEXT DEFAULT 'AVAILABLE',    -- AVAILABLE | SOLD
    seller_tenant_id UUID REFERENCES public.tenants(id),
    seller_name TEXT,
    seller_rating NUMERIC DEFAULT 5,
    seller_deal_count INTEGER DEFAULT 0,
    quality_score INTEGER DEFAULT 0,
    verification_status JSONB DEFAULT '{"phoneVerified":false,"emailVerified":false,"intentVerified":false}'::jsonb,
    guarantee_included BOOLEAN DEFAULT false
);

ALTER TABLE public.lead_offers ENABLE ROW LEVEL SECURITY;

-- Browse: any authenticated broker can see the marketplace.
DROP POLICY IF EXISTS "lead_offers_browse" ON public.lead_offers;
CREATE POLICY "lead_offers_browse" ON public.lead_offers
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Write: only the seller's own tenant (or SaaS staff).
DROP POLICY IF EXISTS "lead_offers_seller_write" ON public.lead_offers;
CREATE POLICY "lead_offers_seller_write" ON public.lead_offers
  FOR ALL
  USING (seller_tenant_id = public.current_tenant_id() OR public.is_saas_admin())
  WITH CHECK (seller_tenant_id = public.current_tenant_id() OR public.is_saas_admin());
