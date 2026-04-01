export type Language = 'python' | 'javascript' | 'java' | 'cpp';

export type EditorTheme = 'dark' | 'light';

export interface EditorFile {
  id: string;
  name: string;
  language: Language;
  content: string;
}

export interface EditorTab extends EditorFile {
  isDirty: boolean;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  time: string;
  memory: string;
}

export type ExecutionStatus = 'idle' | 'running' | 'success' | 'error';

export interface ExecuteCodePayload {
  language: Language;
  code: string;
  stdin: string;
}

export const LANGUAGE_META: Record<
  Language,
  {
    label: string;
    icon: string;
    extension: string;
  }
> = {
  python: {
    label: 'Python',
    icon: 'Py',
    extension: 'py',
  },
  javascript: {
    label: 'JavaScript',
    icon: 'JS',
    extension: 'js',
  },
  java: {
    label: 'Java',
    icon: 'Jv',
    extension: 'java',
  },
  cpp: {
    label: 'C++',
    icon: 'C++',
    extension: 'cpp',
  },
};
