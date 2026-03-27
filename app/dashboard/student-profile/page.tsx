import { redirect } from 'next/navigation';
import StudentProfilePage from '@/src/features/dashboard/StudentProfilePage';
import { hasSupabaseEnv } from '@/src/lib/supabase/env';
import { getAuthenticatedProfile } from '@/src/lib/supabase/profiles';

export default async function DashboardStudentProfilePage() {
  if (!hasSupabaseEnv()) {
    redirect('/login?message=Configure%20Supabase%20first.&kind=error');
  }

  const result = await getAuthenticatedProfile();

  if (!result) {
    redirect('/login?message=Log%20in%20to%20open%20your%20profile.&kind=info');
  }

  return <StudentProfilePage initialProfileData={result.profile} defaultProfileData={result.defaultProfile} />;
}
