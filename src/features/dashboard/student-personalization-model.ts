import {
  normalizeLearningPace,
  normalizePrimaryLearningGoals,
  onboardingLearningGoalOptions,
  type LearningGoal,
  type LearningPace,
  type StudentProfile,
} from './student-profile-model';

export const personalizationSourceProviders = ['chatgpt', 'gemini', 'other'] as const;
export const externalMemoryImportPromptVersion = 'ai-memory-import-v1';

export type PersonalizationSourceProvider = (typeof personalizationSourceProviders)[number];

export type ApprovedPersonalizationFactsNormalized = {
  targetGoals: LearningGoal[];
  inferredSkillLevel: StudentProfile['skillLevel'] | null;
  priorProjects: string[];
  topicsOfInterest: string[];
  timeAvailability: LearningPace | null;
  preferredLearningStyle: string[];
  constraints: string[];
};

export type ApprovedPersonalizationFacts = {
  confirmedFacts: string[];
  likelyPreferences: string[];
  uncertainInferences: string[];
  missingInformation: string[];
  normalized: ApprovedPersonalizationFactsNormalized;
};

export type StudentPersonalizationProfile = {
  sourceProvider: PersonalizationSourceProvider | null;
  sourcePromptVersion: string | null;
  approvedFacts: ApprovedPersonalizationFacts | null;
  learnerSummary: string;
  confidenceSummary: string;
  assumptions: string[];
  dismissedAt: string | null;
  lastGeneratedAt: string | null;
  lastModelProvider: string | null;
  lastModelName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PersonalizationExtractionResult = {
  sourceProvider: PersonalizationSourceProvider;
  sourcePromptVersion: string;
  approvedFacts: ApprovedPersonalizationFacts;
  learnerSummary: string;
  confidenceSummary: string;
  assumptions: string[];
  provider: string;
  modelUsed: string | null;
};

export type PersonalizationImportExtractInput = {
  sourceProvider: PersonalizationSourceProvider;
  sourceSummary: string;
};

export type PersonalizationImportUpdateInput =
  | {
      dismissed: true;
    }
  | {
      sourceProvider: PersonalizationSourceProvider;
      sourcePromptVersion: string;
      approvedFacts: ApprovedPersonalizationFacts;
      learnerSummary: string;
      confidenceSummary: string;
      assumptions: string[];
      dismissed?: false;
    };

function normalizeStringList(value: unknown, limit = 8) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const entry of value) {
    if (typeof entry !== 'string') {
      continue;
    }

    const trimmed = entry.trim().replace(/\s+/g, ' ');

    if (!trimmed) {
      continue;
    }

    const dedupeKey = trimmed.toLowerCase();

    if (seen.has(dedupeKey)) {
      continue;
    }

    normalized.push(trimmed);
    seen.add(dedupeKey);

    if (normalized.length >= limit) {
      break;
    }
  }

  return normalized;
}

function getRecordValue(candidate: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (key in candidate) {
      return candidate[key];
    }
  }

  return undefined;
}

function normalizeSkillLevel(value: unknown): StudentProfile['skillLevel'] | null {
  return value === 'Beginner' || value === 'Intermediate' || value === 'Advanced' ? value : null;
}

function normalizeSourceProvider(value: unknown): PersonalizationSourceProvider | null {
  return personalizationSourceProviders.find((provider) => provider === value) ?? null;
}

function normalizePromptVersion(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeNullableIsoString(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeApprovedFactsNormalized(value: unknown): ApprovedPersonalizationFactsNormalized {
  const candidate = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

  return {
    targetGoals: normalizePrimaryLearningGoals(getRecordValue(candidate, 'targetGoals', 'target_goals')),
    inferredSkillLevel: normalizeSkillLevel(getRecordValue(candidate, 'inferredSkillLevel', 'inferred_skill_level')),
    priorProjects: normalizeStringList(getRecordValue(candidate, 'priorProjects', 'prior_projects')),
    topicsOfInterest: normalizeStringList(getRecordValue(candidate, 'topicsOfInterest', 'topics_of_interest')),
    timeAvailability: normalizeLearningPace(getRecordValue(candidate, 'timeAvailability', 'time_availability')),
    preferredLearningStyle: normalizeStringList(
      getRecordValue(candidate, 'preferredLearningStyle', 'preferred_learning_style'),
    ),
    constraints: normalizeStringList(getRecordValue(candidate, 'constraints')),
  };
}

export function normalizeApprovedPersonalizationFacts(value: unknown): ApprovedPersonalizationFacts | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  return {
    confirmedFacts: normalizeStringList(getRecordValue(candidate, 'confirmedFacts', 'confirmed_facts')),
    likelyPreferences: normalizeStringList(getRecordValue(candidate, 'likelyPreferences', 'likely_preferences')),
    uncertainInferences: normalizeStringList(getRecordValue(candidate, 'uncertainInferences', 'uncertain_inferences')),
    missingInformation: normalizeStringList(getRecordValue(candidate, 'missingInformation', 'missing_information')),
    normalized: normalizeApprovedFactsNormalized(getRecordValue(candidate, 'normalized')),
  };
}

function normalizeRequiredText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim().replace(/\s+/g, ' ');

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

export function normalizePersonalizationExtractInput(value: unknown): PersonalizationImportExtractInput | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const sourceProvider = normalizeSourceProvider(candidate.sourceProvider);
  const sourceSummary = normalizeRequiredText(candidate.sourceSummary, 12_000);

  if (!sourceProvider || !sourceSummary) {
    return null;
  }

  return {
    sourceProvider,
    sourceSummary,
  };
}

