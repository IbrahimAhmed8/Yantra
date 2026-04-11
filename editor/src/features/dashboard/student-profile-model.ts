export type StudentProfile = {
  id: string;
  name: string;
  skillLevel: string;
  progress: number;
  primaryLearningGoals: string[];
};

export const defaultStudentProfile: StudentProfile = {
  id: 'local-student-profile',
  name: 'Local Learner',
  skillLevel: 'intermediate',
  progress: 42,
  primaryLearningGoals: ['Python', 'Frontend fundamentals', 'Debugging confidence'],
};
