-- =============================================================================
-- SWISSBROKER OS - TAX RETURNS
-- =============================================================================
-- Tax dossiers per client/year. Run after database_rls.sql.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tax_returns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    canton TEXT,
    status TEXT DEFAULT 'OPEN',
    deadline DATE,
    documents_count INTEGER DEFAULT 0,
    taxable_income NUMERIC DEFAULT 0,
    deductions_total NUMERIC DEFAULT 0,
    notes TEXT
);

ALTER TABLE public.tax_returns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tax_returns_tenant_isolation" ON public.tax_returns;
CREATE POLICY "tax_returns_tenant_isolation" ON public.tax_returns
  FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_saas_admin())
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_saas_admin());

-- Seed: one OPEN 2023 return per existing client (idempotent-ish: skip if any exist).
INSERT INTO public.tax_returns (tenant_id, client_id, year, canton, status, deadline, documents_count, taxable_income, deductions_total)
SELECT c.tenant_id, c.id, 2023, COALESCE(c.tax_domicile, 'ZH'), 'OPEN', DATE '2024-03-31', 0, 0, 0
FROM public.clients c
WHERE NOT EXISTS (SELECT 1 FROM public.tax_returns t WHERE t.client_id = c.id AND t.year = 2023);
