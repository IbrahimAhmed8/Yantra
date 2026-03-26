'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Brain,
  ChartColumn,
  CirclePlay,
  Database,
  Flame,
  Layers3,
  Lock,
  Menu,
  Sparkles,
  TerminalSquare,
  UserCircle2,
  Waypoints,
  X,
  type LucideIcon,
} from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChatProvider, useChatWidget } from '@/src/features/chat/ChatWidget';
import { useOverlayLock } from '@/src/features/motion/ExperienceProvider';

type OverviewCard = {
  label: string;
  value: string;
  detail: string;
  note: string;
  icon: LucideIcon;
  featured?: boolean;
};

type SkillCard = {
  title: string;
  description: string;
  level: string;
  progress: number;
  icon: LucideIcon;
  tone: string;
  locked?: boolean;
};

type RoomCard = {
  title: string;
  description: string;
  status: string;
  cta: string;
  prompt: string;
  featured: boolean;
  texture: string;
};

const overviewCards: OverviewCard[] = [
  {
    label: 'Current Track',
    value: 'AI Foundations',
    detail: 'Core path',
    note: 'Logic, data handling, and model intuition are flowing together now.',
    icon: BookOpen,
    featured: true,
  },
  {
    label: 'Skills Progress',
    value: '6/18',
    detail: 'Concepts completed',
    note: 'Your strongest momentum is still coming from guided practice loops.',
    icon: ChartColumn,
  },
  {
    label: 'Next Session',
    value: 'Neural Nets',
    detail: 'Recommended next',
    note: 'The next room is ready as soon as you want a more visual challenge.',
    icon: Sparkles,
  },
  {
    label: 'Weekly Momentum',
    value: '4',
    detail: 'Focused sessions',
    note: 'A steady rhythm is active, and your streak is holding cleanly.',
    icon: Flame,
  },
];

const skills: SkillCard[] = [
  {
    title: 'Python Basics',
    description: 'Syntax, data structures, and clean logic are now familiar enough to support faster practice.',
    level: 'Strong',
    progress: 100,
    icon: TerminalSquare,
    tone: 'text-white',
  },
  {
    title: 'Logic Building',
    description: 'Conditionals, loops, and breakdown thinking are improving through guided challenge walkthroughs.',
    level: 'In Progress',
    progress: 72,
    icon: Brain,
    tone: 'text-white/85',
  },
  {
    title: 'ML Foundations',
    description: 'You are building intuition for features, models, training, and why data quality matters.',
    level: 'Started',
    progress: 38,
    icon: Sparkles,
    tone: 'text-white/80',
  },
  {
    title: 'Data Handling',
    description: 'Inspecting structure, spotting issues, and narrating patterns is becoming more natural.',
    level: 'In Progress',
    progress: 51,
    icon: Database,
    tone: 'text-white/80',
  },
  {
    title: 'Neural Networks',
    description: 'Locked until the current logic and data milestones are stable enough for visual model building.',
    level: 'Locked',
    progress: 18,
    icon: Waypoints,
    tone: 'text-white/35',
    locked: true,
  },
  {
    title: 'Prompt Design',
    description: 'Unlocks after the next room so you can reason about outputs with stronger technical context.',
    level: 'Locked',
    progress: 8,
    icon: Layers3,
    tone: 'text-white/35',
    locked: true,
  },
];

