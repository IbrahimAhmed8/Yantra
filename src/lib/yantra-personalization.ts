import {
  externalMemoryImportPromptVersion,
  normalizePersonalizationExtractionResult,
  type ApprovedPersonalizationFacts,
  type PersonalizationExtractionResult,
  type PersonalizationImportExtractInput,
  type PersonalizationSourceProvider,
  type StudentPersonalizationProfile,
} from '@/src/features/dashboard/student-personalization-model';
import {
  buildDeterministicDashboardSnapshot,
  normalizeGeneratedDashboardSnapshot,
  type GeneratedDashboardSnapshot,
} from '@/src/features/dashboard/student-dashboard-generation';
import { onboardingLearningGoalOptions, type StudentProfile } from '@/src/features/dashboard/student-profile-model';
import { getYantraAiServiceTimeoutMs, getYantraAiServiceUrl } from './yantra-ai-service';

type DashboardGenerationRequestPayload = {
  profile: {
    name: string;
    skill_level: StudentProfile['skillLevel'];
    progress: number;
    user_role: StudentProfile['userRole'];
    age_range: StudentProfile['ageRange'];
    primary_learning_goals: StudentProfile['primaryLearningGoals'];
    learning_pace: StudentProfile['learningPace'];
  };
  personalization: {
    learner_summary: string;
    approved_facts: ApprovedPersonalizationFacts | null;
  } | null;
};

type DashboardGenerationResult = {
  snapshot: GeneratedDashboardSnapshot;
  fallbackUsed: boolean;
};

const sectionAliases = {
  confirmedFacts: ['confirmed facts'],
  likelyPreferences: ['likely preferences'],
  uncertainInferences: ['uncertain inferences'],
  missingInformation: ['missing information'],
  goals: ['goals'],
  currentSkillLevel: ['current skill level', 'skill level'],
  priorProjects: ['prior projects'],
  topicsOfInterest: ['topics of interest'],
  timeAvailability: ['time availability'],
  preferredLearningStyle: ['preferred learning style', 'learning style'],
  constraints: ['constraints'],
  confidence: ['confidence'],
} as const;

function normalizeText(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function normalizeLines(lines: string[], limit = 8) {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const line of lines) {
    const trimmed = normalizeText(line, 220);

    if (!trimmed) {
      continue;
    }

    const key = trimmed.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    normalized.push(trimmed);
    seen.add(key);

    if (normalized.length >= limit) {
      break;
    }
  }

  return normalized;
}

function getSectionKey(rawLine: string) {
  const normalized = rawLine.trim().toLowerCase().replace(/[:*]/g, '');

  for (const [key, aliases] of Object.entries(sectionAliases)) {
    if (aliases.some((alias) => normalized === alias)) {
      return key as keyof typeof sectionAliases;
    }
  }

  return null;
}

function inferGoalsFromText(rawText: string) {
  const normalized = rawText.toLowerCase();

  return onboardingLearningGoalOptions.filter((goal) => normalized.includes(goal.toLowerCase())).slice(0, 3);
}

function inferSkillLevel(rawText: string): StudentProfile['skillLevel'] | null {
  const normalized = rawText.toLowerCase();

  if (normalized.includes('advanced')) {
    return 'Advanced';
  }

  if (normalized.includes('intermediate')) {
    return 'Intermediate';
  }

  if (normalized.includes('beginner')) {
    return 'Beginner';
  }

  return null;
}

function inferTimeAvailability(rawText: string): StudentProfile['learningPace'] | null {
  const normalized = rawText.toLowerCase();

  if (normalized.includes('intensive')) {
    return 'Intensive';
  }

  if (normalized.includes('light')) {
    return 'Light';
  }

  if (normalized.includes('focused')) {
    return 'Focused';
  }

  return null;
}

function parseSectionedSummary(sourceSummary: string) {
  const buckets: Record<string, string[]> = {};
  let activeSection: keyof typeof sectionAliases | null = null;

  for (const rawLine of sourceSummary.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    const sectionKey = getSectionKey(line);

    if (sectionKey) {
      activeSection = sectionKey;
      buckets[sectionKey] = buckets[sectionKey] ?? [];
      continue;
    }

    const normalizedLine = line.replace(/^[-*]\s*/, '').trim();

    if (!normalizedLine) {
      continue;
    }

    const key = activeSection ?? 'confirmedFacts';
    buckets[key] = buckets[key] ?? [];
    buckets[key].push(normalizedLine);
  }

  return buckets;
}

