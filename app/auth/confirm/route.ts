import { redirect } from 'next/navigation';
import { type EmailOtpType } from '@supabase/supabase-js';
import { hasSupabaseEnv } from '@/src/lib/supabase/env';
import { createClient } from '@/src/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const next = searchParams.get('next') || '/dashboard';
  const type = searchParams.get('type') as EmailOtpType | null;

  if (!hasSupabaseEnv()) {
    redirect('/login?message=Configure%20Supabase%20first.&kind=error');
  }

  if (!tokenHash || !type) {
    redirect('/login?message=The%20confirmation%20link%20is%20invalid.&kind=error');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    redirect('/login?message=We%20could%20not%20verify%20that%20email%20link.%20Please%20try%20again.&kind=error');
  }

  redirect(next);
}
