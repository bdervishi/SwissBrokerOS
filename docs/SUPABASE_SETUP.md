# Supabase Setup – switching the app from mock to a real database

This is Phase 1 of `docs/ROADMAP.md`. Follow it in order.

## 1. Create a Supabase project
- Cloud: https://supabase.com → New project. Note the project's **Project URL**
  and **anon/public key** (Settings → API).
- Or self-hosted/local: `supabase start` and use the printed URL + anon key.

## 2. Run the SQL (SQL Editor → New query) IN THIS ORDER
1. `database_schema.sql` – creates the 9 tables and enables RLS (with permissive
   demo policies).
2. `supabase_seed.sql` – inserts demo tenants, auth users, profiles, clients,
   policies, mortgages, etc.
3. `database_rls.sql` – replaces the demo policies with real tenant isolation.

> Run each file fully and check for errors. If any statement fails, copy the
> error message back to me. Seeding runs as the service role in the SQL editor,
> so RLS does not block it.

## 3. Configure the frontend (Vercel → Project → Settings → Environment Variables)
| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | your Project URL (e.g. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | your anon/public key |
| `VITE_USE_MOCK_DATA` | `false` |

Redeploy after setting them (env vars are baked in at build time).

> Leaving these unset keeps the app on mock data – it stays fully usable.

## 4. Log in (real mode)
Use the seeded demo account. Because production RLS blocks anonymous reads of
`profiles`, log in with the **email**, not the username:

- Email: `max.muster@swissbroker.ch`
- Password: `Password123!`

(Username login, e.g. `max_broker`, requires the `email_for_username` RPC from
Phase 5.)

### If login fails
Manually seeded `auth.users` rows are accepted by most Supabase versions but not
all. If `signInWithPassword` rejects the seeded user:
1. Authentication → Users → Add user → set email + `Password123!` (auto-confirm).
2. Copy the new user's UUID and point a profile row at it:
   `UPDATE public.profiles SET id = '<new-uuid>' WHERE email = 'max.muster@swissbroker.ch';`
   (or insert a fresh profile with that id, tenant_id and role `BROKER_ADMIN`).

## 5. Verify
- Network tab shows requests to `https://xxxx.supabase.co/rest/v1/...`
- The console logs `[Supabase] Connected to xxxx.supabase.co…`
- Note: until Phase 3, most root pages still read `MOCK_*`, so not every screen
  reflects DB data yet. The data layer and auth are what go live first.

## 6. (Later) AI features
The Gemini features call the backend proxy. Deploy `backend/` (see
`docs/DEPLOYMENT_GCP.md`), set its `GOOGLE_API_KEY`, and set the frontend
`VITE_BACKEND_URL` to the deployed `/api/generate` endpoint.
