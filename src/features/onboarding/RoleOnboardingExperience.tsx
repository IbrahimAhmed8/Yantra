'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ChartColumn,
  Check,
  Cloud,
  Code2,
  Eye,
  Fingerprint,
  GraduationCap,
  Menu,
  Megaphone,
  Palette,
  Rocket,
  School,
  Shield,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Target,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  deriveClassDesignationFromOnboarding,
  onboardingAgeRangeOptions,
  onboardingLearningGoalOptions,
  onboardingLearningPaceOptions,
  onboardingRoleOptions,
  type AgeRange,
  type LearningGoal,
  type LearningPace,
  type StudentProfile,
  type UserRole,
} from '@/src/features/dashboard/student-profile-model';
import { usePageTransition } from '@/src/features/motion/ExperienceProvider';
import GlobalSidebar from '@/src/features/navigation/GlobalSidebar';

type OnboardingStatus =
  | {
    kind: 'error' | 'info' | 'success';
    message: string;
  }
  | null;

type RoleOnboardingExperienceProps = {
  email: string;
  initialProfile: StudentProfile;
  initialStatus?: OnboardingStatus;
};

type OnboardingRole = (typeof onboardingRoleOptions)[number]['value'];

const sidebarIcons: LucideIcon[] = [Fingerprint, Target, SlidersHorizontal, Eye];

const stepCopy = [
  {
    sidebarLabel: 'Identity',
    eyebrow: 'Tell us about yourself',
    title: 'How old are you?',
    subtitle: "We'll personalize your learning path based on your profile.",
    helper: 'Select the age range that best matches where you are right now.',
  },
  {
    sidebarLabel: 'Goal',
    eyebrow: "What's your current status?",
    title: 'Where are you right now?',
    subtitle: 'This helps us align your roadmap to your stage in life.',
    helper: 'Pick the current context that best describes your day-to-day reality.',
  },
  {
    sidebarLabel: 'Preference',
    eyebrow: 'What do you want to learn?',
    title: 'Pick your primary learning goal',
    subtitle: 'Choose what excites you most. You can add more later.',
    helper: 'Select up to 3 topics and Yantra will bias the roadmap toward them.',
  },
  {
    sidebarLabel: 'Review',
    eyebrow: 'Set your learning pace',
    title: 'How much time can you commit?',
    subtitle: "We'll build a roadmap that fits your schedule.",
    helper: 'Choose the rhythm that feels realistic. You can adjust this later.',
  },
] as const;

const roleMeta: Record<OnboardingRole, { icon: LucideIcon; label: string; description: string }> = {
  'School Student (Class 8-12)': { icon: School, label: 'School Student', description: 'Class 8-12' },
  'College Student (Undergraduate)': { icon: GraduationCap, label: 'College Student', description: 'Undergraduate' },
  'Graduate / Postgraduate (I have a degree)': {
    icon: BadgeCheck,
    label: 'Graduate / Postgraduate',
    description: 'I have a degree',
  },
  'Working Professional': { icon: BriefcaseBusiness, label: 'Working Professional', description: 'Career track' },
};

const goalMeta: Record<LearningGoal, { icon: LucideIcon; label: string; description: string }> = {
  'Artificial Intelligence & ML': { icon: Sparkles, label: 'AI & ML', description: 'Neural networks & automation' },
  'Web Development': { icon: Code2, label: 'Web Dev', description: 'Modern frameworks & logic' },
  'App Development': { icon: Smartphone, label: 'App Dev', description: 'iOS, Android & Flutter' },
  'Data Science & Analytics': { icon: ChartColumn, label: 'Data Science', description: 'Visualization & analysis' },
  'Cloud & DevOps': { icon: Cloud, label: 'Cloud & DevOps', description: 'Infrastructure & scale' },
  Cybersecurity: { icon: Shield, label: 'Cybersecurity', description: 'Defense & encryption' },
  'UI/UX Design': { icon: Palette, label: 'UI/UX', description: 'Interface & experience' },
  'Digital Marketing': { icon: Megaphone, label: 'Digital Marketing', description: 'Growth strategy' },
  'Entrepreneurship & Startups': { icon: Rocket, label: 'Entrepreneurship', description: 'Startups & business' },
};

