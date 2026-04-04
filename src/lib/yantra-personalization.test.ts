import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDeterministicDashboardSnapshot } from '@/src/features/dashboard/student-dashboard-generation';
import { defaultStudentProfile, type StudentProfile } from '@/src/features/dashboard/student-profile-model';
import { generateDashboardSnapshot } from './yantra-personalization';

const sampleProfile: StudentProfile = {
  ...defaultStudentProfile,
  name: 'Anierse',
  skillLevel: 'Beginner',
  userRole: 'College Student (Undergraduate)',
  ageRange: '19-22',
  primaryLearningGoals: ['Web Development'],
  learningPace: 'Focused',
  onboardingCompleted: true,
  onboardingCompletedAt: '2026-04-04T00:00:00.000Z',
};

test('generateDashboardSnapshot prefers the local deterministic fallback over local AI fallback payloads', async (t) => {
  const originalFetch = global.fetch;
  t.after(() => {
    global.fetch = originalFetch;
  });

  global.fetch = (async () =>
    ({
      ok: true,
      json: async () => ({
        learner_summary: 'Local fallback summary',
        recommended_track: 'Machine Learning Starter Track',
        recommended_action: {
          title: 'Enter Python Room',
          description: 'Use the first room to give Yantra real signals.',
          prompt: 'Open the Python Room and tell me what to focus on.',
        },
        confidence_summary: 'Built from onboarding answers only.',
        assumptions: ['Primary goal assumed from onboarding: Web Development.'],
        path: {
          path_title: 'Machine Learning Starter Track',
          path_description: 'Fallback path',
          path_status_label: 'Starter Path',
          path_progress: 8,
          current_focus: 'Python, data intuition, and model vocabulary',
          recommended_action_title: 'Enter Python Room',
          recommended_action_description: 'Use the first room to give Yantra real signals.',
          recommended_action_prompt: 'Open the Python Room and tell me what to focus on.',
          learning_track_title: 'Machine Learning Starter Track',
          learning_track_description: 'Fallback description',
          completion_estimate_label: '7-week arc',
          mastery_progress: 8,
          mastery_unlocked_count: 1,
          mastery_total_count: 6,
          next_session_date_day: '--',
          next_session_date_month: 'Suggested',
          next_session_title: 'Enter Python Room',
          next_session_day_label: 'No live schedule yet',
          next_session_time_label: 'Pick a room to begin',
          next_session_instructor_name: 'Yantra Guide',
          next_session_instructor_role: 'AI Coach',
          next_session_instructor_image_url: '',
          weekly_completed_sessions: 0,
          weekly_change_label: 'No prior week yet',
          momentum_summary: 'No streak yet',
          focus_summary: 'Python, data intuition, and model vocabulary',
          consistency_summary: '0 sessions',
        },
        skills: [
          {
            skill_key: 'logic-core',
            title: 'Programming Logic',
            description: 'Fallback skill',
            level_label: 'Starting',
            progress: 16,
            icon_key: 'logic',
            tone_key: 'primary',
            locked: false,
            sort_order: 1,
          },
        ],
        curriculum_nodes: [
          {
            node_key: 'module-01',
            module_label: 'Module 01',
            title: 'Programming Logic Core',
            description: 'Fallback node',
            status_label: 'Start here',
            unlocked: true,
            sort_order: 1,
          },
        ],
        recommended_rooms: [
          {
            room_key: 'python-room',
            title: 'Python Room',
            description: 'Fallback room',
            status_label: 'Start Here',
            cta_label: 'Enter Room',
            prompt: 'Open the Python Room and tell me what to focus on.',
            featured: true,
            texture_key: 'python-room',
            sort_order: 1,
          },
        ],
        weekly_activity: [
          {
            day_key: 'mon',
            day_label: 'MON',
            container_height: 96,
            fill_height: 0,
            highlighted: false,
            sort_order: 1,
          },
        ],
        provider: 'local-dashboard-generate',
        model_used: null,
      }),
    }) as Response);

  const result = await generateDashboardSnapshot(sampleProfile, null);
  const fallback = buildDeterministicDashboardSnapshot(sampleProfile, null);

  assert.equal(result.fallbackUsed, true);
  assert.equal(result.snapshot.path.learningTrackTitle, fallback.path.learningTrackTitle);
  assert.notEqual(result.snapshot.path.learningTrackTitle, 'Machine Learning Starter Track');
  assert.equal(result.snapshot.skills[0]?.title, 'HTML Structure');
});

