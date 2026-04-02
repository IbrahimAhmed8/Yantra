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
  const _theme = theme;

  return (
    <div className="flex h-10 items-stretch overflow-x-auto" style={{ background: '#2d2d2d' }}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const languageMeta = LANGUAGE_META[tab.language];

        return (
          <div
            key={tab.id}
            className={`group relative flex h-10 min-w-[180px] max-w-[240px] shrink-0 items-center border-r ${
              isActive ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-[#858585] hover:bg-[#2a2a2a] hover:text-[#cccccc]'
            }`}
            style={{
              borderColor: '#252526',
            }}
          >
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
              style={{ background: isActive ? '#7C3AED' : 'transparent' }}
            />

            <button
              type="button"
              className="flex h-full min-w-0 flex-1 items-center gap-2 px-3 text-left text-sm"
              onClick={() => onSelect(tab.id)}
            >
              <span
                className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-sm border px-1 font-mono text-[0.55rem] font-bold uppercase"
                style={{
                  background: '#252526',
                  borderColor: '#3c3c3c',
                  color: isActive ? '#ffffff' : '#cccccc',
                }}
              >
                {languageMeta.icon}
              </span>

              <span className="min-w-0 flex-1 truncate">{tab.name}</span>
            </button>

            <button
              type="button"
              className="mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-0"
              style={{
                color: isActive ? '#ffffff' : '#cccccc',
              }}
              disabled={!canCloseTabs}
              onClick={() => onClose(tab.id)}
              aria-label={canCloseTabs ? `Close ${tab.name}` : 'At least one tab must remain open'}
              title={canCloseTabs ? `Close ${tab.name}` : 'At least one tab must remain open'}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
