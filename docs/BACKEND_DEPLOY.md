# Backend deployment

The `backend/` Express service powers everything that needs server-side secrets:
the **AI proxy**, **drive integrations** (Google/OneDrive/Dropbox), the **call
agent** post-call pipeline, the **deadline automation** cron, and **gated demo
access**. The Vercel frontend talks to it via `VITE_API_BASE_URL`.

Deploy it once and all of those go live. Two paths below — **Render** (easiest)
or **Google Cloud Run** (EU/CH data residency).

---

## 0. Generate the secrets first
```bash
openssl rand -hex 32   # ENCRYPTION_KEY
openssl rand -hex 32   # STATE_SECRET
openssl rand -hex 16   # AUTOMATION_SECRET
```
(On Render you can instead let the blueprint auto-generate these.)

## Environment variables (reference)
| Var | Required | Value |
|---|---|---|
| `FRONTEND_URL` | ✅ | your Vercel app URL, e.g. `https://swiss-broker-os.vercel.app` (used for CORS + post-OAuth redirect) |
| `BACKEND_PUBLIC_URL` | ✅ | the public URL of THIS backend (must match OAuth redirect URIs) |
| `GOOGLE_API_KEY` | ✅ | Gemini key (AI proxy, doc extraction, call summaries) |
| `SUPABASE_URL` | ✅ | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key — **server-side only** |
| `ENCRYPTION_KEY` | ✅ | 32-byte key (encrypts integration tokens at rest) |
| `STATE_SECRET` | ✓ | HMAC secret for OAuth state (defaults to ENCRYPTION_KEY) |
| `AUTOMATION_SECRET` | ✓ | guards the manual `/api/automation/run` trigger |
| `DEMO_TENANT_ID` | ✓ | shared demo tenant (defaults to seeded Muster Broker AG) |
| `GOOGLE_CLIENT_ID/SECRET` | drives | only if using Google Drive |
| `MS_CLIENT_ID/SECRET` | drives | only if using OneDrive |
| `DROPBOX_CLIENT_ID/SECRET` | drives | only if using Dropbox |
| `PORT` | auto | injected by Render/Cloud Run |

---

## Option A — Render (easiest)
1. Push this repo to GitHub (done).
2. Render → **New → Blueprint** → connect the repo. It reads `render.yaml`
   (service `swissbroker-backend`, builds `backend/`, region **Frankfurt**).
3. After creation, open the service → **Environment** → fill the `sync:false`
   vars (FRONTEND_URL, BACKEND_PUBLIC_URL, GOOGLE_API_KEY, SUPABASE_URL,
   SUPABASE_SERVICE_ROLE_KEY, …). `ENCRYPTION_KEY/STATE_SECRET/AUTOMATION_SECRET`
   are auto-generated.
   - Set `BACKEND_PUBLIC_URL` to the service's own URL (e.g.
     `https://swissbroker-backend.onrender.com`).
4. Deploy. Verify: open `https://<service>/health` → "Online 🟢".

> ⚠️ The Render **free** plan sleeps when idle → the daily 06:00 cron won't fire
> reliably. Use a paid plan (always-on) or call `/api/automation/run` from an
> external scheduler (cron-job.org / GitHub Actions) with the `x-automation-key`.

Without a blueprint you can also create a **Web Service** manually: Root
Directory `backend`, Build `npm ci && npm run build`, Start `npm start`,
Health check `/health`, and add the env vars.

## Option B — Google Cloud Run (EU residency)
The repo ships `backend/Dockerfile` + `backend/cloudbuild.yaml` (region
`europe-west6` = Zürich).
```bash
cd backend
gcloud builds submit --substitutions=_IMAGE_NAME=gcr.io/PROJECT/swissbroker-backend
# then set env vars on the service (or use Secret Manager):
gcloud run services update swissbroker-backend --region europe-west6 \
  --set-env-vars FRONTEND_URL=https://<app>,BACKEND_PUBLIC_URL=https://<run-url>,SUPABASE_URL=...,GOOGLE_API_KEY=...,DEMO_TENANT_ID=... \
  --set-secrets SUPABASE_SERVICE_ROLE_KEY=svc-role:latest,ENCRYPTION_KEY=enc-key:latest
```
Prefer **Secret Manager** for `SUPABASE_SERVICE_ROLE_KEY`, `ENCRYPTION_KEY`,
OAuth secrets. Cloud Run injects `PORT`. Cloud Scheduler can hit
`/api/automation/run` daily.

---

## 1. Wire the frontend (Vercel)
After the backend is live:
- Vercel env → `VITE_API_BASE_URL` = backend origin (no path), e.g.
  `https://swissbroker-backend.onrender.com`.
- (AI proxy) `VITE_BACKEND_URL` = `${that}/api/generate`.
- Ensure `VITE_USE_MOCK_DATA=false`. **Redeploy** (VITE vars are build-time).

## 2. Provider redirect URIs (only if using drives)
Set each OAuth app's redirect URI to
`${BACKEND_PUBLIC_URL}/api/integrations/<provider>/callback`.

> 📧 **E-Mail-Versand:** Der eingebaute Supabase-Mailer ist auf ~2 Mails/Stunde
> limitiert. Für zuverlässigen Magic-Link-/Reset-/Signup-Versand einen Custom
> SMTP einrichten – Schritt-für-Schritt mit Mailjet: **`docs/EMAIL_MAILJET.md`**.

## 3. Supabase URL configuration
Auth → URL Configuration → Site URL = the Vercel app; add `https://<app>/**`
to Redirect URLs (needed for magic-link login/demo, password reset, signup
confirm). All auth e-mails redirect to the real path `https://<app>/auth/callback`
(NOT a `/#/...` hash route) — the app uses the PKCE flow and exchanges the
`?code=` there before entering the hash-routed SPA, so the `/**` wildcard must
be present. PKCE requires the link to be opened in the same browser that
requested it.

## 4. Verify end-to-end
- `GET /health` → online.
- Integrations page → connect a drive (if configured).
- Client page → "Gespräch verarbeiten".
- `/demo` → an allow-listed email receives a magic link.
- Trigger the cron once:
  `curl -X POST https://<backend>/api/automation/run -H "x-automation-key: <AUTOMATION_SECRET>"`.