const paceMeta: Record<LearningPace, { eyebrow: string; duration: string; icon: LucideIcon; recommended?: boolean }> = {
  Light: { eyebrow: 'Casual progress', duration: '1-2 hrs/week', icon: Sparkles },
  Focused: { eyebrow: 'Balanced growth', duration: '3-5 hrs/week', icon: Zap, recommended: true },
  Intensive: { eyebrow: 'Rapid mastery', duration: '6+ hrs/week', icon: Rocket },
};

function OnboardingAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#090909]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(255,255,255,0.05),transparent_20%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.04),transparent_18%),linear-gradient(180deg,#141414_0%,#0c0c0c_55%,#090909_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '140px 140px',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 82%)',
        }}
      />
      <div className="absolute left-[-12%] top-[8%] h-[24rem] w-[24rem] rounded-full bg-white/[0.05] blur-[120px]" />
      <div className="absolute right-[-12%] top-[16%] h-[28rem] w-[28rem] rounded-full bg-white/[0.04] blur-[150px]" />
      <div className="absolute bottom-[-22%] left-[32%] h-[30rem] w-[38rem] rounded-full bg-white/[0.035] blur-[180px]" />
    </div>
  );
}

function normalizeOnboardingRole(value: UserRole | null): OnboardingRole | null {
  return onboardingRoleOptions.some((option) => option.value === value) ? (value as OnboardingRole) : null;
}

function getStartingStep(profile: StudentProfile) {
  if (!profile.ageRange) return 0;
  if (!normalizeOnboardingRole(profile.userRole)) return 1;
  if (!profile.primaryLearningGoals.length) return 2;
  if (!profile.learningPace) return 3;
  return 3;
}

function ProgressDots({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2">
      {stepCopy.map((_, index) => (
        <span key={index} className={`h-[3px] w-8 rounded-full ${index <= currentStep ? 'bg-white' : 'bg-white/10'}`} />
      ))}
    </div>
  );
}

function StatusBanner({ status }: { status: OnboardingStatus }) {
  if (!status) return null;

  return (
    <div
      className={`rounded-[1.4rem] border px-4 py-4 text-sm leading-relaxed ${status.kind === 'error'
          ? 'border-red-300/25 bg-red-500/10 text-red-100'
          : status.kind === 'success'
            ? 'border-white/14 bg-white/[0.07] text-white'
            : 'border-white/10 bg-white/[0.04] text-white/72'
        }`}
    >
      {status.message}
    </div>
  );
}

function SidebarStep({ active, completed, icon: Icon, label }: { active: boolean; completed: boolean; icon: LucideIcon; label: string }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-full border px-3 py-3 ${active ? 'border-white/10 bg-white/[0.06]' : completed ? 'border-white/8 bg-white/[0.025]' : 'border-transparent'
        }`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border ${active || completed ? 'border-white/14 bg-white/[0.06] text-white/82' : 'border-white/8 text-white/26'
          }`}
      >
        <Icon size={14} />
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/34">{label}</div>
    </div>
  );
}

