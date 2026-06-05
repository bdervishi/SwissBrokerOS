-- =============================================================================
-- SWISSBROKER OS - SUPABASE DATASEED SCRIPT
-- =============================================================================
-- Dieses Script befüllt deine neu erstellte Supabase-Datenbank mit passenden 
-- Testdaten (Mandanten, Benutzer, Kunden, Policen, Hypotheken, etc.) für die Demo.
-- 
-- Anleitung:
-- 1. Kopiere den gesamten Inhalt dieses Scripts.
-- 2. Gehe in deinem Supabase Dashboard auf "SQL Editor" -> "+ New Query".
-- 3. Füge dieses Script ein und klicke auf "Run".
-- =============================================================================

-- ==========================================
-- 0. BEREINIGUNG (Optional, um alte Testdaten sauber zu überschreiben)
-- ==========================================
DELETE FROM public.time_entries;
DELETE FROM public.commissions;
DELETE FROM public.leads;
DELETE FROM public.assets;
DELETE FROM public.mortgages;
DELETE FROM public.policies;
DELETE FROM public.clients;
DELETE FROM public.profiles;
DELETE FROM public.tenants;

-- ==========================================
-- 1. MANDANTEN (TENANTS) SEEDEN
-- ==========================================
INSERT INTO public.tenants (id, name, plan, status, branding_config, hr_config, compliance_stats, storage_quota)
VALUES 
(
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid, 
    'Muster Broker AG', 
    'PROFESSIONAL', 
    'ACTIVE', 
    '{"primaryColor": "#0ea5e9", "logoText": "Muster Broker"}'::jsonb, 
    '{"requireTimeSubmission": true, "requireTimeApproval": true, "workWeekHours": 42}'::jsonb, 
    '{"finmaStatus": "REGISTERED", "ciceroNumber": "12345", "churnRisk": "LOW"}'::jsonb, 
    '{"used": 4200000000, "limit": 5000000000}'::jsonb
),
(
    'f63b2f8a-cda3-4bf0-baac-233bb4e73f92'::uuid, 
    'Finanz & Partner GmbH', 
    'ENTERPRISE', 
    'ACTIVE', 
    '{"primaryColor": "#dc2626", "logoText": "F&P Finance"}'::jsonb, 
    '{"requireTimeSubmission": false, "requireTimeApproval": false, "workWeekHours": 40}'::jsonb, 
    '{"finmaStatus": "REGISTERED", "ciceroNumber": "99887", "churnRisk": "MEDIUM"}'::jsonb, 
    '{"used": 15000000000, "limit": 50000000000}'::jsonb
),
(
    'e2b02bd1-7722-44df-911b-6893ddf2faaa'::uuid, 
    'Solo Broker Hans', 
    'STARTER', 
    'TRIAL', 
    '{"primaryColor": "#10b981", "logoText": "Hans Consult"}'::jsonb, 
    '{"requireTimeSubmission": false, "requireTimeApproval": false, "workWeekHours": 42}'::jsonb, 
    '{"finmaStatus": "WARNING", "churnRisk": "HIGH"}'::jsonb, 
    '{"used": 0, "limit": 2000000000}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2. BENUTZERKONTEN (auth.users & profiles) SEEDEN
-- ==========================================
-- Hier erstellen wir parallel Einträge in Supabases interner Tabelle "auth.users" 
-- sowie in unserer erweiterten "public.profiles"-Tabelle.
-- Passwort für die drei Testkonten ist einheitlich: Password123! (als Bcrypt-Hash gespeichert)

-- 2a. Supabase Authentication Konten (in auth.users)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES 
(
    'e4be0bb1-872f-410a-8dd3-62d04a600101'::uuid, -- Max Muster
    '00000000-0000-0000-0000-000000000000'::uuid,
    'max.muster@swissbroker.ch',
    '$2a$10$w3v6nCgB/11BcoNoW7B.HeH26YV81902G0L4oKeXvV2zC9kZpUoqy', -- Bcrypt für Password123!
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"firstName": "Max", "lastName": "Muster"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated',
    '', '', '', ''
),
(
    'a2d88734-72b1-4770-98fc-eb8283300202'::uuid, -- Felix Fieldagent
    '00000000-0000-0000-0000-000000000000'::uuid,
    'felix.field@swissbroker.ch',
    '$2a$10$w3v6nCgB/11BcoNoW7B.HeH26YV81902G0L4oKeXvV2zC9kZpUoqy', -- Bcrypt für Password123!
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"firstName": "Felix", "lastName": "Fieldagent"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated',
    '', '', '', ''
),
(
    'c830ddda-ffa1-4a49-92b1-887e1a3bc200'::uuid, -- Cornelia Corp
    '00000000-0000-0000-0000-000000000000'::uuid,
    'admin@finanz-partner.ch',
    '$2a$10$w3v6nCgB/11BcoNoW7B.HeH26YV81902G0L4oKeXvV2zC9kZpUoqy', -- Bcrypt für Password123!
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"firstName": "Cornelia", "lastName": "Corp"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated',
    '', '', '', ''
)
ON CONFLICT (id) DO NOTHING;

-- 2b. Erweiterte Profile (in public.profiles)
INSERT INTO public.profiles (
    id, tenant_id, email, username, first_name, last_name, 
    role, position, phone, base_salary, ahv_number, entry_date, is_active
) VALUES
(
    'e4be0bb1-872f-410a-8dd3-62d04a600101'::uuid, 
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid, -- Muster Broker AG
    'max.muster@swissbroker.ch', 
    'max_broker', 
    'Max', 
    'Muster', 
    'BROKER_ADMIN', 
    'CEO / Senior Advisor', 
    '+41 44 123 45 61', 
    9500, 
    '756.1234.5678.90', 
    '2023-01-15'::date, 
    true
),
(
    'a2d88734-72b1-4770-98fc-eb8283300202'::uuid, 
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid, -- Muster Broker AG
    'felix.field@swissbroker.ch', 
    'felix_agent', 
    'Felix', 
    'Fieldagent', 
    'BROKER_AGENT', 
    'Junior Advisor', 
    '+41 44 123 45 62', 
    6800, 
    '756.4321.8765.12', 
    '2023-06-01'::date, 
    true
),
(
    'c830ddda-ffa1-4a49-92b1-887e1a3bc200'::uuid, 
    'f63b2f8a-cda3-4bf0-baac-233bb4e73f92'::uuid, -- Finanz & Partner GmbH
    'admin@finanz-partner.ch', 
    'corp_admin', 
    'Cornelia', 
    'Corp', 
    'BROKER_ADMIN', 
    'Inhaberin / Gründerin', 
    '+41 31 987 65 43', 
    10500, 
    '756.9876.5432.11', 
    '2022-11-01'::date, 
    true
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 3. CRM KUNDEN (CLIENTS) SEEDEN
-- ==========================================
INSERT INTO public.clients (
    id, tenant_id, advisor_id, type, status, 
    company_name, first_name, last_name, email, phone, 
    address, zip_city, country, 
    uid_number, noga_code, employee_count, total_payroll_sum,
    birth_date, tax_domicile, marital_status, trust_score
) VALUES
(
    'c1c1c1c1-1111-4444-b111-74f00998df01'::uuid,
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid, -- Zu: Muster Broker AG
    'e4be0bb1-872f-410a-8dd3-62d04a600101'::uuid, -- Advisor: Max Muster
    'PRIVATE', 'ACTIVE',
    'Meier Consulting AG', 'Hans', 'Meier', 'hans.meier@example.com', '+41 79 123 45 67',
    'Bahnhofstrasse 1', '8001 Zürich', 'Schweiz',
    'CHE-123.456.789', '70.22', 1, 140000,
    '1980-04-15'::date, 'Zürich', 'VERHEIRATET',
    '{"score": 95, "level": "HIGH", "lastUpdated": "2024-06-01", "checks": [{"id": "k1", "checkName": "Zefix Validation", "status": "PASSED", "lastChecked": "2024-06-01", "details": "Firma aktiv, UID: CHE-123.456.789"}]}'::jsonb
),
(
    'c2c2c2c2-2222-4444-b222-74f00998df02'::uuid,
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid, -- Zu: Muster Broker AG
    'e4be0bb1-872f-410a-8dd3-62d04a600101'::uuid, -- Advisor: Max Muster
    'PRIVATE', 'ACTIVE',
    null, 'Anna', 'Schmidt', 'anna.schmidt@example.com', '+41 78 987 65 43',
    'Seestrasse 45', '8800 Thalwil', 'Schweiz',
    null, null, null, null,
    '1985-11-22'::date, 'Zürich', 'LEDIG',
    '{"score": 75, "level": "MEDIUM", "lastUpdated": "2024-05-20", "checks": [{"id": "k4", "checkName": "Identitätsprüfung", "status": "PASSED", "lastChecked": "2024-01-10"}]}'::jsonb
),
(
    'c3c3c3c3-3333-4444-b333-74f00998df03'::uuid,
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid, -- Zu: Muster Broker AG
    'a2d88734-72b1-4770-98fc-eb8283300202'::uuid, -- Advisor: Felix Fieldagent
    'PRIVATE', 'ACTIVE',
    null, 'Peter', 'Müller', 'peter.mueller@example.com', '+41 76 543 21 09',
    'Dorfplatz 3', '3000 Bern', 'Schweiz',
    null, null, null, null,
    '1975-07-03'::date, 'Bern', 'GESCHIEDEN',
    '{"score": 88, "level": "HIGH", "lastUpdated": "2024-05-25"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 4. VERSICHERUNGSPOLICEN (POLICES) SEEDEN
-- ==========================================
INSERT INTO public.policies (
    id, client_id, tenant_id, insurer, type, policy_number,
    start_date, end_date, premium_amount, premium_frequency, status,
    cancellation_notice_period, deductible, initial_commission, liability_duration_months,
    coverage_details
) VALUES
(
    'p1p1p1p1-1111-4444-b111-74f00998df01'::uuid,
    'c1c1c1c1-1111-4444-b111-74f00998df01'::uuid, -- Hans Meier
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid,
    'AXA', 'Privathaftpflicht', '83.223.442',
    '2023-01-01'::date, '2024-01-01'::date, 145.00, 'Jährlich', 'ACTIVE',
    3, 200, 50, 0,
    ARRAY['Privathaftpflicht', 'Grobfahrlässigkeit']
),
(
    'p2p2p2p2-2222-4444-b222-74f00998df02'::uuid,
    'c1c1c1c1-1111-4444-b111-74f00998df01'::uuid, -- Hans Meier
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid,
    'Zurich', 'Motorfahrzeug', 'M-992-883',
    '2023-03-15'::date, '2024-03-15'::date, 850.00, 'Jährlich', 'ACTIVE',
    1, 500, 150, 0,
    ARRAY['Vollkasko', 'Parkschaden']
),
(
    'p3p3p3p3-3333-4444-b333-74f00998df03'::uuid,
    'c2c2c2c2-2222-4444-b222-74f00998df02'::uuid, -- Anna Schmidt
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid,
    'Allianz', 'Hausrat', 'H-123-456',
    '2022-06-01'::date, '2027-06-01'::date, 320.00, 'Jährlich', 'ACTIVE',
    3, 0, 800, 60,
    ARRAY['Hausrat', 'Einbruchdiebstahl']
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 5. HYPOTHEKEN (MORTGAGES) SEEDEN
-- ==========================================
INSERT INTO public.mortgages (
    id, client_id, tenant_id, property_name, property_value, loan_amount, own_capital,
    interest_rate, type, duration_years, start_date, end_date, amortization_method, application_status
) VALUES
(
    'm1m1m1m1-1111-4444-b111-74f00998df01'::uuid,
    'c1c1c1c1-1111-4444-b111-74f00998df01'::uuid, -- Hans Meier
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid,
    'Eigentumswohnung Zürich', 1200000, 800000, 400000,
    1.85, 'FIXED', 10, '2020-07-01'::date, '2030-07-01'::date, 'INDIRECT', 'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 6. VERMÖGENSWERTE (ASSETS) SEEDEN
-- ==========================================
INSERT INTO public.assets (
    id, client_id, type, name, value, provider, last_updated
) VALUES
('a1a1a1a1-1111-4444-b111-74f00998df01'::uuid, 'c1c1c1c1-1111-4444-b111-74f00998df01'::uuid, 'CASH', 'ZKB Privatkonto', 45000, 'ZKB', '2024-05-01'::date),
('a2a2a2a2-2222-4444-b222-74f00998df02'::uuid, 'c1c1c1c1-1111-4444-b111-74f00998df01'::uuid, 'PILLAR_3A', 'VIAC 3a', 65000, 'VIAC', '2024-05-01'::date),
('a3a3a3a3-3333-4444-b333-74f00998df03'::uuid, 'c1c1c1c1-1111-4444-b111-74f00998df01'::uuid, 'REAL_ESTATE', 'Eigentumswohnung', 1200000, null, '2023-12-31'::date),
('a4a4a4a4-4444-4444-b444-74f00998df04'::uuid, 'c1c1c1c1-1111-4444-b111-74f00998df01'::uuid, 'SECURITIES', 'Swisscanto Fonds', 25000, 'ZKB', '2024-05-15'::date)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 7. VERTRIEBS-LEADS (LEADS) SEEDEN
-- ==========================================
INSERT INTO public.leads (
    id, tenant_id, title, description, status, type,
    source, potential_value, quality_score, company_name, contact_person,
    email, phone, city, is_public_marketplace, marketplace_price
) VALUES
(
    'l1l1l1l1-1111-4444-b111-74f00998df01'::uuid,
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid,
    'Hypothekaranfrage EFH Zürich',
    'Kunde sucht Finanzierung für Eigentumswohnung. Kaufpreis 1.2M, Eigenkapital 400k vorhanden. Wünscht Beratung zu Festhypothek.',
    'NEW', 'MORTGAGE', 'Radar', 5500, 95, null, 'Gabriel Huber',
    'gabriel.huber@example.ch', '+41 79 333 44 55', 'Zürich', false, null
),
(
    'l2l2l2l2-2222-4444-b222-74f00998df02'::uuid,
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid,
    'KMU sucht BVG Lösung',
    'Architekturbüro mit 12 Mitarbeitern sucht neue Pensionskassenlösung. Unzufrieden mit aktuellen Verwaltungskosten.',
    'CONTACTED', 'INSURANCE', 'Marketplace', 12500, 85, 'PlanBau Architekten GmbH', 'Cornelia Keller',
    'c.keller@planbau.ch', '+41 31 444 55 66', 'Bern', true, 350
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 8. PROVISIONSABRECHNUNGEN (COMMISSIONS) SEEDEN
-- ==========================================
INSERT INTO public.commissions (
    id, tenant_id, agent_id, amount, currency, status, type, source_partner, description, date
) VALUES
(
    'com1com1-1111-4444-b111-74f00998df01'::uuid, 
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid, 
    'a2d88734-72b1-4770-98fc-eb8283300202'::uuid, -- Felix Fieldagent
    150.00, 
    'CHF', 
    'PAID', 
    'ACQUISITION', 
    'AXA', 
    'Abschluss PH Hans Meier', 
    '2024-05-01'::date
),
(
    'com2com2-2222-4444-b222-74f00998df02'::uuid, 
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid, 
    'a2d88734-72b1-4770-98fc-eb8283300202'::uuid, -- Felix Fieldagent
    450.00, 
    'CHF', 
    'PENDING', 
    'RECURRING', 
    'Zurich', 
    'Bestand Auto Hans Meier', 
    '2024-05-15'::date
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 9. ZEITERFASSUNG (TIME ENTRIES) SEEDEN
-- ==========================================
INSERT INTO public.time_entries (
    id, user_id, tenant_id, date, hours, activity, description, status, related_client_id
) VALUES
(
    't1t1t1t1-1111-4444-b111-74f00998df01'::uuid, 
    'a2d88734-72b1-4770-98fc-eb8283300202'::uuid, -- Felix Fieldagent
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid, 
    '2024-05-20'::date, 
    2.5, 
    'Kundenberatung', 
    'Jahresgespräch und Vorsorgeanalyse', 
    'APPROVED', 
    'c1c1c1c1-1111-4444-b111-74f00998df01'::uuid
),
(
    't2t2t2t2-2222-4444-b222-74f00998df02'::uuid, 
    'a2d88734-72b1-4770-98fc-eb8283300202'::uuid, -- Felix Fieldagent
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid, 
    '2024-05-20'::date, 
    1.0, 
    'Reisezeit', 
    'Fahrt zu Kunde Bern', 
    'APPROVED', 
    null
),
(
    't3t3t3t3-3333-4444-b333-74f00998df03'::uuid, 
    'a2d88734-72b1-4770-98fc-eb8283300202'::uuid, -- Felix Fieldagent
    'd78b87d5-cc72-46a2-bc42-99933fd2fbb1'::uuid, 
    '2024-05-21'::date, 
    4.0, 
    'Administration', 
    'Offerten ausarbeiten Hypothek', 
    'SUBMITTED', 
    null
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- OPTIONAL: DEINEN EIGENEN / NEU REGISTRIERTEN USER-ACCOUNT VERKNÜPFEN
-- =============================================================================
-- Wenn du dich in deiner App als neuer Account registrierst, generiert Supabase 
-- eine dynamische User-ID in "auth.users" für dich.
-- Damit das Dashboard deine Daten und deinen Mandanten "Muster Broker AG" anzeigt,
-- solltest du deine persönliche UUID nachträglich mit einem Broker-Profil verknüpfen.
-- 
-- Führe dazu einfach folgendes SQL im SQL-Editor aus (ersetze die ID durch deine UID):
--
-- UPDATE public.profiles 
-- SET id = 'DEINE_PERSÖNLICHE_SUPABASE_USER_ID_HIER' 
-- WHERE email = 'max.muster@swissbroker.ch';
-- 
-- =============================================================================
