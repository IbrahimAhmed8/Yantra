import assert from 'node:assert/strict';
import test from 'node:test';
import { POST, dashboardGenerateRouteDeps } from './route';
import { buildDeterministicDashboardSnapshot } from '@/src/features/dashboard/student-dashboard-generation';
import { defaultStudentProfile, type StudentProfile } from '@/src/features/dashboard/student-profile-model';

type AuthenticatedProfileResult = NonNullable<Awaited<ReturnType<typeof dashboardGenerateRouteDeps.getAuthenticatedProfile>>>;

const sampleProfile: StudentProfile = {
  ...defaultStudentProfile,
  name: 'Asha Rao',
  classDesignation: 'Undergraduate',
  userRole: 'College Student (Undergraduate)',
  ageRange: '19-22',
  primaryLearningGoals: ['Artificial Intelligence & ML'],
  learningPace: 'Focused',
  onboardingCompleted: true,
  onboardingCompletedAt: '2026-04-03T00:00:00.000Z',
};

const authenticatedProfile: AuthenticatedProfileResult = {
  user: { id: 'user-123', email: 'asha@example.com' } as AuthenticatedProfileResult['user'],
  profile: sampleProfile,
  defaultProfile: sampleProfile,
  supportsOnboardingSchema: true,
  supportsEnhancedOnboardingSchema: true,
};

test('POST /api/dashboard/generate persists the generated roadmap and metadata', async (t) => {
  const originalDeps = { ...dashboardGenerateRouteDeps };
  t.after(() => Object.assign(dashboardGenerateRouteDeps, originalDeps));

  let persistedSnapshot: Record<string, unknown> | null = null;
  let savedMetadata: Record<string, unknown> | null = null;

  const snapshot = buildDeterministicDashboardSnapshot(sampleProfile, null);

  dashboardGenerateRouteDeps.hasSupabaseEnv = () => true;
  dashboardGenerateRouteDeps.getAuthenticatedProfile = async () => authenticatedProfile;
  dashboardGenerateRouteDeps.getAuthenticatedPersonalizationProfile = async () => null;
  dashboardGenerateRouteDeps.generateDashboardSnapshot = async (profile, personalization) => {
    assert.equal(profile.name, 'Asha Rao');
    assert.equal(personalization, null);

    return {
      snapshot: {
        ...snapshot,
        provider: 'deterministic-dashboard-fallback',
      },
      fallbackUsed: true,
    };
  };
  dashboardGenerateRouteDeps.persistDashboardSnapshotForUser = async (userId, data) => {
    assert.equal(userId, 'user-123');
    persistedSnapshot = data as Record<string, unknown>;
    return true;
  };
  dashboardGenerateRouteDeps.upsertAuthenticatedPersonalizationProfile = async (input) => {
    savedMetadata = input as Record<string, unknown>;
    return null;
  };

  const response = await POST();
  const data = (await response.json()) as {
    fallbackUsed?: boolean;
    learnerSummary?: string;
    provider?: string;
  };

  assert.equal(response.status, 200);
  assert.equal(data.fallbackUsed, true);
  assert.equal(data.provider, 'deterministic-dashboard-fallback');
  assert.match(data.learnerSummary || '', /starting an artificial intelligence & ml path/i);
  assert.equal(
    (persistedSnapshot?.path as { nextSessionDateDay?: string } | undefined)?.nextSessionDateDay,
    '--',
  );
  assert.equal(
    (persistedSnapshot?.path as { weeklyCompletedSessions?: number } | undefined)?.weeklyCompletedSessions,
    0,
  );
  assert.equal(savedMetadata?.lastModelProvider, 'deterministic-dashboard-fallback');
  assert.equal(typeof savedMetadata?.lastGeneratedAt, 'string');
});

test('POST /api/dashboard/generate returns 500 when the snapshot cannot be persisted', async (t) => {
  const originalDeps = { ...dashboardGenerateRouteDeps };
  t.after(() => Object.assign(dashboardGenerateRouteDeps, originalDeps));

  dashboardGenerateRouteDeps.hasSupabaseEnv = () => true;
  dashboardGenerateRouteDeps.getAuthenticatedProfile = async () => authenticatedProfile;
  dashboardGenerateRouteDeps.getAuthenticatedPersonalizationProfile = async () => null;
  dashboardGenerateRouteDeps.generateDashboardSnapshot = async () => ({
    snapshot: buildDeterministicDashboardSnapshot(sampleProfile, null),
    fallbackUsed: false,
  });
  dashboardGenerateRouteDeps.persistDashboardSnapshotForUser = async () => false;
  dashboardGenerateRouteDeps.upsertAuthenticatedPersonalizationProfile = async () => null;

  const response = await POST();
  const data = (await response.json()) as { error?: string };

  assert.equal(response.status, 500);
  assert.match(data.error || '', /unable to persist the generated dashboard snapshot/i);
});
