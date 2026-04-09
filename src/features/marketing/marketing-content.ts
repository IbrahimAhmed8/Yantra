import {
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Globe,
  GraduationCap,
  Handshake,
  Palette,
  RefreshCcw,
  type LucideIcon,
} from 'lucide-react';

export const marketingAccessDetails = {
  primary: 'AI-native learning operating system',
  audience: 'Built for learners, institutions, and hiring partners',
  status: 'Learner accounts are previewing now, and pilot conversations remain open for partners.',
};

export const marketingNavLinks = [
  { label: 'Platform', href: '#about' },
  { label: 'Capabilities', href: '#academics' },
  { label: 'Use Cases', href: '#campus-life' },
  { label: 'Access', href: '#contact' },
  { label: 'Docs', href: '/docs' },
  { label: 'Contributors', href: '/contributors' },
] as const;

export const marketingTickerItems = [
  'AI SKILL DIAGNOSIS',
  'PERSONALIZED ROADMAPS',
  'CERTIFICATIONS',
  'JOB MATCHING',
] as const;

export type MarketingAcademicCard = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export const marketingAcademicCards: MarketingAcademicCard[] = [
  {
    icon: BookOpen,
    title: 'AI TUTORING',
    desc: 'Yantra adapts to each learner in real time with guided lessons, feedback loops, and contextual support that keeps momentum high.',
  },
  {
    icon: Globe,
    title: 'ADAPTIVE ROADMAPS',
    desc: 'The platform analyzes skill level, goal, and pace to generate a focused path instead of sending users through generic course clutter.',
  },
  {
    icon: Palette,
    title: 'PROOF & PLACEMENT',
    desc: 'Projects, certifications, and employer-aligned signals stay connected so learning translates into visible progress and job readiness.',
  },
];

export type MarketingAudienceCard = {
  icon: LucideIcon;
  tag: string;
  title: string;
  desc: string;
  heightClassName: string;
};

export const marketingCampusHighlights: MarketingAudienceCard[][] = [
  [
    {
      icon: GraduationCap,
      tag: 'Audience 01',
      title: 'Students',
      desc: 'Skill diagnosis, focused roadmaps, and certifications that signal real growth to employers.',
      heightClassName: 'xl:min-h-[20rem]',
    },
    {
      icon: RefreshCcw,
      tag: 'Audience 02',
      title: 'Career Switchers',
      desc: 'Identify gaps fast, build proof of new skills, and get matched to roles in your target field.',
      heightClassName: 'xl:min-h-[18.5rem]',
    },
  ],
  [
    {
      icon: Building2,
      tag: 'Audience 03',
      title: 'Institutions',
      desc: 'Pilot Yantra as a learning OS. Get outcome data, skill reports, and placement signals at scale.',
      heightClassName: 'xl:min-h-[23.5rem]',
    },
    {
      icon: Handshake,
      tag: 'Audience 04',
      title: 'Hiring Partners',
      desc: 'Access a pipeline of skill-diagnosed candidates matched to your open roles without resume noise.',
      heightClassName: 'xl:min-h-[15rem]',
    },
  ],
  [
    {
      icon: BadgeCheck,
      tag: 'Audience 05',
      title: 'Certification Paths',
      desc: 'AI-guided paths ending in employer-recognized proof, not just course completions.',
      heightClassName: 'xl:min-h-[15rem]',
    },
    {
      icon: BriefcaseBusiness,
      tag: 'Audience 06',
      title: 'Job Matching',
      desc: 'Your skill profile connects directly to relevant opportunities as you grow on the platform.',
      heightClassName: 'xl:min-h-[23.5rem]',
    },
  ],
];
