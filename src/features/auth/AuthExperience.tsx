'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  Orbit,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import GlobalSidebar from '@/src/features/navigation/GlobalSidebar';
import { createClient as createSupabaseBrowserClient } from '@/src/lib/supabase/client';
import { startRouteTransition } from '@/src/features/motion/ExperienceProvider';

type AuthMode = 'login' | 'signup';

type AuthStatus =
  | {
      kind: 'error' | 'info' | 'success';
      message: string;
    }
  | null;

type AuthFields = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  remember: boolean;
};

const authContent = {
  login: {
    eyebrow: 'YANTRA AI-NATIVE OS',
    title: ['RETURN TO', 'YOUR SYSTEM'],
    description:
      'Resume your learning system, recover your current path, and move straight back into focused practice with a calmer, more cinematic access layer.',
    kicker: 'Continue your path',
    helper: 'Return to your dashboard',
    chips: ['AI-guided', 'Private dashboard', 'Secure access'],
    footer: 'SECURE AUTHENTICATION GATEWAY - TERMINAL 01-B',
    ghostCta: 'Back to platform',
  },
  signup: {
    eyebrow: 'EARLY ACCESS / ACCOUNT CREATION',
    title: ['START YOUR', 'SYSTEM'],
    description:
      'Personalized learning, guided by intelligence. Build your Yantra identity, unlock your roadmap, and step into a private cognitive workspace.',
    kicker: 'Create your Yantra account',
    helper: 'Your roadmap begins here',
    chips: ['AI-guided', 'Personalized roadmap', 'Secure access'],
    footer: 'PRIVATE ACCOUNT LAYER - PROVISIONING FLOW ACTIVE',
    ghostCta: 'Back to platform',
  },
} satisfies Record<
  AuthMode,
  {
    eyebrow: string;
    title: [string, string];
    description: string;
    kicker: string;
    helper: string;
    chips: string[];
    footer: string;
    ghostCta: string;
  }
>;

type AuthStatusPresentation = {
  eyebrow: string;
  title: string;
  body: string;
  icon: typeof ShieldCheck;
  chromeClassName: string;
  iconClassName: string;
};

function AuthAtmosphere() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.06),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%,transparent_82%,rgba(255,255,255,0.04))]" />
        <div className="absolute left-[-8%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-white/[0.05] blur-[130px]" />
        <div className="absolute right-[-10%] top-[-8%] h-[34rem] w-[34rem] rounded-full bg-white/[0.04] blur-[150px]" />
        <div className="absolute bottom-[-24%] left-[22%] h-[38rem] w-[40rem] rounded-full bg-white/[0.035] blur-[170px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '140px 140px',
            maskImage: 'radial-gradient(circle at center, black 35%, transparent 82%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-screen"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 160 160%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.88%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22160%22 height=%22160%22 filter=%22url(%23noise)%22 opacity=%220.92%22/%3E%3C/svg%3E")',
          }}
        />
      </div>

      <div className="pointer-events-none fixed left-[24%] top-0 hidden h-full w-px bg-white/6 md:block" />
      <div className="pointer-events-none fixed left-0 top-[28%] hidden h-px w-full bg-white/6 md:block" />
    </>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        fill="currentColor"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="currentColor"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z"
        fill="currentColor"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.69.08-.69 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.27-5.24-5.68 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.07 0 0 .96-.31 3.14 1.18a10.9 10.9 0 0 1 5.72 0c2.18-1.49 3.14-1.18 3.14-1.18.62 1.6.23 2.78.11 3.07.73.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.67.41.36.78 1.08.78 2.19 0 1.58-.01 2.85-.01 3.24 0 .3.2.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function Switcher({ mode }: { mode: AuthMode }) {
  return (
    <nav className="mb-8 flex rounded-full border border-white/10 bg-white/[0.04] p-1 md:mb-10">
      <Link
        href="/login"
        className={`flex-1 rounded-full px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[0.24em] transition-colors ${
          mode === 'login'
            ? 'bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
            : 'text-white/38 hover:text-white/70'
        }`}
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        className={`flex-1 rounded-full px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[0.24em] transition-colors ${
          mode === 'signup'
            ? 'bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
            : 'text-white/38 hover:text-white/70'
        }`}
      >
        Create Account
      </Link>
    </nav>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <label className="block font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">{children}</label>;
}

function AuthInput({
  label,
  type,
  value,
  placeholder,
  error,
  trailing,
  autoComplete = 'off',
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  placeholder: string;
  error?: string;
  trailing?: ReactNode;
  autoComplete?: string;
  onChange: (value: string) => void;
}) {
  const [interactive, setInteractive] = useState(false);

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative flex items-center">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          readOnly={!interactive}
          autoComplete={autoComplete}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          data-lpignore="true"
          data-1p-ignore="true"
          onFocus={() => setInteractive(true)}
          onPointerDown={() => setInteractive(true)}
          onChange={(event) => onChange(event.target.value)}
          className={`hoverable w-full border-b bg-transparent py-3 text-base text-white outline-none transition-colors placeholder:text-white/12 md:text-sm ${
            error ? 'border-red-300/60' : 'border-white/20 focus:border-white'
          }`}
        />
        {trailing}
      </div>
      {error ? <p className="text-[11px] text-red-200/90">{error}</p> : null}
    </div>
  );
}

