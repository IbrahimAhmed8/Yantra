'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

const SITE_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/guide', label: 'Guide' },
] as const;

function isActivePath(currentPath: string, href: string) {
  return href === '/' ? currentPath === '/' : currentPath.startsWith(href);
}

function SiteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#080b14]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(99,102,241,0.22),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_35%,rgba(255,255,255,0.01))]" />
      <div className="absolute left-[-8%] top-[-12%] h-[28rem] w-[28rem] rounded-full bg-[#3b82f6]/16 blur-[120px]" />
      <div className="absolute bottom-[-18%] right-[-8%] h-[30rem] w-[30rem] rounded-full bg-[#6366f1]/14 blur-[140px]" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(circle at center, black 48%, transparent 92%)',
        }}
      />
    </div>
  );
}

type SiteShellProps = {
  children: ReactNode;
};

export default function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-[#3b82f6] selection:text-white">
      <SiteBackground />

      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#080b14]/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] font-mono text-sm font-semibold tracking-[0.24em] text-white">
              Y
            </div>
            <div>
              <div className="font-body text-sm font-semibold tracking-[0.24em] text-white">YANTRA</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Code Editor</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {SITE_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${
                    active ? 'bg-white/[0.08] text-white' : 'text-white/58 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/editor"
              className="hidden items-center gap-2 rounded-full bg-white px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-transform hover:scale-[0.99] sm:inline-flex"
            >
              Open Editor
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white md:hidden"
              onClick={() => setMobileOpen((current) => !current)}
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] bg-[#080b14]/96 px-4 py-5 backdrop-blur-2xl md:hidden">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/48">Navigate</div>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-10 space-y-3">
              {SITE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-[1.6rem] border border-white/8 bg-white/[0.03] px-5 py-4 text-lg font-medium text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Link
              href="/editor"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[1.6rem] bg-white px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-black"
              onClick={() => setMobileOpen(false)}
            >
              Open Editor
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : null}

      {children}

      <footer className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="font-body text-sm font-semibold tracking-[0.24em] text-white">YANTRA</div>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/56">
              Code. Run. Share. Instantly. A browser-native editor for quick experiments, live previews, and public remixable links.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/48">
            {SITE_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
            <Link href="/editor" className="transition-colors hover:text-white">
              Open Editor
            </Link>
          </div>

          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/34">
            Built with Yantra - {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}
