import StudentDashboard from '@/src/features/dashboard/StudentDashboard';
import { requireAuthenticatedProfile } from '@/src/lib/supabase/route-guards';
import { getAuthenticatedDashboardData } from '@/src/lib/supabase/dashboard';

export default async function DashboardPage() {
  await requireAuthenticatedProfile({
    unauthenticatedRedirect: '/login?message=Log%20in%20to%20open%20your%20dashboard.&kind=info',
    requireOnboarding: true,
    onboardingRedirect: '/onboarding?message=Complete%20your%20Yantra%20onboarding%20before%20entering%20the%20dashboard.&kind=info',
  });

  const result = await getAuthenticatedDashboardData();

  if (!result) {
    return null;
  }

  return <StudentDashboard data={result} />;
}
