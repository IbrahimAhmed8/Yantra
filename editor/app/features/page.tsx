import Link from 'next/link';
import {
  Bot,
  FileCode2,
  FolderTree,
  Globe,
  PlayCircle,
  SaveAll,
  Share2,
  Sparkles,
} from 'lucide-react';
import SiteShell from '@/editor/components/site/SiteShell';

const FEATURE_SECTIONS = [
  {
    title: 'Monaco Editor',
    eyebrow: 'Editing Engine',
    description:
      'Yantra uses Monaco to deliver familiar, high-quality editing in the browser. That means syntax highlighting, dependable keyboard shortcuts, and a workspace that feels closer to a real IDE than a toy snippet box.',
    points: ['VS Code-quality editing surface', 'Language-aware highlighting and model switching', 'Designed for fast browser workflows'],
    icon: FileCode2,
  },
  {
    title: 'Run in One Click',
    eyebrow: 'Execution',
    description:
      'Python projects execute through Pyodide without requiring a local runtime, while HTML, CSS, and JavaScript projects render immediately through a live iframe preview.',
    points: ['Pyodide-backed Python execution', 'Live web preview for browser projects', 'Output and errors stay inside the same workspace'],
    icon: PlayCircle,
  },
  {
    title: 'AI Assist',
    eyebrow: 'Guidance',
    description:
      'Ask Yantra to explain code, debug a file, or suggest a cleaner next step. The AI panel lives alongside the editor instead of sending you out to a separate tool.',
    points: ['Inline help for the active file', 'Quick prompts for explain, debug, and refactor', 'Built to support multiple languages'],
    icon: Bot,
  },
  {
    title: 'Smart File System',
    eyebrow: 'Workspace',
    description:
      'Projects feel like projects, not single buffers. Use the explorer, open multiple tabs, create new files, and rely on automatic language detection from filenames.',
    points: ['Explorer sidebar and tab model', 'File badges and path-aware language selection', 'Supports Python, web files, JSON, Markdown, and plain text'],
    icon: FolderTree,
  },
  {
    title: 'Share & Remix',
    eyebrow: 'Collaboration',
    description:
      'Create a public read-only share link for a project, then let other people remix it into their own workspace in one step. Sharing becomes part of the workflow, not a separate export task.',
    points: ['Public project sharing', 'Read-only viewer experience', 'One-click remix into a local editor workspace'],
    icon: Share2,
  },
  {
    title: 'Autosave',
    eyebrow: 'Reliability',
    description:
      'Yantra keeps work safe by autosaving every two seconds and supporting local mode workflows while preserving the editor behavior users already rely on.',
    points: ['Frequent autosave cadence', 'Local storage support', 'Designed to reduce accidental work loss'],
    icon: SaveAll,
  },
] as const;

export default function FeaturesPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <section className="max-w-4xl py-10 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6366f1]/20 bg-[#6366f1]/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#c7d2fe]">
            <Sparkles className="h-3.5 w-3.5" />
            Detailed feature breakdown
          </div>
          <h1 className="mt-7 text-[3.2rem] font-semibold leading-[0.94] tracking-[-0.06em] text-white sm:text-[4.4rem]">
            The fast loop from idea to runnable share link.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/60 sm:text-lg">
            Yantra is built around one principle: browser-based coding should feel immediate and capable. These are the pieces that make that experience work.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FEATURE_SECTIONS.map((feature) => {
            const Icon = feature.icon;

            return (
              <section
                key={feature.title}
                className="rounded-[1.9rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_20px_64px_rgba(3,7,18,0.28)]"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#3b82f6]/18 bg-[#3b82f6]/10 text-[#93c5fd]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-white/34">{feature.eyebrow}</div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{feature.title}</h2>
                <p className="mt-4 text-sm leading-7 text-white/58">{feature.description}</p>
                <div className="mt-6 space-y-3">
                  {feature.points.map((point) => (
                    <div key={point} className="flex items-start gap-3 text-sm leading-7 text-white/66">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#60a5fa]" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section className="pt-24">
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                title: 'Browser-native by design',
                description: 'No install step for the core experience. Open the editor and start working immediately.',
                icon: Globe,
              },
              {
                title: 'Built for teaching and demos',
                description: 'Perfect for sharing reproducible examples, remixing starter projects, and explaining fixes live.',
                icon: Bot,
              },
              {
                title: 'Focused on shipping momentum',
                description: 'Fast previews, fast saves, and a direct path from draft to public link.',
                icon: Share2,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[1.9rem] border border-white/8 bg-white/[0.03] p-6">
                  <Icon className="h-5 w-5 text-[#c7d2fe]" />
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/58">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="pt-24">
          <div className="overflow-hidden rounded-[2rem] border border-[#6366f1]/18 bg-[linear-gradient(135deg,rgba(99,102,241,0.16),rgba(59,130,246,0.14),rgba(255,255,255,0.04))] p-8 shadow-[0_24px_100px_rgba(3,7,18,0.36)] sm:p-10">
            <div className="max-w-3xl">
              <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#c7d2fe]">Next step</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                Want the fast path instead of the long setup?
              </h2>
              <p className="mt-4 text-base leading-8 text-white/68">
                Open the editor and try the full flow yourself, or read the guide for the shortest onboarding path.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/editor"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-black"
                >
                  Open Editor
                </Link>
                <Link
                  href="/guide"
                  className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white"
                >
                  Read Guide
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
