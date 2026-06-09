import { createClient } from '@supabase/supabase-js';

// Vite exposes `VITE_`-prefixed env vars on `import.meta.env`.
const env = (import.meta as any).env || {};
const supabaseUrl: string = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey: string = env.VITE_SUPABASE_ANON_KEY || '';

/**
 * True when both a Supabase URL and anon key are present. The data layer
 * (`src/services/db.ts`) falls back to mock data whenever this is false, so the
 * app keeps working in a fresh checkout without any backend configured.
 */
export const isSupabaseConfigured: boolean = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.info('[Supabase] No URL/key configured – running on mock data.');
} else {
  console.info(`[Supabase] Connected to ${supabaseUrl.replace(/^https?:\/\//, '').slice(0, 24)}…`);
}

// createClient throws synchronously on an empty URL/key. When Supabase is not
// configured we still export a client (built from harmless placeholders) so
// importing this module never crashes the app – in mock mode no requests are
// ever sent through it.
//
// We use the PKCE flow and a real (non-hash) callback path. The app is served
// by a HashRouter, so an implicit-flow token appended to a `/#/...` route would
// produce a double hash (`/#/dashboard#access_token=…`) that supabase-js cannot
// parse. PKCE instead returns `?code=…` as a real query param on
// `/auth/callback`, which `index.tsx` exchanges for a session before mounting
// React (`detectSessionInUrl` is therefore off – we handle it explicitly).
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'public-anon-placeholder-key',
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);

/**
 * Build the e-mail redirect target for magic-link / recovery / signup-confirm
 * flows. Uses a real path (`/auth/callback`) – NOT a hash route – so Supabase
 * appends `?code=…` cleanly. `next` is where the user lands after the session
 * is established (handled in `index.tsx`).
 */
export const authCallbackUrl = (next: string): string =>
  `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
