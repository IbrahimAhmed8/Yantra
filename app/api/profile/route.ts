import { normalizeStudentProfileInput } from '@/src/features/dashboard/student-profile-model';
import { updateAuthenticatedProfile } from '@/src/lib/supabase/profiles';
import { createClient } from '@/src/lib/supabase/server';
import { NextResponse } from 'next/server';

export const profileRouteDeps = {
  createClient,
  normalizeStudentProfileInput,
  updateAuthenticatedProfile,
};

/**
 * Phase 5: Profile API Extension
 * Returns the student profile along with their current skill mastery data.
 */
export async function GET() {
  try {
    const supabase = await profileRouteDeps.createClient();

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

export async function PUT(request: Request) {
  try {
    const payload = profileRouteDeps.normalizeStudentProfileInput(await request.json().catch(() => null));

    if (!payload) {
      return NextResponse.json({ error: 'Invalid student profile payload.' }, { status: 400 });
    }

    const result = await profileRouteDeps.updateAuthenticatedProfile(payload);

    if (!result) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      profile: result.profile,
      defaultProfile: result.defaultProfile,
    });
  } catch (error: any) {
    console.error('[PROFILE_PUT_ERROR]', error);
    return NextResponse.json(
      { error: error?.message || 'Yantra could not save the student profile right now.' },
      { status: 500 },
    );
  }
}
