'use client';

import { MessageSquare, SendHorizontal, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { useOverlayLock } from '@/src/features/motion/ExperienceProvider';
import {
  MAX_PERSISTED_CHAT_MESSAGES,
  normalizeYantraChatMessages,
  yantraQuickPrompts,
  yantraWelcomeMessage,
  type YantraChatMessage,
} from '@/src/features/chat/yantra-chat';
import DeferredChatMessageContent from '@/src/features/chat/DeferredChatMessageContent';

type OpenChatOptions = {
  draft?: string;
  message?: string;
};

type ChatWidgetContextValue = {
  isOpen: boolean;
  isSending: boolean;
  openChat: (options?: OpenChatOptions) => void;
  closeChat: () => void;
};

type ChatWidgetStateContextValue = Pick<ChatWidgetContextValue, 'isOpen' | 'isSending'>;
type ChatWidgetActionsContextValue = Pick<ChatWidgetContextValue, 'openChat' | 'closeChat'>;

type ChatPanelProps = {
  isOpen: boolean;
  isSending: boolean;
  showLauncher: boolean;
  input: string;
  error: string | null;
  messages: YantraChatMessage[];
  inputRef: RefObject<HTMLTextAreaElement | null>;
  endRef: RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onOpen: () => void;
  onClose: () => void;
  onSend: (message: string) => void;
};

const ChatWidgetStateContext = createContext<ChatWidgetStateContextValue | null>(null);
const ChatWidgetActionsContext = createContext<ChatWidgetActionsContextValue | null>(null);

function assistantMessage(content: string): YantraChatMessage {
  return { role: 'assistant', content };
}

function buildDefaultMessages() {
  return [assistantMessage(yantraWelcomeMessage)];
}

function ChatPanel({
  isOpen,
  isSending,
  showLauncher,
  input,
  error,
  messages,
  inputRef,
  endRef,
  onInputChange,
  onOpen,
  onClose,
  onSend,
}: ChatPanelProps) {
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend(input);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-lenis-prevent
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-6 backdrop-blur-md md:items-center md:px-8 md:py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
          >
            <motion.div
              className="relative grid h-[min(100dvh-1rem,48rem)] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-black/92 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl md:h-[min(86vh,48rem)] md:rounded-[32px] md:grid-cols-[18rem_minmax(0,1fr)]"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative flex flex-col border-b border-white/10 bg-white/[0.03] p-4 sm:p-5 md:border-b-0 md:border-r md:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white">
                    <Sparkles size={17} />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">AI Teacher</div>
                    <div className="text-base font-medium text-white">Yantra</div>
                  </div>
                </div>

                <div className="mt-6 hidden flex-1 flex-col md:flex">
                  <div className="max-w-[14rem] text-sm leading-relaxed text-white/80">
                    Ask about AI, computer science, learning paths, or how Yantra can help someone get started.
                  </div>

                  <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">
                    Quick Starts
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    {yantraQuickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white hoverable"
                        onClick={() => onSend(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <div className="mt-auto pt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
                    AI, computer science, and guided learning support.
                  </div>
                </div>

                <button
                  type="button"
                  className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/20 hover:text-white hoverable md:right-5 md:top-5"
                  onClick={onClose}
                  aria-label="Close chat"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex min-h-0 flex-col">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5 md:px-6">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">Conversation</div>
                    <div className="mt-1 text-sm text-white/75">Learn with Yantra in a larger focused space.</div>
                  </div>

                  <div className="hidden font-mono text-[10px] uppercase tracking-[0.24em] text-white/35 md:block">
                    Press Esc to close
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35 md:hidden">
                    Tap outside to close
                  </div>
                </div>

                <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 md:px-6 md:py-5">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={`${message.role}-${index}`}
                        className={message.role === 'user' ? 'ml-auto max-w-[85%]' : 'max-w-[88%]'}
                      >
                        <div
                          className={
                            message.role === 'user'
                              ? 'rounded-3xl rounded-br-md bg-white px-4 py-3 text-sm leading-relaxed text-black md:px-5 md:py-4'
                              : 'rounded-3xl rounded-bl-md border border-white/10 bg-white/[0.05] px-4 py-3 text-sm leading-relaxed text-white/88 md:px-5 md:py-4'
                          }
                        >
                          <DeferredChatMessageContent content={message.content} variant={message.role} />
                        </div>
                      </div>
                    ))}

                    {messages.length === 1 && (
                      <div className="flex flex-wrap gap-2 pt-2 md:hidden">
                        {yantraQuickPrompts.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white hoverable"
                            onClick={() => onSend(prompt)}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}

                    {isSending && (
                      <div className="max-w-[88%]">
                        <div className="inline-flex items-center gap-2 rounded-3xl rounded-bl-md border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/65 md:px-5 md:py-4">
                          <span className="font-mono text-[10px] uppercase tracking-[0.24em]">Yantra</span>
                          <div className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-pulse" />
                            <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse [animation-delay:0.2s]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-white/30 animate-pulse [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 md:px-5 md:py-4">
                        {error}
                      </div>
                    )}

                    <div ref={endRef} />
                  </div>
                </div>

                <form
                  className="border-t border-white/10 p-4 sm:p-5 md:p-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    onSend(input);
                  }}
                >
                  <div className="flex items-end gap-3 rounded-[26px] border border-white/10 bg-white/[0.03] px-3 py-3 md:px-4 md:py-4">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(event) => onInputChange(event.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      placeholder="Ask Yantra anything..."
                      className="min-h-6 max-h-32 flex-1 resize-none bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-white/30"
                    />

                    <button
                      type="submit"
                      disabled={isSending || input.trim().length === 0}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black transition-all duration-300 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/35 hoverable md:h-12 md:w-12"
                      aria-label="Send message"
                    >
                      <SendHorizontal size={16} />
                    </button>
                  </div>

                  <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-white/35 md:hidden">
                    AI, computer science, and guided learning support.
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && showLauncher && (
        <motion.button
          type="button"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-[70] flex min-h-11 items-center gap-3 rounded-full border border-white/10 bg-black/80 px-4 py-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl hoverable sm:px-5 md:bottom-6 md:right-6"
          onClick={onOpen}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute h-3 w-3 rounded-full bg-white/35 animate-ping" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] sm:hidden">Chat</span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.24em] sm:inline">Chat With Yantra</span>
          <MessageSquare size={15} />
        </motion.button>
      )}
    </>
  );
}

