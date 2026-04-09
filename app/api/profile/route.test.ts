import assert from 'node:assert/strict';
import test from 'node:test';
import { GET, PUT, profileRouteDeps } from './route';
import { defaultStudentProfile, type StudentProfile } from '@/src/features/dashboard/student-profile-model';

const sampleProfile: StudentProfile = {
  ...defaultStudentProfile,
  name: 'Harpreet Singh',
  classDesignation: 'Undergraduate',
  userRole: 'College Student (Undergraduate)',
  ageRange: '19-22',
  primaryLearningGoals: ['Web Development'],
  learningPace: 'Focused',
  onboardingCompleted: true,
  onboardingCompletedAt: '2026-04-07T12:00:00.000Z',
};

test('PUT /api/profile rejects invalid payloads', async (t) => {
  const originalDeps = { ...profileRouteDeps };
  t.after(() => Object.assign(profileRouteDeps, originalDeps));

  profileRouteDeps.normalizeStudentProfileInput = () => null;

  const response = await PUT(
    new Request('http://localhost/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nope: true }),
    }),
  );
  const data = (await response.json()) as { error?: string };

  assert.equal(response.status, 400);
  assert.match(data.error || '', /invalid student profile payload/i);
});

test('PUT /api/profile returns 401 when there is no authenticated user', async (t) => {
  const originalDeps = { ...profileRouteDeps };
  t.after(() => Object.assign(profileRouteDeps, originalDeps));

  profileRouteDeps.normalizeStudentProfileInput = () => sampleProfile;
  profileRouteDeps.updateAuthenticatedProfile = async () => null;

  const response = await PUT(
    new Request('http://localhost/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleProfile),
    }),
  );
  const data = (await response.json()) as { error?: string };

  assert.equal(response.status, 401);
  assert.match(data.error || '', /unauthorized/i);
});

test('PUT /api/profile returns the saved profile and default profile', async (t) => {
  const originalDeps = { ...profileRouteDeps };
  t.after(() => Object.assign(profileRouteDeps, originalDeps));

  profileRouteDeps.normalizeStudentProfileInput = () => sampleProfile;
  profileRouteDeps.updateAuthenticatedProfile = async () => ({
    user: { id: 'user-123', email: 'harpreet@example.com' } as never,
    profile: sampleProfile,
    defaultProfile: sampleProfile,
    supportsOnboardingSchema: true,
    supportsEnhancedOnboardingSchema: true,
  });

  const response = await PUT(
    new Request('http://localhost/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleProfile),
    }),
  );
  const data = (await response.json()) as {
    profile?: StudentProfile;
    defaultProfile?: StudentProfile;
  };

  assert.equal(response.status, 200);
  assert.equal(data.profile?.name, 'Harpreet Singh');
  assert.deepEqual(data.defaultProfile, sampleProfile);
});

test('GET /api/profile returns unauthorized when there is no authenticated user', async (t) => {
  const originalDeps = { ...profileRouteDeps };
  t.after(() => Object.assign(profileRouteDeps, originalDeps));

  profileRouteDeps.createClient = async () =>
    ({
      auth: {
        getUser: async () => ({
          data: { user: null },
          error: null,
        }),
      },
    }) as never;

  const response = await GET();
  const data = (await response.json()) as { error?: string };

  assert.equal(response.status, 401);
  assert.match(data.error || '', /unauthorized/i);
});
