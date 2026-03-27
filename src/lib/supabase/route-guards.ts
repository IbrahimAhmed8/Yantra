import { redirect } from 'next/navigation';
import { getAuthenticatedAppPath, isOnboardingComplete } from '@/src/features/dashboard/student-profile-model';
import { hasSupabaseEnv } from './env';
import { getAuthenticatedProfile } from './profiles';

type AuthenticatedProfileResult = NonNullable<Awaited<ReturnType<typeof getAuthenticatedProfile>>>;

type RequireAuthenticatedProfileOptions = {
  unauthenticatedRedirect: string;
  requireOnboarding?: boolean;
  onboardingRedirect?: string;
  supabaseRedirect?: string;
};

export function requireSupabaseConfigured(
  redirectTo = '/login?message=Configure%20Supabase%20first.&kind=error',
) {
  if (!hasSupabaseEnv()) {
    redirect(redirectTo);
  }
}

export async function redirectAuthenticatedUserToApp() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const result = await getAuthenticatedProfile();

  if (result) {
    redirect(
      result.supportsOnboardingSchema
        ? getAuthenticatedAppPath(result.profile, {
            requireProfileDetails: result.supportsEnhancedOnboardingSchema,
          })
        : '/dashboard',
    );
  }

  return null;
}

export async function requireAuthenticatedProfile({
  unauthenticatedRedirect,
  requireOnboarding = false,
  onboardingRedirect = '/onboarding?message=Complete%20your%20Yantra%20onboarding%20before%20continuing.&kind=info',
  supabaseRedirect,
}: RequireAuthenticatedProfileOptions): Promise<AuthenticatedProfileResult> {
  requireSupabaseConfigured(supabaseRedirect);

  const result = await getAuthenticatedProfile();

  if (!result) {
    redirect(unauthenticatedRedirect);
  }

  if (
    requireOnboarding &&
    result.supportsOnboardingSchema &&
    !isOnboardingComplete(result.profile, {
      requireProfileDetails: result.supportsEnhancedOnboardingSchema,
    })
  ) {
    redirect(onboardingRedirect);
  }

  return result;
}
