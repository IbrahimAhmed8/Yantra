import type { User } from '@supabase/supabase-js';
import {
  defaultStudentProfile,
  normalizeAgeRange,
  normalizeLearningPace,
  normalizePrimaryLearningGoals,
  normalizeUserRole,
  sanitizeStudentProfile,
  type StudentProfile,
} from '@/src/features/dashboard/student-profile-model';
import { createClient } from './server';

type EnhancedProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  class_designation: string | null;
  skill_level: StudentProfile['skillLevel'] | null;
  progress: number | null;
  academic_year: string | null;
  user_role: string | null;
  age_range: string | null;
  primary_learning_goals: string[] | null;
  learning_pace: string | null;
  onboarding_completed: boolean | null;
  onboarding_completed_at: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type OnboardingProfileRow = Omit<
  EnhancedProfileRow,
  'age_range' | 'primary_learning_goals' | 'learning_pace'
>;

type LegacyProfileRow = Omit<
  EnhancedProfileRow,
  'user_role' | 'age_range' | 'primary_learning_goals' | 'learning_pace' | 'onboarding_completed' | 'onboarding_completed_at'
>;

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

function buildDefaultStudentProfileForUserContext(user: User, profile: StudentProfile) {
  const defaultProfile = buildDefaultStudentProfile(user);

  return sanitizeStudentProfile({
    ...defaultProfile,
    userRole: profile.userRole,
    ageRange: profile.ageRange,
    primaryLearningGoals: profile.primaryLearningGoals,
    learningPace: profile.learningPace,
    onboardingCompleted: profile.onboardingCompleted,
    onboardingCompletedAt: profile.onboardingCompletedAt,
  });
}

function mapProfileRowToStudentProfile(row: Partial<EnhancedProfileRow> | null, user: User) {
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
    userRole: normalizeUserRole(row.user_role),
    ageRange: normalizeAgeRange(row.age_range),
    primaryLearningGoals: normalizePrimaryLearningGoals(row.primary_learning_goals),
    learningPace: normalizeLearningPace(row.learning_pace),
    onboardingCompleted: Boolean(row.onboarding_completed),
    onboardingCompletedAt: row.onboarding_completed_at ?? null,
  });
}

function mapStudentProfileToEnhancedRow(
  user: User,
  profile: StudentProfile,
): Omit<EnhancedProfileRow, 'created_at' | 'updated_at'> {
  const safeProfile = sanitizeStudentProfile(profile);

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: safeProfile.name,
    class_designation: safeProfile.classDesignation,
    skill_level: safeProfile.skillLevel,
    progress: safeProfile.progress,
    academic_year: safeProfile.academicYear,
    user_role: safeProfile.userRole,
    age_range: safeProfile.ageRange,
    primary_learning_goals: safeProfile.primaryLearningGoals,
    learning_pace: safeProfile.learningPace,
    onboarding_completed: safeProfile.onboardingCompleted,
    onboarding_completed_at: safeProfile.onboardingCompletedAt,
  };
}

function mapStudentProfileToOnboardingRow(
  user: User,
  profile: StudentProfile,
): Omit<OnboardingProfileRow, 'created_at' | 'updated_at'> {
  const safeProfile = sanitizeStudentProfile(profile);

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: safeProfile.name,
    class_designation: safeProfile.classDesignation,
    skill_level: safeProfile.skillLevel,
    progress: safeProfile.progress,
    academic_year: safeProfile.academicYear,
    user_role: safeProfile.userRole,
    onboarding_completed: safeProfile.onboardingCompleted,
    onboarding_completed_at: safeProfile.onboardingCompletedAt,
  };
}

function mapStudentProfileToLegacyRow(
  user: User,
  profile: StudentProfile,
): Omit<LegacyProfileRow, 'created_at' | 'updated_at'> {
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

function getErrorCode(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return '';
  }

  return String((error as { code?: unknown }).code ?? '');
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.toLowerCase();
  }

  if (!error || typeof error !== 'object' || !('message' in error)) {
    return '';
  }

  return String((error as { message?: unknown }).message ?? '').toLowerCase();
}

function isMissingProfilesStorageError(error: unknown) {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('relation') ||
    message.includes('could not find the table') ||
    message.includes('does not exist')
  );
}

function isProfileAccessError(error: unknown) {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  return code === '42501' || message.includes('permission denied') || message.includes('row-level security');
}

function isRecoverableProfileStorageError(error: unknown) {
  return isMissingProfilesStorageError(error) || isProfileAccessError(error);
}

function isSupabaseSchemaError(
  error: unknown,
  column:
    | 'user_role'
    | 'onboarding_completed'
    | 'onboarding_completed_at'
    | 'age_range'
    | 'primary_learning_goals'
    | 'learning_pace',
) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as { code?: unknown; message?: unknown };

  return (
    (candidate.code === 'PGRST204' || candidate.code === '42703') &&
    typeof candidate.message === 'string' &&
    (candidate.message.includes(`'${column}' column`) ||
      candidate.message.includes(`profiles.${column}`) ||
      candidate.message.includes(column))
  );
}

