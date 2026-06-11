-- =============================================================================
-- SWISSBROKER OS - TEAM-ZUSAMMENARBEIT (Übergabe, Benachrichtigungen, Vertretung)
-- =============================================================================
-- Run after database_rls.sql (uses current_tenant_id()/is_saas_admin()).
-- Idempotent.
--
-- 1. leads.assigned_to        Zuständiger Mitarbeiter pro Lead
-- 2. notifications            In-App-Benachrichtigungen (Glocke)
-- 3. absences                 Abwesenheit + Stellvertretung
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. LEAD-ZUWEISUNG
-- ---------------------------------------------------------------------------
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON public.leads(assigned_to);

-- ---------------------------------------------------------------------------
-- 2. BENACHRICHTIGUNGEN
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    type TEXT NOT NULL,                 -- HANDOVER_EVENT | LEAD_ASSIGNED | MENTION | COMMISSION_DISPUTE | DEADLINE | SYSTEM
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,                          -- Hash-Route, z.B. '/calendar'
    related_type TEXT,                  -- EVENT | LEAD | CLIENT | COMMISSION
    related_id TEXT,
    is_read BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Empfänger sieht/aktualisiert nur die eigenen; SaaS-Admin sieht alles.
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (recipient_id = auth.uid() OR public.is_saas_admin());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE USING (recipient_id = auth.uid() OR public.is_saas_admin());

-- Erstellen darf jede:r im selben Mandanten (Kolleg:in benachrichtigen) –
-- der Empfänger muss zum eigenen Tenant gehören. Service-Role (Backend) ohne
-- auth.uid() ist über is_saas_admin()=false -> daher zusätzlich tenant-check.
DROP POLICY IF EXISTS "notifications_insert_same_tenant" ON public.notifications;
CREATE POLICY "notifications_insert_same_tenant" ON public.notifications
  FOR INSERT WITH CHECK (
    public.is_saas_admin()
    OR tenant_id = public.current_tenant_id()
  );

-- ---------------------------------------------------------------------------
-- 3. ABWESENHEIT & STELLVERTRETUNG
-- ---------------------------------------------------------------------------
-- Helper: ist der aktuelle Nutzer Broker-Admin? (für Team-Verwaltung)
CREATE OR REPLACE FUNCTION public.is_broker_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'BROKER_ADMIN' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE TABLE IF NOT EXISTS public.absences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    deputy_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  -- Stellvertretung

    reason TEXT DEFAULT 'VACATION',     -- VACATION | SICK | OTHER
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    note TEXT
);

CREATE INDEX IF NOT EXISTS idx_absences_tenant ON public.absences(tenant_id, start_date, end_date);

ALTER TABLE public.absences ENABLE ROW LEVEL SECURITY;

-- Im Mandanten sichtbar (Team muss Vertretungen kennen); anlegen/ändern/löschen
-- nur die betroffene Person oder ein Broker-Admin desselben Mandanten.
DROP POLICY IF EXISTS "absences_select_tenant" ON public.absences;
CREATE POLICY "absences_select_tenant" ON public.absences
  FOR SELECT USING (tenant_id = public.current_tenant_id() OR public.is_saas_admin());

DROP POLICY IF EXISTS "absences_write_self_or_admin" ON public.absences;
CREATE POLICY "absences_write_self_or_admin" ON public.absences
  FOR ALL
  USING (
    tenant_id = public.current_tenant_id()
    AND (user_id = auth.uid() OR public.is_broker_admin() OR public.is_saas_admin())
  )
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND (user_id = auth.uid() OR public.is_broker_admin() OR public.is_saas_admin())
  );
