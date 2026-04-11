import Link from 'next/link';
import {
  Bot,
  Clock3,
  Braces,
  FileCode2,
  FileJson,
  FileText,
  FolderTree,
  Globe,
  PlayCircle,
  SaveAll,
  Share2,
  Sparkles,
  TerminalSquare,
} from 'lucide-react';
import SiteShell from '@/editor/components/site/SiteShell';

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
    title: 'Workspace-native editing',
    description:
      'Monaco keeps the editing surface serious, so Yantra feels closer to a working studio than a throwaway snippet box.',
    icon: TerminalSquare,
  },
  {
    title: 'Run without setup',
    description:
      'Python runs in-browser through Pyodide and browser projects render in a live iframe, so the feedback loop stays immediate.',
    icon: PlayCircle,
  },
  {
    title: 'Built-in guidance',
    description:
      'Yantra can explain, debug, and unblock the active file without sending you out to a separate workflow.',
    icon: Bot,
  },
  {
    title: 'Project structure that feels real',
    description:
      'Explorer, tabs, file badges, and language detection make multi-file experiments feel organized from the start.',
    icon: FolderTree,
  },
  {
    title: 'Share and remix',
    description:
      'Turn a project into a public link, then let someone else fork the exact state with one click.',
    icon: Share2,
  },
  {
    title: 'Local-first autosave',
    description: 'Projects keep saving in the background, which makes the whole product feel calmer and more forgiving.',
    icon: SaveAll,
  },
] as const;

const STEPS = [
  {
    title: 'Open the workspace',
    description: 'Jump straight into a starter project instead of spending the first ten minutes on setup.',
    icon: Clock3,
  },
  {
    title: 'Shape the idea',
    description: 'Edit files, run code, inspect output, and keep refining inside one browser-native loop.',
    icon: FileCode2,
  },
  {
    title: 'Ship the link',
    description: 'When it is ready, share the exact project state and let someone else remix from there.',
    icon: Sparkles,
  },
] as const;

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[42rem]">
      <div className="absolute -left-8 top-12 h-28 w-28 rounded-full bg-[#2dd4bf]/18 blur-3xl" />
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_56%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_38%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020]/92 shadow-[0_30px_140px_rgba(3,7,18,0.72)]">
        <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.04] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/54">
            session live
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
                <span className="text-[#c084fc]">def</span> <span className="text-[#93c5fd]">launch_demo</span>():
              </div>
              <div>
                <span className="mr-4 text-white/24">2</span>
                <span className="pl-6 text-[#86efac]">return</span> <span className="text-[#fca5a5]">"Prototype shipped before lunch"</span>
              </div>
              <div>
                <span className="mr-4 text-white/24">3</span>
                <span className="text-white/35"> </span>
              </div>
              <div>
                <span className="mr-4 text-white/24">4</span>
                <span className="text-[#93c5fd]">message</span> = <span className="text-[#93c5fd]">launch_demo</span>()
              </div>
              <div>
                <span className="mr-4 text-white/24">5</span>
                <span className="text-[#86efac]">print</span>(message)
              </div>
              <div className="mt-5 rounded-2xl border border-[#3b82f6]/20 bg-[#07101f] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7dd3fc]">AI Assist</div>
                <p className="mt-2 text-sm leading-6 text-white/64">
                  &ldquo;Refactor ready. Next move: turn this result into a shareable preview and keep iterating in the same tab.&rdquo;
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
                    clean run
                  </div>
                </div>
                <div className="mt-3 font-mono text-sm text-[#86efac]">&gt; Prototype shipped before lunch</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">web preview</div>
                <div className="mt-3 rounded-[1.2rem] bg-white p-4 text-slate-950 shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Globe className="h-4 w-4 text-[#3b82f6]" />
                    Product teaser
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="h-3 w-32 rounded-full bg-slate-200" />
                    <div className="h-3 w-24 rounded-full bg-slate-200" />
                    <div className="inline-flex rounded-full bg-slate-950 px-3 py-2 text-white">Launch</div>
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
    </div>
  );
}

