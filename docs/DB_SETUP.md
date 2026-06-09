# Database setup – run order

Run these SQL files in the Supabase SQL editor **in this exact order**. Each is
idempotent where practical, but the order matters (RLS helpers and child tables
depend on earlier files).

| # | File | Purpose |
|---|------|---------|
| 1 | `database_schema.sql` | Core 9 tables + permissive demo RLS |
| 2 | `supabase_seed.sql` | Demo tenants, auth users, profiles, clients, policies, … |
| 3 | `database_rls.sql` | Production RLS (tenant isolation) – replaces the demo policies; adds `current_tenant_id()` / `is_saas_admin()` helpers |
| 4 | `database_notes.sql` | `client_notes` table + RLS |
| 5 | `database_tenant_update.sql` | Lets broker admins update their own tenant (branding/HR) |
| 6 | `database_login_rpc.sql` | `email_for_username()` so username login works under RLS |
| 7 | `database_leads.sql` | Extends `leads` + `lead_contacts` / `lead_activities` / `lead_tasks` + RLS |
| 8 | `database_calendar.sql` | `calendar_events` table + RLS |
| 9 | `database_tax.sql` | `tax_returns` table + RLS (seeds one return per client) |
| 10 | `database_emails.sql` | `emails` table + RLS (seeds demo mail) |
| 11 | `database_lead_offers.sql` | `lead_offers` marketplace table (public browse + seller write) |
| 12 | `database_integrations.sql` | integration tables (providers / tenant_integrations / mappings / sync logs) for drive OAuth – already applied on the live instance |
| 13 | `database_calls.sql` | `calls` table + RLS (call agent post-call pipeline) |
| 14 | `database_signup.sql` | `provision_tenant()` RPC for self-serve tenant signup |

## Frontend env (Vercel → Environment Variables)
| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | your project URL |
| `VITE_SUPABASE_ANON_KEY` | anon/public key |
| `VITE_USE_MOCK_DATA` | `false` (real mode) or `true`/unset (mock) |
| `VITE_BACKEND_URL` | AI proxy endpoint (optional) |

## Demo login (real mode)
- Email: `max.muster@swissbroker.ch` / `Password123!` (BROKER_ADMIN)
- or username `max_broker` (needs file #6)

## Notes
- Without env vars set, the app runs fully on in-memory mock data – no DB needed.
- The data layer auto-falls back to mock when Supabase is unconfigured.
