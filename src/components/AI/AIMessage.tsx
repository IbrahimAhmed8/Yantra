import type { AIMessage as AIChatMessage, EditorTheme } from '@/types';

interface AIMessageProps {
  message: AIChatMessage;
  theme: EditorTheme;
}

const formatTimestamp = (timestamp: Date) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

export const AIMessage = ({ message, theme }: AIMessageProps) => {
  const isUser = message.role === 'user';
  const _theme = theme;

  return (
    <div className={isUser ? 'ml-auto flex w-full max-w-[88%] flex-col items-end' : 'mr-auto flex w-full max-w-[90%] flex-col items-start'}>
      <div
        className={`w-full rounded-md px-4 py-3 text-sm leading-6 ${
          isUser ? 'rounded-br-sm' : 'rounded-bl-sm'
        }`}
        style={{
          background: isUser ? 'var(--yantra-accent)' : 'var(--yantra-active-tab)',
          border: `1px solid ${isUser ? 'var(--yantra-accent)' : 'var(--yantra-border)'}`,
          color: isUser ? '#ffffff' : 'var(--yantra-foreground)',
        }}
      >
        <span className="whitespace-pre-wrap break-words">
          {message.content}
          {message.isStreaming ? <span className="ml-1 inline-block h-4 w-[2px] animate-pulse align-middle bg-current" /> : null}
        </span>
      </div>

      <span className="mt-1 px-1 text-[11px]" style={{ color: 'var(--yantra-muted)' }}>
        {formatTimestamp(message.timestamp)}
      </span>
    </div>
  );
};