function describeAuthStatus(status: AuthStatus): AuthStatusPresentation | null {
  if (!status) {
    return null;
  }

  const normalized = status.message.toLowerCase();

  if (status.kind === 'success') {
    if (normalized.includes('password reset email sent')) {
      return {
        eyebrow: 'Recovery Link Sent',
        title: 'Secure reset signal is in motion',
        body: 'Check your inbox and open the Yantra recovery link to rotate your access key.',
        icon: CheckCircle2,
        chromeClassName: 'border-white/12 bg-white/[0.05]',
        iconClassName: 'border-white/12 bg-white text-black',
      };
    }

    if (normalized.includes('account created')) {
      return {
        eyebrow: 'Identity Provisioned',
        title: 'Your Yantra account is ready',
        body: 'Confirm the email link to start onboarding for this new account.',
        icon: CheckCircle2,
        chromeClassName: 'border-white/12 bg-white/[0.05]',
        iconClassName: 'border-white/12 bg-white text-black',
      };
    }

    if (normalized.includes('password updated') || normalized.includes('access key rotated')) {
      return {
        eyebrow: 'Access Key Rotated',
        title: 'Your recovery cycle completed',
        body: 'Log in with the new password to reopen your protected Yantra workspace.',
        icon: CheckCircle2,
        chromeClassName: 'border-white/12 bg-white/[0.05]',
        iconClassName: 'border-white/12 bg-white text-black',
      };
    }
  }

  if (status.kind === 'info') {
    if (normalized.includes('signed out') || normalized.includes('session closed')) {
      return {
        eyebrow: 'Session Closed',
        title: 'Your console has been sealed',
        body: 'The active Yantra session was closed cleanly. Sign in again whenever you want to continue the path.',
        icon: Orbit,
        chromeClassName: 'border-white/10 bg-black/28',
        iconClassName: 'border-white/10 bg-white/[0.05] text-white/82',
      };
    }

    if (normalized.includes('google sign-in')) {
      return {
        eyebrow: 'Google Handoff',
        title: 'Google auth is routing through Supabase',
        body: 'Continue in the Google account chooser, then Yantra will return you to your dashboard.',
        icon: Orbit,
        chromeClassName: 'border-white/10 bg-black/28',
        iconClassName: 'border-white/10 bg-white/[0.05] text-white/82',
      };
    }

    if (normalized.includes('github sign-in')) {
      return {
        eyebrow: 'GitHub Handoff',
        title: 'GitHub auth is routing through Supabase',
        body: 'Continue in the GitHub authorization flow, then Yantra will return you to your dashboard.',
        icon: Orbit,
        chromeClassName: 'border-white/10 bg-black/28',
        iconClassName: 'border-white/10 bg-white/[0.05] text-white/82',
      };
    }

    if (normalized.includes('supabase is not configured')) {
      return {
        eyebrow: 'System Keys Missing',
        title: 'This gateway needs live runtime keys',
        body: 'Add the Supabase project URL and anon key, then reload the auth surface to activate sign-in.',
        icon: Orbit,
        chromeClassName: 'border-white/10 bg-black/28',
        iconClassName: 'border-white/10 bg-white/[0.05] text-white/82',
      };
    }
  }

  if (status.kind === 'error' && normalized.includes('email rate limit exceeded')) {
    return {
      eyebrow: 'Supabase Limit Hit',
      title: 'Signup email sending is blocked right now',
      body: 'For local testing, open Supabase Auth > Providers > Email and turn off Confirm email, then try signup again. The app will send the new account straight to onboarding.',
      icon: ShieldAlert,
      chromeClassName: 'border-red-300/30 bg-red-400/10',
      iconClassName: 'border-red-300/25 bg-red-500/10 text-red-100',
    };
  }

  return {
    eyebrow: status.kind === 'error' ? 'Signal Interrupted' : status.kind === 'success' ? 'Status' : 'System Notice',
    title:
      status.kind === 'error'
        ? 'The auth layer needs another pass'
        : status.kind === 'success'
          ? 'State updated successfully'
          : 'Yantra sent a system notice',
    body: status.message,
    icon: status.kind === 'error' ? ShieldAlert : status.kind === 'success' ? CheckCircle2 : Orbit,
    chromeClassName:
      status.kind === 'error' ? 'border-red-300/30 bg-red-400/10' : status.kind === 'success' ? 'border-white/12 bg-white/[0.05]' : 'border-white/10 bg-black/28',
    iconClassName:
      status.kind === 'error'
        ? 'border-red-300/25 bg-red-500/10 text-red-100'
        : status.kind === 'success'
          ? 'border-white/12 bg-white text-black'
          : 'border-white/10 bg-white/[0.05] text-white/82',
  };
}

