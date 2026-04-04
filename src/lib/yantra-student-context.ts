import type { YantraChatMessage } from '@/src/features/chat/yantra-chat';
import type { StudentDashboardData } from '@/src/features/dashboard/student-dashboard-model';
import type { StudentPersonalizationProfile } from '@/src/features/dashboard/student-personalization-model';
import { hasSupabaseEnv } from '@/src/lib/supabase/env';
import { getAuthenticatedChatHistory } from '@/src/lib/supabase/chat-history';
import { getAuthenticatedDashboardData } from '@/src/lib/supabase/dashboard';
import { getAuthenticatedPersonalizationProfile } from '@/src/lib/supabase/personalization';
import { getAuthenticatedProfile } from '@/src/lib/supabase/profiles';

export type YantraStudentContext = {
  name: string;
  skill_level: string;
  current_path: string;
  current_surface: string;
  progress: number;
  learning_goals: string[];
  current_focus: string;
  path_description: string;
  recommended_action_title: string;
  recommended_action_description: string;
  strongest_skills: string[];
  active_rooms: string[];
  memory_summary: string;
  approved_learner_summary: string;
  approved_import_facts: {
    target_goals: string[];
    inferred_skill_level: string | null;
    prior_projects: string[];
    topics_of_interest: string[];
    time_availability: string | null;
    preferred_learning_style: string[];
    constraints: string[];
  } | null;
};

type BuildYantraStudentContextOptions = {
  currentSurface?: string;
  dashboardData?: StudentDashboardData | null;
  chatMessages?: YantraChatMessage[] | null;
  personalizationProfile?: StudentPersonalizationProfile | null;
};

function truncateText(value: string, limit: number) {
  const normalized = value.trim().replace(/\s+/g, ' ');

  if (normalized.length <= limit) {
    return normalized;
  }

  const clipped = normalized.slice(0, limit).trim();
  const lastSpace = clipped.lastIndexOf(' ');

  return `${(lastSpace > 32 ? clipped.slice(0, lastSpace) : clipped).trim()}...`;
}

export function inferYantraCurrentPath(request: Request) {
  const referer = request.headers.get('referer');

  if (!referer) {
    return 'Yantra Dashboard';
  }

  try {
    const { pathname } = new URL(referer);

    if (pathname.startsWith('/dashboard/rooms/python')) {
      return 'Python Room';
    }

    if (pathname.startsWith('/dashboard/student-profile')) {
      return 'Student Profile';
    }

    if (pathname.startsWith('/dashboard')) {
      return 'Yantra Dashboard';
    }

    if (pathname.startsWith('/docs')) {
      return 'Docs';
    }

    if (pathname.startsWith('/onboarding')) {
      return 'Onboarding';
    }

    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
      return 'Account Access';
    }
  } catch {
    return 'Yantra Dashboard';
  }

  return 'Yantra';
}

export function summarizeYantraMemory(messages: YantraChatMessage[]) {
  const recentMessages = messages.slice(-8);
  const recentQuestions = recentMessages
    .filter((message) => message.role === 'user')
    .slice(-3)
    .map((message) => truncateText(message.content, 96));
  const recentGuidance = recentMessages
    .filter((message) => message.role === 'assistant')
    .slice(-2)
    .map((message) => truncateText(message.content, 96));

  const sections: string[] = [];

  if (recentQuestions.length > 0) {
    sections.push(`Recent learner questions: ${recentQuestions.join(' | ')}`);
  }

  if (recentGuidance.length > 0) {
    sections.push(`Recent Yantra guidance: ${recentGuidance.join(' | ')}`);
  }

  return sections.join('. ');
}

function getStrongestSkills(dashboardData: StudentDashboardData | null | undefined) {
  if (!dashboardData) {
    return [];
  }

  return [...dashboardData.skills]
    .sort((left, right) => right.progress - left.progress)
    .slice(0, 3)
    .map((skill) => skill.title);
}

