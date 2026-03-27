import StudentProfilePage from '@/src/features/dashboard/StudentProfilePage';
import { requireAuthenticatedProfile } from '@/src/lib/supabase/route-guards';

export default async function DashboardStudentProfilePage() {
  const result = await requireAuthenticatedProfile({
    unauthenticatedRedirect: '/login?message=Log%20in%20to%20open%20your%20profile.&kind=info',
    requireOnboarding: true,
    onboardingRedirect: '/onboarding?message=Complete%20your%20Yantra%20onboarding%20before%20opening%20your%20profile.&kind=info',
  });

  return <StudentProfilePage initialProfileData={result.profile} defaultProfileData={result.defaultProfile} />;
}
