'use client';

import type { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, CirclePlay, Clock3, FileCode2, FlaskConical, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import YantraMobileMenu from '@/src/features/navigation/YantraMobileMenu';
import RoomVoiceAssistant, { type RoomVoiceAssistantHandle } from '@/src/features/rooms/RoomVoiceAssistant';
import {
  buildPythonRoomTranscriptLabel,
  createPythonFeedbackCacheKey,
  type PythonRoomFeedbackRequest,
  type PythonRoomFeedbackResponse,
} from './python-feedback';
import { type PythonRunError, type PythonRunResult, runPythonInBrowser, warmPyodideRuntime } from './pyodide-runtime';
import { pythonRoomDayOneContent } from './python-room-content';

type MonacoNamespace = typeof import('monaco-editor');

const RUNTIME_ERROR_MARKER_OWNER = 'yantra-python-runtime';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((module) => module.default), {
  ssr: false,
  loading: () => (
    <div className="h-full rounded-[1.5rem] border border-white/8 bg-white/[0.035] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.38)]">
      <div className="flex items-center gap-2">
        <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-3 w-16 animate-pulse rounded-full bg-white/8" />
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="h-4 animate-pulse rounded bg-white/[0.06]"
            style={{ width: `${72 + ((index * 13) % 24)}%` }}
          />
        ))}
      </div>
    </div>
  ),
});

function PythonRoomAmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#040404]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.05),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_26%,transparent_78%,rgba(255,255,255,0.03))]" />
      <div className="absolute left-[-12%] top-[-18%] h-[28rem] w-[28rem] rounded-full bg-white/[0.05] blur-[120px]" />
      <div className="absolute bottom-[-26%] right-[-8%] h-[34rem] w-[34rem] rounded-full bg-white/[0.04] blur-[150px]" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '140px 140px',
          maskImage: 'radial-gradient(circle at center, black 36%, transparent 84%)',
        }}
      />
    </div>
  );
}

