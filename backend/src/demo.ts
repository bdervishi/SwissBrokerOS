import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

/**
 * Demo access: only allow-listed emails can enter the shared demo tenant.
 * `POST /api/demo/request-access { email }` — if the email is on
 * public.demo_allowlist, ensure an auth user + a profile in the demo tenant
 * exist, then return { eligible: true }. The frontend then triggers a magic
 * link (signInWithOtp) which only succeeds for that now-existing account.
 * Non-allow-listed emails get a generic response (no account, no link).
 */

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

// Seeded "Muster Broker AG" tenant by default.
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || 'd78b87d5-cc72-46a2-bc42-99933fd2fbb1';

export const demoRouter = Router();

async function findUserIdByEmail(email: string): Promise<string | undefined> {
  // listUsers is paginated; scan a few pages for small allow-lists.
  for (let page = 1; page <= 10; page++) {
    const { data } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    const u = data?.users?.find((x) => (x.email || '').toLowerCase() === email);
    if (u) return u.id;
    if (!data || data.users.length < 200) break;
  }
  return undefined;
}

demoRouter.post('/request-access', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  // Generic response shape so we never reveal who is/ isn't allow-listed.
  const generic = { ok: true };
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'E-Mail erforderlich' });

  try {
    const { data: allowed } = await supabase
      .from('demo_allowlist')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    if (!allowed) return res.json({ ...generic, eligible: false });

    // Ensure an auth user
    let userId: string | undefined;
    const { data: created, error: cErr } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: crypto.randomUUID() + crypto.randomUUID(),
    });
    if (created?.user) userId = created.user.id;
    else if (cErr) userId = await findUserIdByEmail(email);
    if (!userId) return res.status(500).json({ error: 'Konnte Demo-Konto nicht anlegen' });

    // Ensure a profile in the demo tenant (don't overwrite an existing profile)
    const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (!existing) {
      await supabase.from('profiles').insert({
        id: userId, tenant_id: DEMO_TENANT_ID, email,
        username: email.split('@')[0], first_name: 'Demo', last_name: 'Nutzer',
        role: 'BROKER_ADMIN', is_active: true,
      });
    }

    res.json({ ...generic, eligible: true });
  } catch (e: any) {
    console.error('Demo access error:', e?.message);
    res.status(500).json({ error: 'Fehler' });
  }
});
