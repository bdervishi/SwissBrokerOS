
-- ==========================================
-- 0. CLEANUP (Alte Tabellen entfernen)
-- ==========================================
DROP TABLE IF EXISTS public.time_entries CASCADE;
DROP TABLE IF EXISTS public.commissions CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.mortgages CASCADE;
DROP TABLE IF EXISTS public.policies CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- ==========================================
-- 1. SAAS CORE STRUCTURE (Mandanten & User)
-- ==========================================

-- Tenants: Die Makler-Firmen (Mandanten)
CREATE TABLE public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'STARTER', -- 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'TRIAL', 'SUSPENDED'
    
    -- Konfigurationen (JSONB für Flexibilität)
    branding_config JSONB DEFAULT '{}'::jsonb, -- { primaryColor: '#...', logoText: '...' }
    hr_config JSONB DEFAULT '{}'::jsonb,       -- { requireTimeSubmission: true, ... }
    compliance_stats JSONB DEFAULT '{}'::jsonb, -- { finmaStatus: 'REGISTERED' }
    storage_quota JSONB DEFAULT '{"used": 0, "limit": 5000000000}'::jsonb
);

-- Profiles: Die Benutzer (Erweitert Supabase auth.users)
-- Verknüpfung via ID mit auth.users ist Best Practice in Supabase
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),
    
    email TEXT,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL, -- 'BROKER_ADMIN', 'BROKER_AGENT', 'CLIENT', 'SAAS_SUPER_ADMIN'
    
    avatar_url TEXT,
    position TEXT,
    phone TEXT,
    
    -- HR Daten (Nur für Admins sichtbar via RLS)
    base_salary NUMERIC,
    ahv_number TEXT,
    entry_date DATE,
    is_active BOOLEAN DEFAULT true
);

-- ==========================================
-- 2. CRM (Kunden & Beziehungen)
-- ==========================================

-- Clients: Endkunden (Privat & Firmen)
CREATE TABLE public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id), -- Wichtig: Daten-Isolation pro Makler
    advisor_id UUID REFERENCES public.profiles(id), -- Zuständiger Berater
    
    type TEXT DEFAULT 'PRIVATE', -- 'PRIVATE' oder 'CORPORATE'
    status TEXT DEFAULT 'ACTIVE',
    
    -- Stammdaten
    company_name TEXT, -- Nur bei Corporate
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    
    address TEXT,
    zip_city TEXT,
    country TEXT DEFAULT 'Schweiz',
    
    -- Corporate Spezifisch
    uid_number TEXT,    -- CHE-123.456.789
    noga_code TEXT,     -- Branchencode
    employee_count INTEGER,
    total_payroll_sum NUMERIC, -- Für BVG/UVG
    
    -- Private Spezifisch
    birth_date DATE,
    tax_domicile TEXT,
    marital_status TEXT,
    
    trust_score JSONB -- Risiko-Analyse Ergebnis
);

-- ==========================================
-- 3. PORTFOLIO (Policen, Hypotheken, Assets)
-- ==========================================

-- Policies: Versicherungsverträge
CREATE TABLE public.policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id),
    
    insurer TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Privathaftpflicht', 'BVG', etc.
    policy_number TEXT,
    
    start_date DATE,
    end_date DATE,
    
    premium_amount NUMERIC,
    premium_frequency TEXT DEFAULT 'Jährlich',
    status TEXT DEFAULT 'ACTIVE',
    
    cancellation_notice_period INTEGER, -- Monate
    deductible NUMERIC, -- Selbstbehalt
    
    -- Provisionen & Storno
    initial_commission NUMERIC,
    liability_duration_months INTEGER DEFAULT 0, -- Stornohaftungszeit
    
    coverage_details TEXT[]
);

-- Mortgages: Hypotheken
CREATE TABLE public.mortgages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id),
    
    property_name TEXT,
    property_value NUMERIC,
    loan_amount NUMERIC,
    own_capital NUMERIC,
    
    interest_rate NUMERIC,
    type TEXT, -- 'FIXED', 'SARON', 'MIXED'
    duration_years INTEGER,
    
    start_date DATE,
    end_date DATE,
    
    amortization_method TEXT, -- 'DIRECT', 'INDIRECT'
    application_status TEXT DEFAULT 'ACTIVE'
);

-- Assets: Vermögenswerte für 3D Vis
CREATE TABLE public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL, -- 'CASH', 'REAL_ESTATE', 'PILLAR_3A', 'SECURITIES'
    name TEXT,
    value NUMERIC,
    provider TEXT,
    last_updated DATE
);

-- ==========================================
-- 4. SALES & GROWTH
-- ==========================================

-- Leads: Akquise-Pipeline & Marketplace
CREATE TABLE public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),
    
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'NEW', -- 'NEW', 'CONTACTED', 'OFFER', 'WON', 'LOST'
    type TEXT, -- 'MORTGAGE', 'INSURANCE'
    
    source TEXT, -- 'Radar', 'Manual', 'Marketplace'
    potential_value NUMERIC,
    quality_score INTEGER,
    
    -- Kontakt (oft unvollständig bei Leads)
    company_name TEXT,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,
    
    -- Marketplace Felder (falls Lead zum Verkauf steht)
    is_public_marketplace BOOLEAN DEFAULT false,
    marketplace_price NUMERIC
);

-- ==========================================
-- 5. OPERATIONS (Finance & HR)
-- ==========================================

-- Commissions: Provisionsabrechnungen
CREATE TABLE public.commissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),
    agent_id UUID REFERENCES public.profiles(id), -- Wer bekommt den Split?
    
    amount NUMERIC,
    currency TEXT DEFAULT 'CHF',
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PAID'
    type TEXT, -- 'ACQUISITION', 'RECURRING'
    
    source_partner TEXT, -- 'AXA', 'Swiss Life'
    description TEXT,
    
    date DATE
);

-- Time Entries: Zeiterfassung
CREATE TABLE public.time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES public.profiles(id),
    tenant_id UUID REFERENCES public.tenants(id),
    
    date DATE NOT NULL,
    hours NUMERIC NOT NULL,
    activity TEXT,
    description TEXT,
    
    status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'SUBMITTED', 'APPROVED'
    related_client_id UUID -- Optional: Verknüpfung zu Mandat
);

-- ==========================================
-- 6. SECURITY POLICIES (RLS)
-- ==========================================

-- Aktivieren von RLS auf allen Tabellen
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortgages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Initiale Policies für den Start (DEV MODE: Alles offen)
CREATE POLICY "Enable all for demo" ON public.tenants FOR ALL USING (true);
CREATE POLICY "Enable all for demo" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Enable all for demo" ON public.clients FOR ALL USING (true);
CREATE POLICY "Enable all for demo" ON public.policies FOR ALL USING (true);
CREATE POLICY "Enable all for demo" ON public.mortgages FOR ALL USING (true);
CREATE POLICY "Enable all for demo" ON public.assets FOR ALL USING (true);
CREATE POLICY "Enable all for demo" ON public.leads FOR ALL USING (true);
CREATE POLICY "Enable all for demo" ON public.commissions FOR ALL USING (true);
CREATE POLICY "Enable all for demo" ON public.time_entries FOR ALL USING (true);
