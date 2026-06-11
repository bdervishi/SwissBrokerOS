-- =============================================================================
-- SWISSBROKER OS - DETAILED CAPTURE (Versicherungen / Vermögen / Steuern / Dokumente)
-- =============================================================================
-- Run AFTER database_rls.sql (uses current_tenant_id()/is_saas_admin()) and
-- AFTER database_tax.sql (extends tax_returns). Idempotent.
--
-- 1. policies     -> broker-grade detail fields
-- 2. assets       -> valuation/detail fields + type-specific JSONB details
-- 3. tax_returns  -> itemised Swiss deductions + filing metadata
-- 4. documents    -> NEW native document registry + Storage bucket & policies
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. POLICIES: additional capture fields
-- ---------------------------------------------------------------------------
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS product_name TEXT;            -- z.B. "Helvetia Komfort Plus"
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS insured_persons TEXT[];       -- versicherte Personen
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS payment_method TEXT;          -- Rechnung / LSV / eBill / QR
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS notes TEXT;                   -- interne Notizen

-- ---------------------------------------------------------------------------
-- 2. ASSETS: valuation + flexible per-type details
--    (type has no CHECK constraint; the app additionally uses
--     'PILLAR_3B' and 'OTHER' as values besides the existing ones.)
-- ---------------------------------------------------------------------------
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS purchase_value NUMERIC;          -- Einstandswert
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;
-- details examples:
--   PILLAR_3A/3B : {vehicle, annualContribution, beneficiary, maturityDate, interestRate}
--   PENSION_FUND : {employer, insuredSalary, contributionRate, purchasePotential}
--   SECURITIES   : {custodyType, strategy, riskClass, ter}
--   REAL_ESTATE  : {propertyType, usage, rentalIncome, constructionYear, linkedMortgageId}
--   CASH         : {accountType, interestRate}

-- ---------------------------------------------------------------------------
-- 3. TAX RETURNS: itemised deductions + filing metadata
-- ---------------------------------------------------------------------------
ALTER TABLE public.tax_returns ADD COLUMN IF NOT EXISTS municipality TEXT;                       -- Gemeinde
ALTER TABLE public.tax_returns ADD COLUMN IF NOT EXISTS gross_income NUMERIC DEFAULT 0;          -- Bruttoeinkommen
ALTER TABLE public.tax_returns ADD COLUMN IF NOT EXISTS occupational_expenses NUMERIC DEFAULT 0; -- Berufsauslagen
ALTER TABLE public.tax_returns ADD COLUMN IF NOT EXISTS insurance_premiums NUMERIC DEFAULT 0;    -- Versicherungsprämien
ALTER TABLE public.tax_returns ADD COLUMN IF NOT EXISTS pillar3a_contributions NUMERIC DEFAULT 0;-- Säule 3a
ALTER TABLE public.tax_returns ADD COLUMN IF NOT EXISTS debt_interest NUMERIC DEFAULT 0;         -- Schuldzinsen
ALTER TABLE public.tax_returns ADD COLUMN IF NOT EXISTS medical_expenses NUMERIC DEFAULT 0;      -- Krankheitskosten
ALTER TABLE public.tax_returns ADD COLUMN IF NOT EXISTS donations NUMERIC DEFAULT 0;             -- Spenden
ALTER TABLE public.tax_returns ADD COLUMN IF NOT EXISTS childcare_costs NUMERIC DEFAULT 0;       -- Kinderbetreuung
ALTER TABLE public.tax_returns ADD COLUMN IF NOT EXISTS education_costs NUMERIC DEFAULT 0;       -- Weiterbildung
ALTER TABLE public.tax_returns ADD COLUMN IF NOT EXISTS submitted_at DATE;                       -- Einreichdatum

-- ---------------------------------------------------------------------------
-- 4. DOCUMENTS: native document registry (metadata; binaries in Storage)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    category TEXT DEFAULT 'SONSTIGES',  -- POLICE|OFFERTE|STEUERN|VORSORGE|HYPOTHEK|IDENTITAET|KORRESPONDENZ|SONSTIGES

    -- optional link to a business object
    related_type TEXT,                  -- 'POLICY' | 'MORTGAGE' | 'TAX_RETURN'
    related_id UUID,

    -- file metadata (storage_path NULL = metadata-only record)
    file_name TEXT,
    storage_path TEXT,                  -- path inside the 'documents' bucket
    mime_type TEXT,
    size_bytes BIGINT,

    uploaded_by UUID REFERENCES public.profiles(id),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_documents_client ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_related ON public.documents(related_type, related_id);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "documents_tenant_isolation" ON public.documents;
CREATE POLICY "documents_tenant_isolation" ON public.documents
  FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_saas_admin())
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_saas_admin());

-- Keep tax_returns.documents_count real: recount on linked-document changes.
CREATE OR REPLACE FUNCTION public.sync_tax_documents_count()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE tr UUID;
BEGIN
  tr := COALESCE(NEW.related_id, OLD.related_id);
  IF COALESCE(NEW.related_type, OLD.related_type) = 'TAX_RETURN' AND tr IS NOT NULL THEN
    UPDATE public.tax_returns
       SET documents_count = (
         SELECT COUNT(*) FROM public.documents d
          WHERE d.related_type = 'TAX_RETURN' AND d.related_id = tr
       )
     WHERE id = tr;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS trg_documents_tax_count ON public.documents;
CREATE TRIGGER trg_documents_tax_count
AFTER INSERT OR UPDATE OR DELETE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.sync_tax_documents_count();

-- ---------------------------------------------------------------------------
-- 5. STORAGE: private 'documents' bucket, path convention
--    <tenant_id>/<client_id>/<uuid>-<filename>  -> first folder = tenant.
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "documents_storage_select" ON storage.objects;
CREATE POLICY "documents_storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND ((storage.foldername(name))[1] = public.current_tenant_id()::text OR public.is_saas_admin())
  );

DROP POLICY IF EXISTS "documents_storage_insert" ON storage.objects;
CREATE POLICY "documents_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND ((storage.foldername(name))[1] = public.current_tenant_id()::text OR public.is_saas_admin())
  );

DROP POLICY IF EXISTS "documents_storage_delete" ON storage.objects;
CREATE POLICY "documents_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND ((storage.foldername(name))[1] = public.current_tenant_id()::text OR public.is_saas_admin())
  );
