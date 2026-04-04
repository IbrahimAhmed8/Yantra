'use client';

import Link from 'next/link';
import { ChevronRight, Grid2x2 } from 'lucide-react';
import { curriculumItems } from './student-profile-content';

export default function CurriculumPageClient() {
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
              <span className="text-white/80">Curriculum</span>
            </div>
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 backdrop-blur-xl sm:mb-5 sm:px-5">
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.38)]" />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/42 sm:text-[10px] sm:tracking-[0.28em]">Mastery Path</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">Curriculum</h1>
            <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-white/58 sm:mt-4 sm:text-base">
              Your active mastery path — completed modules, in-progress subjects, and upcoming locked content across the
              Yantra academic track.
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

      {/* Curriculum track */}
      <section className="relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_20px_54px_rgba(0,0,0,0.22)] backdrop-blur-[22px] sm:rounded-[1.75rem] sm:p-6 lg:rounded-[2rem] lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.09),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%,rgba(255,255,255,0.02))]" />
        <div className="relative z-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white">Curriculum Track</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/36">Mastery Path</span>
          </div>
          <div className="space-y-6">
            {curriculumItems.map((item) => {
              const Icon = item.icon;
              const iconContainerClassName =
                item.state === 'complete'
                  ? 'border-white bg-white text-black'
                  : item.state === 'active'
                    ? 'border-white/10 bg-white/[0.05] text-white/48'
                    : 'border-white/10 bg-white/[0.05] text-white/28';
              const rowTextClassName = item.state === 'locked' ? 'text-white/40' : 'text-white';
              const progressClassName = item.state === 'complete' ? 'bg-white' : 'bg-white/40';

              return (
                <div key={item.title} className={`flex items-center gap-4 sm:gap-6 ${item.state === 'locked' ? 'opacity-50' : ''}`}>
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border sm:h-12 sm:w-12 sm:rounded-2xl ${iconContainerClassName}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className={`text-sm font-medium ${rowTextClassName}`}>{item.title}</span>
                      <span className="font-mono text-xs text-white/40">{item.value}</span>
                    </div>
                    <div className={`h-[2px] w-full ${item.state === 'locked' ? 'bg-white/5' : 'bg-white/10'}`}>
                      <div className={`h-full ${progressClassName}`} style={{ width: item.progressWidth }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Completed', value: '1', sub: 'module' },
          { label: 'In Progress', value: '1', sub: 'module' },
          { label: 'Locked', value: '1', sub: 'module' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4 text-center sm:rounded-[1.5rem] sm:p-5"
          >
            <div className="font-display text-3xl font-bold text-white">{stat.value}</div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/36">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-white/6 pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">
        Curriculum progress syncs with your Yantra academic record.
      </div>
    </>
  );
}
