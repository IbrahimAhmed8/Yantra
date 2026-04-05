'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  BookOpen,
  CalendarDays,
  ChartColumn,
  CirclePlay,
  Clock3,
  Database,
  Flame,
  Layers3,
  Lock,
  Sparkles,
  TerminalSquare,
  TrendingUp,
  UserCircle2,
  Waypoints,
  type LucideIcon,
} from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { createContext, memo, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChatProvider, useChatWidgetActions } from '@/src/features/chat/ChatWidget';
import { useScrollThreshold } from '@/src/features/motion/useScrollThreshold';
import GlobalSidebar from '@/src/features/navigation/GlobalSidebar';
import {
  type DashboardRoomTextureKey,
  type DashboardSkillIconKey,
  type DashboardSkillToneKey,
  type StudentDashboardCurriculumNode,
  type StudentDashboardData,
  type StudentDashboardRoom,
  type StudentDashboardSkill,
} from './student-dashboard-model';
import YantraAmbientBackground from './YantraAmbientBackground';
import type {
  DashboardCurriculumNode,
  DashboardMomentumBar,
  DashboardRoomCard,
  DashboardSkillCard,
} from './dashboard-content';
import { dashboardSectionLinks } from './dashboard-content';

type StudentDashboardProps = {
  data: StudentDashboardData;
};

type DashboardViewModel = {
  hero: {
    headlineLead: string;
    body: string;
    primaryCtaLabel: string;
    primaryCtaPrompt: string;
    secondaryCtaLabel: string;
    currentPath: string;
    pathDescription: string;
    focusLabel: string;
    nextActionTitle: string;
    nextActionDescription: string;
    nextActionPrompt: string;
    summaryCards: Array<{
      label: string;
      value: string;
    }>;
    streakValue: string;
    streakLabel: string;
  };
  overview: {
    trackTitle: string;
    trackDescription: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    estimatedCompletion: string;
    masteryProgress: number;
    unlockedNodes: number;
    totalNodes: number;
    upcomingSession: {
      badgeValue: string;
      badgeLabel: string;
      title: string;
      dayLabel: string;
      timeLabel: string;
      guideName: string;
      guideRole: string;
      guideInitials: string;
    };
    sessionsThisWeek: number;
    momentumDelta: string;
  };
  weeklyMomentumBars: DashboardMomentumBar[];
  curriculumNodes: DashboardCurriculumNode[];
  skills: DashboardSkillCard[];
  rooms: DashboardRoomCard[];
  ai: {
    description: string;
    fullChatPrompt: string;
    emptyDraftPrompt: string;
    prompts: string[];
  };
};

