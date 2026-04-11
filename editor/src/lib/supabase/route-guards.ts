import { defaultStudentProfile } from '@/src/features/dashboard/student-profile-model';

const DEV_USER = {
  id: 'local-dev-user',
  email: 'local-dev@yantra.test',
};

export async function requireAuthenticatedProfile(_options?: { unauthenticatedRedirect?: string }) {
  return {
    user: DEV_USER,
    profile: defaultStudentProfile,
  };
}
