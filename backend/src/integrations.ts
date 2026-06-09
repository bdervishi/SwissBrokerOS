import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { encryptJson, decryptJson, signState, verifyState } from './crypto';
import { requireTenant, tenantFromQuery, tenantFromBody } from './auth';

/**
 * Per-tenant OAuth drive integrations (Google Drive, Microsoft OneDrive).
 *
 * Security model:
 *  - Client secrets live ONLY here (backend env vars), never in the browser.
 *  - Data routes require a valid Supabase JWT whose tenant matches the request
 *    (requireTenant) – prevents cross-tenant access via a guessed tenantId.
 *  - Per-tenant tokens are AES-256-GCM encrypted at rest (ENCRYPTION_KEY) in
 *    tenant_integrations.encrypted_credentials.
 *  - OAuth state is HMAC-signed with an expiry (signState/verifyState).
 */

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BACKEND_PUBLIC_URL = process.env.BACKEND_PUBLIC_URL || 'http://localhost:3000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type ProviderCode = 'google_drive' | 'microsoft_onedrive' | 'dropbox';

interface ProviderConfig {
  name: string;
  category: string;
  authUrl: string;
  tokenUrl: string;
  scope: string;
  clientId: string;
  clientSecret: string;
  extraAuth?: Record<string, string>;
}

const PROVIDERS: Record<ProviderCode, ProviderConfig> = {
  google_drive: {
    name: 'Google Drive',
    category: 'document_storage',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    // access_type=offline + prompt=consent are required to receive a refresh_token.
    extraAuth: { access_type: 'offline', prompt: 'consent' },
  },
  microsoft_onedrive: {
    name: 'Microsoft OneDrive',
    category: 'document_storage',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scope: 'Files.Read.All offline_access User.Read',
    clientId: process.env.MS_CLIENT_ID || '',
    clientSecret: process.env.MS_CLIENT_SECRET || '',
  },
  dropbox: {
    name: 'Dropbox',
    category: 'document_storage',
    authUrl: 'https://www.dropbox.com/oauth2/authorize',
    tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
    scope: 'files.metadata.read files.content.read',
    clientId: process.env.DROPBOX_CLIENT_ID || '',
    clientSecret: process.env.DROPBOX_CLIENT_SECRET || '',
    // token_access_type=offline is required to receive a refresh_token.
    extraAuth: { token_access_type: 'offline' },
  },
};

const redirectUri = (provider: string) => `${BACKEND_PUBLIC_URL}/api/integrations/${provider}/callback`;

// ---- token storage (tenant_integrations) --------------------------------
async function getOrCreateProviderId(code: ProviderCode): Promise<string> {
  const cfg = PROVIDERS[code];
  const { data: existing } = await supabase.from('integration_providers').select('id').eq('code', code).maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await supabase
    .from('integration_providers')
    .insert({ code, name: cfg.name, category: cfg.category })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function saveCredentials(tenantId: string, code: ProviderCode, creds: any) {
  const providerId = await getOrCreateProviderId(code);
  await supabase
    .from('tenant_integrations')
    .upsert(
      { tenant_id: tenantId, provider_id: providerId, status: 'CONNECTED', encrypted_credentials: encryptJson(creds) },
      { onConflict: 'tenant_id,provider_id' },
    );
}

async function loadCredentials(tenantId: string, code: ProviderCode): Promise<any | null> {
  const providerId = await getOrCreateProviderId(code);
  const { data } = await supabase
    .from('tenant_integrations')
    .select('encrypted_credentials, status')
    .eq('tenant_id', tenantId)
    .eq('provider_id', providerId)
    .maybeSingle();
  if (!data || data.status !== 'CONNECTED') return null;
  return decryptJson(data.encrypted_credentials);
}

async function disconnect(tenantId: string, code: ProviderCode) {
  const providerId = await getOrCreateProviderId(code);
  await supabase
    .from('tenant_integrations')
    .upsert(
      { tenant_id: tenantId, provider_id: providerId, status: 'DISCONNECTED', encrypted_credentials: {} },
      { onConflict: 'tenant_id,provider_id' },
    );
}

// ---- OAuth token exchange / refresh -------------------------------------
async function exchangeCode(code: ProviderCode, authCode: string) {
  const cfg = PROVIDERS[code];
  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    code: authCode,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri(code),
  });
  const res = await fetch(cfg.tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  return res.json();
}

