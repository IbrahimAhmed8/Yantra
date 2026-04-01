import { Check, FlaskConical, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestCaseResult[]>([]);
  const isDark = theme === 'dark';

  useEffect(() => {
    setResults([]);
  }, [activeFile?.id, activeFile?.content, activeFile?.language]);

  const passedCount = useMemo(() => results.filter((result) => result.didPass).length, [results]);

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
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Runs the active file once per sample case using each case input as stdin.
          </p>
        </div>

        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
            isDark
              ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
              : 'border-slate-900/10 bg-white text-slate-900 hover:bg-slate-50'
          } disabled:cursor-not-allowed disabled:opacity-60`}
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
        className="rounded-2xl border px-4 py-3 text-sm"
        style={{
          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: 'var(--yantra-border)',
          color: 'var(--yantra-foreground)',
        }}
      >
        {results.length > 0 ? `${passedCount}/${TEST_CASES.length} passed` : 'Run the suite to see case-by-case results.'}
      </div>

      <div className="grid min-h-0 flex-1 gap-3 overflow-auto">
        {TEST_CASES.map((testCase, index) => {
          const result = results[index];
          const didPass = result?.didPass ?? false;

          return (
            <article
              key={`${testCase.input}-${testCase.expectedOutput}`}
              className="rounded-2xl border p-4"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.92)',
                borderColor: 'var(--yantra-border)',
              }}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--yantra-foreground)' }}>
                  Case {index + 1}
                </p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    result
                      ? didPass
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-rose-500/15 text-rose-400'
                      : isDark
                        ? 'bg-white/5 text-slate-400'
                        : 'bg-slate-900/5 text-slate-500'
                  }`}
                >
                  {result ? didPass ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" /> : <TriangleAlert className="h-3.5 w-3.5" />}
                  {result ? (didPass ? 'PASS' : 'FAIL') : 'Pending'}
                </span>
              </div>

              <div className="grid gap-3 text-sm md:grid-cols-3">
                <div>
                  <p className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Input
                  </p>
                  <pre
                    className={`whitespace-pre-wrap break-words rounded-xl px-3 py-2 font-mono text-xs ${
                      isDark ? 'bg-black/20 text-white' : 'bg-slate-900/[0.06] text-slate-900'
                    }`}
                  >
                    {testCase.input}
                  </pre>
                </div>
                <div>
                  <p className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Expected
                  </p>
                  <pre
                    className={`whitespace-pre-wrap break-words rounded-xl px-3 py-2 font-mono text-xs ${
                      isDark ? 'bg-black/20 text-emerald-300' : 'bg-emerald-500/10 text-emerald-700'
                    }`}
                  >
                    {testCase.expectedOutput}
                  </pre>
                </div>
                <div>
                  <p className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Actual
                  </p>
                  <pre
                    className={`whitespace-pre-wrap break-words rounded-xl px-3 py-2 font-mono text-xs ${
                      isDark ? 'bg-black/20' : 'bg-slate-900/[0.06]'
                    } ${
                      result && !didPass
                        ? isDark
                          ? 'text-rose-300'
                          : 'text-rose-700'
                        : isDark
                          ? 'text-white'
                          : 'text-slate-900'
                    }`}
                  >
                    {result ? result.actualOutput || result.stderr || '(no output)' : 'Waiting to run'}
                  </pre>
                </div>
              </div>

              {result?.stderr ? (
                <p
                  className={`mt-3 rounded-xl px-3 py-2 font-mono text-xs ${
                    isDark ? 'bg-rose-500/10 text-rose-300' : 'bg-rose-500/10 text-rose-700'
                  }`}
                >
                  {result.stderr}
                </p>
              ) : null}

              {result ? (
                <p className={`mt-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Exit code: {result.exitCode}</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
};
