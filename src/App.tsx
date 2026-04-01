import { MoonStar, Plus, Sparkles, SunMedium } from 'lucide-react';
import { useEffect } from 'react';
import { EditorShell } from '@/components/Editor/EditorShell';
import { RunButton } from '@/components/Execution/RunButton';
import { useEditorStore } from '@/store/useEditorStore';
import { LANGUAGE_META, type EditorFile } from '@/types';

const STARTER_FILES: EditorFile[] = [
  {
    id: 'learning-loop-python',
    name: 'learning_loop.py',
    language: 'python',
    content: [
      'def next_milestone(topic: str) -> str:',
      '    milestones = {',
      '        "python": "Ship a small CLI project",',
      '        "algorithms": "Solve five graph problems",',
      '        "system-design": "Sketch a resilient API",',
      '    }',
      '',
      '    return milestones.get(topic, "Keep building with Yantra")',
      '',
      'print(next_milestone("python"))',
    ].join('\n'),
  },
  {
    id: 'coach-widget-javascript',
    name: 'coachWidget.js',
    language: 'javascript',
    content: [
      'const lessons = ["arrays", "graphs", "dp"];',
      '',
      'export async function recommendLesson(progress = 0.42) {',
      '  const nextLesson = lessons[Math.floor(progress * lessons.length)] ?? "projects";',
      '  return `${nextLesson} is ready for today.`;',
      '}',
      '',
      'recommendLesson().then(console.log);',
    ].join('\n'),
  },
  {
    id: 'roadmap-service-java',
    name: 'RoadmapService.java',
    language: 'java',
    content: [
      'public class RoadmapService {',
      '    private final String learnerName;',
      '',
      '    public RoadmapService(String learnerName) {',
      '        this.learnerName = learnerName;',
      '    }',
      '',
      '    public String nextStep() {',
      '        return learnerName + ", build one practice project this week.";',
      '    }',
      '}',
    ].join('\n'),
  },
  {
    id: 'engine-telemetry-cpp',
    name: 'engineTelemetry.cpp',
    language: 'cpp',
    content: [
      '#include <iostream>',
      '#include <vector>',
      '',
      'int main() {',
      '    std::vector<int> scores = {82, 87, 91, 94};',
      '    for (const auto& score : scores) {',
      '        std::cout << "Checkpoint: " << score << std::endl;',
      '    }',
      '',
      '    return 0;',
      '}',
    ].join('\n'),
  },
];

export default function App() {
  const openTabs = useEditorStore((state) => state.openTabs);
  const openTab = useEditorStore((state) => state.openTab);
  const theme = useEditorStore((state) => state.theme);
  const toggleTheme = useEditorStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-18%] h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-4%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-4">
        <header
          className="relative overflow-hidden rounded-[28px] border px-5 py-5 sm:px-6"
          style={{
            background: 'var(--yantra-shell)',
            borderColor: 'var(--yantra-border)',
            boxShadow: '0 22px 70px var(--yantra-shadow)',
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(124,58,237,0.10),transparent_40%,rgba(16,185,129,0.05))]" />

          <div className="relative flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Day 2 Execution Engine
                </div>

                <div className="space-y-2">
                  <h1
                    className={`font-display text-3xl font-bold tracking-tight sm:text-4xl ${
                      isDark ? 'text-white' : 'text-slate-950'
                    }`}
                  >
                    Run code, inspect output, and validate challenge cases without leaving the editor.
                  </h1>
                  <p
                    className={`max-w-2xl text-sm leading-6 sm:text-base ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    Day 2 adds execution controls, a resizable console, stdin support, and a lightweight test runner on top of
                    the multi-file Monaco workspace.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start">
                <RunButton />
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                      : 'border-slate-900/10 bg-white/80 text-slate-950 hover:bg-white'
                  }`}
                  onClick={toggleTheme}
                  aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
                  title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
                >
                  {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                  {isDark ? 'Light mode' : 'Dark mode'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Quick open starter files
                </p>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{openTabs.length} tabs open</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {STARTER_FILES.map((file) => {
                  const isOpen = openTabs.some((tab) => tab.id === file.id);
                  const meta = LANGUAGE_META[file.language];

                  return (
                    <button
                      key={file.id}
                      type="button"
                      className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${
                        isOpen
                          ? isDark
                            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                            : 'border-emerald-600/20 bg-emerald-600/10 text-emerald-800'
                          : isDark
                            ? 'border-white/10 bg-black/20 text-slate-200 hover:border-white/15 hover:bg-black/30'
                            : 'border-slate-900/10 bg-white/70 text-slate-700 hover:border-slate-900/15 hover:bg-white'
                      }`}
                      onClick={() => openTab(file)}
                    >
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-black/20 px-1.5 font-mono text-[0.65rem] font-bold uppercase">
                        {meta.icon}
                      </span>
                      <span>{file.name}</span>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        <EditorShell />
      </div>
    </div>
  );
}
