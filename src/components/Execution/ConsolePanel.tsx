import { ChevronDown, ChevronUp, Eraser, GripHorizontal, Terminal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { StdinInput } from '@/components/Execution/StdinInput';
import { TestCaseRunner } from '@/components/Execution/TestCaseRunner';
import { useEditorStore } from '@/store/useEditorStore';

const DEFAULT_PANEL_HEIGHT = 200;
const MIN_PANEL_HEIGHT = 140;
const MAX_PANEL_HEIGHT = 420;

type ConsoleView = 'output' | 'tests';

export const ConsolePanel = () => {
  const executionResult = useEditorStore((state) => state.executionResult);
  const executionStatus = useEditorStore((state) => state.executionStatus);
  const clearConsole = useEditorStore((state) => state.clearConsole);
  const theme = useEditorStore((state) => state.theme);

  const [activeView, setActiveView] = useState<ConsoleView>('output');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [panelHeight, setPanelHeight] = useState(DEFAULT_PANEL_HEIGHT);

  const resizeStateRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const isDark = theme === 'dark';
  const hasConsoleData = Boolean(executionResult?.stdout || executionResult?.stderr || executionResult);

  useEffect(() => {
    if (executionStatus === 'running' || hasConsoleData) {
      setIsCollapsed(false);
    }
  }, [executionStatus, hasConsoleData]);

  const startResize = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isCollapsed) {
      return;
    }

    resizeStateRef.current = {
      startY: event.clientY,
      startHeight: panelHeight,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStateRef.current) {
        return;
      }

      const nextHeight = resizeStateRef.current.startHeight + (resizeStateRef.current.startY - moveEvent.clientY);

      setPanelHeight(Math.min(MAX_PANEL_HEIGHT, Math.max(MIN_PANEL_HEIGHT, nextHeight)));
    };

    const handleMouseUp = () => {
      resizeStateRef.current = null;
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <section
      className="flex shrink-0 flex-col border-t"
      style={{
        height: isCollapsed ? 56 : panelHeight,
        borderColor: 'var(--yantra-border)',
        background: isDark ? 'rgba(9, 9, 11, 0.72)' : 'rgba(250, 250, 250, 0.8)',
        transition: 'height 160ms ease',
      }}
    >
      <button
        type="button"
        className="flex h-4 items-center justify-center text-slate-500 transition hover:text-violet-400"
        onMouseDown={startResize}
        aria-label="Resize console panel"
        title="Drag to resize console panel"
      >
        <GripHorizontal className="h-4 w-4" />
      </button>

      <div className="flex items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--yantra-border)' }}>
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-violet-400" />
          <div className="flex items-center gap-2 rounded-full p-1" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(17,17,17,0.05)' }}>
            {(['output', 'tests'] as const).map((view) => (
              <button
                key={view}
                type="button"
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  activeView === view
                    ? 'bg-violet-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.25)]'
                    : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                }`}
                onClick={() => setActiveView(view)}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
              isDark
                ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                : 'border-slate-900/10 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            onClick={clearConsole}
          >
            <Eraser className="h-3.5 w-3.5" />
            Clear
          </button>

          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
              isDark
                ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                : 'border-slate-900/10 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setIsCollapsed((value) => !value)}
          >
            {isCollapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {isCollapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>

      {!isCollapsed ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          {activeView === 'output' ? (
            <div className="flex h-full min-h-0 flex-col gap-3 p-4">
              <StdinInput />

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    executionResult?.exitCode === 0
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : executionResult
                        ? 'bg-rose-500/15 text-rose-400'
                        : isDark
                          ? 'bg-white/5 text-slate-400'
                          : 'bg-slate-900/5 text-slate-500'
                  }`}
                >
                  Exit {executionResult ? executionResult.exitCode : '--'}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-900/5 text-slate-500'}`}>
                  Time {executionResult?.time ?? '--'}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-900/5 text-slate-500'}`}>
                  Memory {executionResult?.memory ?? '--'}
                </span>
              </div>

              <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-2">
                <section
                  className="flex min-h-0 flex-col rounded-2xl border"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.92)',
                    borderColor: 'var(--yantra-border)',
                  }}
                >
                  <div className="border-b px-4 py-3" style={{ borderColor: 'var(--yantra-border)' }}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">stdout</p>
                  </div>
                  <pre
                    className={`min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words px-4 py-4 font-mono text-sm ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {executionResult?.stdout || 'No stdout captured yet.'}
                  </pre>
                </section>

                <section
                  className="flex min-h-0 flex-col rounded-2xl border"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.92)',
                    borderColor: 'var(--yantra-border)',
                  }}
                >
                  <div className="border-b px-4 py-3" style={{ borderColor: 'var(--yantra-border)' }}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-400">stderr</p>
                  </div>
                  <pre
                    className={`min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words px-4 py-4 font-mono text-sm ${
                      isDark ? 'text-rose-300' : 'text-rose-700'
                    }`}
                  >
                    {executionResult?.stderr || 'No stderr.'}
                  </pre>
                </section>
              </div>
            </div>
          ) : (
            <TestCaseRunner />
          )}
        </div>
      ) : null}
    </section>
  );
};
