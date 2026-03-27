export type StudentProfile = {
  name: string;
  classDesignation: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  academicYear: string;
};

export const defaultStudentProfile: StudentProfile = {
  name: 'Yantra Learner',
  classDesignation: 'Class 10',
  skillLevel: 'Beginner',
  progress: 0,
  academicYear: '2026',
};

export function sanitizeStudentProfile(profile: StudentProfile): StudentProfile {
  const safeName = profile.name.trim() || defaultStudentProfile.name;
  const safeClassDesignation = profile.classDesignation.trim() || defaultStudentProfile.classDesignation;
  const safeAcademicYear = profile.academicYear.trim() || defaultStudentProfile.academicYear;
  const safeProgress = Number.isFinite(profile.progress) ? Math.max(0, Math.min(100, Math.round(profile.progress))) : 0;

  return {
    name: safeName,
    classDesignation: safeClassDesignation,
    academicYear: safeAcademicYear,
    skillLevel:
      profile.skillLevel === 'Advanced' || profile.skillLevel === 'Intermediate' || profile.skillLevel === 'Beginner'
        ? profile.skillLevel
        : defaultStudentProfile.skillLevel,
    progress: safeProgress,
  };
}

export function normalizeStudentProfileInput(value: unknown) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<StudentProfile>;

  if (
    typeof candidate.name !== 'string' ||
    typeof candidate.classDesignation !== 'string' ||
    typeof candidate.academicYear !== 'string' ||
    typeof candidate.progress !== 'number' ||
    (candidate.skillLevel !== 'Beginner' &&
      candidate.skillLevel !== 'Intermediate' &&
      candidate.skillLevel !== 'Advanced')
  ) {
    return null;
  }

  return sanitizeStudentProfile({
    name: candidate.name,
    classDesignation: candidate.classDesignation,
    academicYear: candidate.academicYear,
    progress: candidate.progress,
    skillLevel: candidate.skillLevel,
  });
}

export function getFirstName(name: string) {
  const firstName = name.trim().split(/\s+/)[0];
  return firstName || 'Learner';
}
