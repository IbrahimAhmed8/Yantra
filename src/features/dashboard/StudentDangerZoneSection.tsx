'use client';

import { useState } from 'react';
import { Loader2, ShieldAlert, Trash2, X } from 'lucide-react';
import { startRouteTransition } from '@/src/features/motion/ExperienceProvider';

type StudentDangerZoneSectionProps = {
  accountDeletionConfigured: boolean;
};

const dangerCardClassName =
  'relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_20px_54px_rgba(0,0,0,0.22)] backdrop-blur-[22px] sm:rounded-[1.75rem] sm:p-6 lg:rounded-[2rem] lg:p-8';

export default function StudentDangerZoneSection({
  accountDeletionConfigured,
}: StudentDangerZoneSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const closeModal = () => {
    if (busy) {
      return;
    }

    setIsModalOpen(false);
    setConfirmationText('');
    setStatusMessage(null);
  };

  const handleDelete = async () => {
    if (confirmationText.trim().toUpperCase() !== 'DELETE ACCOUNT') {
      setStatusMessage('Type DELETE ACCOUNT exactly to continue.');
      return;
    }

    setBusy(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmationText }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || 'Yantra could not delete the account right now.');
      }

      startRouteTransition({ href: payload.redirectTo || '/', label: 'Deleting Account' });
      window.location.href = payload.redirectTo || '/';
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Yantra could not delete the account right now.');
      setBusy(false);
    }
  };

  return (
    <>
      <section className={dangerCardClassName}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_42%,rgba(120,24,36,0.08))]" />

        <div className="relative z-10">
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/34">Danger Zone</div>
              <h4 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">Delete this Yantra account completely.</h4>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/56">
                This removes your auth account and the saved profile, dashboard, chat history, and personalization data that
                belong to it inside Supabase.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-400/16 bg-rose-500/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-rose-100 transition-colors hover:bg-rose-500/16"
              onClick={() => setIsModalOpen(true)}
            >
              <Trash2 size={14} />
              Delete Account
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.25rem] border border-white/8 bg-black/22 p-4 sm:rounded-[1.5rem] sm:p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">What gets removed</div>
              <div className="mt-4 grid gap-3 text-sm text-white/62">
                <div>Profile record and onboarding answers</div>
                <div>Generated roadmap, skills, curriculum, rooms, and weekly activity</div>
                <div>Approved memory import facts and learner summary</div>
                <div>Persisted Yantra chat history tied to this account</div>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-white/8 bg-black/22 p-4 sm:rounded-[1.5rem] sm:p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">Safety Note</div>
              <p className="mt-4 text-sm leading-relaxed text-white/56">
                This action cannot be undone. If you only want a clean start, use profile reset instead of account deletion.
              </p>
              {!accountDeletionConfigured ? (
                <p className="mt-4 text-sm leading-relaxed text-rose-100/78">
                  The confirmation flow is enabled, but full deletion still needs a server-side Supabase service role key.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/82 px-4 py-8 backdrop-blur-xl">
          <div className="relative w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#090909] p-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)] md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Final Confirmation</div>
                <h3 className="font-display text-3xl font-medium text-white">Delete account and all saved Yantra data.</h3>
                <p className="max-w-xl text-sm leading-relaxed text-white/56">
                  Type <span className="font-mono text-white">DELETE ACCOUNT</span> to confirm. This permanently removes the
                  account from Supabase.
                </p>
              </div>

              <button
                type="button"
                className="rounded-full border border-white/10 p-2 text-white/54 transition-colors hover:bg-white/[0.05] hover:text-white"
                onClick={closeModal}
                aria-label="Close delete account modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-rose-400/14 bg-rose-500/[0.06] p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-400/16 bg-rose-500/10 text-rose-100">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <div className="font-display text-xl font-medium text-white">This is permanent.</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/58">
                    Once confirmed, the account, roadmap, personalization layer, and saved chat history are removed.
                  </p>
                </div>
              </div>
            </div>

            <label className="mt-6 block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/34">Confirmation Phrase</span>
              <input
                value={confirmationText}
                onChange={(event) => setConfirmationText(event.target.value)}
                placeholder="Type DELETE ACCOUNT"
                className="w-full rounded-[1.2rem] border border-white/10 bg-black/28 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/24 focus:border-white/20"
              />
            </label>

            {statusMessage ? <p className="mt-4 text-sm text-rose-100/78">{statusMessage}</p> : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/[0.08]"
                onClick={closeModal}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-400/16 bg-rose-500/12 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-rose-100 transition-colors hover:bg-rose-500/18 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => void handleDelete()}
                disabled={busy}
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {busy ? 'Deleting Account' : 'Delete Account Forever'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
