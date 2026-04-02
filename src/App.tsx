import { MoonStar, SunMedium } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EditorShell } from '@/components/Editor/EditorShell';
import { TabBar } from '@/components/Editor/TabBar';
import { RunButton } from '@/components/Execution/RunButton';
import { StatusBar } from '@/components/StatusBar';
import { useEditorStore } from '@/store/useEditorStore';

const SIDEBAR_TOGGLE_GLYPH = String.fromCharCode(0x25a3);
const AI_BUTTON_GLYPH = String.fromCharCode(0x2726);

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const activeFile = useEditorStore((state) => state.activeFile);
  const openTabs = useEditorStore((state) => state.openTabs);
  const theme = useEditorStore((state) => state.theme);
  const toggleTheme = useEditorStore((state) => state.toggleTheme);
  const aiPanelOpen = useEditorStore((state) => state.aiPanel.open);
  const toggleAIPanel = useEditorStore((state) => state.toggleAIPanel);
  const challengeCompletion = useEditorStore((state) => state.challengeCompletion);
  const hideChallengeCompletion = useEditorStore((state) => state.hideChallengeCompletion);
  const closeTab = useEditorStore((state) => state.closeTab);
  const setActiveFile = useEditorStore((state) => state.setActiveFile);
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.editorTheme = theme;
    document.documentElement.dataset.theme = theme;

    return () => {
      delete document.documentElement.dataset.editorTheme;
      delete document.documentElement.dataset.theme;
    };
  }, [theme]);

  useEffect(() => {
    if (!challengeCompletion.visible) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      hideChallengeCompletion();
    }, 4200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [challengeCompletion.visible, hideChallengeCompletion]);

  return (
    <div
      className="flex min-h-screen flex-col overflow-hidden"
      style={{
        height: '100dvh',
        background: 'var(--yantra-background)',
        color: 'var(--yantra-foreground)',
      }}
    >
      <header
        className="flex h-10 shrink-0 items-stretch border-b"
        style={{
          background: '#2d2d2d',
          borderColor: 'var(--yantra-border)',
        }}
      >
        <div className="flex shrink-0 items-center gap-2 px-3">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold transition hover:bg-[#3a3a3a]"
            style={{
              color: '#d4d4d4',
            }}
            onClick={() => setIsSidebarOpen((value) => !value)}
            aria-label={isSidebarOpen ? 'Collapse file explorer' : 'Open file explorer'}
            title={isSidebarOpen ? 'Collapse file explorer' : 'Open file explorer'}
          >
            {SIDEBAR_TOGGLE_GLYPH}
          </button>

          <div className="text-sm font-bold tracking-tight text-white">Yantra</div>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <TabBar
            activeTabId={activeFile?.id ?? null}
            onClose={closeTab}
            onSelect={setActiveFile}
            tabs={openTabs}
            theme={theme}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2 px-3">
          <RunButton />

          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition hover:bg-[rgba(124,58,237,0.12)]"
            style={{
              background: 'transparent',
              borderColor: '#7C3AED',
              color: '#c4b5fd',
            }}
            onClick={toggleAIPanel}
            aria-label={aiPanelOpen ? 'Close AI panel' : 'Open AI panel'}
            title={aiPanelOpen ? 'Close AI panel' : 'Open AI panel'}
          >
            <span aria-hidden="true">{AI_BUTTON_GLYPH}</span>
            <span>AI</span>
          </button>

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition hover:bg-[#3a3a3a]"
            style={{
              color: '#d4d4d4',
            }}
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          >
            {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-row overflow-hidden">
        <EditorShell isSidebarOpen={isSidebarOpen} />
      </main>

      <StatusBar />
    </div>
  );
}
