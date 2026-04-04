'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Grid2x2 } from 'lucide-react';
import GlobalSidebar from '@/src/features/navigation/GlobalSidebar';
import YantraAmbientBackground from './YantraAmbientBackground';
import { sideNavItems, supportNavItems, type StudentProfileNavItem } from './student-profile-content';

function NavEntry({ item }: { item: StudentProfileNavItem }) {
  const pathname = usePathname();

  // Exact match for overview, prefix match for sub-routes
  const isActive =
    item.href === '/dashboard/student-profile'
      ? pathname === '/dashboard/student-profile'
      : item.href
        ? pathname.startsWith(item.href)
        : false;

  const sharedClassName =
    'flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 transition-all duration-300 font-mono text-[10px] uppercase tracking-[0.18em] cursor-pointer';
  const stateClassName = isActive
    ? 'border-white/10 bg-white/[0.08] text-white shadow-[0_16px_36px_rgba(0,0,0,0.18)]'
    : 'text-white/40 hover:border-white/6 hover:bg-white/[0.04] hover:text-white/72';

  const Icon = item.icon;

  return (
    <Link href={item.href ?? '#'} className={`${sharedClassName} ${stateClassName}`}>
      <Icon size={18} />
      <span>{item.label}</span>
    </Link>
  );
}

export default function StudentProfileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-white selection:text-black [cursor:default]">
      <YantraAmbientBackground />

      {/* Mobile header */}
      <header className="fixed left-0 top-0 z-40 w-full border-b border-white/8 bg-black/72 px-4 py-4 backdrop-blur-2xl xl:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="font-display text-2xl font-bold tracking-tight text-white uppercase cursor-pointer"
          >
            YANTRA
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/78 transition-colors hover:bg-white/[0.08] cursor-pointer sm:px-4 sm:tracking-[0.18em]"
            >
              <Grid2x2 size={14} />
              Back
            </Link>
            <GlobalSidebar />
          </div>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 flex-col border-r border-white/8 bg-black/62 px-4 pb-8 pt-10 backdrop-blur-2xl xl:flex">
        {/* Logo */}
        <div className="mb-12 flex flex-col gap-2 px-2">
          <Link
            href="/dashboard"
            className="font-display text-xl font-bold text-white hover:text-white/80 transition-colors cursor-pointer"
          >
            YANTRA
          </Link>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Institutional Portal</div>
        </div>

        {/* Primary nav */}
        <div className="flex flex-1 flex-col gap-1">
          {sideNavItems.map((item) => (
            <NavEntry key={item.label} item={item} />
          ))}
        </div>

        {/* Support nav */}
        <div className="mt-auto flex flex-col gap-1">
          {supportNavItems.map((item) => (
            <NavEntry key={item.label} item={item} />
          ))}
        </div>
      </aside>

      {/* Page content */}
      <main className="relative z-10 min-h-screen px-4 pb-14 pt-24 sm:pb-16 md:px-8 md:pt-28 xl:pl-72 xl:pr-10 xl:pt-10">
        <div className="mx-auto max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
