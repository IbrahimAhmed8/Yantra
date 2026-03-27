'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Orbit, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { startRouteTransition } from '@/src/features/motion/ExperienceProvider';
import { createClient as createSupabaseBrowserClient, createTransientClient } from '@/src/lib/supabase/client';

type ResetStatus =
  | {
      kind: 'error' | 'info' | 'success';
      message: string;
    }
  | null;

type ResetStatusPresentation = {
  eyebrow: string;
  title: string;
  body: string;
  icon: typeof ShieldCheck;
  chromeClassName: string;
  iconClassName: string;
};

function ResetPasswordAtmosphere() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.06),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%,transparent_82%,rgba(255,255,255,0.04))]" />
        <div className="absolute left-[-8%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-white/[0.05] blur-[130px]" />
        <div className="absolute right-[-10%] top-[-8%] h-[34rem] w-[34rem] rounded-full bg-white/[0.04] blur-[150px]" />
        <div className="absolute bottom-[-24%] left-[22%] h-[38rem] w-[40rem] rounded-full bg-white/[0.035] blur-[170px]" />
      </div>

      <div className="pointer-events-none fixed left-[24%] top-0 hidden h-full w-px bg-white/6 md:block" />
      <div className="pointer-events-none fixed left-0 top-[28%] hidden h-px w-full bg-white/6 md:block" />
    </>
  );
}

function describeResetStatus(status: ResetStatus): ResetStatusPresentation | null {
  if (!status) {
    return null;
  }

  const normalized = status.message.toLowerCase();

  if (
    status.kind === 'error' &&
    (normalized.includes('same password') ||
      normalized.includes('not used on this account before') ||
      normalized.includes('cannot be reused'))
  ) {
    return {
      eyebrow: 'Rotation Required',
      title: 'Choose a password your account has not used',
      body: 'For a real reset cycle, the next access key must be different from the previous one.',
      icon: ShieldAlert,
      chromeClassName: 'border-red-300/30 bg-red-400/10',
      iconClassName: 'border-red-300/25 bg-red-500/10 text-red-100',
    };
  }

  if (status.kind === 'error' && normalized.includes('invalid or expired')) {
    return {
      eyebrow: 'Recovery Link Expired',
      title: 'This secure recovery window has decayed',
      body: 'Request a fresh password reset from the login page and reopen the newest recovery link.',
      icon: ShieldAlert,
      chromeClassName: 'border-red-300/30 bg-red-400/10',
      iconClassName: 'border-red-300/25 bg-red-500/10 text-red-100',
    };
  }

  if (status.kind === 'error' && normalized.includes('do not match')) {
    return {
      eyebrow: 'Mismatch Detected',
      title: 'The two access keys are not aligned yet',
      body: 'Enter the same new password in both fields before completing the reset.',
      icon: ShieldAlert,
      chromeClassName: 'border-red-300/30 bg-red-400/10',
      iconClassName: 'border-red-300/25 bg-red-500/10 text-red-100',
    };
  }

  if (status.kind === 'info') {
    return {
      eyebrow: 'Recovery Session',
      title: 'Yantra is preparing the secure reset channel',
      body: status.message,
      icon: Orbit,
      chromeClassName: 'border-white/10 bg-black/28',
      iconClassName: 'border-white/10 bg-white/[0.05] text-white/82',
    };
  }

  if (status.kind === 'success') {
    return {
      eyebrow: 'Recovery Complete',
      title: 'Your access key has been rotated',
      body: status.message,
      icon: CheckCircle2,
      chromeClassName: 'border-white/12 bg-white/[0.05]',
      iconClassName: 'border-white/12 bg-white text-black',
    };
  }

  return {
    eyebrow: 'Security Check',
    title: 'The reset layer needs another pass',
    body: status.message,
    icon: ShieldAlert,
    chromeClassName: 'border-red-300/30 bg-red-400/10',
    iconClassName: 'border-red-300/25 bg-red-500/10 text-red-100',
  };
}

