'use client';

import {
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
import {
  onboardingAgeRangeOptions,
  onboardingLearningGoalOptions,
  onboardingLearningPaceOptions,
  onboardingRoleOptions,
  type AgeRange,
  type LearningGoal,
  type LearningPace,
} from '@/src/features/dashboard/student-profile-model';

type OnboardingRole = (typeof onboardingRoleOptions)[number]['value'];

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

export type OnboardingStepsContentProps = {
  currentStep: number;
  ageRange: AgeRange | null;
  selectedRole: OnboardingRole | null;
  selectedGoals: LearningGoal[];
  learningPace: LearningPace | null;
  stepSubtitle: string;
  onClearStatus: () => void;
  onAgeRange: (value: AgeRange) => void;
  onRole: (value: OnboardingRole) => void;
  onGoalToggle: (goal: LearningGoal) => void;
  onPace: (value: LearningPace) => void;
};

export default function OnboardingStepsContent({
  currentStep,
  ageRange,
  selectedRole,
  selectedGoals,
  learningPace,
  stepSubtitle,
  onClearStatus,
  onAgeRange,
  onRole,
  onGoalToggle,
  onPace,
}: OnboardingStepsContentProps) {
  if (currentStep === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {onboardingAgeRangeOptions.map((option) => {
          const selected = ageRange === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                onClearStatus();
                onAgeRange(option);
              }}
              className={`min-h-[48px] rounded-[1.9rem] border p-5 text-left transition-all ${option === '29+' ? 'xl:col-span-2' : ''
                } ${selected ? 'border-white bg-white/[0.12]' : 'border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.05]'}`}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
                Category_{String(onboardingAgeRangeOptions.indexOf(option) + 1).padStart(2, '0')}
              </div>
              <div className="mt-8 flex items-end justify-between gap-4">
                <div className="font-display text-3xl font-semibold leading-[0.95] text-white sm:text-4xl">{option}</div>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-white bg-white text-black' : 'border-white/12 text-transparent'}`}
                  aria-hidden="true"
                >
                  <Check size={14} aria-hidden="true" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  if (currentStep === 1) {
    return (
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
                onClearStatus();
                onRole(option.value);
              }}
              className={`min-h-[48px] rounded-[1.9rem] border p-5 text-left transition-all ${selected ? 'border-white bg-white/[0.12]' : 'border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.05]'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/82">
                  <Icon size={18} aria-hidden="true" />
                </div>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-white bg-white text-black' : 'border-white/12 text-transparent'}`}
                  aria-hidden="true"
                >
                  <Check size={14} aria-hidden="true" />
                </div>
              </div>
              <div className="mt-8">
                <div className="font-display text-[1.8rem] font-semibold leading-[0.98] text-white sm:text-[2rem]">{meta.label}</div>
                <div className="mt-3 text-sm text-white/72">{meta.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-white/72">{stepSubtitle}</div>
          <div className="inline-flex min-h-12 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
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
                onClick={() => onGoalToggle(goal)}
                className={`min-h-[48px] rounded-[1.7rem] border p-4 text-left transition-all ${selected ? 'border-white bg-white/[0.12]' : 'border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.05]'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/78">
                    <Icon size={15} aria-hidden="true" />
                  </div>
                  <div
                    className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${selected ? 'border-white bg-white' : 'border-white/15 bg-transparent'}`}
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-8">
                  <div className="font-display text-[1.5rem] font-semibold leading-[1] text-white">{meta.label}</div>
                  <div className="mt-2 text-sm leading-relaxed text-white/70">{meta.description}</div>
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
            onClick={() => {
              onClearStatus();
              onPace(pace);
            }}
            className={`relative min-h-[48px] w-full rounded-[1.9rem] border px-5 py-5 text-left transition-all ${selected ? 'border-white bg-white/[0.12]' : 'border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.05]'}`}
          >
            {meta.recommended ? (
              <div className="absolute right-4 top-3 rounded-full border border-white/14 bg-white px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-black">
                Recommended
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">{meta.eyebrow}</div>
                <div className="mt-3 font-display text-[2rem] font-semibold leading-none text-white">{pace}</div>
                <div className="mt-2 text-base text-white/72">{meta.duration}</div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border ${selected ? 'border-white bg-white text-black' : 'border-white/12 bg-white/[0.04] text-white/72'}`}
                >
                  <Icon size={18} aria-hidden="true" />
                </div>
                <div className={`h-4 w-4 rounded-full border-2 ${selected ? 'border-white bg-white' : 'border-white/16'}`} aria-hidden="true" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
