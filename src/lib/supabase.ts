
import { createClient } from '@supabase/supabase-js';

// Environment variables must be set in .env file
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Key missing. App will run in Mock Mode or fail if DB is required.');
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);
