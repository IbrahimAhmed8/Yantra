import { Lightbulb, Wrench, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Monaco } from '@monaco-editor/react';
import type { editor as MonacoEditor } from 'monaco-editor';
import { streamHint } from '@/api/ai';
import type { EditorFile, EditorTheme, ParsedExecutionError } from '@/types';

interface InlineErrorFixProps {
  editor: MonacoEditor.IStandaloneCodeEditor | null;
  monaco: Monaco | null;
  file: EditorFile | null;
  stderr: string;
  theme: EditorTheme;
  onApplyFix: (lineNumber: number, replacementLine: string) => void;
}

interface FixOverlayState {
  lineNumber: number;
  message: string;
  content: string;
  isStreaming: boolean;
  top: number;
  left: number;
}

const CONTEXT_RADIUS = 5;
const ERROR_LINE_PATTERNS = [/line\s+(\d+)/i, /:(\d+):\d+/i, /:(\d+)\s*(?:error|warning|note)\b/i];

const buildLineContext = (file: EditorFile, lineNumber: number) => {
  const lines = file.content.split('\n');
  const start = Math.max(1, lineNumber - CONTEXT_RADIUS);
  const end = Math.min(lines.length, lineNumber + CONTEXT_RADIUS);

  return {
    context: lines.slice(start - 1, end).join('\n'),
    focusLineContent: lines[lineNumber - 1] ?? '',
  };
};

const parseExecutionErrors = (stderr: string, maxLineNumber: number) => {
  const errorMap = new Map<number, ParsedExecutionError>();

  for (const rawLine of stderr.split(/\r?\n/)) {
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      continue;
    }

    for (const pattern of ERROR_LINE_PATTERNS) {
      const match = pattern.exec(trimmedLine);

      if (!match) {
        continue;
      }

      const lineNumber = Number.parseInt(match[1] ?? '', 10);

      if (Number.isNaN(lineNumber) || lineNumber < 1 || lineNumber > maxLineNumber || errorMap.has(lineNumber)) {
        break;
      }

      errorMap.set(lineNumber, {
        lineNumber,
        message: trimmedLine,
      });
      break;
    }
  }

  return [...errorMap.values()].sort((left, right) => left.lineNumber - right.lineNumber);
};

const extractReplacementLine = (content: string) => {
  const replacementMatch = content.match(/replacement line:\s*(.+)/i);

  if (replacementMatch?.[1]) {
    return replacementMatch[1].trim().replace(/^`+|`+$/g, '');
  }

  const codeBlockMatch = content.match(/```[a-zA-Z0-9]*\n([\s\S]*?)```/);

  if (codeBlockMatch?.[1]) {
    const firstCodeLine = codeBlockMatch[1]
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0);

    if (firstCodeLine) {
      return firstCodeLine.replace(/^`+|`+$/g, '');
    }
  }

  const firstMeaningfulLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !/^why:/i.test(line) && !/^ai fix/i.test(line));

  return firstMeaningfulLine ? firstMeaningfulLine.replace(/^`+|`+$/g, '') : '';
};

