import { requireAuthenticatedProfile } from '@/src/lib/supabase/route-guards';
import CurriculumPageClient from '@/src/features/dashboard/CurriculumPageClient';

export default async function CurriculumPage() {
  await requireAuthenticatedProfile({
    unauthenticatedRedirect: '/login?message=Log%20in%20to%20continue.&kind=info',
  });

  return <CurriculumPageClient />;
}
