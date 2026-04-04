import { NextResponse } from 'next/server';
import { hasSupabaseEnv } from '@/src/lib/supabase/env';
import { getAuthenticatedProfile } from '@/src/lib/supabase/profiles';
import { extractPersonalizationFromSummary } from '@/src/lib/yantra-personalization';
import { normalizePersonalizationExtractInput } from '@/src/features/dashboard/student-personalization-model';

export const runtime = 'nodejs';

export const personalizationImportExtractRouteDeps = {
  hasSupabaseEnv,
  getAuthenticatedProfile,
  extractPersonalizationFromSummary,
};

export async function POST(request: Request) {
  if (!personalizationImportExtractRouteDeps.hasSupabaseEnv()) {
    return NextResponse.json({ error: 'Supabase is not configured yet.' }, { status: 500 });
  }

  const profileResult = await personalizationImportExtractRouteDeps.getAuthenticatedProfile();

  if (!profileResult) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const input = normalizePersonalizationExtractInput(body);

    if (!input) {
      return NextResponse.json({ error: 'Invalid personalization import payload.' }, { status: 400 });
    }

    const extraction = await personalizationImportExtractRouteDeps.extractPersonalizationFromSummary(input);

    return NextResponse.json(extraction);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to extract personalization facts.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
