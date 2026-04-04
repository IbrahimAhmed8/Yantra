import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePersonalizationExtractionResult } from './student-personalization-model';

test('normalizePersonalizationExtractionResult accepts snake_case approved facts from the AI service', () => {
  const result = normalizePersonalizationExtractionResult({
    sourceProvider: 'chatgpt',
    sourcePromptVersion: 'ai-memory-import-v1',
    approvedFacts: {
      confirmed_facts: ['Wants to build AI products.'],
      likely_preferences: ['Learns best through small projects.'],
      uncertain_inferences: ['May want more product work later.'],
      missing_information: ['Has not confirmed exact weekly availability.'],
      normalized: {
        target_goals: ['Artificial Intelligence & ML'],
        inferred_skill_level: 'Beginner',
        prior_projects: ['Built a calculator app'],
        topics_of_interest: ['Computer vision'],
        time_availability: 'Focused',
        preferred_learning_style: ['Hands-on'],
        constraints: ['Short weekday sessions'],
      },
    },
    learnerSummary: 'A learner focused on AI projects with hands-on preferences.',
    confidenceSummary: 'Goal confidence is strong, but time constraints need review.',
    assumptions: ['Weekly schedule is still partially inferred.'],
    provider: 'gemini-personalization-extract',
    modelUsed: 'gemini-2.5-flash',
  });

  assert.ok(result);
  assert.deepEqual(result?.approvedFacts.confirmedFacts, ['Wants to build AI products.']);
  assert.deepEqual(result?.approvedFacts.normalized.targetGoals, ['Artificial Intelligence & ML']);
  assert.equal(result?.approvedFacts.normalized.inferredSkillLevel, 'Beginner');
  assert.equal(result?.approvedFacts.normalized.timeAvailability, 'Focused');
});
