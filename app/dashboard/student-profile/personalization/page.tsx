import { requireAuthenticatedProfile } from '@/src/lib/supabase/route-guards';
import { getAuthenticatedPersonalizationProfile } from '@/src/lib/supabase/personalization';
import PersonalizationPageClient from '@/src/features/dashboard/PersonalizationPageClient';

export default async function PersonalizationPage() {
  await requireAuthenticatedProfile({
    unauthenticatedRedirect: '/login?message=Log%20in%20to%20continue.&kind=info',
  });

  const personalization = await getAuthenticatedPersonalizationProfile();

  return <PersonalizationPageClient personalization={personalization} />;
}
