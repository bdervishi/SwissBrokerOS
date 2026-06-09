-- =============================================================================
-- SWISSBROKER OS - SELF-SERVE SIGNUP (tenant provisioning)
-- =============================================================================
-- Lets a freshly signed-up user create their own tenant + admin profile.
-- RLS blocks tenant/profile inserts for non-SaaS users, so this runs as
-- SECURITY DEFINER. Idempotent: re-running returns the existing tenant.
-- Run after database_rls.sql.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.provision_tenant(
    p_company TEXT,
    p_first TEXT,
    p_last TEXT,
    p_username TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_uid UUID := auth.uid();
    v_email TEXT;
    v_tenant UUID;
    v_existing UUID;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Idempotent: a user who already has a profile keeps their tenant.
    SELECT tenant_id INTO v_existing FROM public.profiles WHERE id = v_uid;
    IF v_existing IS NOT NULL THEN
        RETURN v_existing;
    END IF;

    SELECT email INTO v_email FROM auth.users WHERE id = v_uid;

    INSERT INTO public.tenants (name, plan, status, branding_config)
    VALUES (
        COALESCE(NULLIF(p_company, ''), 'Mein Maklerbüro'),
        'STARTER', 'TRIAL',
        jsonb_build_object('primaryColor', '#0ea5e9', 'logoText', COALESCE(NULLIF(p_company, ''), 'Broker'))
    )
    RETURNING id INTO v_tenant;

    INSERT INTO public.profiles (id, tenant_id, email, username, first_name, last_name, role, is_active)
    VALUES (
        v_uid, v_tenant, v_email,
        COALESCE(NULLIF(p_username, ''), split_part(v_email, '@', 1)),
        p_first, p_last, 'BROKER_ADMIN', true
    );

    RETURN v_tenant;
END;
$$;

GRANT EXECUTE ON FUNCTION public.provision_tenant(TEXT, TEXT, TEXT, TEXT) TO authenticated;
