'use client';

import Link from 'next/link';
import { ChevronRight, Grid2x2 } from 'lucide-react';
import StudentDangerZoneSection from './StudentDangerZoneSection';

type Props = {
  accountDeletionConfigured: boolean;
};

export default function DangerZonePageClient({ accountDeletionConfigured }: Props) {
  return (
    <>
      {/* Page header */}
      <section className="mb-10 sm:mb-12">
        <div className="flex flex-col gap-6 sm:gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 hidden flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 sm:flex sm:mb-6">
              <Link href="/dashboard" className="cursor-pointer transition-colors hover:text-white/70">Dashboard</Link>
              <ChevronRight size={14} />
              <Link href="/dashboard/student-profile" className="cursor-pointer transition-colors hover:text-white/70">Profile</Link>
              <ChevronRight size={14} />
              <span className="text-rose-100/70">Danger Zone</span>
            </div>
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-rose-400/20 bg-rose-500/[0.07] px-4 py-2 backdrop-blur-xl sm:mb-5 sm:px-5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-200 shadow-[0_0_10px_rgba(255,150,150,0.5)]" />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-rose-100/50 sm:text-[10px] sm:tracking-[0.28em]">
                Irreversible Actions
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">Danger Zone</h1>
            <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-white/58 sm:mt-4 sm:text-base">
              Destructive account operations that permanently remove data from your Yantra account. These actions cannot be
              undone.
            </p>
          </div>
          <div className="hidden items-center gap-3 sm:flex xl:justify-end">
            <Link
              href="/dashboard/student-profile"
              className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/78 transition-colors hover:bg-white/[0.08] cursor-pointer"
            >
              <Grid2x2 size={16} />
              Back to Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Danger zone section — full width */}
      <StudentDangerZoneSection accountDeletionConfigured={accountDeletionConfigured} />

      <div className="mt-12 border-t border-rose-400/10 pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-rose-100/24">
        Deleted accounts cannot be recovered. Proceed with caution.
      </div>
    </>
  );
}
