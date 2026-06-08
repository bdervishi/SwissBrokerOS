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
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'public-anon-placeholder-key',
);
