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
  GraduationCap,
  Megaphone,
  Palette,
  Rocket,
  School,
  Shield,
  Smartphone,
  Sparkles,
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

const stepCopy = [
  {
    eyebrow: 'Tell us about yourself',
    title: 'How old are you?',
    subtitle: "We'll personalize your learning path based on your profile.",
    helper: 'Select the age range that best matches where you are right now.',
  },
  {
    eyebrow: "What's your current status?",
    title: 'Where are you right now?',
    subtitle: 'This helps us align your roadmap to your stage in life.',
    helper: 'Pick the current context that best describes your day-to-day reality.',
  },
  {
    eyebrow: 'What do you want to learn?',
    title: 'Pick your primary learning goal',
    subtitle: 'Choose what excites you most. You can add more later.',
    helper: 'Select up to 3 topics and Yantra will bias the roadmap toward them.',
  },
  {
    eyebrow: 'Set your learning pace',
    title: 'How much time can you commit?',
    subtitle: "We'll build a roadmap that fits your schedule.",
    helper: 'Choose the rhythm that feels realistic. You can adjust this later.',
  },
] as const;

const statusIconMap: Record<OnboardingRole, LucideIcon> = {
  'School Student (Class 8-12)': School,
  'College Student (Undergraduate)': GraduationCap,
  'Graduate / Postgraduate (I have a degree)': BadgeCheck,
  'Working Professional': BriefcaseBusiness,
};

const goalMeta: Record<
  LearningGoal,
  {
    icon: LucideIcon;
    description: string;
  }
> = {
  'Artificial Intelligence & ML': {
    icon: Sparkles,
    description: 'Neural networks & models',
  },
  'Web Development': {
    icon: Code2,
    description: 'Modern stack & architecture',
  },
  'App Development': {
    icon: Smartphone,
    description: 'iOS, Android & Flutter',
  },
  'Data Science & Analytics': {
    icon: ChartColumn,
    description: 'Statistics & visualization',
  },
  'Cloud & DevOps': {
    icon: Cloud,
    description: 'Infrastructure & scaling',
  },
  Cybersecurity: {
    icon: Shield,
    description: 'Network defense & auditing',
  },
  'UI/UX Design': {
    icon: Palette,
    description: 'Interface & experience',
  },
  'Digital Marketing': {
    icon: Megaphone,
    description: 'Growth & SEO strategy',
  },
  'Entrepreneurship & Startups': {
    icon: Rocket,
    description: 'Founding & scaling',
  },
};

const paceMeta: Record<
  LearningPace,
  {
    eyebrow: string;
    duration: string;
    icon: LucideIcon;
  }
> = {
  Light: {
    eyebrow: 'Casual progress',
    duration: '1-2 hrs/week',
    icon: Sparkles,
  },
  Focused: {
    eyebrow: 'Balanced growth',
    duration: '3-5 hrs/week',
    icon: Zap,
  },
  Intensive: {
    eyebrow: 'Rapid mastery',
    duration: '6+ hrs/week',
    icon: Rocket,
  },
};

function OnboardingAtmosphere() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#040404]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.07),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_24%,transparent_78%,rgba(255,255,255,0.04))]" />
        <div className="absolute left-[-8%] top-[6%] h-[28rem] w-[28rem] rounded-full bg-white/[0.05] blur-[120px]" />
        <div className="absolute right-[-12%] top-[-12%] h-[34rem] w-[34rem] rounded-full bg-white/[0.05] blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[20%] h-[36rem] w-[40rem] rounded-full bg-white/[0.045] blur-[170px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '132px 132px',
            maskImage: 'radial-gradient(circle at center, black 34%, transparent 82%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025] mix-blend-screen"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 160 160%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22160%22 height=%22160%22 filter=%22url(%23noise)%22 opacity=%220.95%22/%3E%3C/svg%3E")',
          }}
        />
      </div>

      <div className="pointer-events-none fixed left-[18%] top-0 hidden h-full w-px bg-white/6 xl:block" />
      <div className="pointer-events-none fixed left-0 top-[26%] hidden h-px w-full bg-white/6 xl:block" />
    </>
  );
}

