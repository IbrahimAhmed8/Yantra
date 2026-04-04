'use client';

import Link from 'next/link';
import { ChevronRight, Grid2x2 } from 'lucide-react';
import Image from 'next/image';
import { activityCards, facultyAvatars } from './student-profile-content';

export default function PerformancePageClient() {
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
              <span className="text-white/80">Performance</span>
            </div>
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 backdrop-blur-xl sm:mb-5 sm:px-5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/42 sm:text-[10px] sm:tracking-[0.28em]">Live Signals</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">Performance</h1>
            <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-white/58 sm:mt-4 sm:text-base">
              Review the student&apos;s latest momentum, upcoming review windows, and progress movement. Live signals update throughout
              your academic session.
            </p>
          </div>
          <div className="hidden items-center gap-3 sm:flex xl:justify-end">
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

      {/* Activity cards — full width 2-col grid */}
      <div className="grid grid-cols-1 gap-5 md:gap-8 lg:grid-cols-2">
        {activityCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className={`relative overflow-hidden rounded-[1.5rem] border p-5 backdrop-blur-[24px] sm:rounded-[1.75rem] sm:p-6 lg:rounded-[2rem] lg:p-8 ${
                card.accent ? 'border-white/10 bg-white/[0.045]' : 'border-white/8 bg-white/[0.035]'
              }`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_40%,rgba(255,255,255,0.02))]" />
              <div className="relative z-10">
                <Icon size={26} className="mb-4 text-white/24" />
                <h3 className="font-display text-xl font-semibold tracking-tight text-white">{card.title}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-white/58">{card.body}</p>
                {card.accent ? (
                  <div className="mt-6 flex -space-x-3">
                    {facultyAvatars.map((avatar) => (
                      <div
                        key={avatar.src}
                        className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-black/70 bg-white/10"
                      >
                        <Image className="object-cover" src={avatar.src} alt={avatar.alt} fill sizes="32px" />
                      </div>
                    ))}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black/70 bg-white/[0.08] text-[10px] font-semibold text-white/44">
                      +4
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 border-t border-white/5 pt-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/36">{card.meta}</span>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Summary metrics */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Completion Δ', value: '+12%', sub: 'last 7 days' },
          { label: 'Streak', value: '5', sub: 'days active' },
          { label: 'Syllabus', value: '0%', sub: 'overall' },
          { label: 'Next Review', value: 'Thu', sub: 'Calculus Final' },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4 sm:rounded-[1.5rem] sm:p-5"
          >
            <div className="font-display text-2xl font-bold text-white sm:text-3xl">{metric.value}</div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/36">{metric.label}</div>
            <div className="mt-0.5 text-[11px] text-white/28">{metric.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-white/6 pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">
        Performance signals update throughout your active Yantra session.
      </div>
    </>
  );
}
