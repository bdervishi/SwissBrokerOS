-- =============================================================================
-- SWISSBROKER OS - EMAILS (Inbox)
-- =============================================================================
-- Stores the unified inbox. (Real email-provider sync would populate this;
-- for now it is seeded with demo mail.) Run after database_rls.sql.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),
    user_id UUID REFERENCES public.profiles(id),
    sender_name TEXT,
    sender_email TEXT,
    subject TEXT,
    preview TEXT,
    content TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false,
    folder TEXT DEFAULT 'INBOX',
    source TEXT,
    priority TEXT DEFAULT 'NORMAL',
    tags TEXT[],
    category TEXT,
    snoozed_until TIMESTAMPTZ,
    attachments JSONB
);

ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emails_tenant_isolation" ON public.emails;
CREATE POLICY "emails_tenant_isolation" ON public.emails
  FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_saas_admin())
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_saas_admin());

-- Seed a couple of demo mails for the first tenant (idempotent on empty table).
INSERT INTO public.emails (tenant_id, sender_name, sender_email, subject, preview, content, date, is_read, folder, source, priority, tags, category)
SELECT 'd78b87d5-cc72-46a2-bc42-99933fd2fbb1', 'Hans Meier', 'hans.meier@example.com', 'Frage zur Police',
       'Guten Tag, ich habe eine Frage zur Rechnung...', 'Guten Tag,<br/>ich habe eine Frage zur Rechnung vom 01.05.2024.<br/>Gruss Hans',
       NOW() - INTERVAL '1 day', false, 'INBOX', 'Gmail', 'NORMAL', ARRAY['Kunde'], 'Service'
WHERE NOT EXISTS (SELECT 1 FROM public.emails);
INSERT INTO public.emails (tenant_id, sender_name, sender_email, subject, preview, content, date, is_read, folder, source, priority, tags, category)
SELECT 'd78b87d5-cc72-46a2-bc42-99933fd2fbb1', 'AXA Broker Service', 'broker@axa.ch', 'Neue Dokumente verfügbar',
       'Im Partnerportal stehen neue Dokumente bereit.', 'Sehr geehrte Damen und Herren,<br/>neue Dokumente verfügbar.',
       NOW() - INTERVAL '2 days', true, 'INBOX', 'Outlook', 'NORMAL', ARRAY['Partner','Dokumente'], 'Admin'
WHERE (SELECT COUNT(*) FROM public.emails) < 2;
