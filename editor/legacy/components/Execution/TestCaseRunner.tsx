import { Check, FlaskConical, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getYantraUserId, postRoadmapComplete } from '@/api/ai';
import { executeCode } from '@/api/execute';
import { useEditorStore } from '@/store/useEditorStore';

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface TestCaseResult extends TestCase {
  actualOutput: string;
  didPass: boolean;
  stderr: string;
  exitCode: number;
}

const TEST_CASES: TestCase[] = [
  { input: '5', expectedOutput: '25' },
  { input: '0', expectedOutput: '0' },
];

export const TestCaseRunner = () => {
  const activeFile = useEditorStore((state) => state.activeFile);
  const theme = useEditorStore((state) => state.theme);
  const setAIPanelOpen = useEditorStore((state) => state.setAIPanelOpen);
  const sendAIMessage = useEditorStore((state) => state.sendAIMessage);
  const showChallengeCompletion = useEditorStore((state) => state.showChallengeCompletion);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestCaseResult[]>([]);
  const completedChallengesRef = useRef<Set<string>>(new Set());
  const _theme = theme;

  useEffect(() => {
    setResults([]);
  }, [activeFile?.id, activeFile?.content, activeFile?.language]);

  const passedCount = useMemo(() => results.filter((result) => result.didPass).length, [results]);
  const didCompleteChallenge = results.length === TEST_CASES.length && passedCount === TEST_CASES.length;

  useEffect(() => {
    if (!activeFile || !didCompleteChallenge || completedChallengesRef.current.has(activeFile.id)) {
      return;
    }

    completedChallengesRef.current.add(activeFile.id);
    showChallengeCompletion(activeFile.id);
    setAIPanelOpen(true);
    sendAIMessage({
      role: 'assistant',
      content: `Congratulations! ${activeFile.name} passed ${TEST_CASES.length}/${TEST_CASES.length} tests. Ready for the next challenge?`,
    });

    void postRoadmapComplete({
      userId: getYantraUserId(),
      challengeId: activeFile.id,
    }).catch(() => null);
  }, [activeFile, didCompleteChallenge, sendAIMessage, setAIPanelOpen, showChallengeCompletion]);

  const runAllTests = async () => {
    if (!activeFile || isRunning) {
      return;
    }

    setIsRunning(true);

    const nextResults: TestCaseResult[] = [];

    for (const testCase of TEST_CASES) {
      try {
        const executionResult = await executeCode({
          language: activeFile.language,
          code: activeFile.content,
          stdin: testCase.input,
        });

        const actualOutput = executionResult.stdout.trim();

        nextResults.push({
          ...testCase,
          actualOutput: actualOutput || '(no stdout)',
          didPass: executionResult.exitCode === 0 && actualOutput === testCase.expectedOutput,
          stderr: executionResult.stderr,
          exitCode: executionResult.exitCode,
        });
      } catch (error) {
        nextResults.push({
          ...testCase,
          actualOutput: '',
          didPass: false,
          stderr: error instanceof Error ? error.message : 'Unable to run this test case.',
          exitCode: 1,
        });
      }
    }

    setResults(nextResults);
    setIsRunning(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--yantra-foreground)' }}>
            Challenge test cases
          </p>
          <p className="text-xs" style={{ color: 'var(--yantra-muted)' }}>
            Runs the active file once per sample case using each case input as stdin.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: isRunning ? 'var(--yantra-sidebar)' : 'var(--yantra-accent)',
            borderColor: isRunning ? 'var(--yantra-border)' : 'var(--yantra-accent)',
            color: '#ffffff',
          }}
          onClick={() => {
            void runAllTests();
          }}
          disabled={!activeFile || isRunning}
        >
          {isRunning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
          {isRunning ? 'Running tests...' : 'Run All Tests'}
        </button>
      </div>

      <div
        className="rounded-md border px-4 py-3 text-sm"
        style={{
          background: didCompleteChallenge ? 'rgba(34, 197, 94, 0.12)' : 'var(--yantra-sidebar)',
          borderColor: didCompleteChallenge ? 'rgba(34, 197, 94, 0.35)' : 'var(--yantra-border)',
          color: didCompleteChallenge ? '#bbf7d0' : 'var(--yantra-foreground)',
        }}
      >
        {didCompleteChallenge
          ? 'Challenge Complete!'
          : results.length > 0
            ? `${passedCount}/${TEST_CASES.length} passed`
            : 'Run the suite to see case-by-case results.'}
      </div>

      <div className="grid min-h-0 flex-1 gap-3 overflow-auto">
        {TEST_CASES.map((testCase, index) => {
          const result = results[index];
          const didPass = result?.didPass ?? false;

          return (
            <article
              key={`${testCase.input}-${testCase.expectedOutput}`}
              className="rounded-md border p-4"
              style={{
                background: 'var(--yantra-sidebar)',
                borderColor: 'var(--yantra-border)',
              }}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--yantra-foreground)' }}>
                  Case {index + 1}
                </p>
                <span
                  className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold"
                  style={{
                    background: result
                      ? didPass
                        ? 'rgba(34, 197, 94, 0.12)'
                        : 'rgba(244, 71, 71, 0.12)'
                      : 'var(--yantra-active-tab)',
                    borderColor: result
                      ? didPass
                        ? 'rgba(34, 197, 94, 0.35)'
                        : 'rgba(244, 71, 71, 0.35)'
                      : 'var(--yantra-border)',
                    color: result ? (didPass ? '#bbf7d0' : 'var(--yantra-error)') : 'var(--yantra-muted)',
                  }}
                >
                  {result ? didPass ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" /> : <TriangleAlert className="h-3.5 w-3.5" />}
                  {result ? (didPass ? 'PASS' : 'FAIL') : 'Pending'}
                </span>
              </div>

              <div className="grid gap-3 text-sm md:grid-cols-3">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--yantra-muted)' }}>
                    Input
                  </p>
                  <pre
                    className="whitespace-pre-wrap break-words rounded-md border px-3 py-2 font-mono text-xs"
                    style={{
                      background: 'var(--yantra-active-tab)',
                      borderColor: 'var(--yantra-border)',
                      color: 'var(--yantra-foreground)',
                    }}
                  >
                    {testCase.input}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--yantra-muted)' }}>
                    Expected
                  </p>
                  <pre
                    className="whitespace-pre-wrap break-words rounded-md border px-3 py-2 font-mono text-xs"
                    style={{
                      background: 'rgba(34, 197, 94, 0.12)',
                      borderColor: 'rgba(34, 197, 94, 0.35)',
                      color: '#bbf7d0',
                    }}
                  >
                    {testCase.expectedOutput}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--yantra-muted)' }}>
                    Actual
                  </p>
                  <pre
                    className="whitespace-pre-wrap break-words rounded-md border px-3 py-2 font-mono text-xs"
                    style={{
                      background: 'var(--yantra-active-tab)',
                      borderColor: 'var(--yantra-border)',
                      color: result && !didPass ? 'var(--yantra-error)' : 'var(--yantra-foreground)',
                    }}
                  >
                    {result ? result.actualOutput || result.stderr || '(no output)' : 'Waiting to run'}
                  </pre>
                </div>
              </div>

              {result?.stderr ? (
                <p
                  className="mt-3 rounded-md border px-3 py-2 font-mono text-xs"
                  style={{
                    background: 'rgba(244, 71, 71, 0.12)',
                    borderColor: 'rgba(244, 71, 71, 0.35)',
                    color: 'var(--yantra-error)',
                  }}
                >
                  {result.stderr}
                </p>
              ) : null}

              {result ? (
                <p className="mt-3 text-xs" style={{ color: 'var(--yantra-muted)' }}>
                  Exit code: {result.exitCode}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
};
