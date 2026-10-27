import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Same Supabase project as the customer site (Mai-Hu-nh-Th-Tuy-t).
const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
