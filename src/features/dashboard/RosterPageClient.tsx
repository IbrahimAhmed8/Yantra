'use client';

import Link from 'next/link';
import { ChevronRight, Grid2x2 } from 'lucide-react';
import { useRef, useState } from 'react';
import StudentProfileCard, { type StudentProfileCardHandle } from './StudentProfileCard';
import { type StudentProfile } from './student-profile-model';
import { startRouteTransition } from '@/src/features/motion/ExperienceProvider';

type Props = {
  initialProfileData: StudentProfile;
  defaultProfileData: StudentProfile;
};

export default function RosterPageClient({ initialProfileData, defaultProfileData: _defaultProfileData }: Props) {
  const [profile, setProfile] = useState<StudentProfile>(initialProfileData);
  const [statusMessage, setStatusMessage] = useState('');
  const profileCardRef = useRef<StudentProfileCardHandle>(null);

  const handleSaveProfile = async (nextProfile: StudentProfile) => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextProfile),
    });

    const payload = (await response.json()) as { error?: string; profile?: StudentProfile };

    if (!response.ok || !payload.profile) {
      if (response.status === 401) {
        startRouteTransition({ href: '/login', label: 'Returning to Login' });
        window.location.href = '/login?message=Your%20session%20expired.&kind=error';
      }
      const msg = payload.error || 'Yantra could not save the student profile right now.';
      setStatusMessage(msg);
      throw new Error(msg);
    }

    setProfile(payload.profile);
    setStatusMessage('Student profile saved to your Yantra account.');
    setTimeout(() => setStatusMessage(''), 2800);
  };

  const studentInitial = profile.name.trim().charAt(0).toUpperCase() || 'A';

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
              <span className="text-white/80">Roster</span>
            </div>
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 backdrop-blur-xl sm:mb-5 sm:px-5">
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.38)]" />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/42 sm:text-[10px] sm:tracking-[0.28em]">Current Learner</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">Roster</h1>
            <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-white/58 sm:mt-4 sm:text-base">
              A quick-access roster card for the active learner — profile identity, class record, and edit controls in one place.
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

      {statusMessage ? (
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/72 shadow-[0_16px_36px_rgba(0,0,0,0.16)] sm:rounded-full sm:tracking-[0.18em]">
          {statusMessage}
        </div>
      ) : null}

      {/* Roster summary card */}
      <section className="relative mb-8 overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_20px_54px_rgba(0,0,0,0.22)] backdrop-blur-[22px] sm:rounded-[1.75rem] sm:p-6 lg:rounded-[2rem] lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%,rgba(255,255,255,0.02))]" />
        <div className="relative z-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] border border-white/12 bg-white/[0.06] sm:h-20 sm:w-20 sm:rounded-[1.5rem]">
                <span className="font-display text-2xl font-bold text-white sm:text-3xl">{studentInitial}</span>
              </div>
              <div>
                <div className="font-display text-2xl font-semibold text-white sm:text-3xl">{profile.name}</div>
                <div className="mt-1 text-sm text-white/52 sm:mt-2">
                  {profile.classDesignation} | {profile.skillLevel} | {profile.progress}% complete
                </div>
              </div>
            </div>
            <div className="self-start rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/68 md:self-auto">
              Verified Student
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/student-profile"
              className="rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-black transition-transform duration-300 hover:scale-[0.98] cursor-pointer sm:w-auto"
            >
              Open Profile Overview
            </Link>
          </div>
        </div>
      </section>

      {/* Editable profile card */}
      <StudentProfileCard ref={profileCardRef} profile={profile} onSave={handleSaveProfile} />

      <div className="mt-12 border-t border-white/6 pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">
        Roster edits sync immediately to your Yantra account.
      </div>
    </>
  );
}
