import { ChevronDown, ChevronUp, TerminalSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

export const StdinInput = () => {
  const stdin = useEditorStore((state) => state.stdin);
  const setStdin = useEditorStore((state) => state.setStdin);
  const theme = useEditorStore((state) => state.theme);
  const [isExpanded, setIsExpanded] = useState(Boolean(stdin));
  const _theme = theme;

  useEffect(() => {
    if (stdin.length > 0) {
      setIsExpanded(true);
    }
  }, [stdin]);

  return (
    <section
      className="rounded-md border"
      style={{
        background: 'var(--yantra-sidebar)',
        borderColor: 'var(--yantra-border)',
      }}
    >
      <button type="button" className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => setIsExpanded((value) => !value)}>
        <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--yantra-foreground)' }}>
          <TerminalSquare className="h-4 w-4" style={{ color: 'var(--yantra-accent)' }} />
          stdin
        </span>
        <span className="inline-flex items-center gap-2 text-xs" style={{ color: 'var(--yantra-muted)' }}>
          {stdin.length > 0 ? `${stdin.length} chars` : 'Optional input'}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {isExpanded ? (
        <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: 'var(--yantra-border)' }}>
          <textarea
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            rows={3}
            placeholder="Optional stdin..."
            className="w-full resize-none rounded-md border px-3 py-3 font-mono text-sm outline-none transition"
            style={{
              background: 'var(--yantra-active-tab)',
              borderColor: 'var(--yantra-border)',
              color: 'var(--yantra-foreground)',
            }}
          />
        </div>
      ) : null}
    </section>
  );
};
