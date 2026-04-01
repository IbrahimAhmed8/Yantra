import { Check, LoaderCircle, Play, TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

export const RunButton = () => {
  const activeFile = useEditorStore((state) => state.activeFile);
  const executionStatus = useEditorStore((state) => state.executionStatus);
  const runCode = useEditorStore((state) => state.runCode);
  const theme = useEditorStore((state) => state.theme);

  const isDark = theme === 'dark';
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
    'inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-75';

  const statusClassName = isRunning
    ? isDark
      ? 'border-white/10 bg-white/5 text-white'
      : 'border-slate-900/10 bg-white/90 text-slate-900'
    : isSuccess
      ? isDark
        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.18)]'
        : 'border-emerald-600/30 bg-emerald-500/12 text-emerald-700 shadow-[0_0_0_1px_rgba(5,150,105,0.12)]'
      : isError
        ? isDark
          ? 'border-rose-400/40 bg-rose-500/15 text-rose-200 shadow-[0_0_0_1px_rgba(244,63,94,0.18)]'
          : 'border-rose-600/30 bg-rose-500/12 text-rose-700 shadow-[0_0_0_1px_rgba(225,29,72,0.12)]'
        : 'border-violet-500/40 bg-violet-600 text-white shadow-[0_12px_32px_rgba(124,58,237,0.28)] hover:bg-violet-500';

  return (
    <button
      type="button"
      className={`${baseClassName} ${statusClassName}`}
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
      <span className={`hidden text-[11px] font-medium sm:inline ${isRunning ? 'opacity-0' : 'opacity-80'}`}>Ctrl/Cmd + Enter</span>
    </button>
  );
};