function normalizeOnboardingRole(value: UserRole | null): OnboardingRole | null {
  return onboardingRoleOptions.some((option) => option.value === value) ? (value as OnboardingRole) : null;
}

function getStartingStep(profile: StudentProfile) {
  if (!profile.ageRange) {
    return 0;
  }

  if (!normalizeOnboardingRole(profile.userRole)) {
    return 1;
  }

  if (!profile.primaryLearningGoals.length) {
    return 2;
  }

  if (!profile.learningPace) {
    return 3;
  }

  return 3;
}

function ProgressDots({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2">
      {stepCopy.map((_, index) => (
        <span
          key={index}
          className={`h-[3px] w-8 rounded-full transition-colors ${
            index <= currentStep ? 'bg-white' : 'bg-white/12'
          }`}
        />
      ))}
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
  const progressValue = ((currentStep + 1) / stepCopy.length) * 100;
  const canContinue =
    currentStep === 0
      ? Boolean(ageRange)
      : currentStep === 1
        ? Boolean(selectedRole)
        : currentStep === 2
          ? selectedGoals.length > 0
          : Boolean(learningPace);
  const primaryActionLabel =
    currentStep === stepCopy.length - 1
      ? isSubmitting
        ? 'Building roadmap...'
        : 'Build My Roadmap'
      : 'Continue';

  const summaryItems = [
    {
      label: 'Age',
      value: ageRange ?? 'Pending',
    },
    {
      label: 'Status',
      value: selectedRole ?? 'Pending',
    },
    {
      label: 'Goals',
      value: selectedGoals.length ? `${selectedGoals.length} selected` : 'Pending',
    },
    {
      label: 'Pace',
      value: learningPace ?? 'Pending',
    },
  ];

  const clearStatus = () => {
    if (status?.kind === 'error') {
      setStatus(null);
    }
  };

  const handleGoalToggle = (goal: LearningGoal) => {
    clearStatus();

    setSelectedGoals((current) => {
      if (current.includes(goal)) {
        return current.filter((entry) => entry !== goal);
      }

      if (current.length >= 3) {
        setStatus({
          kind: 'error',
          message: 'Choose up to 3 topics for now. You can add more later from inside Yantra.',
        });
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

    if (currentStep < stepCopy.length - 1) {
      setCurrentStep((stepIndex) => stepIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0 || isSubmitting) {
      return;
    }

    setStatus(null);
    setCurrentStep((stepIndex) => Math.max(0, stepIndex - 1));
  };

  const handleSubmit = async () => {
    if (!selectedRole || !ageRange || !selectedGoals.length || !learningPace) {
      handleNextStep();
      return;
    }

    setIsSubmitting(true);
    setStatus({
      kind: 'info',
      message: 'Saving your selections and preparing the first version of your roadmap...',
    });

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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

      const payload = (await response.json()) as {
        error?: string;
        profile?: StudentProfile;
      };

      if (!response.ok || !payload.profile) {
        if (response.status === 401) {
          window.location.href = '/login?message=Your%20session%20expired.%20Please%20log%20in%20again.&kind=error';
          return;
        }

        throw new Error(payload.error || 'Yantra could not save your onboarding answers right now.');
      }

      setStatus({
        kind: 'success',
        message: 'Roadmap settings saved. Opening your dashboard...',
      });
      startPageTransition();
      router.replace('/dashboard');
      router.refresh();
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Yantra could not save your onboarding answers right now.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {onboardingAgeRangeOptions.map((option) => {
            const selected = ageRange === option;

            return (
              <button
                key={option}
                type="button"
                className={`group flex items-center justify-between rounded-[1.75rem] border px-6 py-6 text-left transition-all duration-300 ${
                  selected
                    ? 'border-white/50 bg-white/[0.11] shadow-[0_20px_60px_rgba(0,0,0,0.24)]'
                    : 'border-white/8 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.06]'
                }`}
                onClick={() => {
                  clearStatus();
                  setAgeRange(option);
                }}
                aria-pressed={selected}
              >
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/36">Age range</div>
                  <div className="mt-4 font-display text-3xl font-semibold text-white">{option}</div>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                    selected ? 'border-white bg-white text-black' : 'border-white/12 bg-white/[0.04] text-white/28'
                  }`}
                >
                  <Check size={16} />
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {onboardingRoleOptions.map((option) => {
            const selected = selectedRole === option.value;
            const Icon = statusIconMap[option.value];

            return (
              <button
                key={option.value}
                type="button"
                className={`group relative overflow-hidden rounded-[1.75rem] border p-6 text-left transition-all duration-300 ${
                  selected
                    ? 'border-white/50 bg-white/[0.11] shadow-[0_20px_60px_rgba(0,0,0,0.24)]'
                    : 'border-white/8 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.06]'
                }`}
                onClick={() => {
                  clearStatus();
                  setSelectedRole(option.value);
                }}
                aria-pressed={selected}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.09),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_52%,rgba(255,255,255,0.02))]" />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/78">
                      <Icon size={20} />
                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                        selected ? 'border-white bg-white text-black' : 'border-white/12 bg-white/[0.04] text-white/28'
                      }`}
                    >
                      <Check size={15} />
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-display text-2xl font-semibold leading-tight text-white">{option.value}</h3>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/34">Select up to 3 topics</div>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/58">
              {selectedGoals.length} / 3 selected
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {onboardingLearningGoalOptions.map((goal) => {
              const selected = selectedGoals.includes(goal);
              const meta = goalMeta[goal];
              const Icon = meta.icon;

              return (
                <button
                  key={goal}
                  type="button"
                  className={`group relative flex min-h-[12.5rem] flex-col justify-between overflow-hidden rounded-[1.6rem] border p-6 text-left transition-all duration-300 ${
                    selected
                      ? 'border-white/40 bg-white/[0.1] shadow-[0_18px_44px_rgba(0,0,0,0.2)]'
                      : 'border-white/8 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.06]'
                  }`}
                  onClick={() => handleGoalToggle(goal)}
                  aria-pressed={selected}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_60%,rgba(255,255,255,0.02))]" />
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/72">
                      <Icon size={18} />
                    </div>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                        selected ? 'border-white bg-white text-black' : 'border-white/12 bg-white/[0.02] text-white/0'
                      }`}
                    >
                      <Check size={13} />
                    </div>
                  </div>

                  <div className="relative z-10 mt-8">
                    <h3 className="font-display text-2xl font-semibold leading-tight text-white">{goal}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/48">{meta.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {onboardingLearningPaceOptions.map((pace) => {
          const selected = learningPace === pace;
          const meta = paceMeta[pace];
          const Icon = meta.icon;

          return (
            <button
              key={pace}
              type="button"
              className={`group flex w-full items-center justify-between gap-4 rounded-[1.75rem] border px-6 py-6 text-left transition-all duration-300 ${
                selected
                  ? 'border-white/50 bg-white/[0.11] shadow-[0_20px_60px_rgba(0,0,0,0.24)]'
                  : 'border-white/8 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.06]'
              }`}
              onClick={() => {
                clearStatus();
                setLearningPace(pace);
              }}
              aria-pressed={selected}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                    selected ? 'border-white bg-white text-black' : 'border-white/12 bg-white/[0.04] text-white/64'
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/34">{meta.eyebrow}</div>
                  <div className="mt-2 font-display text-3xl font-semibold text-white">{pace}</div>
                  <div className="mt-2 text-base text-white/58">{meta.duration}</div>
                </div>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                  selected ? 'border-white bg-white text-black' : 'border-white/12 bg-white/[0.04] text-white/28'
                }`}
              >
                <Check size={15} />
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <OnboardingAtmosphere />

      <header className="fixed left-0 top-0 z-40 w-full border-b border-white/8 bg-black/72 px-4 py-4 backdrop-blur-2xl md:px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="font-heading text-3xl tracking-wider text-white">
              YANTRA<span className="text-white/45">.</span>
            </Link>

            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/52">
                Step {currentStep + 1} of {stepCopy.length}
              </span>
              <Link
                href="/auth/signout"
                className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/62 transition-colors hover:bg-white/[0.08] hover:text-white md:inline-flex"
              >
                Sign Out
              </Link>
            </div>
          </div>

          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.45)] transition-all duration-500"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col px-4 pb-40 pt-28 md:px-8 md:pt-32 xl:flex-row xl:items-start xl:gap-10">
        <section className="hidden w-full xl:sticky xl:top-32 xl:block xl:max-w-[24rem]">
          <motion.div
            key={`summary-${currentStep}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-[30px]"
          >
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.68)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/46">
                Step {currentStep + 1} / {stepCopy.length}
              </span>
            </div>

            <div className="mt-8 space-y-4">
              <h1 className="font-display text-5xl font-semibold leading-[0.92] tracking-tight text-white">
                {step.title}
              </h1>
              <p className="text-sm leading-relaxed text-white/58">{step.helper}</p>
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-white/8 bg-black/24 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">Personalization snapshot</div>
              <div className="mt-4 space-y-3">
                {summaryItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-[1.1rem] border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">{item.label}</span>
                    <span className="max-w-[11rem] text-right text-sm text-white/78">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/38">Signed in as</div>
              <p className="mt-2 break-words text-sm text-white/72">{email || initialProfile.name}</p>
            </div>
          </motion.div>
        </section>

        <section className="mt-0 flex-1">
          <motion.div
            key={`panel-${currentStep}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-[30px] md:p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_42%,rgba(255,255,255,0.02))]" />

            <div className="relative z-10">
              <div className="mb-8 flex flex-col gap-5 border-b border-white/8 pb-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/54">
                    {step.eyebrow}
                  </span>
                  {currentStep === 2 ? (
                    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Multi-select
                    </span>
                  ) : null}
                </div>

                <div>
                  <h2 className="max-w-4xl font-display text-4xl font-semibold leading-[0.94] tracking-tight text-white md:text-6xl">
                    {step.title}
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/56 md:text-lg">{step.subtitle}</p>
                </div>
              </div>

              <div>{renderStepContent()}</div>

              {status ? (
                <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-black/24 px-4 py-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
                    {status.kind === 'success'
                      ? 'Saved'
                      : status.kind === 'error'
                        ? 'Need attention'
                        : 'In progress'}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/74">{status.message}</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 z-40 w-full px-4 pb-4 pt-4 md:px-8 md:pb-6">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 rounded-[2rem] border border-white/8 bg-black/78 px-4 py-4 shadow-[0_26px_60px_rgba(0,0,0,0.42)] backdrop-blur-[28px] md:px-6">
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
              currentStep === 0 || isSubmitting
                ? 'cursor-not-allowed text-white/20'
                : 'text-white/58 hover:bg-white/[0.05] hover:text-white'
            }`}
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <div className="hidden md:block">
            <ProgressDots currentStep={currentStep} />
          </div>

          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] transition-all ${
              canContinue && !isSubmitting
                ? 'bg-white text-black shadow-[0_0_26px_rgba(255,255,255,0.16)] hover:scale-[0.99]'
                : 'cursor-not-allowed bg-white/18 text-white/34'
            }`}
            onClick={() => {
              if (currentStep === stepCopy.length - 1) {
                void handleSubmit();
                return;
              }

              handleNextStep();
            }}
            disabled={!canContinue || isSubmitting}
          >
            <span>{primaryActionLabel}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </footer>
    </div>
  );
}