async function refreshToken(code: ProviderCode, refresh: string) {
  const cfg = PROVIDERS[code];
  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    refresh_token: refresh,
    grant_type: 'refresh_token',
  });
  if (code === 'microsoft_onedrive') body.set('scope', cfg.scope);
  const res = await fetch(cfg.tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
  return res.json();
}

// Returns a valid access token, refreshing + persisting if expired.
async function getAccessToken(tenantId: string, code: ProviderCode): Promise<string> {
  const creds = await loadCredentials(tenantId, code);
  if (!creds?.access_token) throw new Error('NOT_CONNECTED');
  const expiresAt = creds.token_expires_at ? new Date(creds.token_expires_at).getTime() : 0;
  if (expiresAt > Date.now() + 60_000) return creds.access_token;
  if (!creds.refresh_token) return creds.access_token; // best effort
  const refreshed: any = await refreshToken(code, creds.refresh_token);
  const updated = {
    ...creds,
    access_token: refreshed.access_token,
    token_expires_at: new Date(Date.now() + (refreshed.expires_in ?? 3600) * 1000).toISOString(),
    ...(refreshed.refresh_token ? { refresh_token: refreshed.refresh_token } : {}),
  };
  await saveCredentials(tenantId, code, updated);
  return updated.access_token;
}

// ---- normalized file listing --------------------------------------------
async function listFiles(tenantId: string, code: ProviderCode, folderId?: string) {
  const token = await getAccessToken(tenantId, code);
  if (code === 'google_drive') {
    const parent = folderId || 'root';
    const q = encodeURIComponent(`'${parent}' in parents and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink)&pageSize=100`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(await res.text());
    const data: any = await res.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      type: f.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
      mimeType: f.mimeType,
      size: f.size ? Number(f.size) : undefined,
      modified: f.modifiedTime,
      webUrl: f.webViewLink,
    }));
  }
  if (code === 'microsoft_onedrive') {
    const path = folderId ? `items/${folderId}/children` : 'root/children';
    const url = `https://graph.microsoft.com/v1.0/me/drive/${path}?$top=100`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(await res.text());
    const data: any = await res.json();
    return (data.value || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      type: f.folder ? 'folder' : 'file',
      mimeType: f.file?.mimeType,
      size: f.size,
      modified: f.lastModifiedDateTime,
      webUrl: f.webUrl,
      downloadUrl: f['@microsoft.graph.downloadUrl'],
    }));
  }
  // dropbox
  const res = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: folderId || '', limit: 100 }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data: any = await res.json();
  return (data.entries || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    type: f['.tag'] === 'folder' ? 'folder' : 'file',
    size: f.size,
    modified: f.server_modified,
  }));
}

// ---- router -------------------------------------------------------------
export const integrationsRouter = Router();

const isValidProvider = (p: string): p is ProviderCode =>
  p === 'google_drive' || p === 'microsoft_onedrive' || p === 'dropbox';

// List providers + config availability
integrationsRouter.get('/providers', (_req, res) => {
  res.json(
    (Object.keys(PROVIDERS) as ProviderCode[]).map((code) => ({
      code,
      name: PROVIDERS[code].name,
      category: PROVIDERS[code].category,
      configured: Boolean(PROVIDERS[code].clientId && PROVIDERS[code].clientSecret),
    })),
  );
});

// Begin OAuth (authenticated): return the provider consent URL with a signed
// state. Only an authenticated user of the tenant can obtain it; the frontend
// then navigates the browser to the returned URL.
integrationsRouter.post('/:provider/connect-url', requireTenant(tenantFromBody), (req, res) => {
  const { provider } = req.params;
  const tenantId = String(req.body?.tenantId || '');
  if (!isValidProvider(provider)) return res.status(400).json({ error: 'Unknown provider' });
  const cfg = PROVIDERS[provider];
  if (!cfg.clientId) return res.status(500).json({ error: `${cfg.name} is not configured on the server` });

  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: redirectUri(provider),
    response_type: 'code',
    scope: cfg.scope,
    state: signState({ tenantId, provider }),
    ...(cfg.extraAuth || {}),
  });
  res.json({ url: `${cfg.authUrl}?${params.toString()}` });
});

