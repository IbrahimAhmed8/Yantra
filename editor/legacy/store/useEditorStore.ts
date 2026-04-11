import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { executeCode } from '@/api/execute';
import type { AIMessage, AIPanelState, EditorFile, EditorTab, EditorTheme, ExecutionResult, ExecutionStatus } from '@/types';

interface EditorStore {
  activeFile: EditorFile | null;
  openTabs: EditorTab[];
  theme: EditorTheme;
  executionResult: ExecutionResult | null;
  executionStatus: ExecutionStatus;
  lastExecutedFileId: string | null;
  stdin: string;
  aiPanel: AIPanelState;
  challengeCompletion: {
    visible: boolean;
    challengeId: string | null;
    completedAt: number | null;
  };
  openTab: (file: EditorFile) => void;
  closeTab: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  toggleTheme: () => void;
  runCode: () => Promise<ExecutionResult | null>;
  clearConsole: () => void;
  setStdin: (value: string) => void;
  toggleAIPanel: () => void;
  setAIPanelOpen: (open: boolean) => void;
  sendAIMessage: (message: Pick<AIMessage, 'role' | 'content'> & Partial<Pick<AIMessage, 'isStreaming'>>) => string;
  clearAIChat: () => void;
  appendStreamToken: (messageId: string, token: string) => void;
  setAIMessageStreaming: (messageId: string, isStreaming: boolean) => void;
  showChallengeCompletion: (challengeId: string) => void;
  hideChallengeCompletion: () => void;
}

const DEFAULT_FILE: EditorFile = {
  id: 'untitled-python',
  name: 'untitled.py',
  language: 'python',
  content: '',
};

const toTab = (file: EditorFile): EditorTab => ({
  ...file,
  isDirty: false,
});

const toFile = (tab: EditorTab): EditorFile => ({
  id: tab.id,
  name: tab.name,
  language: tab.language,
  content: tab.content,
});

