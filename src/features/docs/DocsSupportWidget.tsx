'use client';

import Link from 'next/link';
import { ArrowUpRight, Expand, LifeBuoy, Minimize2, SendHorizontal, ShieldQuestion, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import DeferredChatMessageContent from '@/src/features/chat/DeferredChatMessageContent';
import { useOverlayLock } from '@/src/features/motion/ExperienceProvider';
import { getDocsArticleHref } from './docs-content';
import {
  docsSupportAssistantName,
  docsSupportQuickPrompts,
  docsSupportWelcomeMessage,
  type DocsSupportMessage,
} from './docs-support';

type DocsSupportWidgetProps = {
  activeSlug?: string | null;
};

type DocsSupportSource = {
  slug: string;
  title: string;
};

function assistantMessage(content: string): DocsSupportMessage {
  return { role: 'assistant', content };
}

export default function DocsSupportWidget({ activeSlug = null }: DocsSupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<DocsSupportMessage[]>([assistantMessage(docsSupportWelcomeMessage)]);
  const [sources, setSources] = useState<DocsSupportSource[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useOverlayLock('docs-support-widget', isOpen && isExpanded);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [isOpen, isSending, messages]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isExpanded) {
          setIsExpanded(false);
          return;
        }

        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isExpanded]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  async function sendMessage(rawMessage: string) {
    const content = rawMessage.trim();

    if (!content || isSending) {
      return;
    }

    const nextMessages = [...messages, { role: 'user', content } satisfies DocsSupportMessage];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setSources([]);
    setIsSending(true);

    try {
      const response = await fetch('/api/docs-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({
          messages: nextMessages,
          activeSlug,
        }),
      });

      const data = (await response.json()) as { error?: string; reply?: string; sources?: DocsSupportSource[] };

      const reply = data.reply?.trim();

      if (!response.ok || !reply) {
        throw new Error(data.error || 'Support Desk could not respond right now.');
      }

      setMessages((current) => [...current, assistantMessage(reply)]);
      setSources(Array.isArray(data.sources) ? data.sources : []);
    } catch (sendError) {
      setError(
        sendError instanceof Error ? sendError.message : 'Support Desk is unavailable right now. Please try again shortly.',
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <>
            {isExpanded ? (
              <motion.button
                type="button"
                aria-label="Close expanded support view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsExpanded(false)}
                className="fixed inset-0 z-[74] bg-black/72 backdrop-blur-md"
              />
            ) : null}

            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={
                isExpanded
                  ? 'fixed inset-0 z-[75] flex items-center justify-center p-4 md:p-6'
                  : 'fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-[75] top-24 md:inset-x-auto md:right-6 md:top-auto'
              }
            >
              <div
                className={`flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-black/92 shadow-[0_28px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl ${
                  isExpanded
                    ? 'h-full max-h-[82vh] w-full max-w-5xl'
                    : 'h-full md:h-[min(72vh,44rem)] md:w-[30rem] lg:w-[32rem]'
                }`}
                onClick={(event) => event.stopPropagation()}
              >
              <div className="border-b border-white/10 px-5 py-5 md:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white">
                      <ShieldQuestion size={18} />
                    </span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Customer Care AI</p>
                      <p className="mt-1 text-base font-semibold tracking-tight text-white">{docsSupportAssistantName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsExpanded((current) => !current)}
                      className="rounded-full border border-white/10 p-2 text-white/60 transition-colors hover:border-white/20 hover:text-white"
                      aria-label={isExpanded ? 'Collapse support assistant' : 'Expand support assistant'}
                    >
                      {isExpanded ? <Minimize2 size={16} /> : <Expand size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsExpanded(false);
                        setIsOpen(false);
                      }}
                      className="rounded-full border border-white/10 p-2 text-white/60 transition-colors hover:border-white/20 hover:text-white"
                      aria-label="Close support assistant"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <p className="mt-4 max-w-[34rem] text-sm leading-relaxed text-white/56 md:text-[0.96rem]">
                  Ask about the dashboard, local profile behavior, editor flow, chat questions, or anything covered in the docs.
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
                <div className="space-y-5">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={message.role === 'user' ? 'ml-auto max-w-[88%]' : 'max-w-[92%]'}
                    >
                      <div
                        className={
                          message.role === 'user'
                            ? 'rounded-[1.8rem] rounded-br-md bg-white px-4 py-3.5 text-[15px] leading-relaxed text-black md:px-5 md:py-4'
                            : 'rounded-[1.8rem] rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[15px] leading-relaxed text-white md:px-5 md:py-4'
                        }
                      >
                        <DeferredChatMessageContent content={message.content} variant={message.role === 'user' ? 'user' : 'assistant'} />
                      </div>
                    </div>
                  ))}

                  {messages.length === 1 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {docsSupportQuickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => void sendMessage(prompt)}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70 transition-colors hover:border-white/20 hover:text-white md:px-4"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {isSending ? (
                    <div className="max-w-[92%]">
                      <div className="inline-flex items-center gap-2 rounded-[1.8rem] rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white/64 md:px-5 md:py-4">
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em]">Searching docs</span>
                        <div className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50" />
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40 [animation-delay:0.2s]" />
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30 [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {error ? (
                    <div className="rounded-[1.5rem] border border-red-400/20 bg-red-500/10 px-4 py-3.5 text-sm text-red-100">
                      {error}
                    </div>
                  ) : null}

                  {sources.length > 0 ? (
                    <div className="rounded-[1.5rem] border border-white/8 bg-black/24 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">Relevant guides</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {sources.map((source) => (
                          <Link
                            key={source.slug}
                            href={getDocsArticleHref(source.slug)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/8 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/64 transition-colors hover:border-white/18 hover:text-white"
                          >
                            {source.title}
                            <ArrowUpRight size={12} />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div ref={endRef} />
                </div>
              </div>

              <form
                className="border-t border-white/10 p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendMessage(input);
                }}
              >
                <div className="flex items-center gap-3 rounded-[1.6rem] border border-white/10 bg-white/[0.03] px-4 py-2.5 md:px-4 md:py-2.5">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Ask about docs, dashboard, profile, editor, or problems..."
                    className="min-h-[1.35rem] max-h-24 flex-1 resize-none border-0 bg-transparent text-[14px] leading-6 text-white outline-none placeholder:text-white/30 focus:outline-none focus-visible:outline-none md:text-[15px]"
                  />

                  <button
                    type="submit"
                    disabled={isSending || input.trim().length === 0}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition-colors disabled:cursor-not-allowed disabled:bg-white/14 disabled:text-white/30 md:h-11 md:w-11"
                    aria-label="Send support question"
                  >
                    <SendHorizontal size={15} />
                  </button>
                </div>
              </form>
            </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      {!isOpen ? (
        <motion.button
          type="button"
          onClick={() => {
            setError(null);
            setIsOpen(true);
          }}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-[72] flex items-center gap-3 rounded-full border border-white/10 bg-black/84 px-5 py-3 text-white shadow-[0_20px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl md:bottom-6 md:right-6"
        >
          <span className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute h-3 w-3 animate-ping rounded-full bg-white/28" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em]">Ask Support</span>
          <LifeBuoy size={15} />
        </motion.button>
      ) : null}
    </>
  );
}
