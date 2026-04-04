import { getFirstName, type StudentProfile } from './student-profile-model';

export type DashboardSkillIconKey = 'python' | 'logic' | 'ml' | 'data' | 'networks' | 'prompt';
export type DashboardSkillToneKey = 'primary' | 'soft' | 'muted';
export type DashboardRoomTextureKey = 'python-room' | 'neural-builder' | 'data-explorer' | 'prompt-lab';

export type StudentDashboardProfile = StudentProfile & {
  fullName: string;
  firstName: string;
  email: string;
};

export type StudentDashboardPath = {
  pathTitle: string;
  pathDescription: string;
  pathStatusLabel: string;
  pathProgress: number;
  currentFocus: string;
  recommendedActionTitle: string;
  recommendedActionDescription: string;
  recommendedActionPrompt: string;
  learningTrackTitle: string;
  learningTrackDescription: string;
  completionEstimateLabel: string;
  masteryProgress: number;
  masteryUnlockedCount: number;
  masteryTotalCount: number;
  nextSessionDateDay: string;
  nextSessionDateMonth: string;
  nextSessionTitle: string;
  nextSessionDayLabel: string;
  nextSessionTimeLabel: string;
  nextSessionInstructorName: string;
  nextSessionInstructorRole: string;
  nextSessionInstructorImageUrl: string;
  weeklyCompletedSessions: number;
  weeklyChangeLabel: string;
  momentumSummary: string;
  focusSummary: string;
  consistencySummary: string;
};

export type StudentDashboardSkill = {
  skillKey: string;
  title: string;
  description: string;
  levelLabel: string;
  progress: number;
  iconKey: DashboardSkillIconKey;
  toneKey: DashboardSkillToneKey;
  locked: boolean;
  sortOrder: number;
};

export type StudentDashboardCurriculumNode = {
  nodeKey: string;
  moduleLabel: string;
  title: string;
  description: string;
  statusLabel: string;
  unlocked: boolean;
  sortOrder: number;
};

export type StudentDashboardRoom = {
  roomKey: string;
  title: string;
  description: string;
  statusLabel: string;
  ctaLabel: string;
  prompt: string;
  featured: boolean;
  textureKey: DashboardRoomTextureKey;
  sortOrder: number;
};

export type StudentDashboardWeeklyActivity = {
  dayKey: string;
  dayLabel: string;
  containerHeight: number;
  fillHeight: number;
  highlighted: boolean;
  sortOrder: number;
};

export type StudentDashboardSeed = {
  path: StudentDashboardPath;
  skills: StudentDashboardSkill[];
  curriculumNodes: StudentDashboardCurriculumNode[];
  rooms: StudentDashboardRoom[];
  weeklyActivity: StudentDashboardWeeklyActivity[];
};

export type StudentDashboardData = {
  profile: StudentDashboardProfile;
  path: StudentDashboardPath;
  skills: StudentDashboardSkill[];
  curriculumNodes: StudentDashboardCurriculumNode[];
  rooms: StudentDashboardRoom[];
  weeklyActivity: StudentDashboardWeeklyActivity[];
};