export default function RoleOnboardingExperience({
  email,
  initialProfile,
  initialStatus = null,
}: RoleOnboardingExperienceProps) {
  const router = useRouter();
  const { startPageTransition } = usePageTransition();
  const [currentStep, setCurrentStep] = useState(getStartingStep(initialProfile));
  const [ageRange, setAgeRange] = useState<AgeRange | null>(initialProfile.ageRange);
  const [selectedRole, setSelectedRole] = useState<OnboardingRole | null>(normalizeOnboardingRole(initialProfile.userRole));
  const [selectedGoals, setSelectedGoals] = useState<LearningGoal[]>(initialProfile.primaryLearningGoals);
  const [learningPace, setLearningPace] = useState<LearningPace | null>(initialProfile.learningPace);
  const [status, setStatus] = useState<OnboardingStatus>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentStep(getStartingStep(initialProfile));
    setAgeRange(initialProfile.ageRange);
    setSelectedRole(normalizeOnboardingRole(initialProfile.userRole));
    setSelectedGoals(initialProfile.primaryLearningGoals);
    setLearningPace(initialProfile.learningPace);
  }, [initialProfile]);

  const step = stepCopy[currentStep];
  const canContinue =
    currentStep === 0
      ? Boolean(ageRange)
      : currentStep === 1
        ? Boolean(selectedRole)
        : currentStep === 2
          ? selectedGoals.length > 0
          : Boolean(learningPace);

  const primaryActionLabel = currentStep === 3 ? (isSubmitting ? 'Building roadmap...' : 'Build My Roadmap') : 'Continue';

  const clearStatus = () => {
    if (status?.kind === 'error') setStatus(null);
  };

  const handleGoalToggle = (goal: LearningGoal) => {
    clearStatus();
    setSelectedGoals((current) => {
      if (current.includes(goal)) return current.filter((entry) => entry !== goal);
      if (current.length >= 3) {
        setStatus({ kind: 'error', message: 'Choose up to 3 topics for now. You can add more later from inside Yantra.' });
        return current;
      }
      return [...current, goal];
    });
  };

  const handleNextStep = () => {
    if (!canContinue) {
      setStatus({
        kind: 'error',
        message:
          currentStep === 0
            ? 'Select an age range to continue.'
            : currentStep === 1
              ? 'Choose the status that best matches where you are right now.'
              : currentStep === 2
                ? 'Pick at least one learning goal before continuing.'
                : 'Choose a learning pace to build your roadmap.',
      });
      return;
    }
    setStatus(null);
    if (currentStep < 3) setCurrentStep((stepIndex) => stepIndex + 1);
  };

  const handleBack = () => {
    if (currentStep === 0 || isSubmitting) return;
    setStatus(null);
    setCurrentStep((stepIndex) => Math.max(0, stepIndex - 1));
  };

  const handleSubmit = async () => {
    if (!selectedRole || !ageRange || !selectedGoals.length || !learningPace) {
      handleNextStep();
      return;
    }

    setIsSubmitting(true);
    setStatus({ kind: 'info', message: 'Saving your selections and generating the first version of your roadmap...' });

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...initialProfile,
          classDesignation: deriveClassDesignationFromOnboarding(selectedRole, ageRange) || initialProfile.classDesignation,
          userRole: selectedRole,
          ageRange,
          primaryLearningGoals: selectedGoals,
          learningPace,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString(),
        } satisfies StudentProfile),
      });

      const payload = (await response.json()) as { error?: string; profile?: StudentProfile };
      if (!response.ok || !payload.profile) {
        if (response.status === 401) {
          window.location.href = '/login?message=Your%20session%20expired.%20Please%20log%20in%20again.&kind=error';
          return;
        }

        throw new Error(payload.error || 'Yantra could not save your onboarding answers right now.');
      }

      setStatus({ kind: 'info', message: 'Profile saved. Building your dashboard roadmap...' });

      const generateResponse = await fetch('/api/dashboard/generate', {
        method: 'POST',
      });

      if (generateResponse.status === 401) {
        window.location.href = '/login?message=Your%20session%20expired.%20Please%20log%20in%20again.&kind=error';
        return;
      }

      if (!generateResponse.ok) {
        console.error('Dashboard generation failed after onboarding.', await generateResponse.text().catch(() => ''));
      }

      setStatus({ kind: 'success', message: 'Roadmap ready. Opening your dashboard...' });
      startPageTransition();
      router.replace('/dashboard');
      router.refresh();
    } catch (error) {
      setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'Yantra could not save your onboarding answers right now.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const content =
    currentStep === 0 ? (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {onboardingAgeRangeOptions.map((option) => {
          const selected = ageRange === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                clearStatus();
                setAgeRange(option);
              }}
              className={`rounded-[1.9rem] border p-5 text-left transition-all ${option === '29+' ? 'xl:col-span-2' : ''
                } ${selected ? 'border-white bg-white/[0.12]' : 'border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.05]'}`}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/22">
                Category_{String(onboardingAgeRangeOptions.indexOf(option) + 1).padStart(2, '0')}
              </div>
              <div className="mt-8 flex items-end justify-between gap-4">
                <div className="font-display text-3xl font-semibold leading-[0.95] text-white sm:text-4xl">{option}</div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border ${selected ? 'border-white bg-white text-black' : 'border-white/12 text-transparent'}`}>
                  <Check size={14} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    ) : currentStep === 1 ? (
      <div className="grid gap-4 xl:grid-cols-2">
        {onboardingRoleOptions.map((option) => {
          const selected = selectedRole === option.value;
          const meta = roleMeta[option.value];
          const Icon = meta.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                clearStatus();
                setSelectedRole(option.value);
              }}
              className={`rounded-[1.9rem] border p-5 text-left transition-all ${selected ? 'border-white bg-white/[0.12]' : 'border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.05]'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/82">
                  <Icon size={18} />
                </div>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${selected ? 'border-white bg-white text-black' : 'border-white/12 text-transparent'}`}>
                  <Check size={14} />
                </div>
              </div>
              <div className="mt-8">
                <div className="font-display text-[1.8rem] font-semibold leading-[0.98] text-white sm:text-[2rem]">{meta.label}</div>
                <div className="mt-3 text-sm text-white/52">{meta.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    ) : currentStep === 2 ? (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-white/54">{step.subtitle}</div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/46">
            Select up to 3 topics
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {onboardingLearningGoalOptions.map((goal) => {
            const selected = selectedGoals.includes(goal);
            const meta = goalMeta[goal];
            const Icon = meta.icon;
            return (
              <button
                key={goal}
                type="button"
                onClick={() => handleGoalToggle(goal)}
                className={`rounded-[1.7rem] border p-4 text-left transition-all ${selected ? 'border-white bg-white/[0.12]' : 'border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.05]'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/78">
                    <Icon size={15} />
                  </div>
                  <div className={`h-3.5 w-3.5 rounded-full border ${selected ? 'border-white bg-white' : 'border-white/15 bg-transparent'}`} />
                </div>
                <div className="mt-8">
                  <div className="font-display text-[1.5rem] font-semibold leading-[1] text-white">{meta.label}</div>
                  <div className="mt-2 text-sm leading-relaxed text-white/42">{meta.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        {onboardingLearningPaceOptions.map((pace) => {
          const selected = learningPace === pace;
          const meta = paceMeta[pace];
          const Icon = meta.icon;
          return (
            <button
              key={pace}
              type="button"
              onClick={() => {
                clearStatus();
                setLearningPace(pace);
              }}
              className={`relative w-full rounded-[1.9rem] border px-5 py-5 text-left transition-all ${selected ? 'border-white bg-white/[0.12]' : 'border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.05]'}`}
            >
              {meta.recommended ? (
                <div className="absolute right-4 top-3 rounded-full border border-white/14 bg-white px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-black">
                  Recommended
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/24">{meta.eyebrow}</div>
                  <div className="mt-3 font-display text-[2rem] font-semibold leading-none text-white">{pace}</div>
                  <div className="mt-2 text-base text-white/56">{meta.duration}</div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full border ${selected ? 'border-white bg-white text-black' : 'border-white/12 bg-white/[0.04] text-white/56'}`}>
                    <Icon size={18} />
                  </div>
                  <div className={`h-4 w-4 rounded-full border-2 ${selected ? 'border-white bg-white' : 'border-white/16'}`} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <OnboardingAtmosphere />

      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/8 bg-black/65 backdrop-blur-2xl">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <GlobalSidebar disableDesktop={true} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-white/80 hover:bg-white/[0.1] lg:hidden cursor-pointer" />
            <Link href="/" className="inline-flex min-h-12 items-center font-heading text-2xl tracking-wider text-white lg:text-3xl">
              YANTRA
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
              Step {currentStep + 1} of {stepCopy.length}
            </span>
            <Link href="/auth/signout" className="hidden h-12 w-12 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white lg:inline-flex" aria-label="Sign out">
              <X size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 pb-32 pt-20 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:px-6 lg:pb-10">
        <aside className="hidden lg:flex lg:min-h-[calc(100vh-7rem)] lg:flex-col lg:justify-between">
          <div>
            <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/82">
                  <Sparkles size={16} />
                </div>
                <div>
                  <div className="font-display text-xl font-semibold text-white">System Sync</div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28">Onboarding protocol</div>
                </div>
              </div>
            </div>

            <nav className="mt-8 space-y-2">
              {stepCopy.map((stepItem, index) => (
                <SidebarStep key={stepItem.sidebarLabel} active={index === currentStep} completed={index < currentStep} icon={sidebarIcons[index]} label={stepItem.sidebarLabel} />
              ))}
            </nav>
          </div>

          <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/28">AI Sync</div>
            <div className="mt-1 truncate text-sm text-white/70">{email || initialProfile.name}</div>
          </div>
        </aside>

        <section>
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_28px_100px_rgba(0,0,0,0.42)] sm:p-8 lg:p-10"
          >
            <div className="space-y-5 border-b border-white/8 pb-8">
              <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                {step.eyebrow}
              </div>
              <div>
                <h1 className="max-w-4xl font-display text-[3rem] font-semibold leading-[0.92] tracking-tight text-white sm:text-[4rem] lg:text-[5rem]">
                  {step.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/56 sm:text-lg">{step.helper}</p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {content}
              <StatusBanner status={status} />
            </div>

            <div className="mt-8 hidden items-center justify-between border-t border-white/8 pt-6 lg:flex">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0 || isSubmitting}
                className={`inline-flex min-h-12 items-center gap-2 rounded-full px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] ${currentStep === 0 || isSubmitting ? 'cursor-not-allowed text-white/20' : 'text-white/56 hover:bg-white/[0.04] hover:text-white'}`}
              >
                <ArrowLeft size={14} />
                Back
              </button>

              <div className="flex items-center gap-6">
                <ProgressDots currentStep={currentStep} />
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 3) {
                      void handleSubmit();
                      return;
                    }
                    handleNextStep();
                  }}
                  disabled={!canContinue || isSubmitting}
                  className={`inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ${canContinue && !isSubmitting ? 'bg-white text-black shadow-[0_0_28px_rgba(255,255,255,0.16)]' : 'cursor-not-allowed bg-white/18 text-white/28'}`}
                >
                  <span>{primaryActionLabel}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-black/88 px-4 pb-4 pt-3 backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className={`flex h-14 w-[6.5rem] items-center justify-center gap-2 rounded-full border font-mono text-[11px] uppercase tracking-[0.18em] ${currentStep === 0 || isSubmitting ? 'cursor-not-allowed border-white/6 text-white/20' : 'border-white/10 bg-white/[0.03] text-white/56'}`}
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <button
            type="button"
            onClick={() => {
              if (currentStep === 3) {
                void handleSubmit();
                return;
              }
              handleNextStep();
            }}
            disabled={!canContinue || isSubmitting}
            className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.2em] ${canContinue && !isSubmitting ? 'bg-white text-black shadow-[0_0_28px_rgba(255,255,255,0.16)]' : 'cursor-not-allowed bg-white/18 text-white/28'}`}
          >
            <span>{primaryActionLabel}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </footer>
    </div>
  );
}
