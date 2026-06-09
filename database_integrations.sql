-- =============================================================================
-- SWISSBROKER OS - INTEGRATIONS SCHEMA MIGRATION
-- =============================================================================
-- Dieses Script erweitert deine Supabase-Datenbank um die Tabellen und Strukturen,
-- die für die professionelle Integration von Drittanbietern benötigt werden.
--
-- Unterstützte Systeme:
-- - bexio (CRM & Accounting)
-- - abacus (ERP & Core-Finance)
-- - google (Calendar, Contacts, Gmail, Drive)
-- - microsoft (Graph API: Outlook, OneDrive, Sharepoint)
-- - helvico.ch (Instant Cyber/SME Commercial Insurances Webhook & quoting)
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. TABELLE: integration_providers (Globale Registry - Verwaltet durch Super-Admin)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.integration_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- 'bexio', 'abacus', 'google', 'microsoft', 'helvico'
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'accounting', 'erp', 'productivity', 'insurance'
    is_active BOOLEAN DEFAULT true,
    logo_url TEXT,
    global_config JSONB DEFAULT '{}'::jsonb, -- Beinhaltet ClientIDs, system-weite Limits, Default endpoints
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. TABELLE: tenant_integrations (Mandanten-spezifische Connectoren)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.tenant_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.integration_providers(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'DISCONNECTED', -- 'CONNECTED', 'DISCONNECTED', 'ERROR', 'SUSPENDED'
    
    -- In einer produktiven Umgebung sollten sensible OAuth-Tokens/API-Keys verschlüsselt sein.
    -- Supabase Vault oder pgcrypto können hierfür eingesetzt werden.
    encrypted_credentials JSONB DEFAULT '{}'::jsonb, -- Beinhaltet {access_token, refresh_token, token_expires_at, api_key, api_secret}
    
    settings JSONB DEFAULT '{}'::jsonb, -- Mandantenspezifische Vorlieben (z.B. {"sync_direction": "two_way", "sync_contacts": true})
    error_message TEXT,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uniq_tenant_provider UNIQUE (tenant_id, provider_id)
);

-- =============================================================================
-- 3. TABELLE: integration_external_mappings (ID-Abgleich zur Vermeidung von Duplikaten)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.integration_external_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    provider_code VARCHAR(50) NOT NULL,
    local_table VARCHAR(100) NOT NULL, -- 'clients', 'policies', 'commissions', 'time_entries'
    local_id UUID NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    external_url TEXT, -- Direkter Web-Link zur Ressource im Partnersystem
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uniq_local_external UNIQUE (tenant_id, provider_code, local_table, local_id)
);

-- =============================================================================
-- 4. TABELLE: integration_sync_logs (Audit-Trail und Protokollierung)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    provider_code VARCHAR(50) NOT NULL,
    direction VARCHAR(20) NOT NULL, -- 'INBOUND', 'OUTBOUND'
    status VARCHAR(50) NOT NULL, -- 'SUCCESS', 'FAILED', 'PARTIAL'
    records_processed INTEGER DEFAULT 0,
    records_successful INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_details JSONB DEFAULT '[]'::jsonb, -- Liste von Fehlermeldungen pro Datensatz
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 5. TRICGER FÜR UPDATE_AT TIMESTAMPS
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_providers
    BEFORE UPDATE ON public.integration_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_tenant_integrations
    BEFORE UPDATE ON public.tenant_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_external_mappings
    BEFORE UPDATE ON public.integration_external_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. INDIZES FÜR MAXIMALEN SPEED BEI REPLICATON & SYNC
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_tenant_integrations_tenant ON public.tenant_integrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_integrations_provider ON public.tenant_integrations(provider_id);
CREATE INDEX IF NOT EXISTS idx_external_mappings_lookup ON public.integration_external_mappings(tenant_id, provider_code, local_table, local_id);
CREATE INDEX IF NOT EXISTS idx_external_mappings_ext_id ON public.integration_external_mappings(external_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_tenant_date ON public.integration_sync_logs(tenant_id, started_at DESC);

-- =============================================================================
-- 7. INITIALER-SEED FÜR DIE SYSTEM-PROVIDER (DURCH DEN SUPER-ADMIN)
-- =============================================================================
INSERT INTO public.integration_providers (code, name, category, logo_url, global_config)
VALUES 
(
    'bexio', 
    'Bexio', 
    'accounting', 
    'https://assets.swissbroker-os.ch/logos/bexio.svg',
    '{
        "auth_url": "https://office.bexio.com/oauth/authorize",
        "token_url": "https://office.bexio.com/oauth/access_token",
        "api_url": "https://api.bexio.com/2.0",
        "doc_url": "https://docs.bexio.com/"
    }'::jsonb
),
(
    'abacus', 
    'Abacus ERP', 
    'erp', 
    'https://assets.swissbroker-os.ch/logos/abacus.svg',
    '{
        "api_url_default": "https://{tenant_custom_subdomain}.abaconnect.ch/api/v1",
        "doc_url": "https://abaconnect.abacus.ch/"
    }'::jsonb
),
(
    'google', 
    'Google Workspace', 
    'productivity', 
    'https://assets.swissbroker-os.ch/logos/google.svg',
    '{
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "scopes": ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/contacts", "https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/drive.file"]
    }'::jsonb
),
(
    'microsoft', 
    'Microsoft 365', 
    'productivity', 
    'https://assets.swissbroker-os.ch/logos/microsoft.svg',
    '{
        "auth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        "scopes": ["Calendars.ReadWrite", "Contacts.ReadWrite", "Mail.Send", "Files.ReadWrite"]
    }'::jsonb
),
(
    'helvico', 
    'Helvico .ch', 
    'insurance', 
    'https://assets.swissbroker-os.ch/logos/helvico.svg',
    '{
        "api_sandbox_url": "https://api-sandbox.helvico.ch/v1",
        "api_production_url": "https://api.helvico.ch/v1",
        "doc_url": "https://docs.helvico.ch/"
    }'::jsonb
)
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, 
    category = EXCLUDED.category, 
    global_config = EXCLUDED.global_config;

-- =============================================================================
-- 8. ROW LEVEL SECURITY (RLS) SICHERHEITS-RICHTLINIEN
-- =============================================================================
ALTER TABLE public.integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_external_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;

-- 8a. integration_providers: Jeder authentifizierte Benutzer darf sie LESEN. Nur Super-Admins dürfen SCHREIBEN.
CREATE POLICY select_integration_providers ON public.integration_providers
    FOR SELECT TO authenticated USING (true);

-- 8b. tenant_integrations: Benutzer dürfen nur die Connectoren des EIGENEN Mandanten (tenant_id) verwalten.
CREATE POLICY all_tenant_integrations ON public.tenant_integrations
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- 8c. integration_external_mappings: Zugriff streng begrenzt auf Mandantenzugehörigkeit.
CREATE POLICY all_external_mappings ON public.integration_external_mappings
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- 8d. integration_sync_logs: Logs sind mandanten-gesichert.
CREATE POLICY all_sync_logs ON public.integration_sync_logs
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

COMMIT;