function getActiveRooms(dashboardData: StudentDashboardData | null | undefined) {
  if (!dashboardData) {
    return [];
  }

  return dashboardData.rooms
    .filter((room) => room.featured || room.statusLabel.toLowerCase().includes('available') || room.statusLabel.toLowerCase().includes('open'))
    .slice(0, 3)
    .map((room) => room.title);
}

export function buildYantraStudentContextFromData(
  profile: Awaited<ReturnType<typeof getAuthenticatedProfile>> extends infer Result
    ? Result extends { profile: infer Profile }
      ? Profile
      : never
    : never,
  currentSurface: string,
  dashboardData?: StudentDashboardData | null,
  chatMessages?: YantraChatMessage[] | null,
  personalizationProfile?: StudentPersonalizationProfile | null,
): YantraStudentContext {
  const path = dashboardData?.path;
  const memorySummary = summarizeYantraMemory(chatMessages ?? []);
  const approvedFacts = personalizationProfile?.approvedFacts?.normalized ?? null;

  return {
    name: profile.name || 'Learner',
    skill_level: profile.skillLevel || 'Beginner',
    current_path: path?.pathTitle || currentSurface,
    current_surface: currentSurface,
    progress: typeof path?.pathProgress === 'number' ? path.pathProgress : typeof profile.progress === 'number' ? profile.progress : 0,
    learning_goals: [...profile.primaryLearningGoals],
    current_focus: path?.currentFocus || currentSurface,
    path_description: path?.pathDescription || '',
    recommended_action_title: path?.recommendedActionTitle || '',
    recommended_action_description: path?.recommendedActionDescription || '',
    strongest_skills: getStrongestSkills(dashboardData),
    active_rooms: getActiveRooms(dashboardData),
    memory_summary: memorySummary,
    approved_learner_summary: personalizationProfile?.learnerSummary ?? '',
    approved_import_facts: approvedFacts
      ? {
          target_goals: [...approvedFacts.targetGoals],
          inferred_skill_level: approvedFacts.inferredSkillLevel,
          prior_projects: [...approvedFacts.priorProjects],
          topics_of_interest: [...approvedFacts.topicsOfInterest],
          time_availability: approvedFacts.timeAvailability,
          preferred_learning_style: [...approvedFacts.preferredLearningStyle],
          constraints: [...approvedFacts.constraints],
        }
      : null,
  };
}

export async function buildYantraStudentContext(request: Request, options: BuildYantraStudentContextOptions = {}) {
  const currentSurface = options.currentSurface || inferYantraCurrentPath(request);
  const defaultContext: YantraStudentContext = {
    name: 'Learner',
    skill_level: 'Beginner',
    current_path: currentSurface,
    current_surface: currentSurface,
    progress: 0,
    learning_goals: [],
    current_focus: currentSurface,
    path_description: '',
    recommended_action_title: '',
    recommended_action_description: '',
    strongest_skills: [],
    active_rooms: [],
    memory_summary: '',
    approved_learner_summary: '',
    approved_import_facts: null,
  };

  if (!hasSupabaseEnv()) {
    return defaultContext;
  }

  try {
    const result = await getAuthenticatedProfile();
    const profile = result?.profile;

    if (!profile) {
      return defaultContext;
    }

    const [dashboardData, chatHistory, personalizationProfile] = await Promise.all([
      options.dashboardData !== undefined ? options.dashboardData : getAuthenticatedDashboardData(result),
      options.chatMessages !== undefined ? options.chatMessages : getAuthenticatedChatHistory().then((history) => history?.messages ?? []),
      options.personalizationProfile !== undefined
        ? options.personalizationProfile
        : getAuthenticatedPersonalizationProfile(),
    ]);

    return buildYantraStudentContextFromData(
      profile,
      currentSurface,
      dashboardData,
      chatHistory ?? [],
      personalizationProfile,
    );
  } catch (error) {
    console.error('Yantra student-context lookup error:', error);
    return defaultContext;
  }
}
