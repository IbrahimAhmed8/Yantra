'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Grid2x2,
  HelpCircle,
  LayoutGrid,
  Lock,
  LogOut,
  Rocket,
  Settings2,
  TrendingUp,
  UserCircle2,
  Users,
  type LucideIcon,
} from 'lucide-react';
import StudentProfileCard, {
  type StudentProfile,
  type StudentProfileCardHandle,
} from './StudentProfileCard';
import YantraAmbientBackground from './YantraAmbientBackground';

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  action?: 'overview' | 'roster' | 'curriculum' | 'performance' | 'help';
  active?: boolean;
};

type TopNavItem = {
  label: string;
  href?: string;
  action?: 'roster' | 'curriculum' | 'performance';
  active?: boolean;
};

type ActivityCard = {
  title: string;
  body: string;
  meta: string;
  icon: LucideIcon;
  accent?: boolean;
};

type CurriculumItem = {
  title: string;
  value: string;
  progressWidth: string;
  icon: LucideIcon;
  state: 'complete' | 'active' | 'locked';
};

type ActiveSection = 'overview' | 'roster' | 'curriculum' | 'performance' | 'help';

type PanelKey = 'notifications' | 'settings' | 'help' | 'roster' | null;

const initialProfile: StudentProfile = {
  name: 'Aarav Sharma',
  classDesignation: 'Class 10',
  skillLevel: 'Intermediate',
  progress: 65,
  academicYear: '2024',
};

const STUDENT_PROFILE_STORAGE_KEY = 'yantra.student-profile.v1';
const PROFILE_SECTION_ID = 'profile-overview';
const ROSTER_SECTION_ID = 'student-roster';
const PERFORMANCE_SECTION_ID = 'performance-insights';
const CURRICULUM_SECTION_ID = 'curriculum-track';

const topNavItems: TopNavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Students', action: 'roster', active: true },
  { label: 'Academy', action: 'curriculum' },
  { label: 'Reports', action: 'performance' },
];

const sideNavItems: NavItem[] = [
  { label: 'Overview', icon: LayoutGrid, action: 'overview', active: true },
  { label: 'Roster', icon: Users, action: 'roster' },
  { label: 'Curriculum', icon: BookOpen, action: 'curriculum' },
  { label: 'Performance', icon: BarChart3, action: 'performance' },
];

const supportNavItems: NavItem[] = [
  { label: 'Help', icon: HelpCircle, action: 'help' },
  { label: 'Logout', icon: LogOut, href: '/' },
];

const helpFaqs = [
  {
    question: 'How do I edit my profile?',
    answer: 'Open the profile overview card, choose Edit Profile, update your details, and press save. Your latest saved version stays in this browser.',
  },
  {
    question: 'What does skill level mean?',
    answer: 'Skill level is a quick snapshot of your current readiness. It helps the platform show an appropriate learning path and lets mentors understand your current stage.',
  },
  {
    question: 'Does my progress save automatically?',
    answer: 'Profile edits save when you press the save button. The latest saved version is stored locally in your browser until it is reset.',
  },
  {
    question: 'Where can I review my curriculum and performance?',
    answer: 'Use the Curriculum and Performance items in the left sidebar, or open them directly from the Help shortcuts.',
  },
  {
    question: 'How quickly will support respond?',
    answer: 'For routine profile and curriculum questions, expect a response within one working day. Use email support when the issue needs manual review.',
  },
] as const;

const activityCards: ActivityCard[] = [
  {
    title: 'Performance Spike',
    body: 'The active student has increased course completion by 12% in the last 7 days.',
    meta: 'Last update: 2h ago',
    icon: TrendingUp,
  },
  {
    title: 'Upcoming Exam',
    body: 'Calculus Fundamentals: Final Review is scheduled for Thursday.',
    meta: 'Faculty review circle',
    icon: CalendarCheck2,
    accent: true,
  },
];

const curriculumItems: CurriculumItem[] = [
  {
    title: 'Quantum Physics Basics',
    value: '100%',
    progressWidth: '100%',
    icon: CheckCircle2,
    state: 'complete',
  },
  {
    title: 'Advanced Algebra II',
    value: '45%',
    progressWidth: '45%',
    icon: Rocket,
    state: 'active',
  },
  {
    title: 'Neural Networking',
    value: 'Locked',
    progressWidth: '0%',
    icon: Lock,
    state: 'locked',
  },
];

