import type { EditorAuthedUser } from '@/editor/types';
import {
  buildStarterStudentDashboard,
  type StudentDashboardData,
} from '@/src/features/dashboard/student-dashboard-model';
import {
  defaultStudentProfile,
  normalizeStudentProfileInput,
  sanitizeStudentProfile,
  type StudentProfile,
} from '@/src/features/dashboard/student-profile-model';

export const PUBLIC_PROFILE_STORAGE_KEY = 'yantra-public-profile';
export const PUBLIC_VISITOR_ID = 'yantra-public-user';
export const PUBLIC_VISITOR_EMAIL = 'local@yantra.test';

export const PUBLIC_EDITOR_USER: EditorAuthedUser = {
  id: PUBLIC_VISITOR_ID,
  email: PUBLIC_VISITOR_EMAIL,
};

export function getPublicStudentProfile(profile: StudentProfile = defaultStudentProfile) {
  return sanitizeStudentProfile(profile);
}

export function buildPublicDashboardData(
  profile: StudentProfile = defaultStudentProfile,
): StudentDashboardData {
  return buildStarterStudentDashboard(getPublicStudentProfile(profile), PUBLIC_VISITOR_EMAIL);
}

export function readPublicProfileFromStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(PUBLIC_PROFILE_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return normalizeStudentProfileInput(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

export function savePublicProfileToStorage(profile: StudentProfile) {
  const safeProfile = getPublicStudentProfile(profile);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PUBLIC_PROFILE_STORAGE_KEY, JSON.stringify(safeProfile));
  }

  return safeProfile;
}
