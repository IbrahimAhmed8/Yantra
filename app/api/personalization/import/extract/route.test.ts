import assert from 'node:assert/strict';
import test from 'node:test';
import { POST, personalizationImportExtractRouteDeps } from './route';
import { defaultStudentProfile, type StudentProfile } from '@/src/features/dashboard/student-profile-model';

type AuthenticatedProfileResult = NonNullable<
  Awaited<ReturnType<typeof personalizationImportExtractRouteDeps.getAuthenticatedProfile>>
>;

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

test('POST /api/personalization/import/extract rejects invalid payloads', async (t) => {
  const originalDeps = { ...personalizationImportExtractRouteDeps };
  t.after(() => Object.assign(personalizationImportExtractRouteDeps, originalDeps));

  personalizationImportExtractRouteDeps.hasSupabaseEnv = () => true;
  personalizationImportExtractRouteDeps.getAuthenticatedProfile = async () => authenticatedProfile;

  const response = await POST(
    new Request('http://localhost/api/personalization/import/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceProvider: 'chatgpt', sourceSummary: '' }),
    }),
  );
  const data = (await response.json()) as { error?: string };

  assert.equal(response.status, 400);
  assert.match(data.error || '', /invalid personalization import payload/i);
});

test('POST /api/personalization/import/extract returns structured extraction data', async (t) => {
  const originalDeps = { ...personalizationImportExtractRouteDeps };
  t.after(() => Object.assign(personalizationImportExtractRouteDeps, originalDeps));

  personalizationImportExtractRouteDeps.hasSupabaseEnv = () => true;
  personalizationImportExtractRouteDeps.getAuthenticatedProfile = async () => authenticatedProfile;
  personalizationImportExtractRouteDeps.extractPersonalizationFromSummary = async (input) => {
    assert.equal(input.sourceProvider, 'gemini');
    assert.match(input.sourceSummary, /confirmed facts/i);

    return {
      sourceProvider: 'gemini',
      sourcePromptVersion: 'ai-memory-import-v1',
      approvedFacts: {
        confirmedFacts: ['Wants to build with AI.'],
        likelyPreferences: ['Learns best by shipping small projects.'],
        uncertainInferences: ['May want more data work later.'],
        missingInformation: ['Has not confirmed weekly availability.'],
        normalized: {
          targetGoals: ['Artificial Intelligence & ML'],
          inferredSkillLevel: 'Beginner',
          priorProjects: ['Built a simple calculator app.'],
          topicsOfInterest: ['Computer vision'],
          timeAvailability: 'Focused',
          preferredLearningStyle: ['Hands-on learning'],
          constraints: ['Limited weekday time'],
        },
      },
      learnerSummary: 'Asha is starting an AI path and prefers project-based learning.',
      confidenceSummary: 'Confirmed goals are strong; time availability still needs review.',
      assumptions: ['Weekly availability is still inferred.'],
      provider: 'local-personalization-extract',
      modelUsed: null,
    };
  };

  const response = await POST(
    new Request('http://localhost/api/personalization/import/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceProvider: 'gemini',
        sourceSummary: 'Confirmed Facts:\n- Wants to build with AI.',
      }),
    }),
  );
  const data = (await response.json()) as {
    learnerSummary?: string;
    approvedFacts?: { normalized?: { targetGoals?: string[] } };
  };

  assert.equal(response.status, 200);
  assert.match(data.learnerSummary || '', /starting an ai path/i);
  assert.deepEqual(data.approvedFacts?.normalized?.targetGoals, ['Artificial Intelligence & ML']);
});