export function ChatProvider({
  children,
  showLauncher = true,
}: {
  children: ReactNode;
  showLauncher?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<YantraChatMessage[]>(buildDefaultMessages);
  const messagesRef = useRef(messages);
  const isSendingRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const historyStateRef = useRef<'idle' | 'loading' | 'loaded' | 'unavailable'>('idle');
  const historyPromiseRef = useRef<Promise<YantraChatMessage[]> | null>(null);

  useOverlayLock('chat-widget', isOpen);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isSendingRef.current = isSending;
  }, [isSending]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void ensureHistoryLoaded();
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const commitMessages = useCallback((nextMessages: YantraChatMessage[]) => {
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
  }, []);

  const ensureHistoryLoaded = useCallback(async () => {
    if (historyStateRef.current === 'loaded' || historyStateRef.current === 'unavailable') {
      return messagesRef.current;
    }

    if (historyPromiseRef.current) {
      return historyPromiseRef.current;
    }

    historyStateRef.current = 'loading';
    historyPromiseRef.current = (async () => {
      try {
        const response = await fetch('/api/chat/history', {
          cache: 'no-store',
        });

        if (response.status === 401) {
          historyStateRef.current = 'unavailable';
          return messagesRef.current;
        }

        if (!response.ok) {
          historyStateRef.current = 'unavailable';
          return messagesRef.current;
        }

        const data = (await response.json()) as { messages?: YantraChatMessage[] };
        const persistedMessages = normalizeYantraChatMessages(data.messages, MAX_PERSISTED_CHAT_MESSAGES);
        historyStateRef.current = 'loaded';

        if (persistedMessages.length > 0) {
          commitMessages(persistedMessages);
          return persistedMessages;
        }

        return messagesRef.current;
      } catch {
        historyStateRef.current = 'unavailable';
        return messagesRef.current;
      } finally {
        historyPromiseRef.current = null;
      }
    })();

    return historyPromiseRef.current;
  }, [commitMessages]);

  const sendMessage = useCallback(
    async (rawMessage: string) => {
      const content = rawMessage.trim();

      if (!content || isSendingRef.current) {
        return;
      }

      const baseMessages = await ensureHistoryLoaded();
      const nextMessages = normalizeYantraChatMessages(
        [...baseMessages, { role: 'user', content }],
        MAX_PERSISTED_CHAT_MESSAGES,
      );

      commitMessages(nextMessages);
      setInput('');
      setError(null);
      setIsOpen(true);
      isSendingRef.current = true;
      setIsSending(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
          body: JSON.stringify({ messages: nextMessages }),
        });

        const data = (await response.json()) as { error?: string; reply?: string };

        if (!response.ok || !data.reply) {
          throw new Error(data.error || 'Yantra could not respond right now.');
        }

        const updatedMessages = normalizeYantraChatMessages(
          [...nextMessages, assistantMessage(data.reply.trim())],
          MAX_PERSISTED_CHAT_MESSAGES,
        );
        commitMessages(updatedMessages);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Yantra is unavailable right now. Please try again shortly.';
        setError(message);
      } finally {
        isSendingRef.current = false;
        setIsSending(false);
      }
    },
    [commitMessages, ensureHistoryLoaded],
  );

  const openChat = useCallback(
    (options?: OpenChatOptions) => {
      setIsOpen(true);
      setError(null);

      if (typeof options?.draft === 'string') {
        setInput(options.draft);
      }

      if (options?.message) {
        void sendMessage(options.message);
      }
    },
    [sendMessage],
  );

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const stateValue = useMemo(
    () => ({
      isOpen,
      isSending,
    }),
    [isOpen, isSending],
  );
  const actionsValue = useMemo(
    () => ({
      openChat,
      closeChat,
    }),
    [closeChat, openChat],
  );

  return (
    <ChatWidgetActionsContext.Provider value={actionsValue}>
      <ChatWidgetStateContext.Provider value={stateValue}>
        {children}
        <ChatPanel
          isOpen={isOpen}
          isSending={isSending}
          showLauncher={showLauncher}
          input={input}
          error={error}
          messages={messages}
          inputRef={inputRef}
          endRef={endRef}
          onInputChange={setInput}
          onOpen={() => setIsOpen(true)}
          onClose={closeChat}
          onSend={(message) => void sendMessage(message)}
        />
      </ChatWidgetStateContext.Provider>
    </ChatWidgetActionsContext.Provider>
  );
}

export function useChatWidgetState() {
  const context = useContext(ChatWidgetStateContext);

  if (!context) {
    throw new Error('useChatWidgetState must be used inside ChatProvider.');
  }

  return context;
}

export function useChatWidgetActions() {
  const context = useContext(ChatWidgetActionsContext);

  if (!context) {
    throw new Error('useChatWidgetActions must be used inside ChatProvider.');
  }

  return context;
}

export function useChatWidget() {
  const state = useContext(ChatWidgetStateContext);
  const actions = useContext(ChatWidgetActionsContext);

  if (!state || !actions) {
    throw new Error('useChatWidget must be used inside ChatProvider.');
  }

  return {
    ...state,
    ...actions,
  };
}
