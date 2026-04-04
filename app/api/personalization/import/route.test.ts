import assert from 'node:assert/strict';
import test from 'node:test';
import { GET, PUT, personalizationImportRouteDeps } from './route';
import { defaultStudentProfile, type StudentProfile } from '@/src/features/dashboard/student-profile-model';

type AuthenticatedProfileResult = NonNullable<Awaited<ReturnType<typeof personalizationImportRouteDeps.getAuthenticatedProfile>>>;

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
  user: {
    id: 'user-123',
    email: 'asha@example.com',
  } as AuthenticatedProfileResult['user'],
  profile: sampleProfile,
  defaultProfile: sampleProfile,
  supportsOnboardingSchema: true,
  supportsEnhancedOnboardingSchema: true,
};

test('GET /api/personalization/import returns the current profile', async (t) => {
  const originalDeps = { ...personalizationImportRouteDeps };
  t.after(() => Object.assign(personalizationImportRouteDeps, originalDeps));

  personalizationImportRouteDeps.hasSupabaseEnv = () => true;
  personalizationImportRouteDeps.getAuthenticatedProfile = async () => authenticatedProfile;
  personalizationImportRouteDeps.getAuthenticatedPersonalizationProfile = async () => ({
    sourceProvider: 'chatgpt',
    sourcePromptVersion: 'ai-memory-import-v1',
    approvedFacts: null,
    learnerSummary: 'Asha is starting from onboarding answers only.',
    confidenceSummary: 'Low-confidence starter summary.',
    assumptions: [],
    dismissedAt: null,
    lastGeneratedAt: null,
    lastModelProvider: null,
    lastModelName: null,
    createdAt: null,
    updatedAt: null,
  });

  const response = await GET();
  const data = (await response.json()) as { profile?: { learnerSummary?: string } };

  assert.equal(response.status, 200);
  assert.match(data.profile?.learnerSummary || '', /onboarding answers only/i);
});

test('PUT /api/personalization/import persists approved facts without raw pasted text', async (t) => {
  const originalDeps = { ...personalizationImportRouteDeps };
  t.after(() => Object.assign(personalizationImportRouteDeps, originalDeps));

  let savedPayload: Record<string, unknown> | null = null;

  personalizationImportRouteDeps.hasSupabaseEnv = () => true;
  personalizationImportRouteDeps.getAuthenticatedProfile = async () => authenticatedProfile;
  personalizationImportRouteDeps.upsertAuthenticatedPersonalizationProfile = async (input) => {
    savedPayload = input as Record<string, unknown>;

    return {
      sourceProvider: input.sourceProvider ?? null,
      sourcePromptVersion: input.sourcePromptVersion ?? null,
      approvedFacts: input.approvedFacts ?? null,
      learnerSummary: input.learnerSummary ?? '',
      confidenceSummary: input.confidenceSummary ?? '',
      assumptions: input.assumptions ?? [],
      dismissedAt: input.dismissedAt ?? null,
      lastGeneratedAt: input.lastGeneratedAt ?? null,
      lastModelProvider: input.lastModelProvider ?? null,
      lastModelName: input.lastModelName ?? null,
      createdAt: null,
      updatedAt: null,
    };
  };

  const response = await PUT(
    new Request('http://localhost/api/personalization/import', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceProvider: 'chatgpt',
        sourcePromptVersion: 'ai-memory-import-v1',
        sourceSummary: 'Raw external AI paste should never be stored.',
        approvedFacts: {
          confirmedFacts: ['Wants to build AI projects.'],
          likelyPreferences: ['Learns best by doing.'],
          uncertainInferences: ['Could enjoy data-heavy work later.'],
          missingInformation: ['Has not confirmed weekend study time.'],
          normalized: {
            targetGoals: ['Artificial Intelligence & ML'],
            inferredSkillLevel: 'Beginner',
            priorProjects: ['Calculator app'],
            topicsOfInterest: ['Vision'],
            timeAvailability: 'Focused',
            preferredLearningStyle: ['Hands-on'],
            constraints: ['Short weekday sessions'],
          },
        },
        learnerSummary: 'Asha is starting an AI roadmap with project-oriented preferences.',
        confidenceSummary: 'Confirmed goal is strong, but study-time constraints need review.',
        assumptions: ['Weekend availability is still unclear.'],
      }),
    }),
  );
  const data = (await response.json()) as { profile?: { approvedFacts?: { confirmedFacts?: string[] } } };

  assert.equal(response.status, 200);
  assert.deepEqual(data.profile?.approvedFacts?.confirmedFacts, ['Wants to build AI projects.']);
  assert.ok(savedPayload);
  assert.equal('sourceSummary' in (savedPayload || {}), false);
  assert.deepEqual(savedPayload?.approvedFacts, {
    confirmedFacts: ['Wants to build AI projects.'],
    likelyPreferences: ['Learns best by doing.'],
    uncertainInferences: ['Could enjoy data-heavy work later.'],
    missingInformation: ['Has not confirmed weekend study time.'],
    normalized: {
      targetGoals: ['Artificial Intelligence & ML'],
      inferredSkillLevel: 'Beginner',
      priorProjects: ['Calculator app'],
      topicsOfInterest: ['Vision'],
      timeAvailability: 'Focused',
      preferredLearningStyle: ['Hands-on'],
      constraints: ['Short weekday sessions'],
    },
  });
});
