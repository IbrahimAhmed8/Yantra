import assert from 'node:assert/strict';
import test from 'node:test';
import { buildStudentDashboardProfile, starterStudentDashboardSeed } from '@/src/features/dashboard/student-dashboard-model';
import type { StudentDashboardData } from '@/src/features/dashboard/student-dashboard-model';
import type { StudentPersonalizationProfile } from '@/src/features/dashboard/student-personalization-model';
import { defaultStudentProfile } from '@/src/features/dashboard/student-profile-model';
import { buildYantraStudentContextFromData, summarizeYantraMemory } from '@/src/lib/yantra-student-context';

test('summarizeYantraMemory keeps recent learner questions and guidance compact', () => {
  const memory = summarizeYantraMemory([
    { role: 'user', content: 'Explain gradient descent in simple words.' },
    { role: 'assistant', content: 'Gradient descent updates weights step by step to reduce error.' },
    { role: 'user', content: 'How does that connect to my dashboard focus?' },
  ]);

  assert.match(memory, /Recent learner questions:/);
  assert.match(memory, /Recent Yantra guidance:/);
  assert.ok(memory.length < 320);
});

test('buildYantraStudentContextFromData imports dashboard recommendation and memory fields', () => {
  const profile = buildStudentDashboardProfile(
    {
      ...defaultStudentProfile,
      name: 'Aarav Sharma',
      progress: 24,
      primaryLearningGoals: ['Artificial Intelligence & ML'],
    },
    'aarav@example.com',
  );

  const dashboardData: StudentDashboardData = {
    profile,
    path: starterStudentDashboardSeed.path,
    skills: starterStudentDashboardSeed.skills,
    curriculumNodes: starterStudentDashboardSeed.curriculumNodes,
    rooms: starterStudentDashboardSeed.rooms,
    weeklyActivity: starterStudentDashboardSeed.weeklyActivity,
  };

  const personalization: StudentPersonalizationProfile = {
    sourceProvider: 'chatgpt' as const,
    sourcePromptVersion: 'ai-memory-import-v1',
    approvedFacts: {
      confirmedFacts: ['Wants to build AI projects.'],
      likelyPreferences: ['Learns best through small builds.'],
      uncertainInferences: [],
      missingInformation: [],
      normalized: {
        targetGoals: ['Artificial Intelligence & ML'],
        inferredSkillLevel: 'Beginner',
        priorProjects: ['Calculator app'],
        topicsOfInterest: ['Computer vision'],
        timeAvailability: 'Focused',
        preferredLearningStyle: ['Hands-on'],
        constraints: ['Short weekday sessions'],
      },
    },
    learnerSummary: 'Aarav is focused on practical AI projects.',
    confidenceSummary: 'Goal confidence is strong; weekly availability still needs review.',
    assumptions: ['Weekly availability is inferred.'],
    dismissedAt: null,
    lastGeneratedAt: null,
    lastModelProvider: null,
    lastModelName: null,
    createdAt: null,
    updatedAt: null,
  };

  const context = buildYantraStudentContextFromData(profile, 'Yantra Dashboard', dashboardData, [
    { role: 'user', content: 'What should I learn next?' },
    { role: 'assistant', content: 'Open the Neural Net Builder next.' },
  ], personalization);

  assert.equal(context.current_path, starterStudentDashboardSeed.path.pathTitle);
  assert.equal(context.current_focus, starterStudentDashboardSeed.path.currentFocus);
  assert.equal(context.recommended_action_title, starterStudentDashboardSeed.path.recommendedActionTitle);
  assert.ok(context.strongest_skills.length > 0);
  assert.ok(context.active_rooms.length > 0);
  assert.match(context.memory_summary, /What should I learn next/i);
  assert.equal(context.approved_learner_summary, 'Aarav is focused on practical AI projects.');
  assert.deepEqual(context.approved_import_facts?.target_goals, ['Artificial Intelligence & ML']);
});
