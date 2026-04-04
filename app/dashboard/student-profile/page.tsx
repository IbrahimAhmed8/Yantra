import { requireAuthenticatedProfile } from '@/src/lib/supabase/route-guards';
import StudentProfileOverview from '@/src/features/dashboard/StudentProfileOverview';

export default async function StudentProfileIndexPage() {
  const result = await requireAuthenticatedProfile({
    unauthenticatedRedirect: '/login?message=Log%20in%20to%20open%20your%20profile.&kind=info',
  });

  return (
    <StudentProfileOverview
      initialProfileData={result.profile}
      defaultProfileData={result.defaultProfile}
    />
  );
}