const facultyAvatars = [
  {
    alt: 'Close-up profile portrait of a young woman smiling gently in soft outdoor lighting.',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwSyLZhXHHyjNxPmq8fKoMhh0oJjvv5SPblQz3-95XGZ5lSe6fmVIPZ_QDwy1iTEL9NoupAHUYYzRhPKbfS9_Sf8Ij3srQG526kA4miQ24KKaM8rlAFcUKdwL-yPg9CRDkf24WZbK8hpgKBFQERFB1wbe6J2kSkS9YZ9v8aZr9q1qz0jfjHT7kDHOIXtE9QEKmYofzWLgl_l--GziEirF183JHbgB3xx5SEBeb2aRdortOm64Lkf_2-FlKMbEpE-OXgiNFxR891Yz1',
  },
  {
    alt: 'Front profile portrait of a middle-aged man with glasses in a professional workspace.',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkbKmIWK6gaAWHpWCrVBTaGKzQQMgek0Ph9KVwUxuTKCMN2Wzp5AHIW3Q52vUgdc7ZF3PMSv3SMd78Mhgh3GWObZ1ca10pTEPnTrDSq020YulQQzEg5LZASm8OKe7MHW5mcxgD2ZD30BgZFtGP5B_1_kQX1pr86dJofBq9vibxYNILwEruRrYPsDbyWD1PmblH_9OdZdGMZxCNMv4ZZrVZreSsuC5TD2q0mp8uqWMRFZuj5kBL4wd7suONZ2eR390obh44oawLup-c',
  },
];

const profileSectionClassName =
  'relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.035] p-8 shadow-[0_24px_72px_rgba(0,0,0,0.24)] backdrop-blur-[24px]';
const profileInsetCardClassName = 'rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6';
const profilePanelCardClassName = 'rounded-2xl border border-white/8 bg-white/[0.04] p-4';
const profileActionButtonClassName =
  'rounded-full border border-white/12 bg-white/[0.05] px-5 py-3 font-semibold text-white transition-colors hover:bg-white/[0.09] cursor-pointer';

function isSkillLevel(value: unknown): value is StudentProfile['skillLevel'] {
  return value === 'Beginner' || value === 'Intermediate' || value === 'Advanced';
}

