'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  BookOpen,
  ChevronRight,
  Grid2x2,
  Settings2,
  UserCircle2,
} from 'lucide-react';
import { startRouteTransition } from '@/src/features/motion/ExperienceProvider';
import { readJsonResponse } from '@/src/lib/read-json-response';
import YantraMobileMenu from '@/src/features/navigation/YantraMobileMenu';
import StudentProfileCard, { type StudentProfileCardHandle } from './StudentProfileCard';
import YantraAmbientBackground from './YantraAmbientBackground';
import { defaultStudentProfile, type StudentProfile } from './student-profile-model';
import {
  activityCards,
  curriculumItems,
  facultyAvatars,
  helpFaqs,
  sideNavItems,
  supportNavItems,
  topNavItems,
  type StudentProfileNavItem,
  type StudentProfileTopNavItem,
} from './student-profile-content';

type ActiveSection = 'overview' | 'roster' | 'curriculum' | 'performance' | 'help';

type PanelKey = 'notifications' | 'settings' | 'help' | 'roster' | null;
type StudentProfilePageProps = {
  initialProfileData: StudentProfile;
  defaultProfileData: StudentProfile;
};

const PROFILE_SECTION_ID = 'profile-overview';
const ROSTER_SECTION_ID = 'student-roster';
const PERFORMANCE_SECTION_ID = 'performance-insights';
const CURRICULUM_SECTION_ID = 'curriculum-track';
const profileSectionClassName =
  'relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_20px_54px_rgba(0,0,0,0.22)] backdrop-blur-[22px] sm:rounded-[1.75rem] sm:p-6 lg:rounded-[2rem] lg:p-8';
const profileInsetCardClassName = 'rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4 sm:rounded-[1.5rem] sm:p-5 lg:rounded-[1.75rem] lg:p-6';
const profilePanelCardClassName = 'rounded-2xl border border-white/8 bg-white/[0.04] p-4';
const profileActionButtonClassName =
  'w-full rounded-full border border-white/12 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.09] cursor-pointer sm:w-auto sm:px-5';

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

function NavEntry({
  item,
  onAction,
  isActive,
}: {
  item: StudentProfileNavItem;
  onAction: (action: NonNullable<StudentProfileNavItem['action']>) => void;
  isActive: boolean;
}) {
  const sharedClassName =
    'flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 transition-all duration-300 font-mono text-[10px] uppercase tracking-[0.18em]';
  const stateClassName = isActive
    ? 'border-white/10 bg-white/[0.08] text-white shadow-[0_16px_36px_rgba(0,0,0,0.18)]'
    : 'text-white/40 hover:border-white/6 hover:bg-white/[0.04] hover:text-white/72';
  const Icon = item.icon;

  if (item.href) {
    return (
      <Link href={item.href} className={`${sharedClassName} ${stateClassName} cursor-pointer`}>
        <Icon size={18} />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`${sharedClassName} ${stateClassName} cursor-pointer`}
      onClick={() => item.action && onAction(item.action)}
    >
      <Icon size={18} />
      <span>{item.label}</span>
    </button>
  );
}

function ActivitySection() {
  return (
    <div className="grid grid-cols-1 gap-5 md:gap-8 lg:grid-cols-2">
      {activityCards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.title}
              className={`relative overflow-hidden rounded-[1.5rem] border p-5 backdrop-blur-[24px] sm:rounded-[1.75rem] sm:p-6 lg:rounded-[2rem] lg:p-8 ${
              card.accent
                ? 'border-white/10 bg-white/[0.045]'
                : 'border-white/8 bg-white/[0.035]'
            }`}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_40%,rgba(255,255,255,0.02))]" />

            <div className="relative z-10">
              <Icon size={26} className="mb-4 text-white/24" />
              <h4 className="font-display text-xl font-semibold tracking-tight text-white">{card.title}</h4>
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
  );
}