const roomTextures = {
  deepOcean:
    'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.16), transparent 32%), radial-gradient(circle at 78% 18%, rgba(255,255,255,0.08), transparent 24%), linear-gradient(145deg, rgba(3,10,14,0.95), rgba(9,20,24,0.82) 42%, rgba(11,11,11,0.96) 100%)',
  graphite:
    'radial-gradient(circle at 80% 12%, rgba(255,255,255,0.18), transparent 30%), radial-gradient(circle at 20% 88%, rgba(255,255,255,0.09), transparent 34%), linear-gradient(145deg, rgba(19,19,22,0.98), rgba(27,27,30,0.9) 45%, rgba(9,9,11,0.98) 100%)',
  slate:
    'radial-gradient(circle at 72% 18%, rgba(255,255,255,0.12), transparent 26%), linear-gradient(160deg, rgba(10,12,14,0.95), rgba(21,21,21,0.85) 54%, rgba(8,8,8,0.98) 100%)',
  charcoal:
    'radial-gradient(circle at 30% 18%, rgba(255,255,255,0.12), transparent 26%), linear-gradient(150deg, rgba(9,9,9,0.96), rgba(20,20,20,0.84) 50%, rgba(11,11,13,0.98) 100%)',
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'YG';
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function buildWeeklyMomentumBars(progress: number): DashboardMomentumBar[] {
  const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const containerHeights = [96, 128, 80, 144, 112, 48, 48];
  const fillHeights =
    progress === 0
      ? [0, 0, 0, 0, 0, 0, 0]
      : progress < 20
        ? [8, 0, 0, 18, 0, 0, 0]
        : progress < 70
          ? [32, 58, 18, 76, 44, 12, 0]
          : [70, 92, 78, 100, 82, 44, 20];

  return dayLabels.map((day, index) => ({
    day,
    containerHeight: containerHeights[index],
    fillHeight: fillHeights[index],
    bright: fillHeights[index] >= 80,
  }));
}

function buildCurriculumNodes(progress: number): DashboardCurriculumNode[] {
  return [
    {
      module: 'Module 01',
      title: 'AI Foundations',
      description: 'Core ideas, vocabulary, and the first logic needed to begin with confidence.',
      status: progress === 0 ? 'Ready to start' : progress < 35 ? 'In progress' : 'Complete',
      unlocked: true,
    },
    {
      module: 'Module 02',
      title: 'Data Thinking',
      description: 'Read structure, notice patterns, and understand what good model input looks like.',
      status: progress < 20 ? 'Locked' : progress < 65 ? 'In progress' : 'Complete',
      unlocked: progress >= 20,
    },
    {
      module: 'Module 03',
      title: 'Model Building',
      description: 'Move from intuition into model choices, architectures, and explainable outputs.',
      status: progress < 45 ? 'Locked' : progress < 80 ? 'In progress' : 'Complete',
      unlocked: progress >= 45,
    },
  ];
}

function buildSkills(progress: number): DashboardSkillCard[] {
  return [
    {
      title: progress < 20 ? 'AI Vocabulary' : 'Python Basics',
      description:
        progress < 20
          ? 'Start by learning the core language Yantra uses across lessons, prompts, and guided explanations.'
          : 'Syntax, data structures, and clean logic are now strong enough to support faster project work.',
      level: progress < 20 ? 'Starting' : progress >= 70 ? 'Strong' : 'In Progress',
      progress: clamp(progress < 20 ? 8 : progress + 12, 8, 100),
      icon: progress < 20 ? Sparkles : TerminalSquare,
      tone: 'text-white',
    },
    {
      title: 'Logic Building',
      description:
        progress < 20
          ? 'Train breakdown thinking before you move deeper into models and structured problem solving.'
          : 'Conditionals, loops, and decomposition are becoming more reliable through guided practice.',
      level: progress < 10 ? 'Queued' : progress < 70 ? 'In Progress' : 'Strong',
      progress: clamp(progress - 4, 0, 92),
      icon: Brain,
      tone: progress < 10 ? 'text-white/35' : 'text-white/80',
      locked: progress < 10,
    },
    {
      title: 'ML Foundations',
      description: 'Build intuition for data, training, models, and why small decisions change output quality.',
      level: progress < 20 ? 'Locked' : progress < 65 ? 'Started' : 'In Progress',
      progress: clamp(progress - 14, 0, 84),
      icon: Sparkles,
      tone: progress < 20 ? 'text-white/35' : 'text-white/80',
      locked: progress < 20,
    },
    {
      title: 'Data Handling',
      description: 'Inspect structure, spot issues, and narrate patterns clearly enough to support model reasoning.',
      level: progress < 30 ? 'Locked' : progress < 75 ? 'In Progress' : 'Strong',
      progress: clamp(progress - 22, 0, 88),
      icon: Database,
      tone: progress < 30 ? 'text-white/35' : 'text-white/80',
      locked: progress < 30,
    },
    {
      title: 'Neural Networks',
      description: 'Visual model building unlocks after your foundations are stable enough for architecture thinking.',
      level: progress < 45 ? 'Locked' : progress < 85 ? 'In Progress' : 'Strong',
      progress: clamp(progress - 32, 0, 82),
      icon: Waypoints,
      tone: progress < 45 ? 'text-white/35' : 'text-white/78',
      locked: progress < 45,
    },
    {
      title: 'Prompt Design',
      description: 'Learn to shape better outputs, critique responses, and use AI tools with stronger context.',
      level: progress < 15 ? 'Locked' : progress < 60 ? 'Started' : 'In Progress',
      progress: clamp(progress - 10, 0, 86),
      icon: Layers3,
      tone: progress < 15 ? 'text-white/35' : 'text-white/78',
      locked: progress < 15,
    },
  ];
}

function buildRooms(progress: number): DashboardRoomCard[] {
  return [
    {
      title: progress < 20 ? 'Foundations Room' : 'Python Room',
      description:
        progress < 20
          ? 'Start with the first guided session so Yantra can calibrate your pace, focus, and recommendations.'
          : 'Immersive sandbox for refining logic and data structure implementation with real-time AI guidance.',
      status: progress < 20 ? 'Start Here' : 'Available Now',
      cta: progress < 20 ? 'Start First Lesson' : 'Enter Room',
      prompt:
        progress < 20
          ? 'Start my first Yantra lesson and explain what I should focus on.'
          : 'Guide me through the Python Room and suggest the right challenge for me.',
      featured: true,
      texture: roomTextures.deepOcean,
    },
    {
      title: progress >= 70 ? 'Capstone Studio' : 'Neural Net Builder',
      description:
        progress < 20
          ? 'Unlock after the first session to move from AI basics into more visual, hands-on model thinking.'
          : progress >= 70
            ? 'Pull together models, datasets, and explanation layers into a stronger end-to-end build.'
            : 'Visual node editor to construct and train first perceptrons and multi-layer learning flows.',
      status: progress < 20 ? 'Unlock After First Session' : 'Recommended Next',
      cta: progress < 20 ? 'Preview Room' : 'Start Next Room',
      prompt:
        progress >= 70
          ? 'Open my capstone studio and explain what to focus on next.'
          : 'Open my next room and explain what I should focus on there.',
      featured: true,
      texture: roomTextures.graphite,
    },
    {
      title: 'Data Explorer',
      description: 'Load datasets, inspect patterns, and turn rough signals into understandable stories.',
      status: progress < 20 ? 'Queued' : 'Open',
      cta: 'Explore Data',
      prompt: 'Show me what I would learn inside the Data Explorer room.',
      featured: false,
      texture: roomTextures.slate,
    },
    {
      title: 'Prompt Lab',
      description: 'Experiment with prompts, compare output quality, and understand why instruction design changes results.',
      status: progress < 20 ? 'Preview' : 'Open',
      cta: progress < 20 ? 'Preview Lab' : 'Enter Lab',
      prompt: 'Teach me prompt design and open the Prompt Lab context.',
      featured: false,
      texture: roomTextures.charcoal,
    },
  ];
}

function buildDashboardViewModel(data: StudentDashboardData): DashboardViewModel {
  const { profile, path, curriculumNodes, rooms, skills, weeklyActivity } = data;
  const featuredRoom = rooms.find((room) => room.featured) ?? rooms[0] ?? null;
  const primaryNode = curriculumNodes[0] ?? null;
  const primarySkill = skills.find((skill) => !skill.locked) ?? skills[0] ?? null;
  const progress = path.pathProgress;
  const isStarter = progress <= 12;
  const sessionsThisWeek = path.weeklyCompletedSessions;
  const streakValue = sessionsThisWeek > 0 ? String(Math.min(99, sessionsThisWeek)).padStart(2, '0') : '00';
  const learningPrompt =
    path.recommendedActionPrompt || featuredRoom?.prompt || 'Help me understand my current progress and what to do next.';

  return {
    hero: {
      headlineLead: isStarter ? 'Welcome to Yantra,' : 'Welcome back,',
      body: isStarter
        ? `Your first roadmap is live. It starts from ${path.learningTrackTitle.toLowerCase()} and will tighten once you give Yantra real signals from practice.`
        : `Your dashboard is centered on ${path.currentFocus.toLowerCase()}. The next best move is ${path.recommendedActionTitle.toLowerCase()}.`,
      primaryCtaLabel: featuredRoom?.ctaLabel || 'Open Next Step',
      primaryCtaPrompt: learningPrompt,
      secondaryCtaLabel: 'View Practice Rooms',
      currentPath: path.pathTitle,
      pathDescription: path.pathDescription,
      focusLabel: path.currentFocus,
      nextActionTitle: path.recommendedActionTitle,
      nextActionDescription: path.recommendedActionDescription,
      nextActionPrompt: learningPrompt,
      summaryCards: [
        { label: 'Momentum', value: path.momentumSummary },
        { label: 'Focus', value: path.focusSummary },
        { label: 'Role', value: profile.userRole ?? 'Starter Track' },
      ],
      streakValue,
      streakLabel: sessionsThisWeek > 0 ? 'Sessions This Week' : 'Fresh Account',
    },
    overview: {
      trackTitle: path.learningTrackTitle,
      trackDescription: path.learningTrackDescription,
      primaryCtaLabel: featuredRoom?.ctaLabel || path.recommendedActionTitle,
      secondaryCtaLabel: 'View Skills',
      estimatedCompletion: path.completionEstimateLabel,
      masteryProgress: path.masteryProgress,
      unlockedNodes: path.masteryUnlockedCount,
      totalNodes: path.masteryTotalCount,
      upcomingSession: {
        badgeValue: path.nextSessionDateDay,
        badgeLabel: path.nextSessionDateMonth,
        title: path.nextSessionTitle,
        dayLabel: path.nextSessionDayLabel,
        timeLabel: path.nextSessionTimeLabel,
        guideName: path.nextSessionInstructorName,
        guideRole: path.nextSessionInstructorRole,
        guideInitials: getInitials(path.nextSessionInstructorName),
      },
      sessionsThisWeek,
      momentumDelta: path.weeklyChangeLabel,
    },
    weeklyMomentumBars: weeklyActivity.map((day) => ({
      day: day.dayLabel,
      containerHeight: day.containerHeight,
      fillHeight: day.fillHeight,
      bright: day.highlighted,
    })),
    curriculumNodes: curriculumNodes.map((node) => ({
      module: node.moduleLabel,
      title: node.title,
      description: node.description,
      status: node.statusLabel,
      unlocked: node.unlocked,
    })),
    skills: skills.map((skill) => ({
      title: skill.title,
      description: skill.description,
      level: skill.levelLabel,
      progress: skill.progress,
      icon: skill.locked ? Lock : skillIconMap[skill.iconKey],
      tone: skillToneClassMap[skill.toneKey],
      locked: skill.locked,
    })),
    rooms: rooms.map((room) => ({
      title: room.title,
      description: room.description,
      status: room.statusLabel,
      cta: room.ctaLabel,
      prompt: room.prompt,
      featured: room.featured,
      texture: roomTextureMap[room.textureKey],
    })),
    ai: {
      description: `Yantra AI is grounded in your ${path.learningTrackTitle.toLowerCase()} roadmap, current focus, and recommended rooms so the conversation starts from what you are learning now.`,
      fullChatPrompt: `Help me continue with my ${path.learningTrackTitle} roadmap and focus on ${path.currentFocus}.`,
      emptyDraftPrompt: learningPrompt,
      prompts: [
        primarySkill ? `How do I improve ${primarySkill.title}?` : 'What should I learn next?',
        primaryNode ? `Explain ${primaryNode.title} simply` : 'Explain this concept simply',
        featuredRoom ? `Open ${featuredRoom.title}` : 'Open my next room',
      ],
    },
  };
}

const DashboardDataContext = createContext<StudentDashboardData | null>(null);

const aiPrompts = [
  'Explain backpropagation simply',
  'What should I learn next?',
  'Open my next room',
];

const skillIconMap: Record<DashboardSkillIconKey, LucideIcon> = {
  python: TerminalSquare,
  logic: Brain,
  ml: Sparkles,
  data: Database,
  networks: Waypoints,
  prompt: Layers3,
};

const skillToneClassMap: Record<DashboardSkillToneKey, string> = {
  primary: 'text-white',
  soft: 'text-white/84',
  muted: 'text-white/38',
};

const roomTextureMap: Record<DashboardRoomTextureKey, string> = {
  'python-room':
    'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.12), transparent 32%), radial-gradient(circle at 78% 18%, rgba(255,255,255,0.06), transparent 24%), linear-gradient(145deg, rgba(3,10,14,0.95), rgba(9,20,24,0.82) 42%, rgba(11,11,11,0.96) 100%)',
  'neural-builder':
    'radial-gradient(circle at 80% 12%, rgba(255,255,255,0.14), transparent 30%), radial-gradient(circle at 20% 88%, rgba(255,255,255,0.06), transparent 34%), linear-gradient(145deg, rgba(19,19,22,0.98), rgba(27,27,30,0.9) 45%, rgba(9,9,11,0.98) 100%)',
  'data-explorer':
    'radial-gradient(circle at 72% 18%, rgba(255,255,255,0.08), transparent 26%), linear-gradient(160deg, rgba(10,12,14,0.95), rgba(21,21,21,0.85) 54%, rgba(8,8,8,0.98) 100%)',
  'prompt-lab':
    'radial-gradient(circle at 30% 18%, rgba(255,255,255,0.08), transparent 26%), linear-gradient(150deg, rgba(9,9,9,0.96), rgba(20,20,20,0.84) 50%, rgba(11,11,13,0.98) 100%)',
};

function buildRoomHref(roomKey: string) {
  if (roomKey === 'python-room') {
    return '/dashboard/rooms/python';
  }

  return null;
}

function useDashboardData() {
  const context = useContext(DashboardDataContext);

  if (!context) {
    throw new Error('useDashboardData must be used inside StudentDashboard.');
  }

  return context;
}

function SectionShell({
  id,
  number,
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <motion.section
      id={id}
      className="relative scroll-mt-28 space-y-10 md:space-y-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pointer-events-none absolute -left-1 top-[-4rem] hidden select-none font-display text-[5rem] leading-none text-white/[0.028] sm:block lg:top-[-5rem] lg:text-[8rem] xl:top-[-6.5rem] xl:text-[11rem]">
        {number}
      </div>

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/38">{eyebrow}</div>
          <h2 className="max-w-4xl font-display text-4xl font-semibold leading-[0.92] text-white md:text-6xl">
            {title}
          </h2>
          <p className="max-w-2xl text-base font-light leading-relaxed text-white/56 md:text-lg">{description}</p>
        </div>
        {action}
      </div>

      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}

function DashboardNav() {
  const { profile } = useDashboardData();
  const { openChat } = useChatWidgetActions();
  const scrolled = useScrollThreshold(18);

  return (
    <>
      <motion.nav
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
          scrolled ? 'border-b border-white/8 bg-black/72 backdrop-blur-2xl' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto flex h-20 max-w-[1520px] items-center justify-between px-5 md:px-8 xl:px-10">
          <div className="flex items-center gap-8 md:gap-10">
            <Link href="/" className="font-heading text-3xl tracking-wider text-white hoverable">
              YANTRA<span className="text-white/42">.</span>
            </Link>

            <div className="hidden items-center gap-7 md:flex">
              {dashboardSectionLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  data-no-route-loader="true"
                  className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/50 transition-colors hover:text-white hoverable"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/docs/first-dashboard-session"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/70 transition-colors hover:bg-white/[0.08] hoverable"
            >
              <BookOpen size={14} />
              Docs
            </Link>

            <button
              type="button"
              className="rounded-full bg-white px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-black transition-colors hover:bg-white/92 hoverable"
              onClick={() => openChat({ message: 'Help me continue learning from my current student dashboard context.' })}
            >
              Open Yantra AI
            </button>

            <Link
              href="/dashboard/student-profile"
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-xl transition-colors hover:bg-white/[0.08] hoverable"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/70">
                <UserCircle2 size={16} />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/58">{profile.fullName}</div>
            </Link>
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <Link
              href="/dashboard/student-profile"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/70 transition-colors hover:bg-white/[0.08]"
              aria-label="Student Profile"
            >
              <UserCircle2 size={16} />
            </Link>
            <GlobalSidebar className="text-white hoverable" />
          </div>
        </div>
      </motion.nav>
    </>
  );
}

function HeroSection({
  firstName,
  view,
}: {
  firstName: string;
  view: DashboardViewModel;
}) {
  const { path } = useDashboardData();
  const { openChat } = useChatWidgetActions();
  const statRef = useRef<HTMLDivElement>(null);
  const statInView = useInView(statRef, { once: true, margin: '-60px' });
  const progress = path.pathProgress;
  const progressWidth = `${progress}%`;
  const resolvedView = view;

  return (
    <section className="relative grid gap-8 pt-24 sm:gap-10 sm:pt-28 lg:grid-cols-[minmax(0,1.04fr)_minmax(21rem,0.96fr)] lg:items-end lg:gap-10 lg:pt-32 xl:grid-cols-[minmax(0,1.16fr)_minmax(24rem,0.84fr)] xl:gap-14 xl:pt-36 2xl:gap-16">
      <motion.div
        className="space-y-6 sm:space-y-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 backdrop-blur-xl">
          <span className="h-2 w-2 rounded-full bg-white/85" />
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/42">Student OS / System Active</span>
        </div>

        <div className="space-y-5">
          <h1 className="max-w-4xl font-display text-[clamp(3.1rem,14vw,7rem)] font-semibold leading-[0.9] tracking-tight text-white sm:leading-[0.88]">
            {resolvedView.hero.headlineLead}
            <br />
            {firstName}.
          </h1>

          <p className="max-w-2xl text-base font-light leading-relaxed text-white/56 sm:text-lg xl:text-[1.35rem]">
            {resolvedView.hero.body}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            className="w-full rounded-full bg-white px-8 py-4 text-sm font-medium uppercase tracking-[0.22em] text-black transition-transform duration-300 hover:scale-[0.985] hoverable sm:w-auto"
            onClick={() => openChat({ message: resolvedView.hero.primaryCtaPrompt })}
          >
            {resolvedView.hero.primaryCtaLabel}
          </button>

          <a
            href="#rooms"
            data-no-route-loader="true"
            className="w-full rounded-full border border-white/14 bg-white/[0.04] px-8 py-4 text-center font-mono text-[11px] uppercase tracking-[0.24em] text-white transition-colors hover:bg-white/[0.08] hoverable sm:w-auto"
          >
            {resolvedView.hero.secondaryCtaLabel}
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Momentum</div>
            <div className="mt-2 font-display text-2xl font-medium text-white">{path.momentumSummary}</div>
          </div>
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Focus</div>
            <div className="mt-2 font-display text-2xl font-medium text-white">{path.focusSummary}</div>
          </div>
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Consistency</div>
            <div className="mt-2 font-display text-2xl font-medium text-white">{path.consistencySummary}</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        ref={statRef}
        className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-[28px] sm:p-6 xl:p-7"
        initial={{ opacity: 0, y: 28 }}
        animate={statInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.85, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_36%,rgba(255,255,255,0.02))]" />

        <div className="relative z-10 space-y-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/38">Current Path</div>
              <div className="mt-3 font-display text-2xl font-medium text-white sm:text-3xl xl:text-[2.5rem]">{path.pathTitle}</div>
              <div className="mt-2 text-sm leading-relaxed text-white/52">{path.pathDescription}</div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/54">
              {path.pathStatusLabel}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.6rem] bg-black/28 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Path Progress</div>
              <div className="mt-2 font-display text-5xl font-medium text-white">{progress}%</div>
            </div>
            <div className="rounded-[1.6rem] bg-black/28 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">{resolvedView.hero.streakLabel}</div>
              <div className="mt-2 flex items-center gap-3 font-display text-5xl font-medium text-white">
                {resolvedView.hero.streakValue}
                <Flame size={22} className="text-white/70" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/34 sm:flex-row sm:items-center sm:justify-between">
              <span>Current Focus</span>
              <span>{resolvedView.hero.focusLabel}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-white"
                initial={{ width: 0 }}
                animate={statInView ? { width: progressWidth } : undefined}
                transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.6rem] border border-white/8 bg-black/28 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Next Recommended Action</div>
              <CirclePlay size={16} className="text-white/46" />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-display text-xl font-medium text-white sm:text-2xl">{resolvedView.hero.nextActionTitle}</div>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/54">
                  {resolvedView.hero.nextActionDescription}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full border border-white/12 bg-white/[0.05] p-3 text-white transition-colors hover:bg-white/[0.12] hoverable min-h-12 min-w-12 inline-flex items-center justify-center"
                onClick={() => openChat({ message: resolvedView.hero.nextActionPrompt })}
                aria-label="Next action"
              >
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function OverviewSection({ view }: { view: DashboardViewModel }) {
  const { openChat } = useChatWidgetActions();
  const { path, curriculumNodes, weeklyActivity } = useDashboardData();
  const masteryCircumference = 2 * Math.PI * 58;
  const masteryOffset = masteryCircumference - (masteryCircumference * path.masteryProgress) / 100;

  return (
    <SectionShell
      id="overview"
      number="01"
      eyebrow="Dashboard Snapshot"
      title="A clean command surface for progress, momentum, and the next right move."
      description="Everything here reflects the current account state so a new dashboard feels genuinely new instead of pre-filled like a sample profile."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <motion.article
          className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.035] p-8 backdrop-blur-[24px] xl:col-span-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative z-10 flex h-full flex-col justify-between gap-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/36">Current Learning Track</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/58">
                  <BookOpen size={18} />
                </div>
              </div>

              <div className="max-w-xl">
                <h3 className="font-display text-4xl font-semibold leading-tight text-white md:text-5xl">
                  {view.overview.trackTitle}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
                  {view.overview.trackDescription}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-wrap gap-3">
                <a
                  href="#rooms"
                  data-no-route-loader="true"
                  className="rounded-full bg-white px-6 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-black transition-colors hover:bg-white/92 hoverable"
                >
                  {view.overview.primaryCtaLabel}
                </a>
                <a
                  href="#skills"
                  data-no-route-loader="true"
                  className="rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/[0.08] hoverable"
                >
                  {view.overview.secondaryCtaLabel}
                </a>
              </div>

              <div className="text-left lg:text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/36">Estimated Completion</p>
                <p className="mt-2 font-display text-xl text-white">{path.completionEstimateLabel}</p>
              </div>
            </div>
          </div>
        </motion.article>

        <motion.article
          className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.035] p-8 backdrop-blur-[24px] xl:col-span-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/36">Mastery Nodes</span>
            <div className="text-white/24">
              <ChartColumn size={18} />
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center text-center">
            <div className="relative mb-6 h-32 w-32">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
                <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-white/6" />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={masteryCircumference}
                  strokeDashoffset={masteryOffset}
                  className="text-white transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-3xl font-light text-white">{path.masteryProgress}%</span>
              </div>
            </div>

            <p className="font-display text-4xl font-semibold text-white">
              {path.masteryUnlockedCount} / {path.masteryTotalCount}
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/36">Competency Nodes Unlocked</p>
          </div>
        </motion.article>

        <motion.article
          className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.035] p-8 backdrop-blur-[24px] xl:col-span-5"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="space-y-8">
            <span className="block font-mono text-[10px] uppercase tracking-[0.24em] text-white/36">Upcoming Session</span>

            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.05]">
                <span className="font-display text-2xl font-semibold text-white">{path.nextSessionDateDay}</span>
                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/34">{path.nextSessionDateMonth}</span>
              </div>

              <div>
                <h3 className="font-display text-2xl font-semibold text-white">{path.nextSessionTitle}</h3>
                <p className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/36">
                  <CalendarDays size={14} />
                  <span>{path.nextSessionDayLabel}</span>
                  <Clock3 size={14} />
                  <span>{path.nextSessionTimeLabel}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-[1.25rem] border border-white/8 bg-white/[0.05] p-4">
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/[0.06]">
                {path.nextSessionInstructorImageUrl.trim() ? (
                  <Image
                    className="object-cover"
                    src={path.nextSessionInstructorImageUrl}
                    alt={`${path.nextSessionInstructorName} portrait`}
                    fill
                    sizes="36px"
                  />
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/72">
                    {view.overview.upcomingSession.guideInitials}
                  </span>
                )}
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/78">{path.nextSessionInstructorName}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">{path.nextSessionInstructorRole}</p>
              </div>

              <button
                type="button"
                className="ml-auto rounded-full p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white hoverable"
                aria-label="Open session"
                onClick={() =>
                  openChat({
                    message: `Help me prepare for ${path.nextSessionTitle} and tell me what to focus on next.`,
                  })
                }
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.article>

        <motion.article
          className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.035] p-8 backdrop-blur-[24px] xl:col-span-7"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/36">Weekly Momentum</span>
            <div className="flex gap-2">
              <span className="h-2 w-2 rounded-full bg-white/90" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
            </div>
          </div>

          <div className="mt-10 grid h-40 grid-cols-7 items-end gap-4 px-2 md:px-4">
            {weeklyActivity.map((bar) => (
              <div key={bar.dayKey} className="flex flex-col items-center gap-4">
                <div
                  className="relative w-full overflow-hidden rounded-t-full bg-white/5"
                  style={{ height: `${bar.containerHeight}px` }}
                >
                  {bar.fillHeight > 0 ? (
                    <div
                      className={`absolute bottom-0 w-full ${bar.highlighted ? 'bg-white/90' : 'bg-white/20'}`}
                      style={{ height: `${bar.fillHeight}%` }}
                    />
                  ) : null}
                </div>
                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/30">{bar.dayLabel}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-white/5 pt-6 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="font-display text-3xl font-semibold text-white">{path.weeklyCompletedSessions} Sessions</span>
              <span className="ml-0 mt-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-white/36 md:ml-3 md:mt-0 md:inline">
                Completed this week
              </span>
            </div>

            <div className="flex items-center gap-2 text-white/58">
              <TrendingUp size={16} />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em]">{path.weeklyChangeLabel}</span>
            </div>
          </div>
        </motion.article>
      </div>

      <div className="mt-14">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/30">Active Curriculum Nodes</div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {curriculumNodes.map((node, index) => (
            <CurriculumNodeCard key={node.nodeKey} node={node} index={index} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function CurriculumNodeCard({ node, index }: { node: StudentDashboardCurriculumNode; index: number }) {
  return (
    <motion.article
      className={`relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.035] p-6 backdrop-blur-[24px] ${
        node.unlocked ? '' : 'opacity-65 grayscale-[0.15]'
      }`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: 0.08 * index, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between gap-4">
        <span className={`h-1.5 w-1.5 rounded-full ${node.unlocked ? 'bg-white' : 'bg-white/20'}`} />
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">{node.moduleLabel}</span>
      </div>

      <div className="mt-6">
        <h4 className="font-display text-xl font-medium text-white">{node.title}</h4>
        <p className="mt-3 text-sm leading-relaxed text-white/44">{node.description}</p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <span className={`font-mono text-[9px] uppercase tracking-[0.16em] ${node.unlocked ? 'text-white/60' : 'text-white/36'}`}>
          {node.statusLabel}
        </span>
        {node.unlocked ? <Sparkles size={16} className="text-white/56" /> : <Lock size={16} className="text-white/24" />}
      </div>
    </motion.article>
  );
}

function SkillsSection() {
  const { skills } = useDashboardData();
  return (
    <SectionShell
      id="skills"
      number="02"
      eyebrow="Skill Roadmap"
      title="A roadmap that opens up as your real progress deepens."
      description="The skills below now reflect a fresh account state first, then expand as more of the path unlocks."
      action={
        <a
          href="#rooms"
          data-no-route-loader="true"
          className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/54 transition-colors hover:text-white hoverable"
        >
          View full practice flow
        </a>
      }
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {skills.map((skill, index) => (
          <SkillCard key={skill.skillKey} skill={skill} index={index} />
        ))}
      </div>
    </SectionShell>
  );
}

const SkillCard = memo(function SkillCard({ skill, index }: { skill: StudentDashboardSkill; index: number }) {
  const Icon = skill.locked ? Lock : skillIconMap[skill.iconKey];

  return (
    <motion.div
      className={`relative overflow-hidden rounded-[2rem] border p-7 backdrop-blur-[24px] ${
        skill.locked ? 'border-white/6 bg-white/[0.02] opacity-55 grayscale-[0.15]' : 'border-white/8 bg-white/[0.035]'
      }`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/16 to-transparent" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/66">
          <Icon size={18} />
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/62">
          {skill.levelLabel}
        </div>
      </div>

      <div className="mt-8">
        <h3 className={`font-display text-3xl font-medium leading-none ${skillToneClassMap[skill.toneKey]}`}>{skill.title}</h3>
        <p className="mt-4 text-sm font-light leading-relaxed text-white/52">{skill.description}</p>
      </div>

      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/34">
          <span>{skill.locked ? 'Unlock Progress' : 'Mastery'}</span>
          <span>{skill.progress}%</span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-white" style={{ width: `${skill.progress}%` }} />
        </div>
      </div>
    </motion.div>
  );
});

SkillCard.displayName = 'SkillCard';

const RoomCard = memo(function RoomCard({ room, index }: { room: StudentDashboardRoom; index: number }) {
  const { openChat } = useChatWidgetActions();
  const roomHref = buildRoomHref(room.roomKey);

  return (
    <motion.article
      className={`relative overflow-hidden rounded-[2rem] border border-white/8 p-8 backdrop-blur-[20px] ${
        room.featured ? 'min-h-[25rem]' : 'min-h-[20rem]'
      }`}
      style={{ backgroundImage: roomTextureMap[room.textureKey] }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_26%,rgba(0,0,0,0.34)_100%)]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: room.featured ? '44px 44px' : '52px 52px',
          maskImage: 'radial-gradient(circle at center, black 28%, transparent 86%)',
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-white/64">
            {room.statusLabel}
          </div>

          <div className="mt-5 max-w-[24rem]">
            <h3 className="font-display text-3xl font-medium leading-[0.96] text-white md:text-4xl">{room.title}</h3>
            <p className="mt-4 text-sm font-light leading-relaxed text-white/56">{room.description}</p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          {roomHref ? (
            <Link
              href={roomHref}
              className={`rounded-full px-6 py-3 text-sm uppercase tracking-[0.18em] transition-colors hoverable ${
                room.featured ? 'bg-white text-black hover:bg-white/92' : 'border border-white/12 bg-white/[0.05] text-white hover:bg-white/[0.08]'
              }`}
            >
              {room.ctaLabel}
            </Link>
          ) : (
            <button
              type="button"
              className={`rounded-full px-6 py-3 text-sm uppercase tracking-[0.18em] transition-colors hoverable ${
                room.featured ? 'bg-white text-black hover:bg-white/92' : 'border border-white/12 bg-white/[0.05] text-white hover:bg-white/[0.08]'
              }`}
              onClick={() => openChat({ message: room.prompt })}
            >
              {room.ctaLabel}
            </button>
          )}

          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
            <span>AI-guided</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </motion.article>
  );
});

RoomCard.displayName = 'RoomCard';

function RoomsSection() {
  const { rooms } = useDashboardData();

  return (
    <SectionShell
      id="rooms"
      number="03"
      eyebrow="Practice Rooms"
      title="Immersive rooms that stay tied to the learner’s current context."
      description="The room system keeps the same four-entry structure from your sample, but the featured spaces now have more atmosphere and clearer energy around the next best action."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {rooms.map((room, index) => (
          <RoomCard key={room.roomKey} room={room} index={index} />
        ))}
      </div>
    </SectionShell>
  );
}

function YantraAiSection({ view }: { view: DashboardViewModel }) {
  const { openChat } = useChatWidgetActions();
  const [draft, setDraft] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.trim()) {
      openChat({ draft: view.ai.emptyDraftPrompt });
      return;
    }

    openChat({ message: draft });
    setDraft('');
  };

  return (
    <section id="yantra-ai" className="relative scroll-mt-28 border-t border-white/8 pt-14 md:pt-16">
      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="space-y-6 md:col-span-4">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white/85" />
            <h2 className="font-display text-3xl font-medium tracking-tight text-white md:text-4xl">Yantra AI</h2>
          </div>

          <p className="max-w-md text-base leading-relaxed text-white/56 md:text-lg">{view.ai.description}</p>

          <button
            type="button"
            className="w-full rounded-full border border-white/12 bg-white/[0.04] px-6 py-4 font-mono text-[11px] uppercase tracking-[0.24em] text-white transition-colors hover:bg-white/[0.08] hoverable"
            onClick={() => openChat({ message: view.ai.fullChatPrompt })}
          >
            Open Full AI Chat
          </button>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.04] p-6 backdrop-blur-[24px] md:col-span-8 md:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_42%,rgba(255,255,255,0.02))]" />

          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/36">Suggested Commands</div>
              <div className="flex flex-wrap gap-3">
                {view.ai.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="rounded-full border border-white/8 bg-white/[0.045] px-5 py-3 text-sm text-white/80 transition-colors hover:border-white/16 hover:bg-white/[0.08] hover:text-white hoverable"
                    onClick={() => openChat({ message: prompt })}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex items-center gap-3 rounded-[2rem] border border-white/10 bg-black/26 px-5 py-4 transition-colors focus-within:border-white/20">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/24"
                  placeholder="Ask Yantra about your progress or a concept..."
                />
                <button
                  type="submit"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white text-black transition-colors hover:bg-white/92 hoverable"
                  aria-label="Send prompt"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardFooter() {
  return (
    <footer className="border-t border-white/6 px-5 py-10 md:px-8 md:py-12">
      <div className="mx-auto flex max-w-[1520px] flex-col gap-6 md:flex-row md:items-center md:justify-between xl:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          <span className="font-heading text-2xl tracking-wider text-white/20">YANTRA</span>
          <div className="flex gap-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/28">
            <Link href="/privacy" className="transition-colors hover:text-white hoverable">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white hoverable">
              Terms
            </Link>
            <Link href="/status" className="transition-colors hover:text-white hoverable">
              System Status
            </Link>
          </div>
        </div>

        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/20">
          2026 Yantra Intelligence Systems. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function DashboardExperience() {
  const data = useDashboardData();
  const view = buildDashboardViewModel(data);

  return (
    <div className="relative min-h-screen bg-black text-white">
      <YantraAmbientBackground />
      <DashboardNav />

      <main className="mx-auto flex w-full max-w-[1520px] flex-col gap-24 px-5 pb-20 md:gap-32 md:px-8 md:pb-24 xl:px-10">
        <HeroSection firstName={data.profile.firstName || 'Learner'} view={view} />
        <OverviewSection view={view} />
        <SkillsSection />
        <RoomsSection />
        <YantraAiSection view={view} />
      </main>

      <DashboardFooter />
    </div>
  );
}

export default function StudentDashboard({ data }: StudentDashboardProps) {
  return (
    <ChatProvider>
      <DashboardDataContext.Provider value={data}>
        <DashboardExperience />
      </DashboardDataContext.Provider>
    </ChatProvider>
  );
}
