# SwissBroker OS – Roadmap

Canonical decision: **the root tree (`App.tsx` + `pages/` + `contexts/`) is the
real, deployed app.** The `src/` multi-app tree is being retired; its useful
parts (the Supabase client, the `db` data service and the `useData` hooks) are
moved into the root tree.

Status legend: ✅ done · 🟡 in progress · ⬜ open

---

## Phase 0 – Stabilisation (✅ done)
- ✅ Fix production white screen (`createClient` crash when Supabase unconfigured)
- ✅ Real data-access layer with mock fallback (`db` service, 9 tables, snake↔camel mapping)
- ✅ Real Supabase auth with demo fallback (`AuthContext`)
- ✅ Production RLS policies with tenant isolation (`database_rls.sql`)
- ✅ Route all Gemini calls through the backend proxy (no API key in the bundle)
- ✅ `.gitignore` + committed lockfile

## Phase 1 – Connect real Supabase (🟡 current)
Goal: the deployed app talks to a real database in read mode.
- ⬜ Provision a Supabase project (cloud or self-hosted)
- ⬜ Run SQL in order: `database_schema.sql` → `supabase_seed.sql` → `database_rls.sql`
- ⬜ Set Vercel env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_USE_MOCK_DATA=false`
- ⬜ Verify login in real mode (use **email** `max.muster@swissbroker.ch` /
  `Password123!`; username login needs Phase 5 RPC)
- See `docs/SUPABASE_SETUP.md` for exact steps.

## Phase 2 – Consolidate on the root tree (⬜)
- ⬜ Move `src/lib/supabase.ts`, `src/services/db.ts`, `src/hooks/useData.ts`
  into the root tree (e.g. `lib/`, `services/`, `hooks/`)
- ⬜ Repoint `AuthContext` import to the relocated client
- ⬜ Remove the now-dead `src/` app tree (`src/apps`, `src/entries`, `src/pages`,
  duplicate `src/components`, `src/constants.ts`, `src/types.ts`) and the
  `admin/broker/client.html` entries from `vite.config.ts`
- ⬜ Single source of truth for `types.ts` and `constants.ts`

## Phase 3 – Wire reads (⬜)
Migrate root `pages/*` from direct `MOCK_*` imports to the `useData` hooks.
- ⬜ Clients, ClientDetail, Policies, PolicyDetail
- ⬜ Dashboard, Analytics, AgentDashboard
- ⬜ Mortgages, MortgageDetail, Commissions, TaxManagement, LeadFinder, Inbox
- ⬜ TenantDetail, MyProfile, TeamOverview/Detail, EmployeeDetail
- Non-DB mocks (partners, events, static pages) stay mock until tables exist.

## Phase 4 – Wire writes / CRUD (⬜)
Replace stub handlers (console.log / local-only) with real `db.*` calls.
- ⬜ **Create client** (the reported bug): add modal + form + `db.clients.create()`
- ⬜ Create tenant, policy, mortgage, lead
- ⬜ Client notes, activity protocols, time entries → persist
- ⬜ Profile save, settings save
- ⬜ Validation + optimistic UI + error/loading states

## Phase 5 – Security & backend hardening (⬜)
- ⬜ Apply `database_rls.sql` and verify tenant isolation end-to-end
- ⬜ `SECURITY DEFINER` RPC `email_for_username` so username login works under RLS
- ⬜ Role-based route guards (not just `isAuthenticated`)
- ⬜ Deploy the `backend/` AI proxy (Cloud Run) and set `VITE_BACKEND_URL`
- ⬜ Move SaaS config (CMS pages, tax, email) from `localStorage` to DB

## Phase 6 – Quality & QA (⬜)
- ⬜ Add `tsconfig.json` + `npm run typecheck` and wire into CI
- ⬜ Build+preview smoke test in CI (would have caught the white screen)
- ⬜ Route-based code splitting (`React.lazy`) – current bundles exceed 1 MB
- ⬜ Replace the Tailwind Play CDN with a real build pipeline
- ⬜ Basic E2E tests for the core CRUD cycle
