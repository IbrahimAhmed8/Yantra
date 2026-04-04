import { requireAuthenticatedProfile } from '@/src/lib/supabase/route-guards';
import PerformancePageClient from '@/src/features/dashboard/PerformancePageClient';

export default async function PerformancePage() {
  await requireAuthenticatedProfile({
    unauthenticatedRedirect: '/login?message=Log%20in%20to%20continue.&kind=info',
  });

  return <PerformancePageClient />;
}
