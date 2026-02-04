
import { createClient } from '@supabase/supabase-js';

// Environment variables must be set in .env file
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
const useMock = (import.meta as any).env.VITE_USE_MOCK_DATA;

// Debug Logging
console.log(`[System] Initializing Supabase... Mock Mode: ${useMock}`);
if (supabaseUrl) console.log(`[System] Supabase URL found: ${supabaseUrl.substring(0, 15)}...`);
else console.warn('[System] No Supabase URL found in environment variables.');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Key missing. App will run in Mock Mode or fail if DB is required.');
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);