const createMessageId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `ai-message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

let statusResetTimer: number | null = null;

const scheduleStatusReset = (set: (partial: Partial<EditorStore>) => void) => {
  if (statusResetTimer) {
    clearTimeout(statusResetTimer);
  }

  statusResetTimer = window.setTimeout(() => {
    set({ executionStatus: 'idle' });
    statusResetTimer = null;
  }, 1500);
};

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      activeFile: DEFAULT_FILE,
      openTabs: [toTab(DEFAULT_FILE)],
      theme: 'dark',
      executionResult: null,
      executionStatus: 'idle',
      lastExecutedFileId: null,
      stdin: '',
      aiPanel: {
        open: false,
        messages: [],
      },
      challengeCompletion: {
        visible: false,
        challengeId: null,
        completedAt: null,
      },
      openTab: (file) =>
        set((state) => {
          const existingTab = state.openTabs.find((tab) => tab.id === file.id);

          if (existingTab) {
            return { activeFile: toFile(existingTab) };
          }

          const nextTab = toTab(file);

          return {
            activeFile: toFile(nextTab),
            openTabs: [...state.openTabs, nextTab],
          };
        }),
      closeTab: (fileId) =>
        set((state) => {
          if (state.openTabs.length === 1) {
            return state;
          }

          const closingIndex = state.openTabs.findIndex((tab) => tab.id === fileId);

          if (closingIndex === -1) {
            return state;
          }

          const nextTabs = state.openTabs.filter((tab) => tab.id !== fileId);
          const nextActiveTab =
            state.activeFile?.id === fileId
              ? nextTabs[Math.max(0, closingIndex - 1)] ?? nextTabs[0]
              : nextTabs.find((tab) => tab.id === state.activeFile?.id) ?? nextTabs[0];

          return {
            activeFile: nextActiveTab ? toFile(nextActiveTab) : null,
            openTabs: nextTabs,
          };
        }),
      setActiveFile: (fileId) =>
        set((state) => {
          const nextActiveTab = state.openTabs.find((tab) => tab.id === fileId);

          if (!nextActiveTab) {
            return state;
          }

          return {
            activeFile: toFile(nextActiveTab),
          };
        }),
      updateFileContent: (fileId, content) =>
        set((state) => {
          const nextTabs = state.openTabs.map((tab) =>
            tab.id === fileId
              ? {
                  ...tab,
                  content,
                  isDirty: tab.isDirty || tab.content !== content,
                }
              : tab,
          );

          const nextActiveTab = nextTabs.find((tab) => tab.id === state.activeFile?.id) ?? null;

          return {
            activeFile: nextActiveTab ? toFile(nextActiveTab) : null,
            openTabs: nextTabs,
          };
        }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
      runCode: async () => {
        const { activeFile, stdin } = get();

        if (!activeFile) {
          const errorResult: ExecutionResult = {
            stdout: '',
            stderr: 'No active file is available to execute.',
            exitCode: 1,
            time: '0ms',
            memory: '0 MB',
          };

          set({
            executionResult: errorResult,
            executionStatus: 'error',
          });
          scheduleStatusReset(set);
          return errorResult;
        }

        if (statusResetTimer) {
          clearTimeout(statusResetTimer);
          statusResetTimer = null;
        }

        set({
          executionStatus: 'running',
          lastExecutedFileId: activeFile.id,
        });

        try {
          const result = await executeCode({
            language: activeFile.language,
            code: activeFile.content,
            stdin,
          });

          set({
            executionResult: result,
            executionStatus: result.exitCode === 0 ? 'success' : 'error',
            lastExecutedFileId: activeFile.id,
          });
          scheduleStatusReset(set);
          return result;
        } catch (error) {
          const errorResult: ExecutionResult = {
            stdout: '',
            stderr: error instanceof Error ? error.message : 'Unable to run this file right now.',
            exitCode: 1,
            time: '0ms',
            memory: '0 MB',
          };

          set({
            executionResult: errorResult,
            executionStatus: 'error',
            lastExecutedFileId: activeFile.id,
          });
          scheduleStatusReset(set);
          return errorResult;
        }
      },
      clearConsole: () =>
        set({
          executionResult: null,
          executionStatus: 'idle',
          lastExecutedFileId: null,
        }),
      setStdin: (value) =>
        set({
          stdin: value,
        }),
      toggleAIPanel: () =>
        set((state) => ({
          aiPanel: {
            ...state.aiPanel,
            open: !state.aiPanel.open,
          },
        })),
      setAIPanelOpen: (open) =>
        set((state) => ({
          aiPanel: {
            ...state.aiPanel,
            open,
          },
        })),
      sendAIMessage: (message) => {
        const messageId = createMessageId();
        const nextMessage: AIMessage = {
          id: messageId,
          role: message.role,
          content: message.content,
          timestamp: new Date(),
          isStreaming: message.isStreaming ?? false,
        };

        set((state) => ({
          aiPanel: {
            ...state.aiPanel,
            messages: [...state.aiPanel.messages, nextMessage],
          },
        }));

        return messageId;
      },
      clearAIChat: () =>
        set((state) => ({
          aiPanel: {
            ...state.aiPanel,
            messages: [],
          },
        })),
      appendStreamToken: (messageId, token) =>
        set((state) => ({
          aiPanel: {
            ...state.aiPanel,
            messages: state.aiPanel.messages.map((message) =>
              message.id === messageId
                ? {
                    ...message,
                    content: `${message.content}${token}`,
                  }
                : message,
            ),
          },
        })),
      setAIMessageStreaming: (messageId, isStreaming) =>
        set((state) => ({
          aiPanel: {
            ...state.aiPanel,
            messages: state.aiPanel.messages.map((message) =>
              message.id === messageId
                ? {
                    ...message,
                    isStreaming,
                  }
                : message,
            ),
          },
        })),
      showChallengeCompletion: (challengeId) =>
        set({
          challengeCompletion: {
            visible: true,
            challengeId,
            completedAt: Date.now(),
          },
        }),
      hideChallengeCompletion: () =>
        set({
          challengeCompletion: {
            visible: false,
            challengeId: null,
            completedAt: null,
          },
        }),
    }),
    {
      name: 'yantra-editor-shell',
      partialize: (state) => ({ theme: state.theme, stdin: state.stdin }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