export default function AuthExperience({
  mode,
  initialStatus = null,
  supabaseConfigured,
}: {
  mode: AuthMode;
  initialStatus?: AuthStatus;
  supabaseConfigured: boolean;
}) {
  const content = authContent[mode];
  const docsHref = mode === 'login' ? '/docs/sign-in-and-google' : '/docs/create-account';
  const docsLabel = mode === 'login' ? 'Read sign-in docs' : 'Read account setup docs';
  const router = useRouter();
  const [fields, setFields] = useState<AuthFields>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    remember: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AuthFields, string>>>({});
  const [status, setStatus] = useState<AuthStatus>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [oauthSubmittingProvider, setOauthSubmittingProvider] = useState<'google' | 'github' | null>(null);
  const statusPresentation = describeAuthStatus(status);
  const isOAuthSubmitting = oauthSubmittingProvider !== null;

  const updateField = <K extends keyof AuthFields>(key: K, value: AuthFields[K]) => {
    setFields((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof AuthFields, string>> = {};

    if (mode === 'signup' && !fields.fullName.trim()) {
      nextErrors.fullName = 'Enter your full name to continue.';
    }

    if (!fields.email.trim()) {
      nextErrors.email = 'Enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      nextErrors.email = 'Use a valid email address.';
    }

    if (!fields.password.trim()) {
      nextErrors.password = 'Enter your password.';
    } else if (fields.password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.';
    }

    if (mode === 'signup' && !fields.confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Confirm your password.';
    } else if (mode === 'signup' && fields.confirmPassword !== fields.password) {
      nextErrors.confirmPassword = 'Passwords do not match yet.';
    }

    return nextErrors;
  };

  const validateEmailField = () => {
    if (!fields.email.trim()) {
      setErrors((current) => ({ ...current, email: 'Enter your email address first.' }));
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      setErrors((current) => ({ ...current, email: 'Use a valid email address.' }));
      return false;
    }

    setErrors((current) => {
      if (!current.email) {
        return current;
      }

      const next = { ...current };
      delete next.email;
      return next;
    });

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        kind: 'error',
        message: 'Check the highlighted fields before continuing.',
      });
      return;
    }

    if (!supabaseConfigured) {
      setStatus({
        kind: 'error',
        message: 'Supabase is not configured yet. Add your Supabase URL and anon key to activate auth.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: fields.email.trim(),
          password: fields.password,
        });

        if (error) {
          throw error;
        }

        startRouteTransition({ href: '/dashboard', label: 'Opening Dashboard' });
        router.replace('/dashboard');
        router.refresh();
        return;
      }

      const redirectTo = `${window.location.origin}/auth/confirm?next=/onboarding`;
      const { data, error } = await supabase.auth.signUp({
        email: fields.email.trim(),
        password: fields.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: fields.fullName.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        startRouteTransition({ href: '/onboarding', label: 'Opening Onboarding' });
        router.replace('/onboarding');
        router.refresh();
        return;
      }

      setStatus({
        kind: 'success',
        message:
          'Account created. Check your email for the confirmation link to start onboarding.',
      });
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Yantra could not complete authentication right now.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!validateEmailField()) {
      setStatus({
        kind: 'error',
        message: 'Enter the email on this account before requesting a reset link.',
      });
      return;
    }

    const email = fields.email.trim();

    if (!supabaseConfigured) {
      setStatus({
        kind: 'error',
        message: 'Supabase is not configured yet. Add your Supabase URL and anon key to activate password recovery.',
      });
      return;
    }

    setIsRecovering(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (error) {
        throw error;
      }

      setStatus({
        kind: 'success',
        message: 'Password reset email sent. Open the recovery link in your inbox to choose a new password.',
      });
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Yantra could not send the password reset email right now.',
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    if (!supabaseConfigured) {
      setStatus({
        kind: 'error',
        message: 'Supabase is not configured yet. Add your Supabase URL and anon key to activate auth.',
      });
      return;
    }

    setOauthSubmittingProvider(provider);

    try {
      const supabase = createSupabaseBrowserClient();
      const nextPath = mode === 'signup' ? '/onboarding' : '/dashboard';
      const redirectTo = `${window.location.origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          ...(provider === 'google'
            ? {
                queryParams: {
                  prompt: 'select_account',
                },
              }
            : {}),
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const providerLabel = provider === 'google' ? 'Google' : 'GitHub';
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : `Yantra could not open ${providerLabel} sign-in right now.`,
      });
      setOauthSubmittingProvider(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <AuthAtmosphere />

      <header className="fixed left-0 top-0 z-40 w-full px-6 py-6 md:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <Link href="/" className="font-heading text-3xl tracking-wider text-white hoverable">
            YANTRA<span className="text-white/45">.</span>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.75)] animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/52">
              AI-Native Learning OS
            </span>
          </div>
          <GlobalSidebar disableDesktop={true} />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 pb-10 pt-24 md:flex-row md:items-center md:gap-10 md:px-8 md:pb-24 md:pt-24">
        <section className="mb-5 w-full md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-[24px]"
          >
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.52)]" />
              <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/52">{content.eyebrow}</span>
            </div>

            <div className="mt-5 space-y-4">
              <h1 className="font-display text-[2.9rem] font-semibold leading-[0.88] tracking-tight text-white">
                {content.title[0]}
                <br />
                {content.title[1]}
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-white/62">{content.description}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {content.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/44"
                >
                  {chip}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="hidden w-full flex-1 flex-col justify-center md:flex md:pr-10">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.52)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/52">{content.eyebrow}</span>
            </div>

            <div className="space-y-6">
              <h1 className="font-display text-6xl font-semibold leading-[0.88] tracking-tight text-white md:text-8xl">
                {content.title[0]}
                <br />
                {content.title[1]}
              </h1>

              <div className="max-w-xl border-l border-white/12 pl-6">
                <p className="text-lg font-light leading-relaxed text-white/62 md:text-xl">{content.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-5 pt-4">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-white/45" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/44">
                  {content.chips[0]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Waypoints size={15} className="text-white/45" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/44">
                  {content.chips[1]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-white/45" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/44">
                  {content.chips[2]}
                </span>
              </div>
            </div>

            <div className="hidden h-px w-32 bg-gradient-to-r from-white/30 to-transparent md:block" />
          </motion.div>
        </section>

        <section className="mt-0 flex w-full flex-1 justify-center md:mt-0 md:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[520px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-[32px] md:rounded-[2rem] md:p-10 md:shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_36%,rgba(255,255,255,0.03))]" />

            <div className="relative z-10">
              <Switcher mode={mode} />

              <div className="mb-6 md:mb-8">
                <p className="font-display text-[2rem] font-medium tracking-tight text-white md:text-3xl">
                  {content.helper}
                </p>
                <p className="mt-2 max-w-md text-[13px] leading-relaxed text-white/50 md:text-sm">
                  {supabaseConfigured
                    ? 'This access layer is now connected to Supabase with session cookies, protected routes, and a synced student profile record.'
                    : 'This auth surface is ready, but it still needs your Supabase project URL and anon key before sign-in can go live.'}
                </p>
                <Link
                  href={docsHref}
                  className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/42 transition-colors hover:text-white"
                >
                  <BookOpen size={14} />
                  {docsLabel}
                </Link>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
                <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
                  <input tabIndex={-1} autoComplete="username" />
                  <input tabIndex={-1} type="password" autoComplete="current-password" />
                </div>

                {mode === 'signup' ? (
                  <AuthInput
                    label="Full Name"
                    type="text"
                    value={fields.fullName}
                    placeholder="Aarav Malhotra"
                    error={errors.fullName}
                    onChange={(value) => updateField('fullName', value)}
                  />
                ) : null}

                <AuthInput
                  label={mode === 'login' ? 'Registry Email' : 'Email Address'}
                  type="email"
                  value={fields.email}
                  placeholder="identity@yantra.ai"
                  error={errors.email}
                  autoComplete="off"
                  onChange={(value) => updateField('email', value)}
                />

                {mode === 'signup' ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    <AuthInput
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={fields.password}
                      placeholder="Create a secure password"
                      error={errors.password}
                      autoComplete="off"
                      onChange={(value) => updateField('password', value)}
                      trailing={
                        <button
                          type="button"
                          className="hoverable absolute right-0 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-white"
                          onClick={() => setShowPassword((current) => !current)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      }
                    />
                    <AuthInput
                      label="Confirm"
                      type={showConfirm ? 'text' : 'password'}
                      value={fields.confirmPassword}
                      placeholder="Repeat your password"
                      error={errors.confirmPassword}
                      autoComplete="off"
                      onChange={(value) => updateField('confirmPassword', value)}
                      trailing={
                        <button
                          type="button"
                          className="hoverable absolute right-0 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-white"
                          onClick={() => setShowConfirm((current) => !current)}
                          aria-label={showConfirm ? 'Hide password confirmation' : 'Show password confirmation'}
                        >
                          {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      }
                    />
                  </div>
                ) : (
                  <AuthInput
                    label="Access Key"
                    type={showPassword ? 'text' : 'password'}
                    value={fields.password}
                    placeholder="Enter your password"
                    error={errors.password}
                    autoComplete="off"
                    onChange={(value) => updateField('password', value)}
                    trailing={
                      <button
                        type="button"
                        className="hoverable absolute right-0 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-white"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    }
                  />
                )}

                {mode === 'login' ? (
                  <div className="flex items-center justify-between py-1">
                    <label className="group flex cursor-pointer items-center gap-3">
                      <button
                        type="button"
                        className={`flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors ${
                          fields.remember ? 'border-white/70 bg-white/10' : 'border-white/30 bg-transparent'
                        }`}
                        onClick={() => updateField('remember', !fields.remember)}
                        aria-pressed={fields.remember}
                      >
                        {fields.remember ? <LockKeyhole size={10} className="text-white" /> : null}
                      </button>
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/48">
                        Remember Path
                      </span>
                    </label>

                    <button
                      type="button"
                      className="hoverable font-mono text-[9px] uppercase tracking-[0.16em] text-white/40 transition-colors hover:text-white disabled:cursor-not-allowed disabled:text-white/24"
                      onClick={handleForgotPassword}
                      disabled={isRecovering}
                    >
                      {isRecovering ? 'Sending Reset...' : 'Forgot Password?'}
                    </button>
                  </div>
                ) : null}

                <div className="space-y-5 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || isOAuthSubmitting || !supabaseConfigured}
                    className="hoverable flex h-14 w-full items-center justify-center gap-2 rounded-[1.2rem] bg-white font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-all duration-300 hover:scale-[0.99] disabled:cursor-not-allowed disabled:bg-white/35"
                  >
                    <span>
                      {isSubmitting
                        ? mode === 'login'
                          ? 'Signing in...'
                          : 'Creating account...'
                        : content.kicker}
                    </span>
                    <ArrowRight size={15} />
                  </button>

                  <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-white/34">
                    <span className="font-mono">
                      {mode === 'login' ? 'Secure session flow' : 'Email verification ready'}
                    </span>
                    <Link href="/" className="hoverable font-mono text-white/54 transition-colors hover:text-white">
                      {content.ghostCta}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center py-1">
                  <div className="h-px flex-1 bg-white/8" />
                  <span className="px-4 font-mono text-[9px] uppercase tracking-[0.24em] text-white/25">OR</span>
                  <div className="h-px flex-1 bg-white/8" />
                </div>

                <button
                  type="button"
                  disabled={isSubmitting || isOAuthSubmitting || !supabaseConfigured}
                  className="hoverable flex h-14 w-full items-center justify-center gap-3 rounded-[1.2rem] border border-white/12 bg-transparent font-mono text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-white/[0.02] disabled:text-white/35"
                  onClick={() => {
                    void handleOAuthSignIn('google');
                  }}
                >
                  <GoogleIcon />
                  <span>
                    {oauthSubmittingProvider === 'google'
                      ? 'Connecting Google...'
                      : mode === 'login'
                        ? 'Authenticate with Google'
                        : 'Continue with Google'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || isOAuthSubmitting || !supabaseConfigured}
                  className="hoverable flex h-14 w-full items-center justify-center gap-3 rounded-[1.2rem] border border-white/12 bg-transparent font-mono text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-white/[0.02] disabled:text-white/35"
                  onClick={() => {
                    void handleOAuthSignIn('github');
                  }}
                >
                  <GitHubIcon />
                  <span>
                    {oauthSubmittingProvider === 'github'
                      ? 'Connecting GitHub...'
                      : mode === 'login'
                        ? 'Authenticate with GitHub'
                        : 'Continue with GitHub'}
                  </span>
                </button>
              </form>

              {statusPresentation ? (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative mt-6 overflow-hidden rounded-[1.35rem] border p-4 md:rounded-[1.5rem] ${statusPresentation.chromeClassName}`}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_36%,rgba(255,255,255,0.03))]" />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/18 to-transparent"
                  />

                  <div className="relative z-10 flex items-start gap-4">
                    <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${statusPresentation.iconClassName}`}>
                      <statusPresentation.icon size={17} />
                    </div>

                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/46">
                        {statusPresentation.eyebrow}
                      </div>
                      <div className="mt-2 font-display text-xl font-medium tracking-tight text-white">
                        {statusPresentation.title}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-white/66">{statusPresentation.body}</p>
                    </div>
                  </div>
                </motion.div>
              ) : null}

              <div className="mt-7 border-t border-white/8 pt-5 text-center md:mt-8 md:pt-6">
                <p className="font-mono text-[8px] uppercase tracking-[0.26em] text-white/24">{content.footer}</p>
              </div>

              <div className="mt-4 text-center md:hidden">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">
                  {mode === 'login' ? 'Need a new account?' : 'Already have access?'}{' '}
                </span>
                <Link
                  href={mode === 'login' ? '/signup' : '/login'}
                  className="hoverable font-mono text-[10px] uppercase tracking-[0.16em] text-white/62 transition-colors hover:text-white"
                >
                  {mode === 'login' ? 'Create one' : 'Log in'}
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 hidden border-t border-white/6 px-8 py-8 md:block">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/32">
            (c) 2026 Yantra AI-native OS. All rights reserved.
          </span>
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="hoverable font-mono text-[10px] uppercase tracking-[0.2em] text-white/28 transition-colors hover:text-white"
            >
              Platform
            </Link>
            <Link
              href="/login"
              className="hoverable font-mono text-[10px] uppercase tracking-[0.2em] text-white/28 transition-colors hover:text-white"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="hoverable font-mono text-[10px] uppercase tracking-[0.2em] text-white/28 transition-colors hover:text-white"
            >
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
