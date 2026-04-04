import { requireAuthenticatedProfile } from '@/src/lib/supabase/route-guards';
import RosterPageClient from '@/src/features/dashboard/RosterPageClient';

export default async function RosterPage() {
  const result = await requireAuthenticatedProfile({
    unauthenticatedRedirect: '/login?message=Log%20in%20to%20continue.&kind=info',
  });

  return <RosterPageClient initialProfileData={result.profile} defaultProfileData={result.defaultProfile} />;
}