export default function ResetPasswordExperience({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<ResetStatus>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordInteractive, setPasswordInteractive] = useState(false);
  const [confirmInteractive, setConfirmInteractive] = useState(false);
  const statusPresentation = describeResetStatus(status);

  useEffect(() => {
    if (!supabaseConfigured) {
      setStatus({
        kind: 'info',
        message: 'Supabase is not configured yet. Add your Supabase URL and anon key before using password reset.',
      });
      setIsCheckingSession(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let active = true;

    const setRecoveryState = (isReady: boolean) => {
      if (!active) {
        return;
      }

      setHasRecoverySession(isReady);
      setIsCheckingSession(false);
      setStatus(
        isReady
          ? null
          : {
              kind: 'error',
              message: 'This password reset link is invalid or expired. Request a fresh recovery email from the login page.',
            },
      );
    };

    const timerId = window.setTimeout(async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (error) {
        setRecoveryState(false);
        return;
      }

      setRecoveryState(Boolean(data.session));
    }, 300);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) {
        return;
      }

      if (event === 'PASSWORD_RECOVERY' || Boolean(session)) {
        setHasRecoverySession(true);
        setIsCheckingSession(false);
        setStatus(null);
      }
    });

    return () => {
      active = false;
      window.clearTimeout(timerId);
      subscription.unsubscribe();
    };
  }, [supabaseConfigured]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasRecoverySession) {
      setStatus({
        kind: 'error',
        message: 'This password reset session is not ready. Request a fresh recovery email and try again.',
      });
      return;
    }

    if (password.length < 8) {
      setStatus({
        kind: 'error',
        message: 'Use at least 8 characters for the new password.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({
        kind: 'error',
        message: 'The new password and confirmation do not match yet.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user?.email) {
        throw new Error('Yantra could not verify the active recovery identity. Request a fresh reset link.');
      }

      const transientClient = createTransientClient();
      const { data: existingPasswordMatch, error: existingPasswordError } = await transientClient.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (!existingPasswordError && existingPasswordMatch.session) {
        await transientClient.auth.signOut();
        setStatus({
          kind: 'error',
          message: 'Choose a password you have not used on this account before. The previous access key cannot be reused.',
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      await supabase.auth.signOut();
      startRouteTransition({ href: '/login', label: 'Returning to Login' });
      router.replace('/login?message=Access%20key%20rotated.%20Log%20in%20with%20your%20new%20password.&kind=success');
      router.refresh();
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Yantra could not update your password right now.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <ResetPasswordAtmosphere />

      <header className="fixed left-0 top-0 z-40 w-full px-6 py-6 md:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <Link href="/" className="font-heading text-3xl tracking-wider text-white hoverable">
            YANTRA<span className="text-white/45">.</span>
          </Link>

          <Link
            href="/login"
            className="hoverable rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/72 transition-colors hover:bg-white/[0.08]"
          >
            Back to Login
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col justify-center px-4 pb-12 pt-28 md:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-[minmax(0,1fr)_minmax(26rem,34rem)] md:items-center">
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:block"
          >
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.52)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/52">
                Secure Recovery / Password Update
              </span>
            </div>

            <div className="mt-8 space-y-6">
              <h1 className="font-display text-6xl font-semibold leading-[0.88] tracking-tight text-white md:text-8xl">
                RESET
                <br />
                ACCESS
              </h1>

              <div className="max-w-xl border-l border-white/12 pl-6">
                <p className="text-lg font-light leading-relaxed text-white/62 md:text-xl">
                  Create a new password for your Yantra account and return to your protected dashboard with a fresh
                  session.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-[32px] md:p-10 md:shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_36%,rgba(255,255,255,0.03))]" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">Recovery Session</div>
                  <div className="mt-1 font-display text-3xl font-medium tracking-tight text-white">Choose a new password</div>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-white/54">
                {isCheckingSession
                  ? 'Checking the recovery link and preparing your secure reset session.'
                  : 'Set a new password with at least 8 characters, then return to the login page.'}
              </p>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
                <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
                  <input tabIndex={-1} autoComplete="username" />
                  <input tabIndex={-1} type="password" autoComplete="new-password" />
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-[10px] uppercase tracking-[0.24em] text-white/42" htmlFor="password">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      readOnly={!passwordInteractive}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      data-lpignore="true"
                      data-1p-ignore="true"
                      onFocus={() => setPasswordInteractive(true)}
                      onPointerDown={() => setPasswordInteractive(true)}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className="hoverable w-full border-b border-white/20 bg-transparent py-3 text-base text-white outline-none transition-colors placeholder:text-white/12 focus:border-white md:text-sm"
                    />
                    <button
                      type="button"
                      className="hoverable absolute right-0 text-white/40 transition-colors hover:text-white"
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    className="block font-mono text-[10px] uppercase tracking-[0.24em] text-white/42"
                    htmlFor="confirm-password"
                  >
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      readOnly={!confirmInteractive}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      data-lpignore="true"
                      data-1p-ignore="true"
                      onFocus={() => setConfirmInteractive(true)}
                      onPointerDown={() => setConfirmInteractive(true)}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="••••••••"
                      className="hoverable w-full border-b border-white/20 bg-transparent py-3 text-base text-white outline-none transition-colors placeholder:text-white/12 focus:border-white md:text-sm"
                    />
                    <button
                      type="button"
                      className="hoverable absolute right-0 text-white/40 transition-colors hover:text-white"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {statusPresentation ? (
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative overflow-hidden rounded-[1.35rem] border p-4 ${statusPresentation.chromeClassName}`}
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

                <button
                  type="submit"
                  disabled={isSubmitting || isCheckingSession || !hasRecoverySession}
                  className="hoverable flex h-14 w-full items-center justify-center gap-2 rounded-[1.2rem] bg-white font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-all duration-300 hover:scale-[0.99] disabled:cursor-not-allowed disabled:bg-white/35"
                >
                  <span>{isSubmitting ? 'Updating password...' : 'Update Password'}</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