test('generateDashboardSnapshot accepts validated Gemini roadmap payloads', async (t) => {
  const originalFetch = global.fetch;
  t.after(() => {
    global.fetch = originalFetch;
  });

  const snapshot = buildDeterministicDashboardSnapshot(sampleProfile, null);

  global.fetch = (async () =>
    ({
      ok: true,
      json: async () => ({
        learner_summary: snapshot.learnerSummary,
        recommended_track: snapshot.recommendedTrack,
        recommended_action: snapshot.recommendedAction,
        confidence_summary: snapshot.confidenceSummary,
        assumptions: snapshot.assumptions,
        path: {
          path_title: snapshot.path.pathTitle,
          path_description: snapshot.path.pathDescription,
          path_status_label: snapshot.path.pathStatusLabel,
          path_progress: snapshot.path.pathProgress,
          current_focus: snapshot.path.currentFocus,
          recommended_action_title: snapshot.path.recommendedActionTitle,
          recommended_action_description: snapshot.path.recommendedActionDescription,
          recommended_action_prompt: snapshot.path.recommendedActionPrompt,
          learning_track_title: snapshot.path.learningTrackTitle,
          learning_track_description: snapshot.path.learningTrackDescription,
          completion_estimate_label: snapshot.path.completionEstimateLabel,
          mastery_progress: snapshot.path.masteryProgress,
          mastery_unlocked_count: snapshot.path.masteryUnlockedCount,
          mastery_total_count: snapshot.path.masteryTotalCount,
          next_session_date_day: snapshot.path.nextSessionDateDay,
          next_session_date_month: snapshot.path.nextSessionDateMonth,
          next_session_title: snapshot.path.nextSessionTitle,
          next_session_day_label: snapshot.path.nextSessionDayLabel,
          next_session_time_label: snapshot.path.nextSessionTimeLabel,
          next_session_instructor_name: snapshot.path.nextSessionInstructorName,
          next_session_instructor_role: snapshot.path.nextSessionInstructorRole,
          next_session_instructor_image_url: snapshot.path.nextSessionInstructorImageUrl,
          weekly_completed_sessions: snapshot.path.weeklyCompletedSessions,
          weekly_change_label: snapshot.path.weeklyChangeLabel,
          momentum_summary: snapshot.path.momentumSummary,
          focus_summary: snapshot.path.focusSummary,
          consistency_summary: snapshot.path.consistencySummary,
        },
        skills: snapshot.skills.map((skill) => ({
          skill_key: skill.skillKey,
          title: skill.title,
          description: skill.description,
          level_label: skill.levelLabel,
        })),
        curriculum_nodes: snapshot.curriculumNodes.map((node) => ({
          node_key: node.nodeKey,
          module_label: node.moduleLabel,
          title: node.title,
          description: node.description,
          status_label: node.statusLabel,
        })),
        provider: 'gemini-dashboard-generate',
        model_used: 'gemini-2.5-pro',
      }),
    }) as Response);

  const result = await generateDashboardSnapshot(sampleProfile, null);

  assert.equal(result.fallbackUsed, false);
  assert.equal(result.snapshot.provider, 'gemini-dashboard-generate');
  assert.equal(result.snapshot.modelUsed, 'gemini-2.5-pro');
  assert.equal(result.snapshot.path.learningTrackTitle, snapshot.path.learningTrackTitle);
  assert.deepEqual(result.snapshot.rooms, snapshot.rooms);
  assert.deepEqual(result.snapshot.weeklyActivity, snapshot.weeklyActivity);
});
