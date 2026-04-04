import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './env';

function getSupabaseServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    process.env.SERVICE_ROLE_KEY?.trim() ||
    null
  );
}

export function hasSupabaseServiceRoleEnv() {
  return Boolean(getSupabaseServiceRoleKey());
}

export function createAdminClient() {
  const { supabaseUrl } = getSupabaseEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!serviceRoleKey) {
    throw new Error(
      'A Supabase service role key is missing. Set SUPABASE_SERVICE_ROLE_KEY to enable full account deletion.',
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
