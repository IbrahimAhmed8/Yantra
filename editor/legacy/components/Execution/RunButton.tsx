import { Check, LoaderCircle, Play, TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

export const RunButton = () => {
  const activeFile = useEditorStore((state) => state.activeFile);
  const executionStatus = useEditorStore((state) => state.executionStatus);
  const runCode = useEditorStore((state) => state.runCode);

  const isRunning = executionStatus === 'running';
  const isSuccess = executionStatus === 'success';
  const isError = executionStatus === 'error';
  const isDisabled = isRunning || !activeFile;

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey) || isDisabled) {
        return;
      }

      event.preventDefault();
      void runCode();
    };

    window.addEventListener('keydown', handleShortcut);

    return () => {
      window.removeEventListener('keydown', handleShortcut);
    };
  }, [isDisabled, runCode]);

  const baseClassName =
    'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-75';

  const statusStyle =
    isRunning
      ? {
          background: 'var(--yantra-sidebar)',
          borderColor: 'var(--yantra-border)',
          color: 'var(--yantra-foreground)',
        }
      : isSuccess
        ? {
            background: 'rgba(34, 197, 94, 0.12)',
            borderColor: 'rgba(34, 197, 94, 0.35)',
            color: '#bbf7d0',
          }
        : isError
          ? {
              background: 'rgba(244, 71, 71, 0.12)',
              borderColor: 'rgba(244, 71, 71, 0.35)',
              color: 'var(--yantra-error)',
            }
          : {
              background: 'var(--yantra-accent)',
              borderColor: 'var(--yantra-accent)',
              color: '#ffffff',
            };

  return (
    <button
      type="button"
      className={baseClassName}
      style={statusStyle}
      onClick={() => {
        void runCode();
      }}
      disabled={isDisabled}
      aria-label="Run active file"
      title="Run active file (Ctrl/Cmd + Enter)"
    >
      {isRunning ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : isSuccess ? (
        <Check className="h-4 w-4" />
      ) : isError ? (
        <TriangleAlert className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4 fill-current" />
      )}

      <span>{isRunning ? 'Running...' : isSuccess ? 'Success' : isError ? 'Error' : 'Run'}</span>
    </button>
  );
};
