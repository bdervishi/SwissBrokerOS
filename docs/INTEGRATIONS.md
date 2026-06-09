# Cloud drive integrations (Google Drive & Microsoft OneDrive)

Per-tenant OAuth so each broker firm connects its own Google Drive / OneDrive
and browses files from inside the app. Tokens live only on the backend.

## Architecture
- **Frontend** (`components/integrations/CloudDrives.tsx`, `src/services/integrations.ts`):
  connect/disconnect buttons + a file browser. No secrets in the browser.
- **Backend** (`backend/src/integrations.ts`): OAuth connect/callback, token
  refresh, and Drive/Graph file listing. Stores per-tenant tokens in
  `public.tenant_integrations.encrypted_credentials` via the Supabase service role.
- **DB**: `database_integrations.sql` (already applied on the live instance) –
  `integration_providers`, `tenant_integrations`, `integration_external_mappings`,
  `integration_sync_logs`.

## 1. Register the OAuth apps (operator, one-time)

### Google Drive
1. Google Cloud Console → new project → **enable the Google Drive API**.
2. APIs & Services → **OAuth consent screen** (External), add scope
   `.../auth/drive.readonly`.
3. **Credentials → Create OAuth client ID → Web application**.
4. Authorized redirect URI:
   `https://<your-backend>/api/integrations/google_drive/callback`
5. Note the **Client ID** and **Client secret**.

### Microsoft OneDrive (Office 365)
1. Entra/Azure portal → **App registrations → New registration** (accounts in any org + personal).
2. Redirect URI (Web):
   `https://<your-backend>/api/integrations/microsoft_onedrive/callback`
3. **API permissions** → Microsoft Graph → delegated: `Files.Read.All`,
   `offline_access`, `User.Read`.
4. **Certificates & secrets** → new client secret. Note **Application (client) ID** + secret.

### Dropbox
1. Dropbox App Console → **Create app** → Scoped access → Full Dropbox.
2. **Permissions** tab → enable `files.metadata.read`, `files.content.read`.
3. **Settings** → OAuth 2 → Redirect URI:
   `https://<your-backend>/api/integrations/dropbox/callback`
4. Note the **App key** (client id) + **App secret**.

## 2. Backend env (`backend/.env`)
```
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key>   # server-side only!
BACKEND_PUBLIC_URL=https://<your-backend>       # must match the redirect URIs
FRONTEND_URL=https://<your-frontend>            # used for the post-OAuth redirect + CORS
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MS_CLIENT_ID=...
MS_CLIENT_SECRET=...
DROPBOX_CLIENT_ID=...
DROPBOX_CLIENT_SECRET=...
GOOGLE_API_KEY=...                              # (existing AI proxy)
```

## 3. Frontend env (Vercel)
```
VITE_API_BASE_URL=https://<your-backend>        # backend origin (no path)
```
If unset, it is derived from `VITE_BACKEND_URL` (the AI proxy URL) by stripping
`/api/generate`.

## 4. Deploy the backend
`backend/` is an Express app (`npm run build && npm start`). Deploy it to Cloud
Run / Render / Fly with the env vars above (see `docs/DEPLOYMENT_GCP.md`). The
`BACKEND_PUBLIC_URL` must be the public HTTPS URL and match the registered
redirect URIs exactly.

## 5. Use it
- **Connect (per tenant):** Integrations page → **Cloud-Speicher** → *Verbinden*
  (Google Drive / OneDrive / Dropbox) → consent → *Dateien anzeigen*.
- **Per-client folders:** open a client → **Dokumente** tab → *Ordner verknüpfen*
  → navigate to the client's folder → *Ordner verknüpfen*. The folder's files then
  appear directly on the client record. Stored in `integration_external_mappings`.

## Security notes / hardening
- Client secrets and refresh tokens never reach the browser.
- `tenant_integrations` is RLS-protected; the backend uses the service role.
- **TODO:** encrypt `encrypted_credentials` at rest (Supabase Vault / pgsodium
  or app-level AES) – currently stored as plaintext JSONB.
- `state` carries the tenantId; consider a signed/expiring state for stricter CSRF.
- Scopes are read-only (`drive.readonly` / `Files.Read.All`).

## Next steps (not yet built)
- File download proxy/streaming through the backend (currently open via provider
  web links).
- Encrypt stored tokens at rest.
- Bexio / Abacus / other providers (the Integrations page still shows these as a
  mock demo).
