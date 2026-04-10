'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Eye, Fingerprint, SlidersHorizontal, Sparkles, Target, X, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  deriveClassDesignationFromOnboarding,
  onboardingRoleOptions,
  type AgeRange,
  type LearningGoal,
  type LearningPace,
  type StudentProfile,
  type UserRole,
} from '@/src/features/dashboard/student-profile-model';
import { usePageTransition } from '@/src/features/motion/ExperienceProvider';
import GlobalSidebar from '@/src/features/navigation/GlobalSidebar';
import { readJsonResponse } from '@/src/lib/read-json-response';

const OnboardingAtmosphere = dynamic(() => import('./OnboardingAtmosphere'), { ssr: false });
const OnboardingStepsContent = dynamic(() => import('./OnboardingStepsContent'), { ssr: false });

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
        <span key={index} className={`h-[3px] w-8 rounded-full ${index <= currentStep ? 'bg-white' : 'bg-white/14'}`} />
      ))}
    </div>
  );
}

function StatusBanner({ status }: { status: OnboardingStatus }) {
  if (!status) return null;

  return (
    <div
      className={`rounded-[1.4rem] border px-4 py-4 text-sm leading-relaxed ${
        status.kind === 'error'
          ? 'border-red-300/25 bg-red-500/10 text-red-100'
          : status.kind === 'success'
            ? 'border-white/14 bg-white/[0.07] text-white'
            : 'border-white/10 bg-white/[0.04] text-white/78'
      }`}
    >
      {status.message}
    </div>
  );
}

function SidebarStep({ active, completed, icon: Icon, label }: { active: boolean; completed: boolean; icon: LucideIcon; label: string }) {
  return (
    <div
      className={`flex min-h-12 items-center gap-3 rounded-full border px-3 py-3 ${
        active ? 'border-white/10 bg-white/[0.06]' : completed ? 'border-white/8 bg-white/[0.025]' : 'border-transparent'
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
          active || completed ? 'border-white/14 bg-white/[0.06] text-white/82' : 'border-white/8 text-white/60'
        }`}
      >
        <Icon size={14} aria-hidden="true" />
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">{label}</div>
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

      const payload = await readJsonResponse<{ error?: string; profile?: StudentProfile }>(response);
      if (!response.ok || !payload?.profile) {
        if (response.status === 401) {
          window.location.href = '/login?message=Your%20session%20expired.%20Please%20log%20in%20again.&kind=error';
          return;
        }

        throw new Error(payload?.error || 'Yantra could not save your onboarding answers right now.');
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <OnboardingAtmosphere />

      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/8 bg-black/65 backdrop-blur-2xl">
        <div className="flex min-h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <GlobalSidebar
              disableDesktop={true}
              className="flex min-h-12 min-w-12 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-white/80 hover:bg-white/[0.1] lg:hidden cursor-pointer"
            />
            <Link
              href="/"
              className="inline-flex min-h-12 min-w-12 items-center justify-center px-2 font-heading text-2xl tracking-wider text-white lg:text-3xl"
            >
              YANTRA
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">
              Step {currentStep + 1} of {stepCopy.length}
            </span>
            <Link
              href="/auth/signout"
              className="hidden min-h-12 min-w-12 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white lg:inline-flex"
              aria-label="Sign out"
            >
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/82">
                  <Sparkles size={16} aria-hidden="true" />
                </div>
                <div>
                  <div className="font-display text-xl font-semibold text-white">System Sync</div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/60">Onboarding protocol</div>
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
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/60">AI Sync</div>
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
              <div className="inline-flex min-h-12 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/65">
                {step.eyebrow}
              </div>
              <div>
                <h1 className="max-w-4xl font-display text-[3rem] font-semibold leading-[0.92] tracking-tight text-white sm:text-[4rem] lg:text-[5rem]">
                  {step.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/72 sm:text-lg">{step.helper}</p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <OnboardingStepsContent
                currentStep={currentStep}
                ageRange={ageRange}
                selectedRole={selectedRole}
                selectedGoals={selectedGoals}
                learningPace={learningPace}
                stepSubtitle={step.subtitle}
                onClearStatus={clearStatus}
                onAgeRange={setAgeRange}
                onRole={setSelectedRole}
                onGoalToggle={handleGoalToggle}
                onPace={setLearningPace}
              />
              <StatusBanner status={status} />
            </div>

            <div className="mt-8 hidden items-center justify-between border-t border-white/8 pt-6 lg:flex">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0 || isSubmitting}
                className={`inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] ${
                  currentStep === 0 || isSubmitting ? 'cursor-not-allowed text-white/50' : 'text-white/72 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <ArrowLeft size={14} aria-hidden="true" />
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
                  className={`inline-flex min-h-14 min-w-12 items-center justify-center gap-2 rounded-full px-8 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ${
                    canContinue && !isSubmitting ? 'bg-white text-black shadow-[0_0_28px_rgba(255,255,255,0.16)]' : 'cursor-not-allowed bg-white/18 text-white/50'
                  }`}
                >
                  <span>{primaryActionLabel}</span>
                  <ArrowRight size={15} aria-hidden="true" />
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
            className={`flex min-h-14 min-w-[6.5rem] shrink-0 items-center justify-center gap-2 rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.18em] ${
              currentStep === 0 || isSubmitting ? 'cursor-not-allowed border-white/6 text-white/50' : 'border-white/10 bg-white/[0.03] text-white/72'
            }`}
          >
            <ArrowLeft size={14} aria-hidden="true" />
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
            className={`flex min-h-14 min-w-12 flex-1 items-center justify-center gap-2 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.2em] ${
              canContinue && !isSubmitting ? 'bg-white text-black shadow-[0_0_28px_rgba(255,255,255,0.16)]' : 'cursor-not-allowed bg-white/18 text-white/50'
            }`}
          >
            <span>{primaryActionLabel}</span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
}
