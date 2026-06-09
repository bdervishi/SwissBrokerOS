import { supabase } from '../lib/supabase';
import { API_BASE } from './integrations';

async function authHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export interface CallOutcome {
  summary?: string;
  sentiment?: string;
  intent?: string;
  actions?: { type: string; title: string; dueInDays?: number }[];
}

export interface ProcessResult {
  callId?: string;
  summary?: string;
  outcome?: CallOutcome;
  created?: { notes: number; events: number };
}

export const callsApi = {
  // Transcript -> AI summary + follow-up actions (persisted server-side).
  process: async (params: {
    tenantId: string; clientId?: string; transcript: string; toNumber?: string; consentCaptured?: boolean;
  }): Promise<ProcessResult> => {
    const res = await fetch(`${API_BASE}/api/calls/process`, {
      method: 'POST',
      headers: await authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Verarbeitung fehlgeschlagen.');
    return res.json();
  },

  list: async (tenantId: string, clientId?: string) => {
    const qp = new URLSearchParams({ tenantId, ...(clientId ? { clientId } : {}) });
    const res = await fetch(`${API_BASE}/api/calls?${qp.toString()}`, { headers: await authHeaders() });
    if (!res.ok) return [];
    return (await res.json()).calls;
  },
};
