import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDeterministicDashboardSnapshot,
  normalizeGeneratedDashboardSnapshot,
} from './student-dashboard-generation';
import { defaultStudentProfile, type StudentProfile } from './student-profile-model';

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

test('buildDeterministicDashboardSnapshot keeps new-user history honest', () => {
  const snapshot = buildDeterministicDashboardSnapshot(sampleProfile, null);

  assert.equal(snapshot.path.nextSessionDateDay, '--');
  assert.equal(snapshot.path.nextSessionDateMonth, 'Suggested');
  assert.equal(snapshot.path.nextSessionTimeLabel, 'Pick a room to begin');
  assert.equal(snapshot.path.nextSessionInstructorName, 'Yantra Guide');
  assert.equal(snapshot.path.weeklyCompletedSessions, 0);
  assert.ok(snapshot.weeklyActivity.every((bar) => bar.fillHeight === 0));
  assert.match(snapshot.confidenceSummary, /onboarding answers first/i);
});

test('buildDeterministicDashboardSnapshot gives web development learners relevant dashboard card copy', () => {
  const webSnapshot = buildDeterministicDashboardSnapshot(
    {
      ...sampleProfile,
      primaryLearningGoals: ['Web Development'],
    },
    null,
  );

  assert.equal(webSnapshot.path.learningTrackTitle, 'Web Development Starter Track');
  assert.equal(webSnapshot.curriculumNodes[0]?.title, 'HTML Structure');
  assert.equal(webSnapshot.skills[0]?.title, 'HTML Structure');
  assert.equal(webSnapshot.skills[3]?.title, 'React Foundations');
  assert.equal(webSnapshot.rooms[0]?.title, 'Python Room');
});

test('normalizeGeneratedDashboardSnapshot accepts partial snake_case dashboard copy and keeps fixed room structure', () => {
  const fallback = buildDeterministicDashboardSnapshot(sampleProfile, null);
  const normalized = normalizeGeneratedDashboardSnapshot(
    {
      learner_summary: fallback.learnerSummary,
      recommended_track: fallback.recommendedTrack,
      recommended_action: fallback.recommendedAction,
      confidence_summary: fallback.confidenceSummary,
      assumptions: fallback.assumptions,
      path: {
        path_title: fallback.path.pathTitle,
        path_description: fallback.path.pathDescription,
        path_status_label: fallback.path.pathStatusLabel,
        path_progress: fallback.path.pathProgress,
        current_focus: fallback.path.currentFocus,
        recommended_action_title: fallback.path.recommendedActionTitle,
        recommended_action_description: fallback.path.recommendedActionDescription,
        recommended_action_prompt: fallback.path.recommendedActionPrompt,
        learning_track_title: fallback.path.learningTrackTitle,
        learning_track_description: fallback.path.learningTrackDescription,
        completion_estimate_label: fallback.path.completionEstimateLabel,
        mastery_progress: fallback.path.masteryProgress,
        mastery_unlocked_count: fallback.path.masteryUnlockedCount,
        mastery_total_count: fallback.path.masteryTotalCount,
        next_session_date_day: fallback.path.nextSessionDateDay,
        next_session_date_month: fallback.path.nextSessionDateMonth,
        next_session_title: fallback.path.nextSessionTitle,
        next_session_day_label: fallback.path.nextSessionDayLabel,
        next_session_time_label: fallback.path.nextSessionTimeLabel,
        next_session_instructor_name: fallback.path.nextSessionInstructorName,
        next_session_instructor_role: fallback.path.nextSessionInstructorRole,
        next_session_instructor_image_url: fallback.path.nextSessionInstructorImageUrl,
        weekly_completed_sessions: fallback.path.weeklyCompletedSessions,
        weekly_change_label: fallback.path.weeklyChangeLabel,
        momentum_summary: fallback.path.momentumSummary,
        focus_summary: fallback.path.focusSummary,
          consistency_summary: fallback.path.consistencySummary,
        },
      skills: fallback.skills.map((skill) => ({
        skill_key: skill.skillKey,
        title: skill.title,
        description: skill.description,
        level_label: skill.levelLabel,
      })),
      curriculum_nodes: fallback.curriculumNodes.map((node) => ({
        node_key: node.nodeKey,
        module_label: node.moduleLabel,
        title: node.title,
        description: node.description,
        status_label: node.statusLabel,
      })),
      provider: 'gemini-dashboard-generate',
      model_used: 'gemini-2.5-pro',
    },
    sampleProfile,
    null,
  );

  assert.ok(normalized);
  assert.equal(normalized?.path.pathTitle, fallback.path.pathTitle);
  assert.equal(normalized?.path.nextSessionDateMonth, 'Suggested');
  assert.equal(normalized?.provider, 'gemini-dashboard-generate');
  assert.equal(normalized?.modelUsed, 'gemini-2.5-pro');
  assert.deepEqual(normalized?.rooms, fallback.rooms);
  assert.deepEqual(normalized?.weeklyActivity, fallback.weeklyActivity);
});
