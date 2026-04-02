import { ChevronDown, ChevronUp, Eraser } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StdinInput } from '@/components/Execution/StdinInput';
import { TestCaseRunner } from '@/components/Execution/TestCaseRunner';
import { useEditorStore } from '@/store/useEditorStore';

const DEFAULT_PANEL_HEIGHT = 280;
const MIN_PANEL_HEIGHT = 150;
const MAX_PANEL_HEIGHT = 500;

type ConsoleView = 'output' | 'tests' | 'problems';

const TAB_ITEMS: ConsoleView[] = ['output', 'tests', 'problems'];

export const ConsolePanel = () => {
  const executionResult = useEditorStore((state) => state.executionResult);
  const executionStatus = useEditorStore((state) => state.executionStatus);
  const clearConsole = useEditorStore((state) => state.clearConsole);

  const [activeView, setActiveView] = useState<ConsoleView>('output');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [panelHeight, setPanelHeight] = useState(DEFAULT_PANEL_HEIGHT);

  const resizeStateRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const hasConsoleData = Boolean(executionResult?.stdout || executionResult?.stderr || executionResult);

  const problemLines = useMemo(
    () =>
      (executionResult?.stderr ?? '')
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter((line) => line.trim().length > 0),
    [executionResult?.stderr],
  );

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
        height: isCollapsed ? 36 : panelHeight,
        background: '#1e1e1e',
        borderColor: '#3c3c3c',
        transition: 'height 160ms ease',
      }}
    >
      <button
        type="button"
        className="h-1 w-full cursor-ns-resize border-0 p-0"
        style={{ background: '#3c3c3c' }}
        onMouseDown={startResize}
        aria-label="Resize console panel"
        title="Drag to resize console panel"
      />

      <div className="flex h-8 items-end justify-between px-4" style={{ background: '#1e1e1e' }}>
        <div className="flex items-end gap-5">
          {TAB_ITEMS.map((view) => {
            const isActive = activeView === view;

            return (
              <button
                key={view}
                type="button"
                className="border-b-2 pb-1.5 text-[12px] font-medium uppercase tracking-[0.12em] transition"
                style={{
                  borderBottomColor: isActive ? '#7C3AED' : 'transparent',
                  color: '#d4d4d4',
                  opacity: isActive ? 1 : 0.72,
                  background: 'transparent',
                }}
                onClick={() => setActiveView(view)}
              >
                {view}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 pb-1">
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-[#858585] transition hover:text-[#d4d4d4]"
            onClick={clearConsole}
            aria-label="Clear console"
            title="Clear console"
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-[#858585] transition hover:text-[#d4d4d4]"
            onClick={() => setIsCollapsed((value) => !value)}
            aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
            title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed ? (
        <div className="min-h-0 flex-1 overflow-hidden border-t" style={{ borderColor: '#3c3c3c' }}>
          {activeView === 'output' ? (
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 border-b px-4 py-3" style={{ borderColor: '#3c3c3c' }}>
                <StdinInput />
              </div>

              <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#858585' }}>
                      stdout
                    </p>
                    <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-5" style={{ color: '#d4d4d4' }}>
                      {executionResult?.stdout || 'No stdout captured yet.'}
                    </pre>
                  </div>

                  {executionResult?.stderr ? (
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#858585' }}>
                        stderr
                      </p>
                      <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-5" style={{ color: '#f44747' }}>
                        {executionResult.stderr}
                      </pre>
                    </div>
                  ) : null}
                </div>
              </div>

              <div
                className="shrink-0 border-t px-4 py-2 font-mono text-[11px]"
                style={{
                  borderColor: '#3c3c3c',
                  color: '#858585',
                }}
              >
                {`Exit ${executionResult ? executionResult.exitCode : '--'}  |  Time ${executionResult?.time ?? '--'}  |  Memory ${executionResult?.memory ?? '--'}`}
              </div>
            </div>
          ) : activeView === 'tests' ? (
            <TestCaseRunner />
          ) : (
            <div className="flex h-full min-h-0 flex-col">
              <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
                {problemLines.length > 0 ? (
                  <div className="space-y-2">
                    {problemLines.map((line, index) => (
                      <div
                        key={`${line}-${index}`}
                        className="border-b pb-2 font-mono text-[13px] leading-5"
                        style={{
                          borderColor: '#3c3c3c',
                          color: '#f44747',
                        }}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px]" style={{ color: '#858585' }}>
                    No problems have been detected.
                  </p>
                )}
              </div>

              <div
                className="shrink-0 border-t px-4 py-2 font-mono text-[11px]"
                style={{
                  borderColor: '#3c3c3c',
                  color: '#858585',
                }}
              >
                {`${problemLines.length} problem${problemLines.length === 1 ? '' : 's'}`}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
};
