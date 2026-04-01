import { X } from 'lucide-react';
import { LANGUAGE_META, type EditorTab, type EditorTheme } from '@/types';

interface TabBarProps {
  activeTabId: string | null;
  tabs: EditorTab[];
  theme: EditorTheme;
  onClose: (tabId: string) => void;
  onSelect: (tabId: string) => void;
}

export const TabBar = ({ activeTabId, tabs, theme, onClose, onSelect }: TabBarProps) => {
  const canCloseTabs = tabs.length > 1;
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-3 py-3">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const languageMeta = LANGUAGE_META[tab.language];

        return (
          <div
            key={tab.id}
            className={`group flex min-w-[190px] max-w-[260px] items-center gap-3 rounded-2xl border px-3 py-2 transition-all ${
              isActive
                ? isDark
                  ? 'border-violet-500/70 bg-violet-500/15 text-white shadow-[0_10px_40px_rgba(124,58,237,0.16)]'
                  : 'border-violet-600/40 bg-violet-600/10 text-slate-950 shadow-[0_10px_40px_rgba(109,40,217,0.10)]'
                : isDark
                  ? 'border-white/10 bg-white/5 text-slate-300 hover:border-white/15 hover:bg-white/10'
                  : 'border-slate-900/10 bg-white/75 text-slate-700 hover:border-slate-900/15 hover:bg-white'
            }`}
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
              onClick={() => onSelect(tab.id)}
            >
              <span
                className={`inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg border px-1.5 font-mono text-[0.62rem] font-bold uppercase ${
                  isDark
                    ? 'border-white/10 bg-black/40 text-emerald-300'
                    : 'border-slate-900/10 bg-slate-100 text-violet-700'
                }`}
              >
                {languageMeta.icon}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{tab.name}</span>
                <span className={`block truncate text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {languageMeta.label}
                </span>
              </span>

              {tab.isDirty ? (
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    isDark ? 'bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.65)]' : 'bg-emerald-600'
                  }`}
                  aria-label="Unsaved changes"
                  title="Unsaved changes"
                />
              ) : null}
            </button>

            <button
              type="button"
              className={`shrink-0 rounded-full p-1.5 transition ${
                canCloseTabs
                  ? isDark
                    ? 'text-slate-400 hover:bg-white/10 hover:text-white'
                    : 'text-slate-500 hover:bg-slate-900/5 hover:text-slate-950'
                  : 'cursor-not-allowed text-slate-500/50'
              }`}
              disabled={!canCloseTabs}
              onClick={() => onClose(tab.id)}
              aria-label={canCloseTabs ? `Close ${tab.name}` : 'At least one tab must remain open'}
              title={canCloseTabs ? `Close ${tab.name}` : 'At least one tab must remain open'}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
