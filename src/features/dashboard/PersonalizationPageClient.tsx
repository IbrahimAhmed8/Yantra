'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight, Grid2x2 } from 'lucide-react';
import DashboardPersonalizationPanel from './DashboardPersonalizationPanel';
import type { StudentPersonalizationProfile } from './student-personalization-model';

type Props = {
  personalization: StudentPersonalizationProfile | null;
};

export default function PersonalizationPageClient({ personalization }: Props) {
  return (
    <>
      {/* Page header */}
      <section className="mb-10 sm:mb-12">
        <div className="flex flex-col gap-6 sm:gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 hidden flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 sm:flex sm:mb-6">
              <Link href="/dashboard" className="cursor-pointer transition-colors hover:text-white/70">
                Dashboard
              </Link>
              <ChevronRight size={14} />
              <Link href="/dashboard/student-profile" className="cursor-pointer transition-colors hover:text-white/70">
                Profile
              </Link>
              <ChevronRight size={14} />
              <span className="text-white/80">Personalization</span>
            </div>

            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 backdrop-blur-xl sm:mb-5 sm:px-5">
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.38)]" />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/42 sm:text-[10px] sm:tracking-[0.28em]">
                AI Memory Layer
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Personalization
            </h1>
            <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-white/58 sm:mt-4 sm:text-base">
              Import a structured summary from ChatGPT or Gemini, review the extracted facts, and rebuild your learning
              roadmap from information you explicitly approve.
            </p>
          </div>

          <div className="hidden flex-wrap items-center gap-3 sm:flex xl:justify-end">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/78 transition-colors hover:bg-white/[0.08] cursor-pointer"
            >
              <Grid2x2 size={16} />
              Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Personalization panel — full width */}
      <DashboardPersonalizationPanel
        personalization={personalization}
        eyebrow="Profile Personalization"
        title="Personalize your roadmap from approved AI memory."
        description="Keep this inside your profile: import a summary from ChatGPT or Gemini, review the extracted facts, then rebuild the roadmap from information you explicitly approve."
      />

      <div className="mt-12 border-t border-white/6 pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">
        Approved memory facts are stored to your Yantra account.
      </div>
    </>
  );
}
