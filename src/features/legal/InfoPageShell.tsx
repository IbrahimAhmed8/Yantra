import Link from 'next/link';
import GlobalSidebar from '@/src/features/navigation/GlobalSidebar';

type InfoSection = {
  title: string;
  body: string[];
};

export default function InfoPageShell({
  eyebrow,
  title,
  description,
  sections,
  statusLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: InfoSection[];
  statusLabel: string;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.06),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_24%,transparent_78%,rgba(255,255,255,0.04))]" />
        <div className="absolute left-[-8%] top-[4%] h-[34rem] w-[34rem] rounded-full bg-white/[0.07] blur-[120px]" />
        <div className="absolute right-[-10%] top-[12%] h-[36rem] w-[36rem] rounded-full bg-white/[0.05] blur-[140px]" />
        <div className="absolute bottom-[-20%] left-[12%] h-[38rem] w-[40rem] rounded-full bg-white/[0.04] blur-[155px]" />
      </div>

      <header className="relative z-10 border-b border-white/8 px-6 py-6 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="font-heading text-3xl tracking-wider text-white hoverable">
            YANTRA<span className="text-white/45">.</span>
          </Link>

          <div className="hidden flex-wrap items-center gap-3 md:flex">
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/62 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/docs"
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/62 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              Docs
            </Link>
          </div>
          <GlobalSidebar disableDesktop={true} />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-20 pt-16 md:px-8 md:pt-24">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-5 py-2 backdrop-blur-xl">
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.72)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">{eyebrow}</span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.92] tracking-tight text-white md:text-7xl">
                {title}
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-white/60 md:text-lg">{description}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6 backdrop-blur-[24px]">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/36">Launch Status</div>
            <div className="mt-4 font-display text-3xl font-medium text-white">{statusLabel}</div>
            <p className="mt-3 text-sm leading-relaxed text-white/56">
              This page is intentionally simple and production-safe so there are no dead links during launch.
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.title}
              className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.035] p-7 backdrop-blur-[24px]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
              <h2 className="font-display text-3xl font-medium text-white">{section.title}</h2>
              <div className="mt-5 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-white/58">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
