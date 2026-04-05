import { createClient } from '@/src/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Phase 5: Profile API Extension
 * Returns the student profile along with their current skill mastery data.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Identity Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Profile and Mastery Data in parallel for optimal response time
    const [profileResult, masteryResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(),
      supabase
        .from('student_skill_mastery')
        .select('*')
        .eq('user_id', user.id)
    ]);

    if (profileResult.error) throw profileResult.error;
    if (masteryResult.error) throw masteryResult.error;

    return NextResponse.json({
      ...profileResult.data,
      mastery: masteryResult.data || []
    });
  } catch (error: any) {
    console.error('[PROFILE_GET_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}