export default function PythonRoomShell() {
  const [code, setCode] = useState(pythonRoomDayOneContent.starterCode);
  const [useDesktopEditor, setUseDesktopEditor] = useState(false);
  const [runtimeState, setRuntimeState] = useState<'warming' | 'idle' | 'running' | 'success' | 'error'>('warming');
  const [output, setOutput] = useState('Python runtime is warming up in the background. Your first run may take a few seconds.');
  const [runtimeErrorLine, setRuntimeErrorLine] = useState<number | null>(null);
  const mobileEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<MonacoNamespace | null>(null);
  const decorationIdsRef = useRef<string[]>([]);
  const voiceAssistantRef = useRef<RoomVoiceAssistantHandle | null>(null);
  const feedbackCacheRef = useRef<Map<string, PythonRoomFeedbackResponse>>(new Map());

  const outputLabel = useMemo(
    () =>
      ({
        warming: 'Python runtime is loading in the browser for the first time.',
        idle: 'Output panel is ready for your first real run.',
        running: 'Executing Python in the browser now.',
        success: 'Real Python output from the current run.',
        error: runtimeErrorLine ? `Python raised an error for this run. Start with line ${runtimeErrorLine}.` : 'Python raised an error for this run.',
      })[runtimeState],
    [runtimeErrorLine, runtimeState],
  );

  const outputBadgeLabel = useMemo(
    () =>
      ({
        warming: 'Loading runtime',
        idle: 'Ready',
        running: 'Running',
        success: 'Executed',
        error: 'Error',
      })[runtimeState],
    [runtimeState],
  );

  const outputBadgeClassName = useMemo(
    () =>
      ({
        warming: 'text-white/58',
        idle: 'text-white/58',
        running: 'text-white',
        success: 'text-emerald-200',
        error: 'text-rose-200',
      })[runtimeState],
    [runtimeState],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia('(min-width: 768px)');
    const updateEditorMode = () => setUseDesktopEditor(media.matches);

    updateEditorMode();
    media.addEventListener('change', updateEditorMode);

    return () => {
      media.removeEventListener('change', updateEditorMode);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    void warmPyodideRuntime().then((isReady) => {
      if (!isMounted) {
        return;
      }

      if (isReady) {
        setRuntimeState((current) => (current === 'warming' ? 'idle' : current));
        return;
      }

      setRuntimeState((current) => (current === 'warming' ? 'error' : current));
      setOutput('Python runtime failed to initialize. Check your connection and try running the room again.');
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (useDesktopEditor || !mobileEditorRef.current) {
      return;
    }

    const textarea = mobileEditorRef.current;
    textarea.style.height = '0px';
    textarea.style.height = `${Math.max(textarea.scrollHeight, 320)}px`;
  }, [code, useDesktopEditor]);

  const clearRuntimeErrorMarkers = () => {
    setRuntimeErrorLine(null);

    if (!editorRef.current || !monacoRef.current) {
      return;
    }

    const model = editorRef.current.getModel();
    if (!model) {
      return;
    }

    monacoRef.current.editor.setModelMarkers(model, RUNTIME_ERROR_MARKER_OWNER, []);
    decorationIdsRef.current = editorRef.current.deltaDecorations(decorationIdsRef.current, []);
  };

  const applyRuntimeErrorMarkers = (error: PythonRunError) => {
    if (!error.line) {
      setRuntimeErrorLine(null);
      return;
    }

    setRuntimeErrorLine(error.line);

    if (!editorRef.current || !monacoRef.current) {
      return;
    }

    const model = editorRef.current.getModel();
    if (!model) {
      return;
    }

    const lineNumber = Math.min(Math.max(error.line, 1), model.getLineCount());
    const lastColumn = model.getLineMaxColumn(lineNumber);

    monacoRef.current.editor.setModelMarkers(model, RUNTIME_ERROR_MARKER_OWNER, [
      {
        severity: monacoRef.current.MarkerSeverity.Error,
        message: `${error.type}: ${error.message}`,
        startLineNumber: lineNumber,
        endLineNumber: lineNumber,
        startColumn: 1,
        endColumn: lastColumn,
      },
    ]);

    decorationIdsRef.current = editorRef.current.deltaDecorations(decorationIdsRef.current, [
      {
        range: new monacoRef.current.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'yantra-runtime-error-line',
          linesDecorationsClassName: 'yantra-runtime-error-decoration',
          overviewRuler: {
            color: '#fb7185',
            position: monacoRef.current.editor.OverviewRulerLane.Full,
          },
        },
      },
    ]);

    editorRef.current.revealLineInCenterIfOutsideViewport(lineNumber);
  };

  const handleEditorMount: OnMount = (editorInstance, monaco) => {
    editorRef.current = editorInstance;
    monacoRef.current = monaco;
  };

  const handleCodeChange = (nextCode: string) => {
    setCode(nextCode);
    clearRuntimeErrorMarkers();
  };

  const buildFallbackReply = (error: PythonRunError) => {
    if (error.line) {
      return `Yantra could not analyze this error right now. Start with line ${error.line}, check the traceback below, then run again.`;
    }

    return 'Yantra could not analyze this error right now. Start with the traceback below, fix the first failing statement, then run again.';
  };

  const requestPythonRoomFeedback = async (result: PythonRunResult, submittedCode: string) => {
    if (result.status !== 'error' || !result.error) {
      return;
    }

    const requestBody: PythonRoomFeedbackRequest = {
      trigger: 'runtime_error',
      task: pythonRoomDayOneContent.task,
      code: submittedCode,
      stdout: result.stdout,
      stderr: result.stderr,
      error: result.error,
    };
    const cacheKey = createPythonFeedbackCacheKey(requestBody);

    try {
      let feedback = feedbackCacheRef.current.get(cacheKey);

      if (!feedback) {
        const response = await fetch('/api/rooms/python/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        const data = (await response.json().catch(() => ({}))) as PythonRoomFeedbackResponse & { error?: string };

        if (!response.ok || !data.reply?.trim()) {
          throw new Error(data.error || 'Yantra could not analyze this Python error right now.');
        }

        feedback = {
          reply: data.reply.trim(),
          provider: data.provider,
          modelUsed: data.modelUsed ?? null,
        };
        if (feedback.provider !== 'local-room-feedback' && feedback.provider !== 'ring-exhausted') {
          feedbackCacheRef.current.set(cacheKey, feedback);
        }
      }

      await voiceAssistantRef.current?.announceSystemReply({
        transcriptLabel: buildPythonRoomTranscriptLabel(result.error),
        reply: feedback.reply,
        autoOpen: true,
        autoSpeak: true,
      });
    } catch (feedbackError) {
      console.error('Python room feedback request failed:', feedbackError);
      await voiceAssistantRef.current?.announceSystemReply({
        transcriptLabel: buildPythonRoomTranscriptLabel(result.error),
        reply: buildFallbackReply(result.error),
        autoOpen: true,
        autoSpeak: false,
      });
    }
  };

  const handleRun = async () => {
    const submittedCode = code;
    clearRuntimeErrorMarkers();
    voiceAssistantRef.current?.clearSystemReply();
    setRuntimeState('running');
    setOutput('Executing your Python code in-browser...');

    const result = await runPythonInBrowser(submittedCode);

    setRuntimeState(result.status);
    setOutput(result.output);

    if (result.status !== 'error' || !result.error) {
      return;
    }

    applyRuntimeErrorMarkers(result.error);
    await requestPythonRoomFeedback(result, submittedCode);
  };

  return (
    <div className="min-h-[100svh] bg-black text-white selection:bg-white selection:text-black sm:min-h-screen">
      <PythonRoomAmbientBackground />

      <header className="sticky top-0 z-30 border-b border-white/8 bg-black/72 backdrop-blur-2xl">
        <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-3 md:items-center">
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              <Link href="/dashboard" className="font-heading text-3xl tracking-wider text-white hoverable sm:text-4xl">
                YANTRA
              </Link>

              <div className="hidden h-5 w-px bg-white/10 sm:block" />

              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/40">Session</div>
                <div className="truncate font-mono text-[11px] uppercase tracking-[0.22em] text-white/70 sm:text-[12px]">
                  Python Room Calibration
                </div>
              </div>
            </div>

            <YantraMobileMenu
              menuId="python-room-mobile-menu"
              title="Python Room"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Docs', href: '/docs/first-dashboard-session' },
                { label: 'Python Room', href: '/dashboard/rooms/python' },
              ]}
              footerItems={[{ label: 'Exit Room', href: '/dashboard', tone: 'primary' }]}
              triggerClassName="flex-shrink-0 text-white hoverable md:hidden"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 md:mt-0 md:justify-end">
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/78">
              {pythonRoomDayOneContent.level}
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/78">
              Python Room
            </div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-xl">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[22%] rounded-full bg-white" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/62">22% ready</span>
            </div>
            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/[0.08] hoverable md:inline-flex"
            >
              <ArrowLeft size={14} />
              Exit Room
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] overflow-x-hidden px-3 pb-8 pt-5 sm:px-6 sm:pb-10 lg:px-8 lg:pb-12">
        <div className="space-y-5 lg:hidden">
          <section className="relative overflow-hidden rounded-[1.75rem] border border-white/8 bg-white/[0.035] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.34)] backdrop-blur-[24px]">
            <div className="pointer-events-none absolute -left-2 top-2 select-none font-display text-[4.4rem] leading-none text-white/[0.04]">
              01
            </div>

            <div className="relative">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 backdrop-blur-xl">
                <Sparkles size={14} className="text-white/80" />
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/70">Day 1 shell</span>
              </div>

              <h1 className="mt-5 max-w-[15rem] font-display text-[2.8rem] font-semibold leading-[0.9] tracking-tight text-white">
                {pythonRoomDayOneContent.title}
              </h1>

              <p className="mt-4 text-sm leading-relaxed text-white/64">{pythonRoomDayOneContent.description}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.35rem] border border-white/8 bg-black/26 p-4">
                  <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
                    <Clock3 size={14} className="text-white/60" />
                    Estimated time
                  </div>
                  <div className="mt-3 font-display text-[2rem] font-medium text-white">{pythonRoomDayOneContent.estimatedMinutes} min</div>
                </div>

                <div className="rounded-[1.35rem] border border-white/8 bg-black/26 p-4">
                  <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
                    <FlaskConical size={14} className="text-white/60" />
                    Mode
                  </div>
                  <div className="mt-3 font-display text-[2rem] font-medium text-white">Preview</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(19rem,0.34fr)_minmax(0,1fr)] lg:gap-7 xl:grid-cols-[minmax(21rem,0.36fr)_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.035] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.34)] backdrop-blur-[24px] sm:p-7">
              <div className="pointer-events-none absolute -left-2 top-2 select-none font-display text-[5rem] leading-none text-white/[0.04] sm:text-[6.4rem]">
                01
              </div>

              <div className="relative">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 backdrop-blur-xl">
                  <Sparkles size={14} className="text-white/80" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/70">Day 1 shell</span>
                </div>

                <h1 className="mt-6 max-w-[20rem] font-display text-[3rem] font-semibold leading-[0.88] tracking-tight text-white sm:max-w-none sm:text-[3.8rem]">
                  {pythonRoomDayOneContent.title}
                </h1>

                <p className="mt-5 max-w-2xl text-sm font-light leading-relaxed text-white/64 sm:text-[15px]">
                  {pythonRoomDayOneContent.description}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/8 bg-black/26 p-4">
                    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
                      <Clock3 size={14} className="text-white/60" />
                      Estimated time
                    </div>
                    <div className="mt-3 font-display text-3xl font-medium text-white">
                      {pythonRoomDayOneContent.estimatedMinutes} min
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/8 bg-black/26 p-4">
                    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
                      <FlaskConical size={14} className="text-white/60" />
                      Mode
                    </div>
                    <div className="mt-3 font-display text-3xl font-medium text-white">Preview</div>
                  </div>
                </div>

                <section className="mt-8 rounded-[1.75rem] border border-white/8 bg-black/28 p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/38">Challenge</div>
                  <p className="mt-4 text-base leading-relaxed text-white/88">{pythonRoomDayOneContent.task}</p>
                </section>

                <section className="mt-5 rounded-[1.75rem] border border-white/8 bg-black/24 p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/38">Starter guidance</div>
                  <p className="mt-4 text-sm leading-relaxed text-white/60">
                    Keep the output to one line per learner. Use one clean loop and one conditional branch block. Day 2 now runs real
                    Python in the browser, so the output panel reflects your actual code.
                  </p>
                </section>
              </div>
            </div>
          </aside>

          <section className="space-y-5">
            <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.035] shadow-[0_24px_90px_rgba(0,0,0,0.34)] backdrop-blur-[24px]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 font-mono text-[11px] text-white/76">
                    <FileCode2 size={14} />
                    <span>main.py</span>
                  </div>
                </div>

                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">
                  {useDesktopEditor ? 'Monaco editor ready on client' : 'Mobile editor ready'}
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <div
                  data-lenis-prevent={useDesktopEditor ? 'true' : undefined}
                  className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                >
                  {useDesktopEditor ? (
                    <div className="h-[23rem] md:h-[28rem] xl:h-[33rem]">
                      <MonacoEditor
                        language="python"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => handleCodeChange(value ?? '')}
                        onMount={handleEditorMount}
                        options={{
                          automaticLayout: true,
                          minimap: { enabled: false },
                          fontFamily: 'var(--font-jetbrains-mono)',
                          fontSize: 14,
                          lineHeight: 22,
                          padding: { top: 20, bottom: 20 },
                          scrollBeyondLastLine: false,
                          wordWrap: 'on',
                          lineNumbersMinChars: 3,
                          glyphMargin: true,
                          overviewRulerBorder: false,
                          hideCursorInOverviewRuler: true,
                          scrollbar: {
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-4">
                      <label className="mb-3 block font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">Mobile editing surface</label>
                      <textarea
                        ref={mobileEditorRef}
                        value={code}
                        onChange={(event) => handleCodeChange(event.target.value)}
                        spellCheck={false}
                        className="w-full resize-none overflow-hidden rounded-[1.2rem] border border-white/8 bg-black/30 px-4 py-4 font-mono text-[13px] leading-6 text-white/84 outline-none"
                        style={{ touchAction: 'pan-y' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-4 shadow-[0_20px_64px_rgba(0,0,0,0.28)] backdrop-blur-[24px] sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/38">Day 2 execution</div>
                <div className="mt-2 text-sm text-white/68">
                  Python now runs directly in your browser through Pyodide. First load may take a few seconds while the runtime initializes.
                </div>
              </div>

              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-white px-7 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-transform duration-300 hover:scale-[0.99] hoverable disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleRun}
                disabled={runtimeState === 'warming' || runtimeState === 'running'}
              >
                <CirclePlay size={16} />
                {runtimeState === 'warming' ? 'Loading Python' : runtimeState === 'running' ? 'Running' : 'Run Python'}
              </button>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="min-w-0 rounded-[2rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.28)] backdrop-blur-[24px] sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/38">Output</div>
                    <div className="mt-2 text-sm text-white/62">{outputLabel}</div>
                  </div>

                  <div className={`rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] ${outputBadgeClassName}`}>
                    {outputBadgeLabel}
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/8 bg-[#0d0d0d]">
                  {runtimeState === 'error' && runtimeErrorLine ? (
                    <div className="border-b border-rose-300/14 bg-rose-400/[0.08] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-rose-100/86 sm:px-5">
                      Primary error line: {runtimeErrorLine}
                    </div>
                  ) : null}
                  <pre className="overflow-x-auto px-4 py-5 font-mono text-[12px] leading-6 whitespace-pre-wrap text-white/78 sm:px-5 sm:text-[13px]">
                    {output}
                  </pre>
                </div>
              </div>

              <RoomVoiceAssistant
                ref={voiceAssistantRef}
                roomKey="python-room"
                roomLabel="Python Room"
                roomSummary="Ask for hints, explain your code, review errors, or let Yantra stay on the side while you keep running the room."
              />
            </div>

            <details className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_18px_54px_rgba(0,0,0,0.26)] backdrop-blur-[24px] lg:hidden">
              <summary className="cursor-pointer list-none font-mono text-[11px] uppercase tracking-[0.24em] text-white/74">
                Room brief
              </summary>
              <div className="mt-5 space-y-4">
                <section className="rounded-[1.35rem] border border-white/8 bg-black/28 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/38">Challenge</div>
                  <p className="mt-3 text-sm leading-relaxed text-white/84">{pythonRoomDayOneContent.task}</p>
                </section>

                <section className="rounded-[1.35rem] border border-white/8 bg-black/24 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/38">Starter guidance</div>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    Keep the output to one line per learner. Use one clean loop and one conditional branch block. Day 2 now runs real Python in the browser, so the output panel reflects your actual code.
                  </p>
                </section>
              </div>
            </details>
          </section>
        </div>
      </main>

    </div>
  );
}