export const starterStudentDashboardSeed: StudentDashboardSeed = {
  path: {
    pathTitle: 'AI Foundations',
    pathDescription: 'Start with the technical basics that make the rest of the roadmap honest and usable.',
    pathStatusLabel: 'Starter Path',
    pathProgress: 8,
    currentFocus: 'Programming logic and first-room calibration',
    recommendedActionTitle: 'Enter Python Room',
    recommendedActionDescription: 'Use the first room to give Yantra real signals before the roadmap gets more specific.',
    recommendedActionPrompt: 'Open the Python Room and tell me what to focus on in my first session.',
    learningTrackTitle: 'Machine Learning Starter Track',
    learningTrackDescription:
      'This starter view uses onboarding data only. Weekly history, streaks, and schedules stay empty until real activity appears.',
    completionEstimateLabel: '7-week arc',
    masteryProgress: 8,
    masteryUnlockedCount: 1,
    masteryTotalCount: 6,
    nextSessionDateDay: '--',
    nextSessionDateMonth: 'Suggested',
    nextSessionTitle: 'Enter Python Room',
    nextSessionDayLabel: 'No live schedule yet',
    nextSessionTimeLabel: 'Pick a room to begin',
    nextSessionInstructorName: 'Yantra Guide',
    nextSessionInstructorRole: 'AI Coach',
    nextSessionInstructorImageUrl: '',
    weeklyCompletedSessions: 0,
    weeklyChangeLabel: 'No prior week yet',
    momentumSummary: 'No streak yet',
    focusSummary: 'First-room setup',
    consistencySummary: '0 sessions',
  },
  skills: [
    {
      skillKey: 'python-basics',
      title: 'Python Basics',
      description: 'Start with syntax, variables, and control flow strong enough to support the rest of the path.',
      levelLabel: 'Starting',
      progress: 16,
      iconKey: 'python',
      toneKey: 'primary',
      locked: false,
      sortOrder: 1,
    },
    {
      skillKey: 'logic-building',
      title: 'Logic Building',
      description: 'Break problems into smaller steps before moving into heavier model or project work.',
      levelLabel: 'Queued',
      progress: 8,
      iconKey: 'logic',
      toneKey: 'soft',
      locked: false,
      sortOrder: 2,
    },
    {
      skillKey: 'ml-foundations',
      title: 'ML Foundations',
      description: 'This opens after the first rooms produce real signals about pace and readiness.',
      levelLabel: 'Locked',
      progress: 0,
      iconKey: 'ml',
      toneKey: 'muted',
      locked: true,
      sortOrder: 3,
    },
    {
      skillKey: 'data-handling',
      title: 'Data Handling',
      description: 'Learn to inspect structure and evidence before drawing conclusions from a dataset.',
      levelLabel: 'Locked',
      progress: 0,
      iconKey: 'data',
      toneKey: 'muted',
      locked: true,
      sortOrder: 4,
    },
    {
      skillKey: 'neural-networks',
      title: 'Neural Networks',
      description: 'Unlock this after the foundations are real, not imagined.',
      levelLabel: 'Locked',
      progress: 0,
      iconKey: 'networks',
      toneKey: 'muted',
      locked: true,
      sortOrder: 5,
    },
    {
      skillKey: 'prompt-design',
      title: 'Prompt Design',
      description: 'Prompt work gets more useful once you have stronger technical context from practice.',
      levelLabel: 'Locked',
      progress: 0,
      iconKey: 'prompt',
      toneKey: 'muted',
      locked: true,
      sortOrder: 6,
    },
  ],
  curriculumNodes: [
    {
      nodeKey: 'module-01',
      moduleLabel: 'Module 01',
      title: 'Programming Logic Core',
      description: 'Start with the basic reasoning patterns that support later rooms and recommendations.',
      statusLabel: 'Start here',
      unlocked: true,
      sortOrder: 1,
    },
    {
      nodeKey: 'module-02',
      moduleLabel: 'Module 02',
      title: 'Data Thinking Basics',
      description: 'Read structure, evidence, and patterns before you jump into models or projects.',
      statusLabel: 'Locked',
      unlocked: false,
      sortOrder: 2,
    },
    {
      nodeKey: 'module-03',
      moduleLabel: 'Module 03',
      title: 'First Model Intuition',
      description: 'Move into model vocabulary only after the technical basics feel stable.',
      statusLabel: 'Locked',
      unlocked: false,
      sortOrder: 3,
    },
  ],
  rooms: [
    {
      roomKey: 'python-room',
      title: 'Python Room',
      description: 'Guided sandbox for first-step logic practice, debugging, and calibration.',
      statusLabel: 'Start Here',
      ctaLabel: 'Enter Room',
      prompt: 'Guide me through the Python Room and suggest the right first challenge for me.',
      featured: true,
      textureKey: 'python-room',
      sortOrder: 1,
    },
    {
      roomKey: 'neural-net-builder',
      title: 'Neural Net Builder',
      description: 'Preview the visual model-building room that opens once your first-room signals exist.',
      statusLabel: 'Recommended Next',
      ctaLabel: 'Preview Next Step',
      prompt: 'Open my next room and explain why Neural Net Builder should be next for me once I finish the first session.',
      featured: true,
      textureKey: 'neural-builder',
      sortOrder: 2,
    },
    {
      roomKey: 'data-explorer',
      title: 'Data Explorer',
      description: 'Load datasets, inspect patterns, and turn rough signals into understandable stories.',
      statusLabel: 'Open',
      ctaLabel: 'Explore Data',
      prompt: 'Show me what I would learn inside the Data Explorer room.',
      featured: false,
      textureKey: 'data-explorer',
      sortOrder: 3,
    },
    {
      roomKey: 'prompt-lab',
      title: 'Prompt Lab',
      description: 'Experiment with prompts, compare output quality, and understand why instruction design changes results.',
      statusLabel: 'Open',
      ctaLabel: 'Enter Lab',
      prompt: 'Teach me prompt design and open the Prompt Lab context.',
      featured: false,
      textureKey: 'prompt-lab',
      sortOrder: 4,
    },
  ],
  weeklyActivity: [
    { dayKey: 'mon', dayLabel: 'MON', containerHeight: 96, fillHeight: 0, highlighted: false, sortOrder: 1 },
    { dayKey: 'tue', dayLabel: 'TUE', containerHeight: 128, fillHeight: 0, highlighted: false, sortOrder: 2 },
    { dayKey: 'wed', dayLabel: 'WED', containerHeight: 80, fillHeight: 0, highlighted: false, sortOrder: 3 },
    { dayKey: 'thu', dayLabel: 'THU', containerHeight: 144, fillHeight: 0, highlighted: false, sortOrder: 4 },
    { dayKey: 'fri', dayLabel: 'FRI', containerHeight: 112, fillHeight: 0, highlighted: false, sortOrder: 5 },
    { dayKey: 'sat', dayLabel: 'SAT', containerHeight: 48, fillHeight: 0, highlighted: false, sortOrder: 6 },
    { dayKey: 'sun', dayLabel: 'SUN', containerHeight: 48, fillHeight: 0, highlighted: false, sortOrder: 7 },
  ],
};

export function buildStudentDashboardProfile(profile: StudentProfile, email: string): StudentDashboardProfile {
  return {
    ...profile,
    fullName: profile.name,
    firstName: getFirstName(profile.name),
    email,
  };
}

export function buildStarterStudentDashboard(profile: StudentProfile, email: string): StudentDashboardData {
  const primaryGoal = profile.primaryLearningGoals[0] ?? 'Artificial Intelligence & ML';
  const focusLabel =
    primaryGoal === 'Artificial Intelligence & ML'
      ? 'Programming logic and first-room calibration'
      : `Foundations for ${primaryGoal}`;

  return {
    profile: buildStudentDashboardProfile(profile, email),
    path: {
      ...starterStudentDashboardSeed.path,
      currentFocus: focusLabel,
      focusSummary: focusLabel,
      learningTrackDescription: `This starter view is based on onboarding only and points toward ${primaryGoal.toLowerCase()}. Weekly history stays empty until real activity exists.`,
    },
    skills: starterStudentDashboardSeed.skills,
    curriculumNodes: starterStudentDashboardSeed.curriculumNodes,
    rooms: starterStudentDashboardSeed.rooms,
    weeklyActivity: starterStudentDashboardSeed.weeklyActivity,
  };
}