// OAuth callback: exchange code, store tokens, redirect back to the app
integrationsRouter.get('/:provider/callback', async (req, res) => {
  const { provider } = req.params;
  const { code, state, error } = req.query as Record<string, string>;
  if (!isValidProvider(provider)) return res.status(400).send('Unknown provider');
  const payload = verifyState(String(state || ''));
  const tenantId = payload?.tenantId;
  const back = (status: string) => res.redirect(`${FRONTEND_URL}/#/integrations?provider=${provider}&status=${status}`);
  if (error || !code || !tenantId || payload?.provider !== provider) return back('error');
  try {
    const tokens: any = await exchangeCode(provider, code);
    await saveCredentials(tenantId, provider, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString(),
    });
    back('connected');
  } catch (e: any) {
    console.error('OAuth callback error:', e?.message);
    back('error');
  }
});

// Connection status for a tenant
integrationsRouter.get('/:provider/status', requireTenant(tenantFromQuery), async (req, res) => {
  const { provider } = req.params;
  const tenantId = String(req.query.tenantId || '');
  if (!isValidProvider(provider) || !tenantId) return res.status(400).json({ connected: false });
  try {
    const creds = await loadCredentials(tenantId, provider);
    res.json({ connected: Boolean(creds?.access_token) });
  } catch {
    res.json({ connected: false });
  }
});

// List files/folders
integrationsRouter.get('/:provider/files', requireTenant(tenantFromQuery), async (req, res) => {
  const { provider } = req.params;
  const tenantId = String(req.query.tenantId || '');
  const folderId = req.query.folderId ? String(req.query.folderId) : undefined;
  if (!isValidProvider(provider) || !tenantId) return res.status(400).json({ error: 'Bad request' });
  try {
    const files = await listFiles(tenantId, provider, folderId);
    res.json({ files });
  } catch (e: any) {
    const msg = e?.message === 'NOT_CONNECTED' ? 'Not connected' : (e?.message || 'Error');
    res.status(e?.message === 'NOT_CONNECTED' ? 409 : 500).json({ error: msg });
  }
});

// ---- per-client folder mappings (integration_external_mappings) ---------
// Link a tenant's drive folder to a specific client so their documents appear
// on the client record.
integrationsRouter.get('/mappings', requireTenant(tenantFromQuery), async (req, res) => {
  const tenantId = String(req.query.tenantId || '');
  const clientId = String(req.query.clientId || '');
  if (!tenantId || !clientId) return res.status(400).json({ error: 'Bad request' });
  const { data, error } = await supabase
    .from('integration_external_mappings')
    .select('provider_code, external_id, external_url')
    .eq('tenant_id', tenantId).eq('local_table', 'clients').eq('local_id', clientId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ mappings: (data || []).map((m) => ({ provider: m.provider_code, folderId: m.external_id, folderUrl: m.external_url })) });
});

integrationsRouter.post('/mappings', requireTenant(tenantFromBody), async (req, res) => {
  const { tenantId, clientId, provider, folderId, folderUrl } = req.body || {};
  if (!tenantId || !clientId || !provider || !folderId) return res.status(400).json({ error: 'Bad request' });
  const { error } = await supabase.from('integration_external_mappings').upsert(
    {
      tenant_id: tenantId, provider_code: provider, local_table: 'clients', local_id: clientId,
      external_id: folderId, external_url: folderUrl || null, updated_at: new Date().toISOString(),
    },
    { onConflict: 'tenant_id,provider_code,local_table,local_id' },
  );
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

integrationsRouter.delete('/mappings', requireTenant(tenantFromQuery), async (req, res) => {
  const tenantId = String(req.query.tenantId || '');
  const clientId = String(req.query.clientId || '');
  const provider = String(req.query.provider || '');
  if (!tenantId || !clientId || !provider) return res.status(400).json({ error: 'Bad request' });
  const { error } = await supabase.from('integration_external_mappings').delete()
    .eq('tenant_id', tenantId).eq('provider_code', provider).eq('local_table', 'clients').eq('local_id', clientId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// Disconnect
integrationsRouter.post('/:provider/disconnect', requireTenant(tenantFromQuery), async (req, res) => {
  const { provider } = req.params;
  const tenantId = String(req.query.tenantId || req.body?.tenantId || '');
  if (!isValidProvider(provider) || !tenantId) return res.status(400).json({ error: 'Bad request' });
  try {
    await disconnect(tenantId, provider);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Error' });
  }
});