function isMissingOnboardingSchemaError(error: unknown) {
  return (
    isSupabaseSchemaError(error, 'user_role') ||
    isSupabaseSchemaError(error, 'onboarding_completed') ||
    isSupabaseSchemaError(error, 'onboarding_completed_at')
  );
}

function isMissingEnhancedOnboardingSchemaError(error: unknown) {
  return (
    isSupabaseSchemaError(error, 'age_range') ||
    isSupabaseSchemaError(error, 'primary_learning_goals') ||
    isSupabaseSchemaError(error, 'learning_pace')
  );
}

async function supportsOnboardingProfileSchema(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { error } = await supabase.from('profiles').select('onboarding_completed').limit(1);

  if (!error) {
    return true;
  }

  if (isMissingOnboardingSchemaError(error)) {
    return false;
  }

  throw error;
}

async function supportsEnhancedOnboardingProfileSchema(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { error } = await supabase
    .from('profiles')
    .select('age_range, primary_learning_goals, learning_pace')
    .limit(1);

  if (!error) {
    return true;
  }

  if (isMissingEnhancedOnboardingSchemaError(error)) {
    return false;
  }

  throw error;
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

  try {
    const supportsOnboardingSchema = await supportsOnboardingProfileSchema(supabase);
    const supportsEnhancedOnboardingSchema = supportsOnboardingSchema
      ? await supportsEnhancedOnboardingProfileSchema(supabase)
      : false;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

    if (error) {
      throw error;
    }

    const existingProfile = (data as Partial<EnhancedProfileRow> | null) ?? null;

    if (!existingProfile) {
      const { data: insertedData, error: insertError } = supportsEnhancedOnboardingSchema
        ? await supabase
            .from('profiles')
            .insert(mapStudentProfileToEnhancedRow(user, defaultProfile))
            .select('*')
            .single()
        : supportsOnboardingSchema
          ? await supabase
              .from('profiles')
              .insert(mapStudentProfileToOnboardingRow(user, defaultProfile))
              .select('*')
              .single()
          : await supabase.from('profiles').insert(mapStudentProfileToLegacyRow(user, defaultProfile)).select('*').single();

      if (insertError) {
        throw insertError;
      }

      const insertedProfile = mapProfileRowToStudentProfile(insertedData as Partial<EnhancedProfileRow>, user);

      return {
        user,
        profile: insertedProfile,
        defaultProfile: buildDefaultStudentProfileForUserContext(user, insertedProfile),
        supportsOnboardingSchema,
        supportsEnhancedOnboardingSchema,
      };
    }

    const mappedProfile = mapProfileRowToStudentProfile(existingProfile, user);

    return {
      user,
      profile: mappedProfile,
      defaultProfile: buildDefaultStudentProfileForUserContext(user, mappedProfile),
      supportsOnboardingSchema,
      supportsEnhancedOnboardingSchema,
    };
  } catch (error) {
    if (!isRecoverableProfileStorageError(error)) {
      throw error;
    }

    return {
      user,
      profile: defaultProfile,
      defaultProfile: buildDefaultStudentProfileForUserContext(user, defaultProfile),
      supportsOnboardingSchema: false,
      supportsEnhancedOnboardingSchema: false,
    };
  }
}

export async function updateAuthenticatedProfile(profile: StudentProfile) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const supportsOnboardingSchema = await supportsOnboardingProfileSchema(supabase);
  const supportsEnhancedOnboardingSchema = supportsOnboardingSchema
    ? await supportsEnhancedOnboardingProfileSchema(supabase)
    : false;
  const { data, error } = supportsEnhancedOnboardingSchema
    ? await supabase
        .from('profiles')
        .upsert(mapStudentProfileToEnhancedRow(user, profile), { onConflict: 'id' })
        .select('*')
        .single()
    : supportsOnboardingSchema
      ? await supabase
          .from('profiles')
          .upsert(mapStudentProfileToOnboardingRow(user, profile), { onConflict: 'id' })
          .select('*')
          .single()
      : await supabase
          .from('profiles')
          .upsert(mapStudentProfileToLegacyRow(user, profile), { onConflict: 'id' })
          .select('*')
          .single();

  if (error) {
    throw error;
  }

  const mappedProfile = mapProfileRowToStudentProfile(data as Partial<EnhancedProfileRow>, user);

  return {
    user,
    profile: mappedProfile,
    defaultProfile: buildDefaultStudentProfileForUserContext(user, mappedProfile),
    supportsOnboardingSchema,
    supportsEnhancedOnboardingSchema,
  };
}
