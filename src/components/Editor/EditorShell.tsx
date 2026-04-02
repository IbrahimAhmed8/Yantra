import { AIPanel } from '@/components/AI/AIPanel';
import { MonacoEditor } from '@/components/Editor/MonacoEditor';
import { ConsolePanel } from '@/components/Execution/ConsolePanel';
import { FileSidebar } from '@/components/Sidebar/FileSidebar';
import { useEditorStore } from '@/store/useEditorStore';

interface EditorShellProps {
  isSidebarOpen: boolean;
}

export const EditorShell = ({ isSidebarOpen }: EditorShellProps) => {
  const activeFile = useEditorStore((state) => state.activeFile);
  const theme = useEditorStore((state) => state.theme);
  const updateFileContent = useEditorStore((state) => state.updateFileContent);

  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{
        background: 'var(--yantra-background)',
        color: 'var(--yantra-foreground)',
      }}
    >
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <FileSidebar isOpen={isSidebarOpen} />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div
            className="min-w-0 flex-1 overflow-hidden"
            style={{
              height: '100%',
              minHeight: '60vh',
              background: 'var(--yantra-active-tab)',
            }}
          >
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

          <AIPanel file={activeFile} theme={theme} />
        </div>
      </div>

      <ConsolePanel />
    </section>
  );
};
