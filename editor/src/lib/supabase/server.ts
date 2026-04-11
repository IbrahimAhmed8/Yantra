import type { SupabaseClient } from '@supabase/supabase-js';

export async function createClient(): Promise<SupabaseClient> {
  throw new Error('Supabase server access is unavailable in this local editor preview.');
}

export function createAnonClient(): SupabaseClient {
  throw new Error('Supabase anon access is unavailable in this local editor preview.');
}