const rooms: RoomCard[] = [
  {
    title: 'Python Room',
    description: 'Immersive sandbox for refining logic and data structure implementation with real-time AI guidance.',
    status: 'Available Now',
    cta: 'Enter Room',
    prompt: 'Guide me through the Python Room and suggest the right challenge for me.',
    featured: true,
    texture:
      'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.16), transparent 32%), radial-gradient(circle at 78% 18%, rgba(255,255,255,0.08), transparent 24%), linear-gradient(145deg, rgba(3,10,14,0.95), rgba(9,20,24,0.82) 42%, rgba(11,11,11,0.96) 100%)',
  },
  {
    title: 'Neural Net Builder',
    description: 'Visual node editor to construct and train first perceptrons and multi-layer learning flows.',
    status: 'Recommended Next',
    cta: 'Start Next Room',
    prompt: 'Open my next room and explain why Neural Net Builder should be next for me.',
    featured: true,
    texture:
      'radial-gradient(circle at 80% 12%, rgba(255,255,255,0.18), transparent 30%), radial-gradient(circle at 20% 88%, rgba(255,255,255,0.09), transparent 34%), linear-gradient(145deg, rgba(19,19,22,0.98), rgba(27,27,30,0.9) 45%, rgba(9,9,11,0.98) 100%)',
  },
  {
    title: 'Data Explorer',
    description: 'Load datasets, inspect patterns, and turn rough signals into understandable stories.',
    status: 'Open',
    cta: 'Explore Data',
    prompt: 'Show me what I would learn inside the Data Explorer room.',
    featured: false,
    texture:
      'radial-gradient(circle at 72% 18%, rgba(255,255,255,0.12), transparent 26%), linear-gradient(160deg, rgba(10,12,14,0.95), rgba(21,21,21,0.85) 54%, rgba(8,8,8,0.98) 100%)',
  },
  {
    title: 'Prompt Lab',
    description: 'Experiment with prompts, compare output quality, and understand why instruction design changes results.',
    status: 'Open',
    cta: 'Enter Lab',
    prompt: 'Teach me prompt design and open the Prompt Lab context.',
    featured: false,
    texture:
      'radial-gradient(circle at 30% 18%, rgba(255,255,255,0.12), transparent 26%), linear-gradient(150deg, rgba(9,9,9,0.96), rgba(20,20,20,0.84) 50%, rgba(11,11,13,0.98) 100%)',
  },
];

const aiPrompts = [
  'Explain backpropagation simply',
  'What should I learn next?',
  'Open my next room',
];

function DashboardBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 opacity-80">
        <div className="absolute left-[-12%] top-[-2%] h-[40rem] w-[40rem] rounded-full bg-white/[0.07] blur-[130px]" />
        <div className="absolute right-[-14%] top-[18%] h-[42rem] w-[42rem] rounded-full bg-white/[0.055] blur-[145px]" />
        <div className="absolute bottom-[-18%] left-[18%] h-[38rem] w-[46rem] rounded-full bg-white/[0.05] blur-[160px]" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
          maskImage: 'radial-gradient(circle at center, black 45%, transparent 88%)',
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.05),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%,transparent_78%,rgba(255,255,255,0.04))]" />

      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-screen"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 160 160%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22160%22 height=%22160%22 filter=%22url(%23noise)%22 opacity=%220.9%22/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
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
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pointer-events-none absolute -left-1 top-[-4.5rem] select-none font-display text-[7rem] leading-none text-white/[0.028] md:top-[-6.5rem] md:text-[11rem]">
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
  const { openChat } = useChatWidget();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useOverlayLock('dashboard-mobile-nav', mobileMenuOpen);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'Overview', href: '#overview' },
    { label: 'Skills', href: '#skills' },
    { label: 'Rooms', href: '#rooms' },
    { label: 'Yantra AI', href: '#yantra-ai' },
  ];

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
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-8 md:gap-10">
            <Link href="/" className="font-heading text-3xl tracking-wider text-white hoverable">
              YANTRA<span className="text-white/42">.</span>
            </Link>

            <div className="hidden items-center gap-7 md:flex">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/50 transition-colors hover:text-white hoverable"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <button
              type="button"
              className="rounded-full bg-white px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-black transition-all duration-300 hover:scale-[0.98] hoverable"
              onClick={() => openChat({ message: 'Help me continue learning from my current student dashboard context.' })}
            >
              Open Yantra AI
            </button>

            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white/70">
                <UserCircle2 size={16} />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/58">Aarav</div>
            </div>
          </div>

          <button
            type="button"
            className="text-white hoverable md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      {mobileMenuOpen && (
        <motion.div
          data-lenis-prevent
          className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-black/92 p-6 backdrop-blur-2xl md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex justify-end">
            <button type="button" className="p-2 text-white hoverable" onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            {links.map((link, index) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="font-display text-5xl font-medium tracking-tight text-white hoverable"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </motion.a>
            ))}

            <motion.button
              type="button"
              className="mt-6 rounded-full bg-white px-7 py-3 font-mono text-[11px] uppercase tracking-[0.24em] text-black hoverable"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34 }}
              onClick={() => {
                setMobileMenuOpen(false);
                openChat({ message: 'Help me continue learning from my current student dashboard context.' });
              }}
            >
              Open Yantra AI
            </motion.button>
          </div>
        </motion.div>
      )}
    </>
  );
}

