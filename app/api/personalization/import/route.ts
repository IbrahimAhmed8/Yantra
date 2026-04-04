import { NextResponse } from 'next/server';
import {
  normalizePersonalizationImportUpdateInput,
  type StudentPersonalizationProfile,
} from '@/src/features/dashboard/student-personalization-model';
import { hasSupabaseEnv } from '@/src/lib/supabase/env';
import { getAuthenticatedProfile } from '@/src/lib/supabase/profiles';
import {
  getAuthenticatedPersonalizationProfile,
  upsertAuthenticatedPersonalizationProfile,
} from '@/src/lib/supabase/personalization';

export const runtime = 'nodejs';

export const personalizationImportRouteDeps = {
  hasSupabaseEnv,
  getAuthenticatedProfile,
  getAuthenticatedPersonalizationProfile,
  upsertAuthenticatedPersonalizationProfile,
};

function serializeProfile(profile: StudentPersonalizationProfile | null) {
  return {
    profile,
  };
}

export async function GET() {
  if (!personalizationImportRouteDeps.hasSupabaseEnv()) {
    return NextResponse.json({ error: 'Supabase is not configured yet.' }, { status: 500 });
  }

  const profileResult = await personalizationImportRouteDeps.getAuthenticatedProfile();

  if (!profileResult) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const profile = await personalizationImportRouteDeps.getAuthenticatedPersonalizationProfile();
    return NextResponse.json(serializeProfile(profile));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load personalization settings.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!personalizationImportRouteDeps.hasSupabaseEnv()) {
    return NextResponse.json({ error: 'Supabase is not configured yet.' }, { status: 500 });
  }

  const profileResult = await personalizationImportRouteDeps.getAuthenticatedProfile();

  if (!profileResult) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const input = normalizePersonalizationImportUpdateInput(body);

    if (!input) {
      return NextResponse.json({ error: 'Invalid personalization review payload.' }, { status: 400 });
    }

    const profile =
      input.dismissed === true
        ? await personalizationImportRouteDeps.upsertAuthenticatedPersonalizationProfile({
            dismissedAt: new Date().toISOString(),
          })
        : await personalizationImportRouteDeps.upsertAuthenticatedPersonalizationProfile({
            sourceProvider: input.sourceProvider,
            sourcePromptVersion: input.sourcePromptVersion,
            approvedFacts: input.approvedFacts,
            learnerSummary: input.learnerSummary,
            confidenceSummary: input.confidenceSummary,
            assumptions: input.assumptions,
            dismissedAt: null,
          });

    return NextResponse.json(serializeProfile(profile));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save personalization settings.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