function CurriculumSection() {
  return (
    <section className={profileSectionClassName}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.09),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%,rgba(255,255,255,0.02))]" />

      <div className="relative z-10">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h4 className="font-display text-xl font-semibold tracking-tight text-white">Curriculum Track</h4>
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
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border sm:h-12 sm:w-12 sm:rounded-2xl ${iconContainerClassName}`}
                >
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
  );
}

function RosterSection({
  profile,
  onOpenProfile,
  onEditProfile,
}: {
  profile: StudentProfile;
  onOpenProfile: () => void;
  onEditProfile: () => void;
}) {
  const studentInitial = profile.name.trim().charAt(0).toUpperCase() || 'A';

  return (
    <section className={profileSectionClassName}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%,rgba(255,255,255,0.02))]" />

      <div className="relative z-10">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h4 className="font-display text-xl font-semibold tracking-tight text-white">Student Roster</h4>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/52">
              A quick-access roster card for the active learner so the sidebar item always lands on visible content.
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/36">Current Learner</span>
        </div>

        <article className={profileInsetCardClassName}>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] border border-white/12 bg-white/[0.06] sm:h-16 sm:w-16 sm:rounded-[1.25rem]">
                <span className="font-display text-2xl font-bold text-white">{studentInitial}</span>
              </div>

              <div>
                <div className="font-display text-xl font-semibold text-white sm:text-2xl">{profile.name}</div>
                <div className="mt-1 text-sm text-white/52 sm:mt-2">
                  {profile.classDesignation} | {profile.skillLevel} | {profile.progress}% complete
                </div>
              </div>
            </div>

            <div className="self-start rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/68 md:self-auto">
              Verified Student
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-transform duration-300 hover:scale-[0.98] cursor-pointer sm:w-auto"
              onClick={onOpenProfile}
            >
              Open Profile Overview
            </button>
            <button type="button" className={profileActionButtonClassName} onClick={onEditProfile}>
              Edit Record
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

function PerformanceSection() {
  return (
    <section className={profileSectionClassName}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%,rgba(255,255,255,0.02))]" />

      <div className="relative z-10">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h4 className="font-display text-xl font-semibold tracking-tight text-white">Performance Insights</h4>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/52">
              Review the student&apos;s latest momentum, upcoming review windows, and progress movement in one place.
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/36">Live Signals</span>
        </div>

        <ActivitySection />
      </div>
    </section>
  );
}

export default function StudentProfilePage({
  initialProfileData,
  defaultProfileData,
}: StudentProfilePageProps) {
  const [profile, setProfile] = useState<StudentProfile>(initialProfileData);
  const [defaultProfileState, setDefaultProfileState] = useState<StudentProfile>(defaultProfileData);
  const [activePanel, setActivePanel] = useState<PanelKey>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [statusMessage, setStatusMessage] = useState('');
  const profileCardRef = useRef<StudentProfileCardHandle>(null);

  useEffect(() => {
    setProfile(initialProfileData);
  }, [initialProfileData]);

  useEffect(() => {
    setDefaultProfileState(defaultProfileData);
  }, [defaultProfileData]);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStatusMessage('');
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  const showStatusMessage = (message: string) => {
    setStatusMessage(message);
  };

  const persistProfile = async (nextProfile: StudentProfile, successMessage: string) => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nextProfile),
    });

    const payload = await readJsonResponse<{
      error?: string;
      profile?: StudentProfile;
      defaultProfile?: StudentProfile;
    }>(response);

    if (!response.ok || !payload?.profile) {
      if (response.status === 401) {
        startRouteTransition({ href: '/login', label: 'Returning to Login' });
        window.location.href = '/login?message=Your%20session%20expired.%20Please%20log%20in%20again.&kind=error';
      }

      throw new Error(payload?.error || 'Yantra could not save the student profile right now.');
    }

    setProfile(payload.profile);

    if (payload.defaultProfile) {
      setDefaultProfileState(payload.defaultProfile);
    }

    setActivePanel(null);
    setActiveSection('overview');
    showStatusMessage(successMessage);
  };

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePanelToggle = (panel: Exclude<PanelKey, null>) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const focusSection = (sectionId: string, section: ActiveSection, message?: string) => {
    setActiveSection(section);
    setActivePanel(null);
    scrollToSection(sectionId);
    if (message) {
      showStatusMessage(message);
    }
  };

  const openRosterView = (message = 'Opened roster view.') => {
    setActiveSection('roster');
    setActivePanel(null);
    scrollToSection(ROSTER_SECTION_ID);
    showStatusMessage(message);
  };

  const handleNavAction = (action: NonNullable<StudentProfileNavItem['action']>) => {
    if (action === 'overview') {
      focusSection(PROFILE_SECTION_ID, 'overview', 'Returned to profile overview.');
      return;
    }

    if (action === 'curriculum') {
      focusSection(CURRICULUM_SECTION_ID, 'curriculum', 'Jumped to curriculum track.');
      return;
    }

    if (action === 'performance') {
      focusSection(PERFORMANCE_SECTION_ID, 'performance', 'Jumped to performance insights.');
      return;
    }

    if (action === 'roster') {
      openRosterView();
      return;
    }

    if (action === 'help') {
      setActiveSection('help');
      handlePanelToggle('help');
    }
  };

  const handleTopNavAction = (action: NonNullable<StudentProfileTopNavItem['action']>) => {
    if (action === 'curriculum') {
      focusSection(CURRICULUM_SECTION_ID, 'curriculum', 'Jumped to curriculum track.');
      return;
    }

    if (action === 'performance') {
      focusSection(PERFORMANCE_SECTION_ID, 'performance', 'Jumped to performance insights.');
      return;
    }

    openRosterView();
  };

  const handleSaveProfile = async (nextProfile: StudentProfile) => {
    try {
      await persistProfile(nextProfile, 'Student profile saved to your Yantra account.');
    } catch (error) {
      showStatusMessage(error instanceof Error ? error.message : 'Yantra could not save the current profile.');
      throw error;
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-white selection:text-black [cursor:default]">



      {activePanel === 'notifications' && (
        <PanelShell title="Updates" eyebrow="Notifications" onClose={() => setActivePanel(null)}>
          <div className={profilePanelCardClassName}>
            <div className="font-display text-lg font-medium text-white">Performance digest</div>
            <p className="mt-2 text-sm leading-relaxed text-white/58">
              {profile.name} crossed a {profile.progress}% syllabus milestone and weekly momentum is trending upward.
            </p>
            <button
              type="button"
              className="mt-4 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/[0.09] cursor-pointer"
              onClick={() => {
                focusSection(PERFORMANCE_SECTION_ID, 'performance', 'Opened performance insights.');
              }}
            >
              View performance
            </button>
          </div>

          <div className={profilePanelCardClassName}>
            <div className="font-display text-lg font-medium text-white">Curriculum alert</div>
            <p className="mt-2 text-sm leading-relaxed text-white/58">
              Advanced Algebra II is the current in-progress module and the next review window opens this week.
            </p>
            <button
              type="button"
              className="mt-4 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/[0.09] cursor-pointer"
              onClick={() => {
                focusSection(CURRICULUM_SECTION_ID, 'curriculum', 'Opened curriculum track.');
              }}
            >
              Review track
            </button>
          </div>
        </PanelShell>
      )}





      <main className="relative z-10 min-h-screen px-4 pb-14 pt-10 sm:pb-16 md:px-8 xl:pr-10">
        <div className="mx-auto max-w-[88rem]">
          {statusMessage ? (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/72 shadow-[0_16px_36px_rgba(0,0,0,0.16)] sm:rounded-full sm:tracking-[0.18em]">
              {statusMessage}
            </div>
          ) : null}

          <section className="mb-10 sm:mb-12" id={PROFILE_SECTION_ID}>
            <div className="flex flex-col gap-6 sm:gap-8 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 hidden flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 sm:flex sm:mb-6">
                  <Link href="/dashboard" className="cursor-pointer transition-colors hover:text-white/70">
                    Dashboard
                  </Link>
                  <ChevronRight size={14} />
                  <button
                    type="button"
                    className="cursor-pointer transition-colors hover:text-white/70"
                    onClick={() => openRosterView('Opened roster view.')}
                  >
                    Students
                  </button>
                  <ChevronRight size={14} />
                  <span className="text-white/80">{profile.name}</span>
                </div>

                <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 backdrop-blur-xl sm:mb-5 sm:px-5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.38)]" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/42 sm:text-[10px] sm:tracking-[0.28em]">Student Identity / Synced Theme</span>
                </div>
                <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-7xl">{profile.name}&apos;s Profile</h1>
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
                  aria-expanded={activePanel === 'notifications'}
                  onClick={() => handlePanelToggle('notifications')}
                >
                  <Bell size={14} />
                  Updates
                </button>

              </div>
            </div>
          </section>

          <div className="mb-8 hidden flex-wrap gap-3 pb-2 md:flex xl:hidden">
            {sideNavItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors cursor-pointer ${
                  item.action && activeSection === item.action
                    ? 'border-white/12 bg-white/[0.09] text-white'
                    : 'border-white/8 bg-white/[0.04] text-white/58 hover:bg-white/[0.08] hover:text-white/80'
                }`}
                onClick={() => item.action && handleNavAction(item.action)}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-12">
            <StudentProfileCard ref={profileCardRef} profile={profile} onSave={handleSaveProfile} />

            <section className="flex flex-col gap-6 sm:gap-8 lg:col-span-7">
              <div id={ROSTER_SECTION_ID}>
                <RosterSection
                  profile={profile}
                  onOpenProfile={() => focusSection(PROFILE_SECTION_ID, 'overview', 'Returned to profile overview.')}
                  onEditProfile={() => {
                    profileCardRef.current?.openEditor();
                    focusSection(PROFILE_SECTION_ID, 'overview', 'Editor opened with the latest saved profile.');
                  }}
                />
              </div>
              <div id={PERFORMANCE_SECTION_ID}>
                <PerformanceSection />
              </div>
              <div id={CURRICULUM_SECTION_ID}>
                <CurriculumSection />
              </div>
            </section>
          </div>

          <div className="mt-12 border-t border-white/6 pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">
            Student record edits now sync to your Yantra account.
          </div>
        </div>
      </main>
    </div>
  );
}
