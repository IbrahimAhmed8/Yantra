import type { User } from '@supabase/supabase-js';
import {
  defaultStudentProfile,
  sanitizeStudentProfile,
  type StudentProfile,
} from '@/src/features/dashboard/student-profile-model';
import { createClient } from './server';

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  class_designation: string | null;
  skill_level: StudentProfile['skillLevel'] | null;
  progress: number | null;
  academic_year: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function deriveFullName(user: User) {
  const metadataName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === 'string'
        ? user.user_metadata.name
        : null;

  if (metadataName?.trim()) {
    return metadataName.trim();
  }

  if (user.email) {
    return user.email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return defaultStudentProfile.name;
}

export function buildDefaultStudentProfile(user: User): StudentProfile {
  return sanitizeStudentProfile({
    ...defaultStudentProfile,
    name: deriveFullName(user),
    academicYear: new Date().getFullYear().toString(),
  });
}

function mapProfileRowToStudentProfile(row: ProfileRow | null, user: User) {
  const seededProfile = buildDefaultStudentProfile(user);

  if (!row) {
    return seededProfile;
  }

  return sanitizeStudentProfile({
    name: row.full_name || seededProfile.name,
    classDesignation: row.class_designation || seededProfile.classDesignation,
    skillLevel: row.skill_level || seededProfile.skillLevel,
    progress: typeof row.progress === 'number' ? row.progress : seededProfile.progress,
    academicYear: row.academic_year || seededProfile.academicYear,
  });
}

function mapStudentProfileToRow(user: User, profile: StudentProfile): Omit<ProfileRow, 'created_at' | 'updated_at'> {
  const safeProfile = sanitizeStudentProfile(profile);

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: safeProfile.name,
    class_designation: safeProfile.classDesignation,
    skill_level: safeProfile.skillLevel,
    progress: safeProfile.progress,
    academic_year: safeProfile.academicYear,
  };
}

function isMissingSessionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.name === 'AuthSessionMissingError' || error.message.toLowerCase().includes('auth session missing');
}

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (isMissingSessionError(error)) {
      return null;
    }

    throw error;
  }

  return user;
}

export async function getAuthenticatedProfile() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const defaultProfile = buildDefaultStudentProfile(user);

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

  if (error) {
    throw error;
  }

  const existingProfile = (data as ProfileRow | null) ?? null;

  if (!existingProfile) {
    const { data: insertedData, error: insertError } = await supabase
      .from('profiles')
      .insert(mapStudentProfileToRow(user, defaultProfile))
      .select('*')
      .single();

    if (insertError) {
      throw insertError;
    }

    return {
      user,
      profile: mapProfileRowToStudentProfile(insertedData as ProfileRow, user),
      defaultProfile,
    };
  }

  return {
    user,
    profile: mapProfileRowToStudentProfile(existingProfile, user),
    defaultProfile,
  };
}

export async function updateAuthenticatedProfile(profile: StudentProfile) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .upsert(mapStudentProfileToRow(user, profile), { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return {
    user,
    profile: mapProfileRowToStudentProfile(data as ProfileRow, user),
    defaultProfile: buildDefaultStudentProfile(user),
  };
}
