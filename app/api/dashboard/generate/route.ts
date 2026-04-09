import { NextResponse } from 'next/server';
import { hasSupabaseEnv } from '@/src/lib/supabase/env';
import { getAuthenticatedProfile } from '@/src/lib/supabase/profiles';
import { persistDashboardSnapshotForUser } from '@/src/lib/supabase/dashboard';
import {
  getAuthenticatedPersonalizationProfile,
  upsertAuthenticatedPersonalizationProfile,
} from '@/src/lib/supabase/personalization';
import { generateDashboardSnapshot } from '@/src/lib/yantra-personalization';

export const runtime = 'nodejs';

export const dashboardGenerateRouteDeps = {
  hasSupabaseEnv,
  getAuthenticatedProfile,
  getAuthenticatedPersonalizationProfile,
  generateDashboardSnapshot,
  persistDashboardSnapshotForUser,
  upsertAuthenticatedPersonalizationProfile,
};

export async function POST() {
  if (!dashboardGenerateRouteDeps.hasSupabaseEnv()) {
    return NextResponse.json({ error: 'Supabase is not configured yet.' }, { status: 500 });
  }

  const profileResult = await dashboardGenerateRouteDeps.getAuthenticatedProfile();

  if (!profileResult) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const personalization = await dashboardGenerateRouteDeps.getAuthenticatedPersonalizationProfile();
    const generation = await dashboardGenerateRouteDeps.generateDashboardSnapshot(profileResult.profile, personalization);

    const persisted = await dashboardGenerateRouteDeps.persistDashboardSnapshotForUser(profileResult.user.id, {
      path: generation.snapshot.path,
      skills: generation.snapshot.skills,
      curriculumNodes: generation.snapshot.curriculumNodes,
      rooms: generation.snapshot.rooms,
      weeklyActivity: generation.snapshot.weeklyActivity,
    }, true); // Pass true to wipe legacy/stale track data and ensure a clean slate

    if (!persisted) {
      throw new Error('Unable to persist the generated dashboard snapshot.');
    }

    await dashboardGenerateRouteDeps.upsertAuthenticatedPersonalizationProfile({
      learnerSummary: personalization?.learnerSummary?.trim()
        ? personalization.learnerSummary
        : generation.snapshot.learnerSummary,
      confidenceSummary: personalization?.confidenceSummary?.trim()
        ? personalization.confidenceSummary
        : generation.snapshot.confidenceSummary,
      assumptions:
        personalization?.assumptions && personalization.assumptions.length > 0
          ? personalization.assumptions
          : generation.snapshot.assumptions,
      lastGeneratedAt: new Date().toISOString(),
      lastModelProvider: generation.snapshot.provider,
      lastModelName: generation.snapshot.modelUsed,
    });

    return NextResponse.json({
      provider: generation.snapshot.provider,
      modelUsed: generation.snapshot.modelUsed,
      fallbackUsed: generation.fallbackUsed,
      learnerSummary: generation.snapshot.learnerSummary,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate the dashboard roadmap.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
