'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronRight, Grid2x2 } from 'lucide-react';
import { startRouteTransition } from '@/src/features/motion/ExperienceProvider';
import StudentProfileCard, { type StudentProfileCardHandle } from './StudentProfileCard';
import { defaultStudentProfile, type StudentProfile } from './student-profile-model';

const panelCardClassName = 'rounded-2xl border border-white/8 bg-white/[0.04] p-4';

type PanelKey = 'notifications' | 'settings' | null;
type Props = {
  initialProfileData: StudentProfile;
  defaultProfileData: StudentProfile;
};

function PanelShell({
  title,
  eyebrow,
  children,
  onClose,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <section className="fixed inset-x-4 bottom-4 top-auto z-[60] w-auto overflow-hidden rounded-[1.75rem] border border-white/8 bg-black/78 p-5 shadow-[0_26px_60px_rgba(0,0,0,0.42)] backdrop-blur-[24px] sm:top-24 sm:w-[min(24rem,calc(100vw-2rem))] sm:rounded-[2rem] sm:p-6 md:right-8 md:left-auto">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_38%,rgba(255,255,255,0.02))]" />
      <div className="pointer-events-none absolute right-[-16%] top-[-14%] h-32 w-32 rounded-full bg-white/[0.04] blur-[64px]" />

      <div className="relative z-10">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/38">{eyebrow}</div>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white">{title}</h3>
          </div>
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/62 transition-colors hover:bg-white/[0.08] cursor-pointer"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="space-y-3">{children}</div>
      </div>
    </section>
  );
}

export default function StudentProfileOverview({ initialProfileData, defaultProfileData }: Props) {
  const [profile, setProfile] = useState<StudentProfile>(initialProfileData);
  const [defaultProfileState] = useState<StudentProfile>(defaultProfileData);
  const [activePanel, setActivePanel] = useState<PanelKey>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const profileCardRef = useRef<StudentProfileCardHandle>(null);

  useEffect(() => {
    setProfile(initialProfileData);
  }, [initialProfileData]);

  useEffect(() => {
    if (!statusMessage) return;
    const id = window.setTimeout(() => setStatusMessage(''), 2800);
    return () => window.clearTimeout(id);
  }, [statusMessage]);

  const showStatus = (msg: string) => setStatusMessage(msg);

  const persistProfile = async (nextProfile: StudentProfile, successMessage: string) => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextProfile),
    });

    const payload = (await response.json()) as {
      error?: string;
      profile?: StudentProfile;
      defaultProfile?: StudentProfile;
    };

    if (!response.ok || !payload.profile) {
      if (response.status === 401) {
        startRouteTransition({ href: '/login', label: 'Returning to Login' });
        window.location.href = '/login?message=Your%20session%20expired.%20Please%20log%20in%20again.&kind=error';
      }
      throw new Error(payload.error || 'Yantra could not save the student profile right now.');
    }

    setProfile(payload.profile);
    setActivePanel(null);
    showStatus(successMessage);
  };

  const handleSaveProfile = async (nextProfile: StudentProfile) => {
    try {
      await persistProfile(nextProfile, 'Student profile saved to your Yantra account.');
    } catch (error) {
      showStatus(error instanceof Error ? error.message : 'Yantra could not save the current profile.');
      throw error;
    }
  };

  const handlePanelToggle = (panel: Exclude<PanelKey, null>) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  return (
    <>
      {/* Floating panels */}
      {activePanel === 'notifications' && (
        <PanelShell title="Updates" eyebrow="Notifications" onClose={() => setActivePanel(null)}>
          <div className={panelCardClassName}>
            <div className="font-display text-lg font-medium text-white">Performance digest</div>
            <p className="mt-2 text-sm leading-relaxed text-white/58">
              {profile.name} crossed a {profile.progress}% syllabus milestone and weekly momentum is trending upward.
            </p>
            <Link
              href="/dashboard/student-profile/performance"
              className="mt-4 inline-block rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/[0.09] cursor-pointer"
            >
              View performance
            </Link>
          </div>
          <div className={panelCardClassName}>
            <div className="font-display text-lg font-medium text-white">Curriculum alert</div>
            <p className="mt-2 text-sm leading-relaxed text-white/58">
              Advanced Algebra II is the current in-progress module and the next review window opens this week.
            </p>
            <Link
              href="/dashboard/student-profile/curriculum"
              className="mt-4 inline-block rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/[0.09] cursor-pointer"
            >
              Review track
            </Link>
          </div>
        </PanelShell>
      )}



      {/* Page header */}
      <section className="mb-10 sm:mb-12">
        <div className="flex flex-col gap-6 sm:gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 hidden flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 sm:flex sm:mb-6">
              <Link href="/dashboard" className="cursor-pointer transition-colors hover:text-white/70">
                Dashboard
              </Link>
              <ChevronRight size={14} />
              <Link
                href="/dashboard/student-profile/roster"
                className="cursor-pointer transition-colors hover:text-white/70"
              >
                Students
              </Link>
              <ChevronRight size={14} />
              <span className="text-white/80">{profile.name}</span>
            </div>

            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 backdrop-blur-xl sm:mb-5 sm:px-5">
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.38)]" />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/42 sm:text-[10px] sm:tracking-[0.28em]">
                Student Identity / Synced Theme
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-7xl">
              {profile.name}&apos;s Profile
            </h1>
            <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-white/58 sm:mt-4 sm:text-base">
              Academic tracking and personal identity management for the Yantra ecosystem. Manage core student data and
              skill progression from a single institutional view.
            </p>
          </div>

          <div className="hidden flex-wrap items-center gap-3 sm:flex xl:max-w-md xl:justify-end">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/78 transition-colors hover:bg-white/[0.08] cursor-pointer"
            >
              <Grid2x2 size={16} />
              Back to Dashboard
            </Link>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70 transition-colors hover:bg-white/[0.08] cursor-pointer"
              aria-label="Notifications"
              onClick={() => handlePanelToggle('notifications')}
            >
              <Bell size={14} />
              Updates
            </button>

          </div>
        </div>
      </section>

      {/* Status banner */}
      {statusMessage ? (
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/72 shadow-[0_16px_36px_rgba(0,0,0,0.16)] sm:rounded-full sm:tracking-[0.18em]">
          {statusMessage}
        </div>
      ) : null}

      {/* Profile card — full width, no broken grid */}
      <StudentProfileCard ref={profileCardRef} profile={profile} onSave={handleSaveProfile} />

      {/* Quick links row */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Personalization', href: '/dashboard/student-profile/personalization', desc: 'AI memory & roadmap' },
          { label: 'Roster', href: '/dashboard/student-profile/roster', desc: 'Active learner record' },
          { label: 'Curriculum', href: '/dashboard/student-profile/curriculum', desc: 'Mastery path track' },
          { label: 'Performance', href: '/dashboard/student-profile/performance', desc: 'Live signals & insights' },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative overflow-hidden rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4 backdrop-blur-[20px] transition-all duration-300 hover:border-white/14 hover:bg-white/[0.06] sm:rounded-[1.5rem] sm:p-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.07),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="font-display text-sm font-semibold text-white">{card.label}</div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/38">{card.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 border-t border-white/6 pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">
        Student record edits now sync to your Yantra account.
      </div>
    </>
  );
}
