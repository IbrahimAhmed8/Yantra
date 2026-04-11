import Link from 'next/link';
import { ArrowRight, FileCode2, FolderTree, PlayCircle, Share2, Sparkles } from 'lucide-react';
import SiteShell from '@/editor/components/site/SiteShell';

const GUIDE_STEPS = [
  {
    title: 'Open the editor',
    description: 'Launch Yantra at `/editor` and drop directly into the workspace instead of setting up a local toolchain first.',
    icon: FileCode2,
  },
  {
    title: 'Pick a playground',
    description: 'Start with Python for quick scripts or the web template for HTML, CSS, and JavaScript previews.',
    icon: FolderTree,
  },
  {
    title: 'Write, run, inspect',
    description: 'Edit files, click Run, and use the output or preview panel to tighten the feedback loop.',
    icon: PlayCircle,
  },
  {
    title: 'Share or remix',
    description: 'Generate a public link when you want feedback, or remix a shared project into your own local workspace.',
    icon: Share2,
  },
] as const;

export default function GuidePage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <section className="max-w-4xl py-10 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#3b82f6]/20 bg-[#3b82f6]/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#93c5fd]">
            <Sparkles className="h-3.5 w-3.5" />
            Getting started
          </div>
          <h1 className="mt-7 text-[3.2rem] font-semibold leading-[0.94] tracking-[-0.06em] text-white sm:text-[4.4rem]">
            Start building in under a minute.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/60 sm:text-lg">
            Yantra is intentionally simple to enter: open the workspace, choose a project, run code, and share when you are ready.
          </p>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          {GUIDE_STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <section
                key={step.title}
                className="rounded-[1.9rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_20px_64px_rgba(3,7,18,0.24)]"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/28">0{index + 1}</div>
                </div>
                <h2 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-white">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/58">{step.description}</p>
              </section>
            );
          })}
        </div>

        <section className="pt-20">
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_20px_64px_rgba(3,7,18,0.24)] sm:p-8">
              <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/34">Quick first run</div>
              <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-white/8 bg-[#09101e]">
                <div className="border-b border-white/8 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
                  main.py
                </div>
                <div className="space-y-2 px-4 py-5 font-mono text-sm leading-7 text-white/76">
                  <div>
                    <span className="mr-4 text-white/24">1</span>
                    <span className="text-[#86efac]">print</span>(<span className="text-[#fca5a5]">"Hello, Yantra!"</span>)
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-[1.6rem] border border-[#3b82f6]/18 bg-[#07101f] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#93c5fd]">Output</div>
                <div className="mt-3 font-mono text-sm text-[#86efac]">&gt; Hello, Yantra!</div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_20px_64px_rgba(3,7,18,0.24)] sm:p-8">
              <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/34">Helpful notes</div>
              <div className="mt-5 space-y-5 text-sm leading-7 text-white/60">
                <p>Python projects run in-browser through Pyodide, so you can test ideas quickly without a terminal.</p>
                <p>Web playgrounds give you HTML, CSS, and JavaScript starter files plus an instant iframe preview on Run.</p>
                <p>Autosave keeps the workspace updated every two seconds, and the public editor flow no longer requires sign-in.</p>
                <p>Shared project views remain available through their existing share routes, so remix links continue to work.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-20">
          <div className="overflow-hidden rounded-[2rem] border border-[#3b82f6]/18 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(99,102,241,0.12),rgba(255,255,255,0.04))] p-8 shadow-[0_24px_100px_rgba(3,7,18,0.36)] sm:p-10">
            <div className="max-w-3xl">
              <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#bfdbfe]">Ready</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                Open the workspace and try the full flow.
              </h2>
              <p className="mt-4 text-base leading-8 text-white/68">
                The shortest path is simple: launch the editor, edit a file, run it, and share the result when you want feedback.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/editor"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-black"
                >
                  Open Editor
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white"
                >
                  Explore Features
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
