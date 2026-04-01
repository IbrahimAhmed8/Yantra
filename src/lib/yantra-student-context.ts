import { hasSupabaseEnv } from '@/src/lib/supabase/env';
import { getAuthenticatedProfile } from '@/src/lib/supabase/profiles';

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

export async function buildYantraStudentContext(request: Request) {
  const defaultContext = {
    name: 'Learner',
    skill_level: 'Beginner' as const,
    current_path: inferYantraCurrentPath(request),
    progress: 0,
    learning_goals: [] as string[],
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

    return {
      name: profile.name || defaultContext.name,
      skill_level: profile.skillLevel || defaultContext.skill_level,
      current_path: defaultContext.current_path,
      progress: typeof profile.progress === 'number' ? profile.progress : defaultContext.progress,
      learning_goals: [...profile.primaryLearningGoals],
    };
  } catch (error) {
    console.error('Yantra student-context lookup error:', error);
    return defaultContext;
  }
}

