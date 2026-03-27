export const legacyUserRoleOptions = [
  {
    value: 'School Student (12-18)',
    description: 'Learn AI fundamentals on smartboards.',
  },
  {
    value: 'College Student (18-25)',
    description: 'Deep dive into ML and build portfolios.',
  },
  {
    value: 'Self-Learner (Any Age)',
    description: 'Skill up at your own pace from home.',
  },
  {
    value: 'Teacher / Educator',
    description: 'Assign lessons and track class progress.',
  },
  {
    value: 'Institution / School',
    description: 'Integrate AI education into curriculum.',
  },
  {
    value: 'Hiring Company',
    description: 'Find pre-screened AI talent.',
  },
] as const;

export const onboardingRoleOptions = [
  {
    value: 'School Student (Class 8-12)',
    description: 'Class 8-12',
  },
  {
    value: 'College Student (Undergraduate)',
    description: 'Undergraduate',
  },
  {
    value: 'Graduate / Postgraduate (I have a degree)',
    description: 'I have a degree',
  },
  {
    value: 'Working Professional',
    description: 'Career track',
  },
] as const;

export const onboardingAgeRangeOptions = ['Under 16', '16-18', '19-22', '23-28', '29+'] as const;

export const onboardingLearningGoalOptions = [
  'Artificial Intelligence & ML',
  'Web Development',
  'App Development',
  'Data Science & Analytics',
  'Cloud & DevOps',
  'Cybersecurity',
  'UI/UX Design',
  'Digital Marketing',
  'Entrepreneurship & Startups',
] as const;

export const onboardingLearningPaceOptions = ['Light', 'Focused', 'Intensive'] as const;

export type UserRole =
  | (typeof legacyUserRoleOptions)[number]['value']
  | (typeof onboardingRoleOptions)[number]['value'];

export type AgeRange = (typeof onboardingAgeRangeOptions)[number];
export type LearningGoal = (typeof onboardingLearningGoalOptions)[number];
export type LearningPace = (typeof onboardingLearningPaceOptions)[number];

export type StudentProfile = {
  name: string;
  classDesignation: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  academicYear: string;
  userRole: UserRole | null;
  ageRange: AgeRange | null;
  primaryLearningGoals: LearningGoal[];
  learningPace: LearningPace | null;
  onboardingCompleted: boolean;
  onboardingCompletedAt: string | null;
};

export const defaultStudentProfile: StudentProfile = {
  name: 'Yantra Learner',
  classDesignation: 'Class 10',
  skillLevel: 'Beginner',
  progress: 0,
  academicYear: '2026',
  userRole: null,
  ageRange: null,
  primaryLearningGoals: [],
  learningPace: null,
  onboardingCompleted: false,
  onboardingCompletedAt: null,
};

const allUserRoleValues = [
  ...legacyUserRoleOptions.map((option) => option.value),
  ...onboardingRoleOptions.map((option) => option.value),
];

export function normalizeUserRole(value: unknown): UserRole | null {
  return allUserRoleValues.some((option) => option === value) ? (value as UserRole) : null;
}

export function normalizeAgeRange(value: unknown): AgeRange | null {
  return onboardingAgeRangeOptions.some((option) => option === value) ? (value as AgeRange) : null;
}

function normalizeLearningGoal(value: unknown): LearningGoal | null {
  return onboardingLearningGoalOptions.some((option) => option === value) ? (value as LearningGoal) : null;
}

export function normalizePrimaryLearningGoals(value: unknown): LearningGoal[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<LearningGoal>();
  const normalized: LearningGoal[] = [];

  for (const entry of value) {
    const goal = normalizeLearningGoal(entry);

    if (!goal || seen.has(goal)) {
      continue;
    }

    normalized.push(goal);
    seen.add(goal);

    if (normalized.length >= 3) {
      break;
    }
  }

  return normalized;
}

export function normalizeLearningPace(value: unknown): LearningPace | null {
  return onboardingLearningPaceOptions.some((option) => option === value) ? (value as LearningPace) : null;
}

export function deriveClassDesignationFromOnboarding(userRole: UserRole | null, ageRange: AgeRange | null) {
  switch (userRole) {
    case 'School Student (Class 8-12)':
    case 'School Student (12-18)':
      return 'Class 8-12';
    case 'College Student (Undergraduate)':
    case 'College Student (18-25)':
      return 'Undergraduate';
    case 'Graduate / Postgraduate (I have a degree)':
      return 'Graduate';
    case 'Working Professional':
      return 'Professional Track';
    case 'Self-Learner (Any Age)':
      return ageRange ? `${ageRange} Learner` : 'Self-Learner';
    case 'Teacher / Educator':
      return 'Educator';
    case 'Institution / School':
      return 'Institution';
    case 'Hiring Company':
      return 'Hiring Team';
    default:
      return '';
  }
}

