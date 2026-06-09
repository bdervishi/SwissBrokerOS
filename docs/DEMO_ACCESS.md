# Gated demo access (email allow-list + magic link)

Only allow-listed emails can enter the **shared demo tenant** (the seeded
"Muster Broker AG"). Self-registration of real customers (`/register`) is
unaffected — those get their own tenants.

## Setup
1. Run `database_demo_allowlist.sql`.
2. Backend env: `DEMO_TENANT_ID` (defaults to the seeded Muster Broker AG id).
   The backend must be deployed (uses the Supabase service role + admin API).
3. Supabase → Auth → URL Configuration: allow `https://<app>/**` as redirect.
4. Point the marketing "Demo ansehen" button to `https://<app>/#/demo`.

## Manage the allow-list
Add/remove emails in the `public.demo_allowlist` table (Supabase table editor):
```sql
insert into public.demo_allowlist (email, note) values ('partner@example.com', 'Pilot');
delete from public.demo_allowlist where email = 'partner@example.com';
```

## Flow
`/demo` → enter email → `POST /api/demo/request-access` checks the allow-list
and, if allowed, provisions a demo profile in the demo tenant → the frontend
triggers a magic link (`signInWithOtp`, `shouldCreateUser:false`) → the user
clicks the link → lands in the demo. Non-listed emails get a generic "if
eligible, check your email" message and no link.

## Notes
- The gate is the **demo-tenant membership** (only listed emails get a profile
  there) + magic link to existing accounts only.
- To also block random Supabase OTP account creation entirely, disable public
  signups — but that would also disable `/register`. Not required for the demo
  gate to work (random accounts have no profile/tenant → see nothing).
