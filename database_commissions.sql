-- =============================================================================
-- SWISSBROKER OS - COURTAGE-MANAGEMENT (Konzept: docs/COURTAGEN_KONZEPT.md)
-- =============================================================================
-- Run AFTER database_rls.sql (uses current_tenant_id()/is_saas_admin()) and
-- AFTER database_detail_capture.sql (documents table for statements).
-- Idempotent.
--
-- 1. commission_agreements       Courtagevereinbarung je Versicherer/Sparte
-- 2. commissions (erweitert)     Soll/Ist, Police-/Kundenbezug, Splits
-- 3. commission_statements       hochgeladene Versicherer-Abrechnungen
-- 4. commission_statement_items  KI-extrahierte Abrechnungspositionen
-- 5. commission_split_rules      Beteiligungs-Regelwerk pro Berater
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. COURTAGEVEREINBARUNGEN
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commission_agreements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),

    insurer TEXT NOT NULL,              -- z.B. 'AXA'
    line TEXT,                          -- Sparte, z.B. 'Hausrat'; NULL = alle Sparten
    acquisition_rate NUMERIC DEFAULT 0, -- Abschlusscourtage in % der Jahresprämie
    recurring_rate NUMERIC DEFAULT 0,   -- Bestandescourtage in % der Jahresprämie
    liability_months INTEGER DEFAULT 0, -- Default-Stornohaftung (Monate)
    valid_from DATE,
    valid_to DATE,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_comm_agreements_tenant ON public.commission_agreements(tenant_id);

ALTER TABLE public.commission_agreements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "commission_agreements_tenant_isolation" ON public.commission_agreements;
CREATE POLICY "commission_agreements_tenant_isolation" ON public.commission_agreements
  FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_saas_admin())
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_saas_admin());

-- ---------------------------------------------------------------------------
-- 2. COMMISSIONS: Soll/Ist-Lebenszyklus + Bezüge + Splits
--    status: EXPECTED -> MATCHED -> PAID -> DISPUTED -> CLAWBACK
--    (bestehende Werte PENDING/PAID bleiben gültig)
-- ---------------------------------------------------------------------------
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS policy_id UUID REFERENCES public.policies(id) ON DELETE SET NULL;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS agreement_id UUID REFERENCES public.commission_agreements(id) ON DELETE SET NULL;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS period TEXT;                  -- 'YYYY-MM' der Fälligkeit
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS expected_amount NUMERIC;      -- Soll (amount = Ist)
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS statement_item_id UUID;       -- Abgleich-Referenz
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS split_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS split_rate NUMERIC;           -- % Beteiligung
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS split_amount NUMERIC;         -- berechneter Split (CHF)
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS split_paid_at DATE;           -- Auszahlung an Berater

CREATE INDEX IF NOT EXISTS idx_commissions_policy ON public.commissions(policy_id);
CREATE INDEX IF NOT EXISTS idx_commissions_period ON public.commissions(tenant_id, period);

-- ---------------------------------------------------------------------------
-- 3. COURTAGEABRECHNUNGEN (Versicherer-Statements)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commission_statements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),

    insurer TEXT NOT NULL,
    period TEXT,                        -- 'YYYY-MM' bzw. 'YYYY-Qx'
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    total_amount NUMERIC,
    status TEXT DEFAULT 'NEW',          -- NEW -> PARSED -> RECONCILED
    parsed_at TIMESTAMPTZ,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_comm_statements_tenant ON public.commission_statements(tenant_id);

ALTER TABLE public.commission_statements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "commission_statements_tenant_isolation" ON public.commission_statements;
CREATE POLICY "commission_statements_tenant_isolation" ON public.commission_statements
  FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_saas_admin())
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_saas_admin());

-- ---------------------------------------------------------------------------
-- 4. ABRECHNUNGSPOSITIONEN (KI-extrahiert)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commission_statement_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),
    statement_id UUID REFERENCES public.commission_statements(id) ON DELETE CASCADE,

    policy_number TEXT,
    client_name TEXT,
    line TEXT,                          -- Sparte laut Abrechnung
    premium NUMERIC,
    amount NUMERIC,                     -- abgerechnete Courtage
    match_status TEXT DEFAULT 'UNMATCHED', -- UNMATCHED | MATCHED | DISPUTED | UNEXPECTED
    matched_commission_id UUID,
    raw JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_comm_items_statement ON public.commission_statement_items(statement_id);

ALTER TABLE public.commission_statement_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "commission_statement_items_tenant_isolation" ON public.commission_statement_items;
CREATE POLICY "commission_statement_items_tenant_isolation" ON public.commission_statement_items
  FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_saas_admin())
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_saas_admin());

-- ---------------------------------------------------------------------------
-- 5. SPLIT-REGELWERK
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commission_split_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),

    agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    line TEXT,                          -- NULL = alle Sparten
    rate NUMERIC NOT NULL,              -- % der Courtage für den Berater
    valid_from DATE,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_split_rules_tenant ON public.commission_split_rules(tenant_id);

ALTER TABLE public.commission_split_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "commission_split_rules_tenant_isolation" ON public.commission_split_rules;
CREATE POLICY "commission_split_rules_tenant_isolation" ON public.commission_split_rules
  FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_saas_admin())
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_saas_admin());