function HeroSection() {
  const { openChat } = useChatWidget();
  const statRef = useRef<HTMLDivElement>(null);
  const statInView = useInView(statRef, { once: true, margin: '-60px' });

  return (
    <section className="relative grid gap-10 pt-28 md:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] md:items-end md:gap-14 md:pt-36">
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-5 py-2 backdrop-blur-xl">
          <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.75)] animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/42">Student OS / System Active</span>
        </div>

        <div className="space-y-5">
          <h1 className="max-w-4xl font-display text-[3.8rem] font-semibold leading-[0.9] tracking-tight text-white sm:text-[5rem] md:text-[7rem]">
            Welcome back,
            <br />
            Aarav.
          </h1>

          <p className="max-w-2xl text-lg font-light leading-relaxed text-white/56 md:text-[1.35rem]">
            Yantra tracks your progress, shows what to learn next, and keeps every practice room tied to real
            outcomes with a quieter, more focused learning surface.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            className="rounded-full bg-white px-8 py-4 text-sm font-medium uppercase tracking-[0.22em] text-black transition-transform duration-300 hover:scale-[0.985] hoverable"
            onClick={() => openChat({ message: 'What should I learn next based on my current Yantra dashboard?' })}
          >
            Continue Learning
          </button>

          <a
            href="#rooms"
            className="rounded-full border border-white/14 bg-white/[0.04] px-8 py-4 text-center font-mono text-[11px] uppercase tracking-[0.24em] text-white transition-colors hover:bg-white/[0.08] hoverable"
          >
            View Practice Rooms
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Momentum</div>
            <div className="mt-2 font-display text-2xl font-medium text-white">7-day streak</div>
          </div>
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Focus</div>
            <div className="mt-2 font-display text-2xl font-medium text-white">Neural nets</div>
          </div>
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Consistency</div>
            <div className="mt-2 font-display text-2xl font-medium text-white">4 sessions</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        ref={statRef}
        className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-[28px] md:p-7"
        initial={{ opacity: 0, y: 36 }}
        animate={statInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.85, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_38%,rgba(255,255,255,0.03))]" />
        <div className="absolute right-[-18%] top-[-10%] h-60 w-60 rounded-full bg-white/[0.08] blur-[100px]" />

        <div className="relative z-10 space-y-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/38">Current Path</div>
              <div className="mt-3 font-display text-3xl font-medium text-white md:text-[2.5rem]">AI Foundations</div>
              <div className="mt-2 text-sm leading-relaxed text-white/52">
                Moving from logic confidence into visual model understanding.
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/54">
              Live Path
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[1.6rem] bg-black/28 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Path Progress</div>
              <div className="mt-2 font-display text-5xl font-medium text-white">65%</div>
            </div>
            <div className="rounded-[1.6rem] bg-black/28 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">7-Day Streak</div>
              <div className="mt-2 flex items-center gap-3 font-display text-5xl font-medium text-white">
                07
                <Flame size={22} className="text-white/70" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">
              <span>Current Focus</span>
              <span>Neural Networks Basics</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.28)]"
                initial={{ width: 0 }}
                animate={statInView ? { width: '65%' } : undefined}
                transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.6rem] border border-white/8 bg-black/28 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Next Recommended Action</div>
              <CirclePlay size={16} className="text-white/46" />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-2xl font-medium text-white">Enter Neural Net Builder</div>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/54">
                  You are ready to move from abstract ML ideas to a more spatial, visual model-building exercise.
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full border border-white/12 bg-white/[0.05] p-3 text-white transition-colors hover:bg-white/[0.12] hoverable"
                onClick={() => openChat({ message: 'Open my next room and explain what I should focus on there.' })}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function OverviewSection() {
  return (
    <SectionShell
      id="overview"
      number="01"
      eyebrow="Dashboard Snapshot"
      title="A calmer view of direction, momentum, and what matters next."
      description="The overview keeps the same structure as the sample, but the cards now feel more spatial and editorial so the dashboard breathes with the rest of Yantra."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.label}
            className={`group relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.035] p-6 backdrop-blur-[24px] transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.055] hoverable ${
              card.featured ? 'xl:col-span-2' : 'xl:col-span-1'
            }`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute right-[-18%] top-[-18%] h-32 w-32 rounded-full bg-white/[0.08] blur-[80px] transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center justify-between gap-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/36">{card.label}</div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/56">
                  <card.icon size={16} />
                </div>
              </div>

              <div className="mt-8 font-display text-3xl font-medium leading-none text-white md:text-4xl">{card.value}</div>
              <div className="mt-3 text-sm uppercase tracking-[0.2em] text-white/34">{card.detail}</div>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/52">{card.note}</p>

              {card.featured && (
                <div className="mt-auto pt-8">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">
                    <span>Path Energy</span>
                    <span>Stable + rising</span>
                  </div>
                  <div className="mt-3 grid grid-cols-6 gap-1.5">
                    {[36, 48, 58, 72, 80, 65].map((height) => (
                      <div key={height} className="h-16 rounded-full bg-white/6 px-1.5 pb-1.5 pt-6">
                        <div className="w-full rounded-full bg-white" style={{ height: `${height}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function SkillsSection() {
  return (
    <SectionShell
      id="skills"
      number="02"
      eyebrow="Skill Roadmap"
      title="Depth over noise, with the same roadmap logic but a sharper sense of hierarchy."
      description="The roadmap still shows six skills in the same order as the sample, but active and locked states now feel more intentional, cinematic, and easier to scan."
      action={
        <a
          href="#rooms"
          className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/54 transition-colors hover:text-white hoverable"
        >
          View full practice flow
        </a>
      }
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {skills.map((skill, index) => {
          const Icon = skill.icon;

          return (
            <motion.div
              key={skill.title}
              className={`group relative overflow-hidden rounded-[2rem] border p-7 backdrop-blur-[24px] transition-all duration-500 hover:-translate-y-1 hoverable ${
                skill.locked
                  ? 'border-white/6 bg-white/[0.02] opacity-55 grayscale-[0.15]'
                  : 'border-white/8 bg-white/[0.035] hover:bg-white/[0.05]'
              }`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute right-[-18%] top-[-16%] h-28 w-28 rounded-full bg-white/[0.07] blur-[70px]" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/66 transition-colors group-hover:text-white">
                  {skill.locked ? <Lock size={18} /> : <Icon size={18} />}
                </div>

                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/62">
                  {skill.level}
                </div>
              </div>

              <div className="mt-8">
                <h3 className={`font-display text-3xl font-medium leading-none ${skill.tone}`}>{skill.title}</h3>
                <p className="mt-4 text-sm font-light leading-relaxed text-white/52">{skill.description}</p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/34">
                  <span>{skill.locked ? 'Unlock Progress' : 'Mastery'}</span>
                  <span>{skill.progress}%</span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.22)]"
                    style={{ width: `${skill.progress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionShell>
  );
}

function RoomsSection() {
  const { openChat } = useChatWidget();

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
          <motion.article
            key={room.title}
            className={`group relative overflow-hidden rounded-[2rem] border border-white/8 p-8 backdrop-blur-[20px] transition-all duration-700 hover:border-white/16 hover:-translate-y-1 hoverable ${
              room.featured ? 'min-h-[25rem]' : 'min-h-[20rem]'
            }`}
            style={{ backgroundImage: room.texture }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_26%,rgba(0,0,0,0.34)_100%)]" />
            <div
              className="absolute inset-0 opacity-25"
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
                  {room.status}
                </div>

                <div className="mt-5 max-w-[24rem]">
                  <h3 className="font-display text-3xl font-medium leading-[0.96] text-white md:text-4xl">{room.title}</h3>
                  <p className="mt-4 text-sm font-light leading-relaxed text-white/56">{room.description}</p>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-between gap-4">
                <button
                  type="button"
                  className={`rounded-full px-6 py-3 text-sm uppercase tracking-[0.18em] transition-all duration-300 hoverable ${
                    room.featured
                      ? 'bg-white text-black hover:scale-[0.985]'
                      : 'border border-white/12 bg-white/[0.05] text-white hover:bg-white/[0.1]'
                  }`}
                  onClick={() => openChat({ message: room.prompt })}
                >
                  {room.cta}
                </button>

                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                  <span>AI-guided</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </SectionShell>
  );
}

function YantraAiSection() {
  const { openChat } = useChatWidget();
  const [draft, setDraft] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.trim()) {
      openChat({ draft: 'Help me understand my current progress and what to do next.' });
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
            <span className="h-3 w-3 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.72)] animate-pulse" />
            <h2 className="font-display text-3xl font-medium tracking-tight text-white md:text-4xl">Yantra AI</h2>
          </div>

          <p className="max-w-md text-base leading-relaxed text-white/56 md:text-lg">
            Your AI teacher for concepts, practice, and next steps. It stays context-aware inside this dashboard so the
            conversation starts with what the learner is already doing.
          </p>

          <button
            type="button"
            className="w-full rounded-full border border-white/12 bg-white/[0.04] px-6 py-4 font-mono text-[11px] uppercase tracking-[0.24em] text-white transition-colors hover:bg-white/[0.08] hoverable"
            onClick={() => openChat({ message: 'Open a full Yantra AI coaching conversation for my current dashboard context.' })}
          >
            Open Full AI Chat
          </button>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.04] p-6 backdrop-blur-[24px] md:col-span-8 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%,rgba(255,255,255,0.03))]" />

          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/36">Suggested Commands</div>
              <div className="flex flex-wrap gap-3">
                {aiPrompts.map((prompt) => (
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
              <div className="absolute inset-0 rounded-[2rem] bg-white/[0.04] blur-xl" />
              <div className="relative flex items-center gap-3 rounded-[2rem] border border-white/10 bg-black/26 px-5 py-4 transition-colors focus-within:border-white/20">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/24"
                  placeholder="Ask Yantra about your progress or a concept..."
                />
                <button
                  type="submit"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white text-black transition-transform duration-300 hover:scale-[0.97] hoverable"
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
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          <span className="font-heading text-2xl tracking-wider text-white/20">YANTRA</span>
          <div className="flex gap-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/28">
            <a href="#" className="transition-colors hover:text-white hoverable">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-white hoverable">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-white hoverable">
              System Status
            </a>
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
  return (
    <div className="relative min-h-screen bg-black text-white">
      <DashboardBackground />
      <DashboardNav />

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-24 px-5 pb-20 md:gap-32 md:px-8 md:pb-24">
        <HeroSection />
        <OverviewSection />
        <SkillsSection />
        <RoomsSection />
        <YantraAiSection />
      </main>

      <DashboardFooter />
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <ChatProvider>
      <DashboardExperience />
    </ChatProvider>
  );
}
