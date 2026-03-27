import { redirect } from 'next/navigation';
import StudentDashboard from '@/src/features/dashboard/StudentDashboard';
import { getFirstName } from '@/src/features/dashboard/student-profile-model';
import { hasSupabaseEnv } from '@/src/lib/supabase/env';
import { getAuthenticatedProfile } from '@/src/lib/supabase/profiles';

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    redirect('/login?message=Configure%20Supabase%20first.&kind=error');
  }

  const result = await getAuthenticatedProfile();

  if (!result) {
    redirect('/login?message=Log%20in%20to%20open%20your%20dashboard.&kind=info');
  }

  return (
    <StudentDashboard
      fullName={result.profile.name}
      firstName={getFirstName(result.profile.name)}
      email={result.user.email ?? ''}
    />
  );
}
