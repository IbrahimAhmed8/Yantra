import { redirect } from 'next/navigation';
import RoleOnboardingExperience from '@/src/features/onboarding/RoleOnboardingExperience';
import { isOnboardingComplete } from '@/src/features/dashboard/student-profile-model';
import { requireAuthenticatedProfile } from '@/src/lib/supabase/route-guards';

type OnboardingPageProps = {
  searchParams?: Promise<{
    message?: string | string[];
    kind?: string | string[];
  }>;
};

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const result = await requireAuthenticatedProfile({
    unauthenticatedRedirect: '/login?message=Log%20in%20to%20complete%20onboarding.&kind=info',
  });

  if (!result.supportsOnboardingSchema) {
    redirect('/dashboard');
  }

  if (
    isOnboardingComplete(result.profile, {
      requireProfileDetails: result.supportsEnhancedOnboardingSchema,
    })
  ) {
    redirect('/dashboard');
  }

  const message = readSearchParam(params?.message);
  const kind = readSearchParam(params?.kind);

  return (
    <RoleOnboardingExperience
      email={result.user.email ?? ''}
      initialProfile={result.profile}
      initialStatus={
        message
          ? {
              kind: kind === 'error' || kind === 'success' || kind === 'info' ? kind : 'info',
              message,
            }
          : null
      }
    />
  );
}
