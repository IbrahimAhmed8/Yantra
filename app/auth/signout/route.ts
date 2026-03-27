import { redirect } from 'next/navigation';
import { hasSupabaseEnv } from '@/src/lib/supabase/env';
import { createClient } from '@/src/lib/supabase/server';

export async function GET() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect('/login?message=You%20have%20been%20signed%20out.&kind=info');
}
