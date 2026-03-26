'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';

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
    footer: 'SECURE AUTHENTICATION GATEWAY — TERMINAL 01-B',
    ghostCta: 'View dashboard preview',
  },
  signup: {
    eyebrow: 'EARLY ACCESS / ACCOUNT CREATION',
    title: ['START YOUR', 'SYSTEM'],
    description:
      'Personalized learning, guided by intelligence. Build your Yantra identity, unlock your roadmap, and step into a private cognitive workspace.',
    kicker: 'Create your Yantra account',
    helper: 'Your roadmap begins here',
    chips: ['AI-guided', 'Personalized roadmap', 'Secure access'],
    footer: 'PRIVATE ACCOUNT LAYER — PROVISIONING FLOW ACTIVE',
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

function AuthAtmosphere() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.06),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%,transparent_82%,rgba(255,255,255,0.04))]" />
        <div className="absolute left-[-8%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-white/[0.06] blur-[130px]" />
        <div className="absolute right-[-10%] top-[-8%] h-[34rem] w-[34rem] rounded-full bg-white/[0.05] blur-[150px]" />
        <div className="absolute bottom-[-24%] left-[22%] h-[38rem] w-[40rem] rounded-full bg-white/[0.04] blur-[170px]" />
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

function Switcher({ mode }: { mode: AuthMode }) {
  return (
    <nav className="mb-8 flex rounded-full border border-white/10 bg-white/[0.04] p-1 md:mb-10">
      <Link
        href="/login"
        className={`flex-1 rounded-full px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[0.24em] transition-colors ${
          mode === 'login' ? 'bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'text-white/38 hover:text-white/70'
        }`}
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        className={`flex-1 rounded-full px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[0.24em] transition-colors ${
          mode === 'signup' ? 'bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'text-white/38 hover:text-white/70'
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
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  placeholder: string;
  error?: string;
  trailing?: ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative flex items-center">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
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

export default function AuthExperience({ mode }: { mode: AuthMode }) {
  const content = authContent[mode];
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
  const [status, setStatus] = useState<AuthStatus>(null);

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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

    setStatus({
      kind: 'success',
      message:
        mode === 'login'
          ? 'Preview mode only. Sign-in wiring comes next, but the flow and validation are now ready for backend connection.'
          : 'Preview mode only. Account creation UI is ready, and Supabase wiring can be added next without redesigning this flow.',
    });
  };

  const handleForgotPassword = () => {
    setStatus({
      kind: 'info',
      message: 'Password recovery is intentionally a UI placeholder for this phase and will be connected in the auth backend pass.',
    });
  };

  const handleGooglePreview = () => {
    setStatus({
      kind: 'info',
      message: 'Google sign-in is shown as a design placeholder right now. No external auth provider is connected in this phase.',
    });
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
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/52">AI-Native Learning OS</span>
          </div>
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
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.72)] animate-pulse" />
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
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.72)] animate-pulse" />
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
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/44">{content.chips[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Waypoints size={15} className="text-white/45" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/44">{content.chips[1]}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-white/45" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/44">{content.chips[2]}</span>
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
                <p className="font-display text-[2rem] font-medium tracking-tight text-white md:text-3xl">{content.helper}</p>
                <p className="mt-2 max-w-md text-[13px] leading-relaxed text-white/50 md:text-sm">
                  This is a frontend-first auth surface with validation and state previews only. Real account wiring comes in the next backend phase.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
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
                  onChange={(value) => updateField('email', value)}
                />

                {mode === 'signup' ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    <AuthInput
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={fields.password}
                      placeholder="••••••••"
                      error={errors.password}
                      onChange={(value) => updateField('password', value)}
                      trailing={
                        <button
                          type="button"
                          className="hoverable absolute right-0 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-white"
                          onClick={() => setShowPassword((current) => !current)}
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      }
                    />
                    <AuthInput
                      label="Confirm"
                      type={showConfirm ? 'text' : 'password'}
                      value={fields.confirmPassword}
                      placeholder="••••••••"
                      error={errors.confirmPassword}
                      onChange={(value) => updateField('confirmPassword', value)}
                      trailing={
                        <button
                          type="button"
                          className="hoverable absolute right-0 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-white"
                          onClick={() => setShowConfirm((current) => !current)}
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
                    placeholder="••••••••••••"
                    error={errors.password}
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
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/48">Remember Path</span>
                    </label>

                    <button
                      type="button"
                      className="hoverable font-mono text-[9px] uppercase tracking-[0.16em] text-white/40 transition-colors hover:text-white"
                      onClick={handleForgotPassword}
                    >
                      Forgot Password?
                    </button>
                  </div>
                ) : null}

                <div className="space-y-5 pt-2">
                  <button
                    type="submit"
                    className="hoverable flex h-14 w-full items-center justify-center gap-2 rounded-[1.2rem] bg-white font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-all duration-300 hover:scale-[0.99]"
                  >
                    <span>{content.kicker}</span>
                    <ArrowRight size={15} />
                  </button>

                  <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-white/34">
                    <span className="font-mono">{mode === 'login' ? 'Preview flow active' : 'UI-first account flow'}</span>
                    <Link
                      href={mode === 'login' ? '/dashboard' : '/'}
                      className="hoverable font-mono text-white/54 transition-colors hover:text-white"
                    >
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
                  className="hoverable flex h-14 w-full items-center justify-center gap-3 rounded-[1.2rem] border border-white/12 bg-transparent font-mono text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/[0.05]"
                  onClick={handleGooglePreview}
                >
                  <GoogleIcon />
                  <span>{mode === 'login' ? 'Authenticate with Google' : 'Continue with Google'}</span>
                </button>
              </form>

              {status ? (
                <div
                  className={`mt-6 rounded-[1.25rem] border px-4 py-4 text-sm leading-relaxed md:rounded-[1.4rem] ${
                    status.kind === 'error'
                      ? 'border-red-300/30 bg-red-400/10 text-red-100'
                      : status.kind === 'success'
                        ? 'border-white/12 bg-white/[0.05] text-white/82'
                        : 'border-white/10 bg-black/20 text-white/68'
                  }`}
                >
                  {status.message}
                </div>
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
            © 2026 Yantra AI-native OS. All rights reserved.
          </span>
          <div className="flex items-center gap-8">
            <Link href="/" className="hoverable font-mono text-[10px] uppercase tracking-[0.2em] text-white/28 transition-colors hover:text-white">
              Platform
            </Link>
            <Link href="/login" className="hoverable font-mono text-[10px] uppercase tracking-[0.2em] text-white/28 transition-colors hover:text-white">
              Log In
            </Link>
            <Link href="/signup" className="hoverable font-mono text-[10px] uppercase tracking-[0.2em] text-white/28 transition-colors hover:text-white">
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
