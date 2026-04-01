import { ChevronDown, ChevronUp, TerminalSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

export const StdinInput = () => {
  const stdin = useEditorStore((state) => state.stdin);
  const setStdin = useEditorStore((state) => state.setStdin);
  const theme = useEditorStore((state) => state.theme);
  const [isExpanded, setIsExpanded] = useState(Boolean(stdin));
  const isDark = theme === 'dark';

  useEffect(() => {
    if (stdin.length > 0) {
      setIsExpanded(true);
    }
  }, [stdin]);

  return (
    <section
      className="rounded-2xl border"
      style={{
        background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.88)',
        borderColor: 'var(--yantra-border)',
      }}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setIsExpanded((value) => !value)}
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--yantra-foreground)' }}>
          <TerminalSquare className="h-4 w-4 text-violet-400" />
          stdin
        </span>
        <span className={`inline-flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
            className={`w-full resize-none rounded-2xl border px-3 py-3 font-mono text-sm outline-none transition ${
              isDark
                ? 'border-white/10 bg-black/30 text-slate-100 placeholder:text-slate-500 focus:border-violet-400/40'
                : 'border-slate-900/10 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-600/35'
            }`}
          />
        </div>
      ) : null}
    </section>
  );
};
