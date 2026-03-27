import { NextResponse } from 'next/server';
import { hasSupabaseEnv } from '@/src/lib/supabase/env';
import { getAuthenticatedProfile, updateAuthenticatedProfile } from '@/src/lib/supabase/profiles';
import { normalizeStudentProfileInput } from '@/src/features/dashboard/student-profile-model';

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: 'Supabase is not configured yet.' }, { status: 500 });
  }

  try {
    const result = await getAuthenticatedProfile();

    if (!result) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    return NextResponse.json({
      profile: result.profile,
      defaultProfile: result.defaultProfile,
      email: result.user.email ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load the current profile.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: 'Supabase is not configured yet.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const profile = normalizeStudentProfileInput(body);

    if (!profile) {
      return NextResponse.json({ error: 'Invalid student profile payload.' }, { status: 400 });
    }

    const result = await updateAuthenticatedProfile(profile);

    if (!result) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    return NextResponse.json({
      profile: result.profile,
      defaultProfile: result.defaultProfile,
      email: result.user.email ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save the current profile.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