export function normalizePersonalizationImportUpdateInput(value: unknown): PersonalizationImportUpdateInput | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (candidate.dismissed === true) {
    return { dismissed: true };
  }

  const sourceProvider = normalizeSourceProvider(candidate.sourceProvider);
  const sourcePromptVersion = normalizePromptVersion(candidate.sourcePromptVersion);
  const approvedFacts = normalizeApprovedPersonalizationFacts(candidate.approvedFacts);
  const learnerSummary = normalizeRequiredText(candidate.learnerSummary, 400);
  const confidenceSummary = normalizeRequiredText(candidate.confidenceSummary, 240);
  const assumptions = normalizeStringList(candidate.assumptions);

  if (!sourceProvider || !sourcePromptVersion || !approvedFacts || !learnerSummary || !confidenceSummary) {
    return null;
  }

  return {
    sourceProvider,
    sourcePromptVersion,
    approvedFacts,
    learnerSummary,
    confidenceSummary,
    assumptions,
    dismissed: false,
  };
}

export function normalizeStudentPersonalizationProfile(value: unknown): StudentPersonalizationProfile | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  return {
    sourceProvider: normalizeSourceProvider(candidate.sourceProvider),
    sourcePromptVersion: normalizePromptVersion(candidate.sourcePromptVersion),
    approvedFacts: normalizeApprovedPersonalizationFacts(candidate.approvedFacts),
    learnerSummary: normalizeRequiredText(candidate.learnerSummary, 400) ?? '',
    confidenceSummary: normalizeRequiredText(candidate.confidenceSummary, 240) ?? '',
    assumptions: normalizeStringList(candidate.assumptions),
    dismissedAt: normalizeNullableIsoString(candidate.dismissedAt),
    lastGeneratedAt: normalizeNullableIsoString(candidate.lastGeneratedAt),
    lastModelProvider: normalizeRequiredText(candidate.lastModelProvider, 80),
    lastModelName: normalizeRequiredText(candidate.lastModelName, 120),
    createdAt: normalizeNullableIsoString(candidate.createdAt),
    updatedAt: normalizeNullableIsoString(candidate.updatedAt),
  };
}

export function normalizePersonalizationExtractionResult(value: unknown): PersonalizationExtractionResult | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const sourceProvider = normalizeSourceProvider(candidate.sourceProvider);
  const sourcePromptVersion = normalizePromptVersion(candidate.sourcePromptVersion) ?? externalMemoryImportPromptVersion;
  const approvedFacts = normalizeApprovedPersonalizationFacts(candidate.approvedFacts);
  const learnerSummary = normalizeRequiredText(candidate.learnerSummary, 400);
  const confidenceSummary = normalizeRequiredText(candidate.confidenceSummary, 240);
  const assumptions = normalizeStringList(candidate.assumptions);
  const provider = normalizeRequiredText(candidate.provider, 80) ?? 'yantra-ai-service';

  if (!sourceProvider || !approvedFacts || !learnerSummary || !confidenceSummary) {
    return null;
  }

  return {
    sourceProvider,
    sourcePromptVersion,
    approvedFacts,
    learnerSummary,
    confidenceSummary,
    assumptions,
    provider,
    modelUsed: normalizeRequiredText(candidate.modelUsed ?? candidate.model_used, 120),
  };
}

export function getExternalMemoryImportPrompt(provider: PersonalizationSourceProvider) {
  const providerLabel =
    provider === 'chatgpt' ? 'ChatGPT' : provider === 'gemini' ? 'Gemini' : 'your previous AI assistant';
  const supportedGoals = onboardingLearningGoalOptions.join(', ');

  return [
    `I want to import context from ${providerLabel} into my learning roadmap app.`,
    'Return only structured notes that separate confirmed information from guesses.',
    'Do not invent anything that is not already visible from our past chats or memory.',
    'Use exactly these sections and keep them concise:',
    '',
    'Confirmed Facts:',
    '- Bullet points only.',
    '',
    'Likely Preferences:',
    '- Bullet points only.',
    '',
    'Uncertain Inferences:',
    '- Bullet points only.',
    '',
    'Missing Information:',
    '- Bullet points only.',
    '',
    'Goals:',
    '- Choose from these Yantra goals when possible:',
    `- ${supportedGoals}`,
    '',
    'Current Skill Level:',
    '- Beginner, Intermediate, or Advanced.',
    '',
    'Prior Projects:',
    '- Bullet points only.',
    '',
    'Topics of Interest:',
    '- Bullet points only.',
    '',
    'Time Availability:',
    '- Light, Focused, or Intensive.',
    '',
    'Preferred Learning Style:',
    '- Bullet points only.',
    '',
    'Constraints:',
    '- Bullet points only.',
    '',
    'Confidence:',
    '- One short paragraph explaining what is high confidence and what is uncertain.',
    '',
    'Important rules:',
    '- Keep personal data out unless I explicitly asked for it.',
    '- Mark guesses clearly instead of presenting them as facts.',
    '- If you are unsure, place it under Uncertain Inferences or Missing Information.',
  ].join('\n');
}
