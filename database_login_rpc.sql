-- =============================================================================
-- SWISSBROKER OS - USERNAME -> EMAIL LOOKUP (LOGIN)
-- =============================================================================
-- Under production RLS, anonymous users cannot read public.profiles, so the
-- login form cannot resolve a username to an email. This SECURITY DEFINER
-- function does that single lookup safely (it only ever returns the email for
-- an exact username match). Run after database_rls.sql.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.email_for_username(uname text)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE username = uname LIMIT 1;
$$;

-- Allow the (anonymous) login form and authenticated users to call it.
GRANT EXECUTE ON FUNCTION public.email_for_username(text) TO anon, authenticated;
