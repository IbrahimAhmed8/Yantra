import {
  BarChart3,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  HelpCircle,
  LayoutGrid,
  Lock,
  Rocket,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type StudentProfileNavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  action?: 'overview' | 'roster' | 'curriculum' | 'performance' | 'help' | 'personalization' | 'danger';
  active?: boolean;
};

export type StudentProfileTopNavItem = {
  label: string;
  href?: string;
  action?: 'roster' | 'curriculum' | 'performance';
  active?: boolean;
};

export type StudentProfileActivityCard = {
  title: string;
  body: string;
  meta: string;
  icon: LucideIcon;
  accent?: boolean;
};

export type StudentProfileCurriculumItem = {
  title: string;
  value: string;
  progressWidth: string;
  icon: LucideIcon;
  state: 'complete' | 'active' | 'locked';
};

export const topNavItems: StudentProfileTopNavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Students', action: 'roster', active: true },
  { label: 'Academy', action: 'curriculum' },
  { label: 'Reports', action: 'performance' },
];

export const sideNavItems: StudentProfileNavItem[] = [
  { label: 'Overview', icon: LayoutGrid, href: '/dashboard/student-profile' },
  { label: 'Personalization', icon: Sparkles, href: '/dashboard/student-profile/personalization' },
  { label: 'Roster', icon: Users, href: '/dashboard/student-profile/roster' },
  { label: 'Curriculum', icon: BookOpen, href: '/dashboard/student-profile/curriculum' },
  { label: 'Performance', icon: BarChart3, href: '/dashboard/student-profile/performance' },
];

export const supportNavItems: StudentProfileNavItem[] = [
  { label: 'Danger Zone', icon: ShieldAlert, href: '/dashboard/student-profile/danger-zone' },
  { label: 'Docs', icon: HelpCircle, href: '/docs/student-profile' },
  { label: 'Editor', icon: Rocket, href: '/editor' },
];

export const helpFaqs = [
  {
    question: 'How do I edit my profile?',
    answer: 'Open the profile overview card, choose Edit Profile, update your details, and press save. Your latest record is stored for this device in the current public build.',
  },
  {
    question: 'What does skill level mean?',
    answer: 'Skill level is a quick snapshot of your current readiness. It helps the platform show an appropriate learning path and lets mentors understand your current stage.',
  },
  {
    question: 'Does my progress save automatically?',
    answer: 'Profile edits save when you press the save button. In the current public build, the saved version stays on this device.',
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

export const activityCards: StudentProfileActivityCard[] = [
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

export const curriculumItems: StudentProfileCurriculumItem[] = [
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

export const facultyAvatars = [
  {
    alt: 'Close-up profile portrait of a young woman smiling gently in soft outdoor lighting.',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwSyLZhXHHyjNxPmq8fKoMhh0oJjvv5SPblQz3-95XGZ5lSe6fmVIPZ_QDwy1iTEL9NoupAHUYYzRhPKbfS9_Sf8Ij3srQG526kA4miQ24KKaM8rlAFcUKdwL-yPg9CRDkf24WZbK8hpgKBFQERFB1wbe6J2kSkS9YZ9v8aZr9q1qz0jfjHT7kDHOIXtE9QEKmYofzWLgl_l--GziEirF183JHbgB3xx5SEBeb2aRdortOm64Lkf_2-FlKMbEpE-OXgiNFxR891Yz1',
  },
  {
    alt: 'Front profile portrait of a middle-aged man with glasses in a professional workspace.',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkbKmIWK6gaAWHpWCrVBTaGKzQQMgek0Ph9KVwUxuTKCMN2Wzp5AHIW3Q52vUgdc7ZF3PMSv3SMd78Mhgh3GWObZ1ca10pTEPnTrDSq020YulQQzEg5LZASm8OKe7MHW5mcxgD2ZD30BgZFtGP5B_1_kQX1pr86dJofBq9vibxYNILwEruRrYPsDbyWD1PmblH_9OdZdGMZxCNMv4ZZrVZreSsuC5TD2q0mp8uqWMRFZuj5kBL4wd7suONZ2eR390obh44oawLup-c',
  },
] as const;
