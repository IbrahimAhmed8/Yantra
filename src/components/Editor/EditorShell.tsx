import { MonacoEditor } from '@/components/Editor/MonacoEditor';
import { TabBar } from '@/components/Editor/TabBar';
import { ConsolePanel } from '@/components/Execution/ConsolePanel';
import { useEditorStore } from '@/store/useEditorStore';

export const EditorShell = () => {
  const activeFile = useEditorStore((state) => state.activeFile);
  const openTabs = useEditorStore((state) => state.openTabs);
  const theme = useEditorStore((state) => state.theme);
  const executionStatus = useEditorStore((state) => state.executionStatus);
  const closeTab = useEditorStore((state) => state.closeTab);
  const setActiveFile = useEditorStore((state) => state.setActiveFile);
  const updateFileContent = useEditorStore((state) => state.updateFileContent);

  const activeTab = openTabs.find((tab) => tab.id === activeFile?.id) ?? null;
  const lineCount = activeFile?.content.split('\n').length ?? 1;
  const characterCount = activeFile?.content.length ?? 0;
  const isDark = theme === 'dark';

  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border"
      style={{
        background: 'var(--yantra-panel)',
        borderColor: 'var(--yantra-border)',
        boxShadow: '0 24px 80px var(--yantra-shadow)',
      }}
    >
      <div className="border-b" style={{ borderColor: 'var(--yantra-border)' }}>
        <TabBar
          activeTabId={activeFile?.id ?? null}
          onClose={closeTab}
          onSelect={setActiveFile}
          tabs={openTabs}
          theme={theme}
        />
      </div>

      <div className="min-h-0 flex-1">
        <MonacoEditor
          file={activeFile}
          onChange={(value) => {
            if (!activeFile) {
              return;
            }

            updateFileContent(activeFile.id, value);
          }}
          theme={theme}
        />
      </div>

      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}
        style={{ borderColor: 'var(--yantra-border)' }}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold" style={{ color: 'var(--yantra-foreground)' }}>
            {activeFile?.name ?? 'No file selected'}
          </span>
          <span>{activeFile?.language ?? 'editor'}</span>
          {executionStatus === 'running' ? (
            <span className={isDark ? 'text-violet-300' : 'text-violet-700'}>Execution in progress...</span>
          ) : activeTab?.isDirty ? (
            <span className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>Unsaved changes</span>
          ) : (
            <span>Ready to run with Ctrl/Cmd + Enter</span>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span>{openTabs.length} tabs</span>
          <span>{lineCount} lines</span>
          <span>{characterCount} chars</span>
        </div>
      </div>

      <ConsolePanel />
    </section>
  );
};
