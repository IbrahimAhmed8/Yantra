import type { Monaco } from '@monaco-editor/react';
import { Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { streamHint } from '@/api/ai';
import type { EditorFile, EditorTheme } from '@/types';
import type { editor as MonacoEditor } from 'monaco-editor';

interface HoverExplainProps {
  editor: MonacoEditor.IStandaloneCodeEditor | null;
  monaco?: Monaco | null;
  file: EditorFile | null;
  stderr?: string;
  theme: EditorTheme;
}

interface LineAnchorPosition {
  buttonTop: number;
  buttonLeft: number;
  popoverTop: number;
  popoverLeft: number;
}

interface ExplainPopoverState {
  lineNumber: number;
  content: string;
  isStreaming: boolean;
  top: number;
  left: number;
}

const CONTEXT_RADIUS = 5;

const buildLineContext = (file: EditorFile, lineNumber: number) => {
  const lines = file.content.split('\n');
  const start = Math.max(1, lineNumber - CONTEXT_RADIUS);
  const end = Math.min(lines.length, lineNumber + CONTEXT_RADIUS);

  return {
    context: lines.slice(start - 1, end).join('\n'),
    focusLineContent: lines[lineNumber - 1] ?? '',
  };
};

export const HoverExplain = ({ editor, file, theme }: HoverExplainProps) => {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [anchorPosition, setAnchorPosition] = useState<LineAnchorPosition | null>(null);
  const [popover, setPopover] = useState<ExplainPopoverState | null>(null);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const clearHoverTimeoutRef = useRef<number | null>(null);
  const isDark = theme === 'dark';

  const clearHover = useCallback(() => {
    setHoveredLine(null);
    setAnchorPosition(null);
  }, []);

  const cancelHoverClear = useCallback(() => {
    if (clearHoverTimeoutRef.current) {
      window.clearTimeout(clearHoverTimeoutRef.current);
      clearHoverTimeoutRef.current = null;
    }
  }, []);

  const scheduleHoverClear = useCallback(() => {
    cancelHoverClear();

    clearHoverTimeoutRef.current = window.setTimeout(() => {
      clearHover();
      clearHoverTimeoutRef.current = null;
    }, 110);
  }, [cancelHoverClear, clearHover]);

  const getAnchorPosition = useCallback(
    (lineNumber: number): LineAnchorPosition | null => {
      if (!editor) {
        return null;
      }

      const visiblePosition = editor.getScrolledVisiblePosition({
        lineNumber,
        column: 1,
      });

      if (!visiblePosition) {
        return null;
      }

      const layoutInfo = editor.getLayoutInfo();
      const containerWidth = editor.getContainerDomNode().clientWidth;

      return {
        buttonTop: visiblePosition.top + 6,
        buttonLeft: 44,
        popoverTop: visiblePosition.top + 10,
        popoverLeft: Math.max(
          layoutInfo.contentLeft + 12,
          Math.min(layoutInfo.contentLeft + 18, containerWidth - 296),
        ),
      };
    },
    [editor],
  );

  useEffect(() => {
    if (!editor || !file) {
      clearHover();
      setPopover(null);
      return;
    }

    const handleMove = editor.onMouseMove((event) => {
      const nextLine = event.target.position?.lineNumber;

      if (!nextLine) {
        scheduleHoverClear();
        return;
      }

      cancelHoverClear();
      setHoveredLine(nextLine);
      setAnchorPosition(getAnchorPosition(nextLine));
    });

    const handleLeave = editor.onMouseLeave(() => {
      scheduleHoverClear();
    });

    const handleScroll = editor.onDidScrollChange(() => {
      if (hoveredLine) {
        setAnchorPosition(getAnchorPosition(hoveredLine));
      }

      setPopover((current) => {
        if (!current) {
          return current;
        }

        const nextPosition = getAnchorPosition(current.lineNumber);

        if (!nextPosition) {
          return current;
        }

        return {
          ...current,
          top: nextPosition.popoverTop,
          left: nextPosition.popoverLeft,
        };
      });
    });

    const handleLayout = editor.onDidLayoutChange(() => {
      if (hoveredLine) {
        setAnchorPosition(getAnchorPosition(hoveredLine));
      }

      setPopover((current) => {
        if (!current) {
          return current;
        }

        const nextPosition = getAnchorPosition(current.lineNumber);

        if (!nextPosition) {
          return current;
        }

        return {
          ...current,
          top: nextPosition.popoverTop,
          left: nextPosition.popoverLeft,
        };
      });
    });

    return () => {
      handleMove.dispose();
      handleLeave.dispose();
      handleScroll.dispose();
      handleLayout.dispose();
    };
  }, [cancelHoverClear, clearHover, editor, file, getAnchorPosition, hoveredLine, scheduleHoverClear]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (buttonRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }

      setPopover(null);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPopover(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (clearHoverTimeoutRef.current) {
        window.clearTimeout(clearHoverTimeoutRef.current);
      }

      abortRef.current?.abort();
    };
  }, []);

  const handleExplain = async () => {
    if (!editor || !file || !hoveredLine) {
      return;
    }

    abortRef.current?.abort();

    const position = getAnchorPosition(hoveredLine);
    const { context, focusLineContent } = buildLineContext(file, hoveredLine);
    const controller = new AbortController();
    abortRef.current = controller;

    setPopover({
      lineNumber: hoveredLine,
      content: '',
      isStreaming: true,
      top: position?.popoverTop ?? 20,
      left: position?.popoverLeft ?? 96,
    });

    try {
      await streamHint(
        {
          code: context,
          language: file.language,
          task: `Explain line ${hoveredLine}`,
          context,
          selectedLine: hoveredLine,
          focusLineContent,
        },
        {
          signal: controller.signal,
          onToken: (token) =>
            setPopover((current) =>
              current && current.lineNumber === hoveredLine
                ? {
                    ...current,
                    content: `${current.content}${token}`,
                  }
                : current,
            ),
        },
      );
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setPopover((current) =>
          current && current.lineNumber === hoveredLine
            ? {
                ...current,
                content: error instanceof Error ? error.message : 'Yantra AI could not explain this line right now.',
              }
            : current,
        );
      }
    } finally {
      setPopover((current) =>
        current && current.lineNumber === hoveredLine
          ? {
              ...current,
              isStreaming: false,
            }
          : current,
      );

      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  };

  if (!editor || !file || !hoveredLine || !anchorPosition) {
    return popover ? (
      <div
        ref={popoverRef}
        className={`absolute z-20 w-[280px] rounded-[22px] border px-4 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.28)] ${
          isDark ? 'border-violet-400/20 bg-slate-950/95 text-slate-100' : 'border-violet-500/20 bg-white text-slate-900'
        }`}
        style={{
          top: popover.top,
          left: popover.left,
        }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className={`text-[11px] uppercase tracking-[0.18em] ${isDark ? 'text-violet-300' : 'text-violet-700'}`}>Yantra Explain</p>
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Line {popover.lineNumber}</p>
          </div>

          <button
            type="button"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
              isDark ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-900/10 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setPopover(null)}
            aria-label="Close explanation"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {popover.content}
          {popover.isStreaming ? <span className="ml-1 inline-block h-4 w-[2px] animate-pulse align-middle bg-current" /> : null}
        </p>
      </div>
    ) : null;
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="absolute z-10 inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_10px_24px_rgba(124,58,237,0.28)] transition hover:bg-violet-500"
        style={{
          top: anchorPosition.buttonTop,
          left: anchorPosition.buttonLeft,
        }}
        onMouseEnter={cancelHoverClear}
        onMouseLeave={scheduleHoverClear}
        onClick={() => {
          cancelHoverClear();
          void handleExplain();
        }}
      >
        <Sparkles className="h-3 w-3" />
        <span>Explain</span>
      </button>

      {popover ? (
        <div
          ref={popoverRef}
          className={`absolute z-20 w-[280px] rounded-[22px] border px-4 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.28)] ${
            isDark ? 'border-violet-400/20 bg-slate-950/95 text-slate-100' : 'border-violet-500/20 bg-white text-slate-900'
          }`}
          style={{
            top: popover.top,
            left: popover.left,
          }}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className={`text-[11px] uppercase tracking-[0.18em] ${isDark ? 'text-violet-300' : 'text-violet-700'}`}>Yantra Explain</p>
              <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Line {popover.lineNumber}</p>
            </div>

            <button
              type="button"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                isDark ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-900/10 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => setPopover(null)}
              aria-label="Close explanation"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {popover.content}
            {popover.isStreaming ? <span className="ml-1 inline-block h-4 w-[2px] animate-pulse align-middle bg-current" /> : null}
          </p>
        </div>
      ) : null}
    </>
  );
};
