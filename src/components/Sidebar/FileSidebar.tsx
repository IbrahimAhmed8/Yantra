import { useEditorStore } from '@/store/useEditorStore';

interface FileSidebarProps {
  isOpen: boolean;
}

const SIDEBAR_WIDTH = 220;

const LANGUAGE_BADGES = {
  python: {
    label: 'PY',
    background: '#3572A5',
    color: '#ffffff',
  },
  javascript: {
    label: 'JS',
    background: '#F7DF1E',
    color: '#000000',
  },
  java: {
    label: 'JV',
    background: '#E76F00',
    color: '#ffffff',
  },
  cpp: {
    label: 'C+',
    background: '#659AD2',
    color: '#ffffff',
  },
} as const;

export const FileSidebar = ({ isOpen }: FileSidebarProps) => {
  const activeFileId = useEditorStore((state) => state.activeFile?.id ?? null);
  const openTabs = useEditorStore((state) => state.openTabs);
  const setActiveFile = useEditorStore((state) => state.setActiveFile);

  return (
    <div
      className="relative shrink-0 overflow-hidden border-r"
      style={{
        width: isOpen ? SIDEBAR_WIDTH : 0,
        background: '#252526',
        borderColor: isOpen ? 'var(--yantra-border)' : 'transparent',
        transition: 'width 200ms ease',
      }}
    >
      <aside
        className="absolute inset-y-0 left-0 flex h-full w-[220px] flex-col"
        style={{
          background: '#252526',
          transform: isOpen ? 'translateX(0)' : 'translateX(-12px)',
          opacity: isOpen ? 1 : 0,
          transition: 'transform 200ms ease, opacity 200ms ease',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        <div
          className="border-b px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.18em]"
          style={{
            color: '#858585',
            borderColor: 'var(--yantra-border)',
          }}
        >
          EXPLORER
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          {openTabs.map((tab) => {
            const badge = LANGUAGE_BADGES[tab.language];
            const isActive = tab.id === activeFileId;

            return (
              <button
                key={tab.id}
                type="button"
                className="flex h-9 w-full items-center gap-3 border-l-2 px-4 text-left text-sm transition"
                style={{
                  background: isActive ? '#37373d' : 'transparent',
                  borderLeftColor: isActive ? '#7C3AED' : 'transparent',
                  color: isActive ? 'var(--yantra-foreground)' : '#d4d4d4',
                }}
                onClick={() => setActiveFile(tab.id)}
              >
                <span
                  className="inline-flex h-5 min-w-5 items-center justify-center rounded text-[10px] font-bold uppercase"
                  style={{
                    background: badge.background,
                    color: badge.color,
                  }}
                >
                  {badge.label}
                </span>
                <span className="min-w-0 flex-1 truncate">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
};