export const InlineErrorFix = ({ editor, monaco, file, stderr, theme, onApplyFix }: InlineErrorFixProps) => {
  const [overlay, setOverlay] = useState<FixOverlayState | null>(null);
  const [viewportVersion, setViewportVersion] = useState(0);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isDark = theme === 'dark';
  const lineCount = file?.content.split('\n').length ?? 0;

  const errorLines = useMemo(() => parseExecutionErrors(stderr, lineCount), [lineCount, stderr]);

  const getAnchorPosition = (lineNumber: number) => {
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
      buttonTop: visiblePosition.top + 5,
      buttonLeft: 10,
      overlayTop: visiblePosition.top + 32,
      overlayLeft: Math.max(layoutInfo.contentLeft + 12, Math.min(layoutInfo.contentLeft + 18, containerWidth - 316)),
    };
  };

  const visibleButtons = useMemo(() => {
    if (!editor) {
      return [];
    }

    return errorLines
      .map((errorLine) => {
        const anchorPosition = getAnchorPosition(errorLine.lineNumber);

        if (!anchorPosition) {
          return null;
        }

        return {
          ...errorLine,
          top: anchorPosition.buttonTop,
          left: anchorPosition.buttonLeft,
        };
      })
      .filter((value): value is ParsedExecutionError & { top: number; left: number } => value !== null);
  }, [editor, errorLines, viewportVersion]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleScroll = editor.onDidScrollChange(() => {
      setViewportVersion((current) => current + 1);
    });

    const handleLayout = editor.onDidLayoutChange(() => {
      setViewportVersion((current) => current + 1);
    });

    return () => {
      handleScroll.dispose();
      handleLayout.dispose();
    };
  }, [editor]);

  useEffect(() => {
    if (!monaco || !editor) {
      return;
    }

    const model = editor.getModel();

    if (!model) {
      return;
    }

    monaco.editor.setModelMarkers(
      model,
      'yantra-inline-error',
      errorLines.map((errorLine) => ({
        severity: monaco.MarkerSeverity.Error,
        message: errorLine.message,
        startLineNumber: errorLine.lineNumber,
        endLineNumber: errorLine.lineNumber,
        startColumn: 1,
        endColumn: model.getLineMaxColumn(errorLine.lineNumber),
      })),
    );

    return () => {
      monaco.editor.setModelMarkers(model, 'yantra-inline-error', []);
    };
  }, [editor, errorLines, monaco]);

  useEffect(() => {
    setOverlay((current) => {
      if (!current) {
        return current;
      }

      const anchorPosition = getAnchorPosition(current.lineNumber);

      if (!anchorPosition) {
        return current;
      }

      return {
        ...current,
        top: anchorPosition.overlayTop,
        left: anchorPosition.overlayLeft,
      };
    });
  }, [viewportVersion]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (overlayRef.current?.contains(target)) {
        return;
      }

      setOverlay(null);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOverlay(null);
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
      abortRef.current?.abort();
    };
  }, []);

  const handleRequestFix = async (errorLine: ParsedExecutionError) => {
    if (!editor || !file) {
      return;
    }

    abortRef.current?.abort();

    const anchorPosition = getAnchorPosition(errorLine.lineNumber);
    const { context, focusLineContent } = buildLineContext(file, errorLine.lineNumber);
    const controller = new AbortController();
    abortRef.current = controller;

    setOverlay({
      lineNumber: errorLine.lineNumber,
      message: errorLine.message,
      content: '',
      isStreaming: true,
      top: anchorPosition?.overlayTop ?? 48,
      left: anchorPosition?.overlayLeft ?? 96,
    });

    try {
      await streamHint(
        {
          code: context,
          language: file.language,
          task: `Fix the error on line ${errorLine.lineNumber}. Respond with "Replacement line:" first, then a brief explanation.`,
          context,
          selectedLine: errorLine.lineNumber,
          focusLineContent,
          errorMessage: errorLine.message,
        },
        {
          signal: controller.signal,
          onToken: (token) =>
            setOverlay((current) =>
              current && current.lineNumber === errorLine.lineNumber
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
        setOverlay((current) =>
          current && current.lineNumber === errorLine.lineNumber
            ? {
                ...current,
                content: error instanceof Error ? error.message : 'Yantra AI could not suggest a fix right now.',
              }
            : current,
        );
      }
    } finally {
      setOverlay((current) =>
        current && current.lineNumber === errorLine.lineNumber
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

  if (!editor || !file || errorLines.length === 0) {
    return null;
  }

  const replacementLine = overlay ? extractReplacementLine(overlay.content) : '';

  return (
    <>
      {visibleButtons.map((errorLine) => (
        <button
          key={`${errorLine.lineNumber}-${errorLine.message}`}
          type="button"
          className="absolute z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/95 text-sm shadow-[0_12px_28px_rgba(217,119,6,0.24)] transition hover:scale-[1.04]"
          style={{
            top: errorLine.top,
            left: errorLine.left,
          }}
          onClick={() => {
            void handleRequestFix(errorLine);
          }}
          aria-label={`Get AI fix for line ${errorLine.lineNumber}`}
          title={`Get AI fix for line ${errorLine.lineNumber}`}
        >
          <Lightbulb className="h-4 w-4" />
        </button>
      ))}

      {overlay ? (
        <div
          ref={overlayRef}
          className={`absolute z-20 w-[300px] rounded-[22px] border px-4 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.28)] ${
            isDark ? 'border-amber-400/20 bg-slate-950/96 text-slate-100' : 'border-amber-500/20 bg-white text-slate-900'
          }`}
          style={{
            top: overlay.top,
            left: overlay.left,
          }}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                <Wrench className="h-3.5 w-3.5" />
                AI Fix Suggestion
              </p>
              <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Line {overlay.lineNumber}</p>
            </div>

            <button
              type="button"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                isDark ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-900/10 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => setOverlay(null)}
              aria-label="Close AI fix suggestion"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className={`mb-3 rounded-2xl px-3 py-2 text-xs leading-5 ${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-900/[0.04] text-slate-600'}`}>
            {overlay.message}
          </p>

          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {overlay.content}
            {overlay.isStreaming ? <span className="ml-1 inline-block h-4 w-[2px] animate-pulse align-middle bg-current" /> : null}
          </p>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                isDark
                  ? 'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10'
                  : 'border-slate-900/10 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => setOverlay(null)}
            >
              Dismiss
            </button>

            <button
              type="button"
              className="rounded-full bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(124,58,237,0.28)] transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-violet-400/60"
              onClick={() => {
                if (!replacementLine) {
                  return;
                }

                onApplyFix(overlay.lineNumber, replacementLine);
                setOverlay(null);
              }}
              disabled={overlay.isStreaming || replacementLine.length === 0}
            >
              Apply Fix
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};
