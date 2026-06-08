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

// createClient tolerates empty strings (it only fails on an actual request),
// so exporting a client even when unconfigured keeps imports simple.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