export default function HomePage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <section className="grid min-h-[calc(100svh-8rem)] items-center gap-14 py-10 lg:grid-cols-[1fr_0.95fr] lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#38bdf8]/20 bg-[#38bdf8]/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#93c5fd]">
              <Sparkles className="h-3.5 w-3.5" />
              Browser-native building for fast demos
            </div>

            <h1 className="mt-7 max-w-4xl font-display text-[3.6rem] font-semibold leading-[0.9] tracking-[-0.08em] text-white sm:text-[4.9rem] lg:text-[6rem]">
              Build the idea before the momentum disappears.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
              Yantra is the browser workspace for quick experiments, product demos, code walkthroughs, and remixable prototypes. Open the tab, write the file, run it, share it.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/editor"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-transform hover:scale-[0.99]"
              >
                Open Editor
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/[0.06]"
              >
                View quick start
              </Link>
            </div>

            <div className="mt-10 flex max-w-3xl flex-wrap gap-2">
              {['Python in the browser', 'Live web preview', 'Local-first saving', 'Public remix links'].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/62"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">setup time</div>
                <div className="mt-3 flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-[#7dd3fc]" />
                  <div className="text-sm text-white/74">From blank tab to runnable project in minutes.</div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">editing core</div>
                <div className="mt-3 flex items-center gap-3">
                  <TerminalSquare className="h-5 w-5 text-[#c4b5fd]" />
                  <div className="text-sm text-white/74">Monaco editing with a real workspace feel.</div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">handoff</div>
                <div className="mt-3 flex items-center gap-3">
                  <Share2 className="h-5 w-5 text-[#86efac]" />
                  <div className="text-sm text-white/74">Share links and remix flows keep feedback lightweight.</div>
                </div>
              </div>
            </div>
          </div>

          <HeroMockup />
        </section>

        <section className="rounded-[2rem] border border-white/8 bg-white/[0.03] px-5 py-6 shadow-[0_20px_80px_rgba(3,7,18,0.36)] sm:px-6">
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
        </section>

        <section className="pt-24">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/38">Why Yantra feels different</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                Fewer steps between the spark and the shareable result.
              </h2>
            </div>
            <div className="max-w-xl text-sm leading-7 text-white/56">
              Traditional setup burns time before the first useful moment. Yantra compresses that loop into one browser session with editing, execution, preview, and sharing in the same surface.
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_20px_64px_rgba(3,7,18,0.28)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#3b82f6]/18 bg-[#3b82f6]/10 text-[#93c5fd]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/58">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="pt-24">
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_20px_64px_rgba(3,7,18,0.22)] sm:p-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/38">Features</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                One home for browser coding across the formats people actually use.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/58">
                Start with Python for logic, switch to web files for presentation, then keep everything together in one project instead of juggling tools.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: 'Fast prototype loop',
                  body: 'Write, run, inspect, tweak, repeat. Great for demos, experiments, and teaching moments.',
                  icon: PlayCircle,
                },
                {
                  title: 'Real project feel',
                  body: 'Folders, tabs, autosave, and language-aware files make the browser feel much less temporary.',
                  icon: FolderTree,
                },
                {
                  title: 'Built for the web',
                  body: 'Switch between Python, TypeScript, HTML, CSS, JSON, and Markdown without leaving the same shell.',
                  icon: Globe,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_20px_64px_rgba(3,7,18,0.22)]"
                  >
                    <Icon className="h-5 w-5 text-[#c4b5fd]" />
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/56">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pt-24">
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
        </section>

        <section className="pt-24">
          <div className="overflow-hidden rounded-[2rem] border border-[#3b82f6]/18 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(99,102,241,0.14),rgba(255,255,255,0.04))] p-8 shadow-[0_24px_100px_rgba(3,7,18,0.36)] sm:p-10">
            <div className="max-w-3xl">
              <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#bfdbfe]">Start with the live workspace</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Open the editor, make the first change, and let the page prove the product.</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
                The fastest way to understand Yantra is to use it. Launch a playground, run something real, and send the result as a remixable link.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/editor"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-transform hover:scale-[0.99]"
                >
                  Open Editor
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/[0.06]"
                >
                  Explore features
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