function buildLocalPersonalizationExtraction(
  input: PersonalizationImportExtractInput,
): PersonalizationExtractionResult {
  const sections = parseSectionedSummary(input.sourceSummary);
  const goals = inferGoalsFromText(
    [...(sections.goals ?? []), ...(sections.confirmedFacts ?? []), ...(sections.likelyPreferences ?? [])].join(' '),
  );
  const skillLevel = inferSkillLevel([...(sections.currentSkillLevel ?? []), input.sourceSummary].join(' '));
  const timeAvailability = inferTimeAvailability([...(sections.timeAvailability ?? []), input.sourceSummary].join(' '));
  const confirmedFacts = normalizeLines(sections.confirmedFacts ?? input.sourceSummary.split(/[.!?]/));
  const likelyPreferences = normalizeLines(sections.likelyPreferences ?? []);
  const uncertainInferences = normalizeLines(sections.uncertainInferences ?? []);
  const missingInformation = normalizeLines(sections.missingInformation ?? []);
  const priorProjects = normalizeLines(sections.priorProjects ?? []);
  const topicsOfInterest = normalizeLines(sections.topicsOfInterest ?? []);
  const preferredLearningStyle = normalizeLines(sections.preferredLearningStyle ?? []);
  const constraints = normalizeLines(sections.constraints ?? []);
  const confidenceLine = normalizeText(
    normalizeLines(sections.confidence ?? ['Based on the pasted summary only. Review these facts before saving.'], 2).join(' '),
    240,
  );
  const learnerSummary = normalizeText(
    [confirmedFacts[0], likelyPreferences[0], topicsOfInterest[0]].filter(Boolean).join(' '),
    400,
  );

  return {
    sourceProvider: input.sourceProvider,
    sourcePromptVersion: externalMemoryImportPromptVersion,
    approvedFacts: {
      confirmedFacts,
      likelyPreferences,
      uncertainInferences,
      missingInformation,
      normalized: {
        targetGoals: goals,
        inferredSkillLevel: skillLevel,
        priorProjects,
        topicsOfInterest,
        timeAvailability,
        preferredLearningStyle,
        constraints,
      },
    },
    learnerSummary: learnerSummary || 'Imported context is ready for review before Yantra updates the roadmap.',
    confidenceSummary: confidenceLine || 'Built from the pasted summary only. Review each field before saving.',
    assumptions: uncertainInferences.slice(0, 4),
    provider: 'local-personalization-extract',
    modelUsed: null,
  };
}

export async function extractPersonalizationFromSummary(
  input: PersonalizationImportExtractInput,
): Promise<PersonalizationExtractionResult> {
  const serviceUrl = getYantraAiServiceUrl();

  if (!serviceUrl) {
    return buildLocalPersonalizationExtraction(input);
  }

  try {
    const response = await fetch(`${serviceUrl}/personalization/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(Math.min(getYantraAiServiceTimeoutMs(), 20_000)),
      body: JSON.stringify({
        source_provider: input.sourceProvider,
        source_summary: input.sourceSummary,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const normalized = normalizePersonalizationExtractionResult({
      sourceProvider: data.source_provider ?? data.sourceProvider,
      sourcePromptVersion: data.source_prompt_version ?? data.sourcePromptVersion,
      approvedFacts: data.approved_facts ?? data.approvedFacts,
      learnerSummary: data.learner_summary ?? data.learnerSummary,
      confidenceSummary: data.confidence_summary ?? data.confidenceSummary,
      assumptions: data.assumptions,
      provider: data.provider,
      modelUsed: data.model_used ?? data.modelUsed,
    });

    if (!response.ok || !normalized) {
      throw new Error('Yantra AI service returned an invalid extraction payload.');
    }

    return normalized;
  } catch (error) {
    console.error('Yantra personalization extract error:', error);
    return buildLocalPersonalizationExtraction(input);
  }
}

function buildDashboardGenerationPayload(
  profile: StudentProfile,
  personalization: StudentPersonalizationProfile | null | undefined,
): DashboardGenerationRequestPayload {
  return {
    profile: {
      name: profile.name,
      skill_level: profile.skillLevel,
      progress: profile.progress,
      user_role: profile.userRole,
      age_range: profile.ageRange,
      primary_learning_goals: profile.primaryLearningGoals,
      learning_pace: profile.learningPace,
    },
    personalization: personalization
      ? {
          learner_summary: personalization.learnerSummary,
          approved_facts: personalization.approvedFacts,
        }
      : null,
  };
}

export async function generateDashboardSnapshot(
  profile: StudentProfile,
  personalization?: StudentPersonalizationProfile | null,
): Promise<DashboardGenerationResult> {
  const fallbackSnapshot = buildDeterministicDashboardSnapshot(profile, personalization);
  const serviceUrl = getYantraAiServiceUrl();

  if (!serviceUrl) {
    return {
      snapshot: fallbackSnapshot,
      fallbackUsed: true,
    };
  }

  try {
    const response = await fetch(`${serviceUrl}/dashboard/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(Math.min(getYantraAiServiceTimeoutMs(), 25_000)),
      body: JSON.stringify(buildDashboardGenerationPayload(profile, personalization)),
    });

    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const normalized = normalizeGeneratedDashboardSnapshot(
      {
        learnerSummary: data.learner_summary ?? data.learnerSummary,
        recommendedTrack: data.recommended_track ?? data.recommendedTrack,
        recommendedAction: data.recommended_action ?? data.recommendedAction,
        confidenceSummary: data.confidence_summary ?? data.confidenceSummary,
        assumptions: data.assumptions,
        path: data.path,
        skills: data.skills,
        curriculumNodes: data.curriculum_nodes ?? data.curriculumNodes,
        recommendedRooms: data.recommended_rooms ?? data.recommendedRooms,
        weeklyActivity: data.weekly_activity ?? data.weeklyActivity,
        provider: data.provider,
        modelUsed: data.model_used ?? data.modelUsed,
      },
      profile,
      personalization,
    );

    if (!response.ok || !normalized) {
      throw new Error('Yantra AI service returned an invalid dashboard payload.');
    }

    if (normalized.provider === 'local-dashboard-generate') {
      return {
        snapshot: fallbackSnapshot,
        fallbackUsed: true,
      };
    }

    return {
      snapshot: normalized,
      fallbackUsed: false,
    };
  } catch (error) {
    console.error('Yantra dashboard generation error:', error);
    return {
      snapshot: fallbackSnapshot,
      fallbackUsed: true,
    };
  }
}
