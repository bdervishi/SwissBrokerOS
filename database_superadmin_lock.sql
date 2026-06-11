-- =============================================================================
-- SWISSBROKER OS - SUPER-ADMIN LOCK + ROLLEN-HÄRTUNG
-- =============================================================================
-- Stellt sicher:
--   1. NUR das unten definierte Konto darf die Rolle SAAS_SUPER_ADMIN tragen
--      (Identitätsanker = auth.users.email, NICHT das frei editierbare
--      profiles.email). Beim Anlegen seines Profils wird es automatisch
--      Super-Admin; niemand kann es von aussen degradieren.
--   2. Niemand kann die EIGENE Rolle ändern (schliesst die bisherige
--      Privilege-Escalation über die offene profile_self_update-RLS-Policy:
--      ein Broker konnte sich per API selbst SAAS_SUPER_ADMIN geben).
--   3. Andere SAAS_-Rollen (z.B. SAAS_SALES) kann nur ein SaaS-Admin oder das
--      Backend (Service-Role) vergeben. Alle übrigen Nutzer bleiben Broker /
--      bei ihrer zugewiesenen Rolle.
-- Durchgesetzt als BEFORE-Trigger: gilt damit auch für PostgREST-Aufrufe und
-- die Service-Role (RLS-Bypass schützt NICHT vor Triggern).
-- Run after database_rls.sql. Idempotent.
-- =============================================================================

-- >>> HIER die reservierte Super-Admin-Adresse pflegen <<<
CREATE OR REPLACE FUNCTION public.super_admin_email()
RETURNS TEXT
LANGUAGE sql IMMUTABLE
AS $$ SELECT 'email@dervishi.ch' $$;

CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_actor UUID := auth.uid();          -- NULL bei Service-Role/SQL-Editor
  v_auth_email TEXT;                   -- echte Login-E-Mail des Profilinhabers
  v_reserved TEXT := lower(public.super_admin_email());
BEGIN
  SELECT lower(email) INTO v_auth_email FROM auth.users WHERE id = NEW.id;

  -- Das reservierte Konto ist IMMER Super-Admin (Auto-Promote, kein Demote).
  IF v_auth_email = v_reserved THEN
    NEW.role := 'SAAS_SUPER_ADMIN';
    RETURN NEW;
  END IF;

  -- Super-Admin-Rolle ist für alle anderen Konten gesperrt.
  IF NEW.role = 'SAAS_SUPER_ADMIN' THEN
    RAISE EXCEPTION 'SAAS_SUPER_ADMIN ist dem reservierten Konto vorbehalten';
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
    -- Niemand ändert die eigene Rolle (Privilege-Escalation-Schutz).
    IF v_actor IS NOT NULL AND v_actor = NEW.id THEN
      RAISE EXCEPTION 'Die eigene Rolle kann nicht geändert werden';
    END IF;
    -- SAAS_-Rollen vergibt nur ein SaaS-Admin (oder Service-Role/SQL).
    IF NEW.role LIKE 'SAAS_%' AND v_actor IS NOT NULL AND NOT public.is_saas_admin() THEN
      RAISE EXCEPTION 'SAAS_-Rollen können nur durch die Plattform-Administration vergeben werden';
    END IF;
  END IF;

  IF TG_OP = 'INSERT' AND NEW.role LIKE 'SAAS_%'
     AND v_actor IS NOT NULL AND NOT public.is_saas_admin() THEN
    RAISE EXCEPTION 'SAAS_-Rollen können nur durch die Plattform-Administration vergeben werden';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_guard_profile_role ON public.profiles;
CREATE TRIGGER trg_guard_profile_role
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

-- ---------------------------------------------------------------------------
-- Bestandsbereinigung:
--  a) Fremde SAAS_SUPER_ADMINs -> BROKER_ADMIN degradieren
--  b) das reservierte Konto (falls schon registriert) -> Super-Admin
-- Direkt-UPDATEs hier laufen ebenfalls durch den Trigger; das reservierte
-- Konto wird dort ohnehin auto-promotet.
-- ---------------------------------------------------------------------------
UPDATE public.profiles p
   SET role = 'BROKER_ADMIN'
  FROM auth.users u
 WHERE u.id = p.id
   AND p.role = 'SAAS_SUPER_ADMIN'
   AND lower(u.email) <> lower(public.super_admin_email());

UPDATE public.profiles p
   SET role = 'SAAS_SUPER_ADMIN'
  FROM auth.users u
 WHERE u.id = p.id
   AND lower(u.email) = lower(public.super_admin_email());

-- Kontrolle: wer trägt jetzt welche SAAS_-Rolle?
SELECT u.email, p.role
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
 WHERE p.role LIKE 'SAAS_%';