function normalizeStoredProfile(value: unknown): StudentProfile | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<StudentProfile>;

  if (
    typeof candidate.name !== 'string' ||
    typeof candidate.classDesignation !== 'string' ||
    typeof candidate.academicYear !== 'string' ||
    typeof candidate.progress !== 'number' ||
    !isSkillLevel(candidate.skillLevel)
  ) {
    return null;
  }

  return {
    name: candidate.name,
    classDesignation: candidate.classDesignation,
    academicYear: candidate.academicYear,
    skillLevel: candidate.skillLevel,
    progress: Math.max(0, Math.min(100, candidate.progress)),
  };
}

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
    <section className="fixed right-4 top-24 z-[60] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[2rem] border border-white/8 bg-black/78 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-[28px] md:right-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_38%,rgba(255,255,255,0.03))]" />
      <div className="pointer-events-none absolute right-[-16%] top-[-14%] h-40 w-40 rounded-full bg-white/[0.08] blur-[90px]" />

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
  item: NavItem;
  onAction: (action: NonNullable<NavItem['action']>) => void;
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
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {activityCards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.title}
            className={`relative overflow-hidden rounded-[2rem] border p-8 backdrop-blur-[24px] ${
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
                      className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-black/70 bg-white/10"
                    >
                      <img className="h-full w-full object-cover" src={avatar.src} alt={avatar.alt} />
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
        <div className="mb-8 flex items-center justify-between gap-4">
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
              <div key={item.title} className={`flex items-center gap-6 ${item.state === 'locked' ? 'opacity-50' : ''}`}>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${iconContainerClassName}`}
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
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h4 className="font-display text-xl font-semibold tracking-tight text-white">Student Roster</h4>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/52">
              A quick-access roster card for the active learner so the sidebar item always lands on visible content.
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/36">Current Learner</span>
        </div>

        <article className={profileInsetCardClassName}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] border border-white/12 bg-white/[0.06]">
                <span className="font-display text-2xl font-bold text-white">{studentInitial}</span>
              </div>

              <div>
                <div className="font-display text-2xl font-semibold text-white">{profile.name}</div>
                <div className="mt-2 text-sm text-white/52">
                  {profile.classDesignation} | {profile.skillLevel} | {profile.progress}% complete
                </div>
              </div>
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/68">
              Verified Student
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-white px-5 py-3 font-semibold text-black transition-transform duration-300 hover:scale-[0.98] cursor-pointer"
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
        <div className="mb-8 flex items-center justify-between gap-4">
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

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [activePanel, setActivePanel] = useState<PanelKey>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [statusMessage, setStatusMessage] = useState('');
  const profileCardRef = useRef<StudentProfileCardHandle>(null);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(STUDENT_PROFILE_STORAGE_KEY);
      if (!storedValue) {
        return;
      }

      const parsedValue = JSON.parse(storedValue);
      const normalizedProfile = normalizeStoredProfile(parsedValue);

      if (normalizedProfile) {
        setProfile(normalizedProfile);
      }
    } catch {
      window.localStorage.removeItem(STUDENT_PROFILE_STORAGE_KEY);
    }
  }, []);

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

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePanelToggle = (panel: Exclude<PanelKey, null>) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const focusSection = (sectionId: string, section: Exclude<ActiveSection, 'help'>, message?: string) => {
    setActiveSection(section);
    setActivePanel(null);
    scrollToSection(sectionId);
    if (message) {
      showStatusMessage(message);
    }
  };

  const openRosterView = (message = 'Opened roster view.') => {
    setActiveSection('roster');
    setActivePanel('roster');
    scrollToSection(ROSTER_SECTION_ID);
    showStatusMessage(message);
  };

  const handleNavAction = (action: NonNullable<NavItem['action']>) => {
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

  const handleTopNavAction = (action: NonNullable<TopNavItem['action']>) => {
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

  const handleSaveProfile = (nextProfile: StudentProfile) => {
    setProfile(nextProfile);
    window.localStorage.setItem(STUDENT_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    setActivePanel(null);
    setActiveSection('overview');
    showStatusMessage('Student profile saved to this browser.');
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-white selection:text-black [cursor:default]">
      <YantraAmbientBackground />

      <nav className="fixed left-0 top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/8 bg-black/72 px-4 backdrop-blur-2xl md:px-8">
        <Link href="/dashboard" className="font-display text-2xl font-bold tracking-tight text-white uppercase cursor-pointer">
          YANTRA
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {topNavItems.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={`border-b-2 pb-1 font-display tracking-tight transition-colors cursor-pointer ${
                  item.active ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/80'
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                className={`border-b-2 pb-1 font-display tracking-tight transition-colors cursor-pointer ${
                  activeSection === item.action || (item.action === 'roster' && activeSection === 'overview')
                    ? 'border-white text-white'
                    : 'border-transparent text-white/50 hover:text-white/80'
                }`}
                onClick={() => item.action && handleTopNavAction(item.action)}
              >
                {item.label}
              </button>
            ),
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full p-2 text-white/50 transition-all hover:bg-white/5 hover:text-white cursor-pointer"
            aria-label="Notifications"
            aria-expanded={activePanel === 'notifications'}
            onClick={() => handlePanelToggle('notifications')}
          >
            <Bell size={20} />
          </button>
          <button
            type="button"
            className="rounded-full p-2 text-white/50 transition-all hover:bg-white/5 hover:text-white cursor-pointer"
            aria-label="Settings"
            aria-expanded={activePanel === 'settings'}
            onClick={() => handlePanelToggle('settings')}
          >
            <Settings2 size={20} />
          </button>
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.05]">
            <img
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4CWSeYvprUHrYzSPufJblSA90Y4UJou5ZbeZwZAHcqrbYDbnvC6FH11WQlj8zoOhtN0MjRZTkQCbiB_JhePugg2KI93jCi7Eup9I4PaUTXffgCxFHdn8mPZgMDQ12459nME-9oqlfYirEFgdb_St_sFpIPxSbHefu_RNM6NJbBDcEf6VUwOaK_D6-pbuj6kDviL-Cyxb4qZ8wJCCKNdfGx6T1uNjOuD3TdNmgKy8dp51aDJvelS138ftcduB-2q3B2ysq5_14_e2h"
              alt="Professional male portrait with a minimalist background and soft studio lighting."
            />
          </div>
        </div>
      </nav>

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

      {activePanel === 'settings' && (
        <PanelShell title="Profile Settings" eyebrow="Controls" onClose={() => setActivePanel(null)}>
          <button
            type="button"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition-colors hover:bg-white/[0.08] cursor-pointer"
            onClick={() => {
              profileCardRef.current?.openEditor();
              setActiveSection('overview');
              scrollToSection(PROFILE_SECTION_ID);
              setActivePanel(null);
              showStatusMessage('Editor opened with the latest saved profile.');
            }}
          >
            <div className="font-display text-lg font-medium text-white">Resume editing</div>
            <div className="mt-1 text-sm text-white/52">Reopen the form using the latest saved values.</div>
          </button>

          <button
            type="button"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition-colors hover:bg-white/[0.08] cursor-pointer"
            onClick={() => {
              setProfile(initialProfile);
              profileCardRef.current?.closeEditor();
              window.localStorage.removeItem(STUDENT_PROFILE_STORAGE_KEY);
              setActivePanel(null);
              setActiveSection('overview');
              showStatusMessage('Profile reset to the default record.');
            }}
          >
            <div className="font-display text-lg font-medium text-white">Reset profile</div>
            <div className="mt-1 text-sm text-white/52">Clear saved browser data and restore the original record.</div>
          </button>

          <Link
            href="/dashboard"
            className="block rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.08] cursor-pointer"
          >
            <div className="font-display text-lg font-medium text-white">Go to dashboard</div>
            <div className="mt-1 text-sm text-white/52">Return to the main student dashboard overview.</div>
          </Link>
        </PanelShell>
      )}

      {activePanel === 'roster' && (
        <PanelShell title="Student Roster" eyebrow="Quick Access" onClose={() => setActivePanel(null)}>
          <div className={profilePanelCardClassName}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-lg font-medium text-white">{profile.name}</div>
                <div className="mt-1 text-sm text-white/52">
                  {profile.classDesignation} · {profile.skillLevel} · {profile.progress}% complete
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/72">
                Current
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/[0.09] cursor-pointer"
                onClick={() => {
                  setActiveSection('overview');
                  scrollToSection(PROFILE_SECTION_ID);
                  setActivePanel(null);
                  showStatusMessage('Roster focused on the active student.');
                }}
              >
                Open record
              </button>

              <Link
                href="/dashboard"
                className="rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/[0.09] cursor-pointer"
              >
                Dashboard view
              </Link>
            </div>
          </div>
        </PanelShell>
      )}

      {activePanel === 'help' && (
        <PanelShell title="Support" eyebrow="Help" onClose={() => setActivePanel(null)}>
          <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-5">
            <div className="pointer-events-none absolute right-[-18%] top-[-26%] h-40 w-40 rounded-full bg-white/[0.06] blur-[80px]" />

            <div className="relative z-10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] border border-white/10 bg-white/[0.06]">
                  <HelpCircle size={20} className="text-white/72" />
                </div>

                <div>
                  <div className="font-display text-xl font-semibold text-white">Student Support Desk</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/58">
                    Get help with profile updates, curriculum access, progress questions, and record issues without leaving
                    this page.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {['Profile Edits', 'Curriculum Access', 'Performance Questions'].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/62"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/36">Response Time</div>
                  <div className="mt-2 text-sm text-white">Within one working day</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/36">Profile Storage</div>
                  <div className="mt-2 text-sm text-white">Saved in this browser</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                  href="mailto:support@yantra.ai?subject=Student%20Profile%20Support"
                  className="rounded-[1.25rem] border border-white/10 bg-white/[0.05] px-4 py-4 transition-colors hover:bg-white/[0.09] cursor-pointer"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">Contact</div>
                  <div className="mt-2 font-display text-lg text-white">Email support</div>
                  <div className="mt-1 text-sm text-white/50">Reach the support desk for manual help.</div>
                </a>

                <button
                  type="button"
                  className="rounded-[1.25rem] border border-white/10 bg-white/[0.05] px-4 py-4 text-left transition-colors hover:bg-white/[0.09] cursor-pointer"
                  onClick={() => {
                    focusSection(CURRICULUM_SECTION_ID, 'curriculum', 'Opened the curriculum section for review.');
                  }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">Shortcut</div>
                  <div className="mt-2 font-display text-lg text-white">Review curriculum</div>
                  <div className="mt-1 text-sm text-white/50">Jump directly to the current mastery track.</div>
                </button>

                <button
                  type="button"
                  className="rounded-[1.25rem] border border-white/10 bg-white/[0.05] px-4 py-4 text-left transition-colors hover:bg-white/[0.09] cursor-pointer"
                  onClick={() => {
                    focusSection(PERFORMANCE_SECTION_ID, 'performance', 'Opened performance insights.');
                  }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">Shortcut</div>
                  <div className="mt-2 font-display text-lg text-white">Open performance</div>
                  <div className="mt-1 text-sm text-white/50">Review the latest progress and activity signals.</div>
                </button>

                <button
                  type="button"
                  className="rounded-[1.25rem] border border-white/10 bg-white/[0.05] px-4 py-4 text-left transition-colors hover:bg-white/[0.09] cursor-pointer"
                  onClick={() => {
                    focusSection(PROFILE_SECTION_ID, 'overview', 'Returned to profile overview.');
                  }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">Shortcut</div>
                  <div className="mt-2 font-display text-lg text-white">Back to profile</div>
                  <div className="mt-1 text-sm text-white/50">Return to the editable student record card.</div>
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-lg font-medium text-white">FAQs</div>
                <p className="mt-2 text-sm leading-relaxed text-white/54">
                  Quick answers to the most common student support questions.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/58">
                {helpFaqs.length} Topics
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {helpFaqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group overflow-hidden rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4 transition-colors open:bg-white/[0.05]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/78">{faq.question}</span>
                    <ChevronRight size={16} className="shrink-0 text-white/38 transition-transform duration-300 group-open:rotate-90 group-open:text-white/72" />
                  </summary>
                  <p className="mt-3 border-t border-white/6 pt-3 text-sm leading-relaxed text-white/56">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </PanelShell>
      )}

      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 flex-col border-r border-white/8 bg-black/62 px-4 pb-8 pt-28 backdrop-blur-2xl lg:flex">
        <div className="mb-12 flex flex-col gap-2 px-2">
          <div className="font-display text-xl font-bold text-white">YANTRA</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Institutional Portal</div>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          {sideNavItems.map((item) => (
            <NavEntry
              key={item.label}
              item={item}
              onAction={handleNavAction}
              isActive={item.action ? activeSection === item.action : Boolean(item.active)}
            />
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-1">
          {supportNavItems.map((item) => (
            <NavEntry
              key={item.label}
              item={item}
              onAction={handleNavAction}
              isActive={item.action ? activeSection === item.action : Boolean(item.active)}
            />
          ))}
        </div>
      </aside>

      <main className="relative z-10 min-h-screen px-4 pb-12 pt-28 md:px-12 lg:pl-64">
        <div className="mx-auto max-w-6xl">
          {statusMessage ? (
            <div className="mb-6 rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/72 shadow-[0_16px_36px_rgba(0,0,0,0.16)]">
              {statusMessage}
            </div>
          ) : null}

          <div className="mb-8 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
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

          <section className="mb-12" id={PROFILE_SECTION_ID}>
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-5 py-2 backdrop-blur-xl">
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.72)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">Student Identity / Synced Theme</span>
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight text-white md:text-7xl">Student Profile</h1>
            <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-white/58">
              Academic tracking and personal identity management for the Yantra ecosystem. Manage core student data and
              skill progression from a single institutional view.
            </p>
          </section>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <StudentProfileCard ref={profileCardRef} profile={profile} onSave={handleSaveProfile} />

            <section className="flex flex-col gap-8 lg:col-span-7">
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

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/78 transition-colors hover:bg-white/[0.08] cursor-pointer"
            >
              <Grid2x2 size={16} />
              Back to Dashboard
            </Link>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">
              Student record edits now persist in this browser until reset.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