function normalizeOnboardingCompletedAt(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

type OnboardingCompletionProfile = Pick<
  StudentProfile,
  'userRole' | 'onboardingCompleted' | 'ageRange' | 'primaryLearningGoals' | 'learningPace'
>;

type OnboardingCompletionOptions = {
  requireProfileDetails?: boolean;
};

export function isOnboardingComplete(
  profile: OnboardingCompletionProfile,
  { requireProfileDetails = false }: OnboardingCompletionOptions = {},
) {
  const hasCoreOnboarding = Boolean(profile.onboardingCompleted && normalizeUserRole(profile.userRole));

  if (!hasCoreOnboarding) {
    return false;
  }

  if (!requireProfileDetails) {
    return true;
  }

  return Boolean(
    normalizeAgeRange(profile.ageRange) &&
      normalizePrimaryLearningGoals(profile.primaryLearningGoals).length > 0 &&
      normalizeLearningPace(profile.learningPace),
  );
}

export function getAuthenticatedAppPath(profile: OnboardingCompletionProfile, options?: OnboardingCompletionOptions) {
  return isOnboardingComplete(profile, options) ? '/dashboard' : '/onboarding';
}

export function sanitizeStudentProfile(profile: StudentProfile): StudentProfile {
  const safeName = profile.name.trim() || defaultStudentProfile.name;
  const safeAgeRange = normalizeAgeRange(profile.ageRange);
  const safeClassDesignation =
    profile.classDesignation.trim() ||
    deriveClassDesignationFromOnboarding(normalizeUserRole(profile.userRole), safeAgeRange) ||
    defaultStudentProfile.classDesignation;
  const safeAcademicYear = profile.academicYear.trim() || defaultStudentProfile.academicYear;
  const safeProgress = Number.isFinite(profile.progress) ? Math.max(0, Math.min(100, Math.round(profile.progress))) : 0;
  const safeUserRole = normalizeUserRole(profile.userRole);
  const safeLearningGoals = normalizePrimaryLearningGoals(profile.primaryLearningGoals);
  const safeLearningPace = normalizeLearningPace(profile.learningPace);
  const safeOnboardingCompleted = Boolean(profile.onboardingCompleted && safeUserRole);

  return {
    name: safeName,
    classDesignation: safeClassDesignation,
    academicYear: safeAcademicYear,
    skillLevel:
      profile.skillLevel === 'Advanced' || profile.skillLevel === 'Intermediate' || profile.skillLevel === 'Beginner'
        ? profile.skillLevel
        : defaultStudentProfile.skillLevel,
    progress: safeProgress,
    userRole: safeUserRole,
    ageRange: safeAgeRange,
    primaryLearningGoals: safeLearningGoals,
    learningPace: safeLearningPace,
    onboardingCompleted: safeOnboardingCompleted,
    onboardingCompletedAt: safeOnboardingCompleted ? normalizeOnboardingCompletedAt(profile.onboardingCompletedAt) : null,
  };
}

export function normalizeStudentProfileInput(value: unknown) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<StudentProfile>;

  if (
    typeof candidate.name !== 'string' ||
    typeof candidate.classDesignation !== 'string' ||
    typeof candidate.academicYear !== 'string' ||
    typeof candidate.progress !== 'number' ||
    (candidate.skillLevel !== 'Beginner' &&
      candidate.skillLevel !== 'Intermediate' &&
      candidate.skillLevel !== 'Advanced')
  ) {
    return null;
  }

  if (
    ('userRole' in candidate && candidate.userRole !== null && candidate.userRole !== undefined && typeof candidate.userRole !== 'string') ||
    ('ageRange' in candidate && candidate.ageRange !== null && candidate.ageRange !== undefined && typeof candidate.ageRange !== 'string') ||
    ('primaryLearningGoals' in candidate &&
      candidate.primaryLearningGoals !== undefined &&
      !Array.isArray(candidate.primaryLearningGoals)) ||
    ('learningPace' in candidate &&
      candidate.learningPace !== null &&
      candidate.learningPace !== undefined &&
      typeof candidate.learningPace !== 'string') ||
    ('onboardingCompleted' in candidate &&
      candidate.onboardingCompleted !== undefined &&
      typeof candidate.onboardingCompleted !== 'boolean') ||
    ('onboardingCompletedAt' in candidate &&
      candidate.onboardingCompletedAt !== null &&
      candidate.onboardingCompletedAt !== undefined &&
      typeof candidate.onboardingCompletedAt !== 'string')
  ) {
    return null;
  }

  return sanitizeStudentProfile({
    name: candidate.name,
    classDesignation: candidate.classDesignation,
    academicYear: candidate.academicYear,
    progress: candidate.progress,
    skillLevel: candidate.skillLevel,
    userRole: normalizeUserRole(candidate.userRole),
    ageRange: normalizeAgeRange(candidate.ageRange),
    primaryLearningGoals: normalizePrimaryLearningGoals(candidate.primaryLearningGoals),
    learningPace: normalizeLearningPace(candidate.learningPace),
    onboardingCompleted: candidate.onboardingCompleted ?? false,
    onboardingCompletedAt: candidate.onboardingCompletedAt ?? null,
  });
}

export function getFirstName(name: string) {
  const firstName = name.trim().split(/\s+/)[0];
  return firstName || 'Learner';
}
