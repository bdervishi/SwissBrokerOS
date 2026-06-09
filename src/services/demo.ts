import { API_BASE } from './integrations';

export const demoApi = {
  // Returns { eligible } for an email. Server only creates an account for
  // allow-listed emails; the response is otherwise generic.
  requestAccess: async (email: string): Promise<{ eligible: boolean }> => {
    try {
      const res = await fetch(`${API_BASE}/api/demo/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) return { eligible: false };
      const data = await res.json();
      return { eligible: Boolean(data.eligible) };
    } catch {
      return { eligible: false };
    }
  },
};
