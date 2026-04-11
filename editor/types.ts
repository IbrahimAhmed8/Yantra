import type { StudentProfile } from '@/src/features/dashboard/student-profile-model';

export type EditorTemplateKey = 'python-playground' | 'web-playground' | 'js-playground';

export type EditorFileLanguage =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'plaintext';

export type EditorPrimaryLanguage = 'python' | 'html' | 'javascript';

export type EditorAuthedUser = {
  id: string;
  email: string | null;
};

export type EditorAuthedProfile = StudentProfile;

export type EditorProjectSummary = {
  id: string;
  userId: string;
  title: string;
  templateKey: EditorTemplateKey;
  primaryLanguage: EditorPrimaryLanguage;
  createdAt: string;
  updatedAt: string;
};

export type EditorProjectFile = {
  id: string;
  projectId: string;
  path: string;
  language: EditorFileLanguage;
  content: string;
  sortOrder: number;
  isEntry: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EditorProjectDetails = {
  project: EditorProjectSummary;
  files: EditorProjectFile[];
};

export type EditorProjectFileInput = {
  path: string;
  language: EditorFileLanguage;
  content: string;
  sortOrder: number;
  isEntry: boolean;
};

export type EditorAssistRequest = {
  language: EditorFileLanguage;
  fileContent: string;
  selectedText?: string;
  learnerLevel?: string;
  question: string;
};

export type EditorAssistResponse = {
  reply: string;
  provider: string;
  modelUsed: string | null;
};
