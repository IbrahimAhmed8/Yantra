import { SendHorizontal, Square } from 'lucide-react';
import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AIMessage } from '@/components/AI/AIMessage';
import type { AIMessage as AIChatMessage, EditorTheme } from '@/types';

interface AIChatInterfaceProps {
  messages: AIChatMessage[];
  theme: EditorTheme;
  draft: string;
  error: string | null;
  isStreaming: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
}

export const AIChatInterface = ({
  messages,
  theme,
  draft,
  error,
  isStreaming,
  onDraftChange,
  onSend,
  onStop,
}: AIChatInterfaceProps) => {
  const endRef = useRef<HTMLDivElement | null>(null);
  const _theme = theme;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isStreaming]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((message) => (
              <AIMessage key={message.id} message={message} theme={theme} />
            ))}
            <div ref={endRef} />
          </div>
        ) : (
          <div
            className="flex h-full min-h-[220px] items-center justify-center rounded-md border border-dashed px-6 text-center text-sm leading-6"
            style={{
              background: 'var(--yantra-active-tab)',
              borderColor: 'var(--yantra-border)',
              color: 'var(--yantra-muted)',
            }}
          >
            Ask for a hint, request a review, or type your own question about the active file.
          </div>
        )}
      </div>

      <div
        className="border-t px-4 py-4"
        style={{
          background: 'var(--yantra-sidebar)',
          borderColor: 'var(--yantra-border)',
        }}
      >
        {error ? (
          <div
            className="mb-3 rounded-md border px-3 py-2 text-xs leading-5"
            style={{
              background: 'rgba(244, 71, 71, 0.12)',
              borderColor: 'rgba(244, 71, 71, 0.35)',
              color: 'var(--yantra-error)',
            }}
          >
            {error}
          </div>
        ) : null}

        <div
          className="rounded-md border px-3 py-3"
          style={{
            background: 'var(--yantra-tab-bar)',
            borderColor: 'var(--yantra-border)',
          }}
        >
          <textarea
            rows={2}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI..."
            className="w-full resize-none bg-transparent text-sm leading-6 outline-none"
            style={{
              color: 'var(--yantra-foreground)',
            }}
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[11px]" style={{ color: 'var(--yantra-muted)' }}>
              Enter to send, Shift+Enter for a new line.
            </p>

            <div className="flex items-center gap-2">
              {isStreaming ? (
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition hover:bg-white/5"
                  style={{
                    background: 'var(--yantra-active-tab)',
                    borderColor: 'var(--yantra-border)',
                    color: 'var(--yantra-foreground)',
                  }}
                  onClick={onStop}
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  Stop
                </button>
              ) : null}

              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: 'var(--yantra-accent)',
                  borderColor: 'var(--yantra-accent)',
                  color: '#ffffff',
                }}
                onClick={onSend}
                disabled={draft.trim().length === 0 || isStreaming}
                aria-label="Send AI message"
                title="Send AI message"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
