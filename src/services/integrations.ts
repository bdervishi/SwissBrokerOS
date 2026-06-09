// Frontend client for the per-tenant drive integrations served by the backend
// (backend/src/integrations.ts). All secrets/tokens stay on the backend.
import { supabase } from '../lib/supabase';

const env = (import.meta as any).env || {};

// Attach the caller's Supabase access token so the backend can verify the
// tenant (prevents cross-tenant access).
async function authHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
const explicitBase: string | undefined = env.VITE_API_BASE_URL;
const aiUrl: string | undefined = env.VITE_BACKEND_URL; // e.g. https://host/api/generate
// Derive the backend origin from the AI proxy URL if a base isn't set explicitly.
export const API_BASE: string =
  explicitBase || (aiUrl ? aiUrl.replace(/\/api\/generate\/?$/, '') : 'http://localhost:3000');

export type DriveProvider = 'google_drive' | 'microsoft_onedrive' | 'dropbox';

export interface ClientFolderMapping {
  provider: DriveProvider;
  folderId: string;
  folderUrl?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  type: 'folder' | 'file';
  mimeType?: string;
  size?: number;
  modified?: string;
  webUrl?: string;
  downloadUrl?: string;
}

const q = (params: Record<string, string | undefined>) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
    .join('&');

export const integrationsApi = {
  // Authenticated: fetch the provider consent URL (signed state) then navigate.
  getConnectUrl: async (provider: DriveProvider, tenantId: string): Promise<string> => {
    const res = await fetch(`${API_BASE}/api/integrations/${provider}/connect-url`, {
      method: 'POST',
      headers: await authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ tenantId }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Verbinden fehlgeschlagen.');
    return (await res.json()).url as string;
  },

  status: async (provider: DriveProvider, tenantId: string): Promise<{ connected: boolean }> => {
    try {
      const res = await fetch(`${API_BASE}/api/integrations/${provider}/status?${q({ tenantId })}`, { headers: await authHeaders() });
      if (!res.ok) return { connected: false };
      return res.json();
    } catch {
      return { connected: false };
    }
  },

  listFiles: async (
    provider: DriveProvider,
    tenantId: string,
    folderId?: string,
  ): Promise<DriveFile[]> => {
    const res = await fetch(`${API_BASE}/api/integrations/${provider}/files?${q({ tenantId, folderId })}`, { headers: await authHeaders() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Fehler ${res.status}`);
    }
    const data = await res.json();
    return data.files as DriveFile[];
  },

  disconnect: async (provider: DriveProvider, tenantId: string): Promise<void> => {
    await fetch(`${API_BASE}/api/integrations/${provider}/disconnect?${q({ tenantId })}`, { method: 'POST', headers: await authHeaders() });
  },

  // ---- per-client folder mappings ----
  getClientMappings: async (tenantId: string, clientId: string): Promise<ClientFolderMapping[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/integrations/mappings?${q({ tenantId, clientId })}`, { headers: await authHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      return data.mappings as ClientFolderMapping[];
    } catch {
      return [];
    }
  },

  linkClientFolder: async (
    tenantId: string, clientId: string, provider: DriveProvider, folderId: string, folderUrl?: string,
  ): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/integrations/mappings`, {
      method: 'POST',
      headers: await authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ tenantId, clientId, provider, folderId, folderUrl }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Verknüpfen fehlgeschlagen.');
  },

  unlinkClientFolder: async (tenantId: string, clientId: string, provider: DriveProvider): Promise<void> => {
    await fetch(`${API_BASE}/api/integrations/mappings?${q({ tenantId, clientId, provider })}`, { method: 'DELETE', headers: await authHeaders() });
  },
};
