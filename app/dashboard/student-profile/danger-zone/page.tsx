import { hasSupabaseServiceRoleEnv } from '@/src/lib/supabase/admin';
import { requireAuthenticatedProfile } from '@/src/lib/supabase/route-guards';
import DangerZonePageClient from '@/src/features/dashboard/DangerZonePageClient';

export default async function DangerZonePage() {
  await requireAuthenticatedProfile({
    unauthenticatedRedirect: '/login?message=Log%20in%20to%20continue.&kind=info',
  });

  return <DangerZonePageClient accountDeletionConfigured={hasSupabaseServiceRoleEnv()} />;
}
