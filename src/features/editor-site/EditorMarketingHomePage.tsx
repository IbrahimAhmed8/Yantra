'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Bot,
  Braces,
  FileCode2,
  FileJson,
  FilePlus2,
  FileText,
  FolderTree,
  Globe,
  PlayCircle,
  SaveAll,
  Share2,
  Sparkles,
  Type,
} from 'lucide-react';
import EditorSiteShell from './EditorSiteShell';
import { Reveal } from './Reveal';

const LANGUAGES = [
  { label: 'Python', icon: 'Py', tone: 'border-[#3776ab]/30 bg-[#3776ab]/12 text-[#8bc2ff]' },
  { label: 'JavaScript', icon: 'JS', tone: 'border-[#f7df1e]/25 bg-[#f7df1e]/10 text-[#f7df1e]' },
  { label: 'TypeScript', icon: 'TS', tone: 'border-[#3178c6]/30 bg-[#3178c6]/12 text-[#7dc1ff]' },
  { label: 'HTML', icon: 'HT', tone: 'border-[#e34f26]/30 bg-[#e34f26]/12 text-[#ff9a77]' },
  { label: 'CSS', icon: 'CS', tone: 'border-[#1572b6]/30 bg-[#1572b6]/12 text-[#7fc9ff]' },
  { label: 'JSON', icon: '{}', tone: 'border-white/14 bg-white/[0.05] text-white/78' },
  { label: 'Markdown', icon: 'MD', tone: 'border-[#a855f7]/30 bg-[#a855f7]/12 text-[#ddb4ff]' },
] as const;

const FEATURES = [
  {
    title: 'Monaco Editor',
    description:
      'VS Code-quality editing, right in your browser. Full IntelliSense, syntax highlighting, and keyboard shortcuts.',
    icon: FileCode2,
  },
  {
    title: 'Run in One Click',
    description:
      'Execute Python via Pyodide or preview web projects instantly in a live iframe. No terminal required.',
    icon: PlayCircle,
  },
  {
    title: 'AI Assist',
    description:
      'Get AI-powered help for any language. Ask questions, get suggestions, fix bugs — right inside the editor.',
    icon: Bot,
  },
  {
    title: 'Smart File System',
    description:
      'Create, organize, and switch between files with a full explorer sidebar. Tabs, file icons, and language detection built in.',
    icon: FolderTree,
  },
  {
    title: 'Share & Remix',
    description:
      'Generate a public share link for any project. Others can view or remix your code with one click.',
    icon: Share2,
  },
  {
    title: 'Autosave',
    description:
      'Never lose work. Projects autosave every 2 seconds, with local dev mode for offline use.',
    icon: SaveAll,
  },
] as const;

const STEPS = [
  {
    title: 'Create a file',
    description: 'Start with Python or a web template, then add files from the explorer in seconds.',
    icon: FilePlus2,
  },
  {
    title: 'Write your code',
    description: 'Use Monaco editing, tabs, file icons, and inline AI help without leaving the browser.',
    icon: Type,
  },
  {
    title: 'Run & share',
    description: 'Preview instantly, test Python output, then generate a public remixable link when you are ready.',
    icon: Sparkles,
  },
] as const;

function HeroMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="relative mx-auto w-full max-w-[42rem]"
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_56%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_38%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020]/92 shadow-[0_30px_140px_rgba(3,7,18,0.72)]">
        <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.04] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/54">
            autosave active
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.45fr_0.9fr]">
          <div className="border-b border-white/8 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
              <span className="rounded-full border border-[#3776ab]/30 bg-[#3776ab]/12 px-2 py-1 text-[#8bc2ff]">main.py</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1">preview.html</span>
            </div>

            <div className="space-y-2 px-4 py-5 font-mono text-[13px] leading-7 text-white/78">
              <div>
                <span className="mr-4 text-white/24">1</span>
                <span className="text-[#c084fc]">def</span> <span className="text-[#93c5fd]">greet</span>():
              </div>
              <div>
                <span className="mr-4 text-white/24">2</span>
                <span className="pl-6 text-[#86efac]">return</span> <span className="text-[#fca5a5]">"Hello from Yantra"</span>
              </div>
              <div>
                <span className="mr-4 text-white/24">3</span>
                <span className="text-white/35"> </span>
              </div>
              <div>
                <span className="mr-4 text-white/24">4</span>
                <span className="text-[#93c5fd]">message</span> = <span className="text-[#93c5fd]">greet</span>()
              </div>
              <div>
                <span className="mr-4 text-white/24">5</span>
                <span className="text-[#86efac]">print</span>(message)
              </div>
              <div className="mt-5 rounded-2xl border border-[#3b82f6]/20 bg-[#07101f] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7dd3fc]">AI Assist</div>
                <p className="mt-2 text-sm leading-6 text-white/64">
                  “You can also expose this in HTML and share a remix link after the run completes.”
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[linear-gradient(180deg,rgba(9,14,28,0.92),rgba(7,10,19,0.98))]">
            <div className="border-b border-white/8 px-4 py-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">Run panel</div>
            </div>

            <div className="space-y-4 px-4 py-5">
              <div className="rounded-2xl border border-[#3b82f6]/18 bg-[#0b1222] p-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">output</div>
                  <div className="rounded-full bg-[#22c55e]/12 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#86efac]">
                    success
                  </div>
                </div>
                <div className="mt-3 font-mono text-sm text-[#86efac]">&gt; Hello from Yantra</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">web preview</div>
                <div className="mt-3 rounded-[1.2rem] bg-white p-4 text-slate-950 shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Globe className="h-4 w-4 text-[#3b82f6]" />
                    Live iframe
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="h-3 w-32 rounded-full bg-slate-200" />
                    <div className="h-3 w-24 rounded-full bg-slate-200" />
                    <div className="inline-flex rounded-full bg-slate-950 px-3 py-2 text-white">Click me</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[Braces, FileJson, FileText].map((Icon, index) => (
                  <div key={index} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-white/58">
                    <Icon className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function EditorMarketingHomePage() {
  return (
    <EditorSiteShell>
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <section className="grid min-h-[calc(100svh-8rem)] items-center gap-14 py-10 lg:grid-cols-[1fr_0.95fr] lg:py-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-[#3b82f6]/20 bg-[#3b82f6]/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#93c5fd]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Browser-native coding, ready in seconds
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 max-w-3xl font-body text-[3.4rem] font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-[4.5rem] lg:text-[5.5rem]"
            >
              Code. Run. Share. Instantly.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-2xl text-base leading-8 text-white/62 sm:text-lg"
            >
              Yantra is a blazing-fast in-browser code editor — no setup, no install, just write and run.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/editor"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-transform hover:scale-[0.99]"
              >
                Open Editor
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/[0.06]"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                See it in action
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3"
            >
              {[
                'Instant Python execution',
                'Live web preview',
                'Public share + remix links',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/58"
                >
                  {item}
                </div>
              ))}
            </motion.div>
          </div>

          <HeroMockup />
        </section>

        <Reveal className="rounded-[2rem] border border-white/8 bg-white/[0.03] px-5 py-6 shadow-[0_20px_80px_rgba(3,7,18,0.36)] sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/38">Works with your favorite languages</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((language) => (
                <div
                  key={language.label}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] ${language.tone}`}
                >
                  <span className="inline-flex min-w-5 justify-center">{language.icon}</span>
                  <span>{language.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="pt-24">
          <div className="max-w-3xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/38">Features</div>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              Everything needed for fast browser-based building.
            </h2>
            <p className="mt-4 text-base leading-8 text-white/58">
              Yantra focuses on the tight loop developers actually want: open a project, edit comfortably, run immediately, and share without friction.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <Reveal
                  key={feature.title}
                  delay={index * 0.04}
                  className="group rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_20px_64px_rgba(3,7,18,0.28)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#3b82f6]/18 bg-[#3b82f6]/10 text-[#93c5fd]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/58">{feature.description}</p>
                </Reveal>
              );
            })}
          </div>
        </Reveal>

        <Reveal id="demo" className="pt-24">
          <div className="max-w-3xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/38">Live Demo / How It Works</div>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">A simple flow that keeps momentum high.</h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="relative rounded-[1.9rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_18px_60px_rgba(3,7,18,0.24)]">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/28">0{index + 1}</div>
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold tracking-[-0.04em] text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/58">{step.description}</p>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal className="pt-24">
          <div className="overflow-hidden rounded-[2rem] border border-[#3b82f6]/18 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(99,102,241,0.14),rgba(255,255,255,0.04))] p-8 shadow-[0_24px_100px_rgba(3,7,18,0.36)] sm:p-10">
            <div className="max-w-3xl">
              <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#bfdbfe]">Ready to build something?</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Ship the first draft before your coffee cools.</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
                Launch the editor, open a playground, and move from idea to runnable code without setting up a local toolchain first.
              </p>
              <Link
                href="/editor"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-transform hover:scale-[0.99]"
              >
                Launch Yantra Editor
                <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
    </EditorSiteShell>
  );
}
