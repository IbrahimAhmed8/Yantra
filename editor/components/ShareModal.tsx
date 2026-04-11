'use client';

import { Check, Copy, Link2, LoaderCircle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ShareModalProps {
  open: boolean;
  isLoading: boolean;
  shareUrl: string;
  error: string | null;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export default function ShareModal({ open, isLoading, shareUrl, error, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.hasAttribute('disabled'));

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(8,8,15,0.72)] px-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[rgba(30,30,56,0.95)] bg-[#1a1a35] shadow-[0_28px_90px_rgba(0,0,0,0.55)]"
      >
        <div className="flex h-11 items-center justify-between border-b border-[rgba(30,30,56,0.95)] bg-[#0d0d18] px-4">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#818cf8]">
            <Link2 className="h-3.5 w-3.5" />
            Share Project
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#11112a] hover:text-[#e2e8f0]"
            onClick={onClose}
            aria-label="Close share modal"
            title="Close share modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <h2 id="share-modal-title" className="text-lg font-semibold text-[#e2e8f0]">
              Create a share link
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">Generate a read-only URL for this editor project.</p>
          </div>

          {isLoading ? (
            <div className="flex min-h-24 items-center justify-center gap-3 rounded-xl border border-[rgba(30,30,56,0.95)] bg-[#08080f] px-4 py-3 text-sm text-[#6b7280]">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Creating your share link...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-sm text-[#f87171]">
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#374151]">
                Shareable URL
              </label>
              <input
                readOnly
                value={shareUrl}
                onFocus={(event) => event.currentTarget.select()}
                className="w-full rounded-xl border border-[rgba(30,30,56,0.95)] bg-[#08080f] px-4 py-3 text-sm text-[#e2e8f0] outline-none focus:border-[#6366f1]"
                aria-label="Shareable URL"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-[#6366f1] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f46e5] hover:shadow-[0_0_12px_rgba(99,102,241,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={async () => {
                    if (!shareUrl) {
                      return;
                    }

                    await navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                  }}
                  disabled={!shareUrl}
                  aria-label={copied ? 'Copied share link' : 'Copy share link'}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
