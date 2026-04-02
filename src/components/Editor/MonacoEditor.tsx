import Editor, { type Monaco } from '@monaco-editor/react';
import { useEffect, useMemo, useState } from 'react';
import type { editor } from 'monaco-editor';
import { HoverExplain } from '@/components/AI/HoverExplain';
import { InlineErrorFix } from '@/components/AI/InlineErrorFix';
import { editorOptions, languageToMonaco, resolveMonacoTheme, setupMonaco } from '@/lib/monaco';
import { useEditorStore } from '@/store/useEditorStore';
import { LANGUAGE_META, type EditorFile, type EditorTheme } from '@/types';

interface MonacoEditorProps {
  file: EditorFile | null;
  theme: EditorTheme;
  onChange: (value: string) => void;
  readOnly?: boolean;
  showAIEnhancements?: boolean;
}

export const MonacoEditor = ({
  file,
  theme,
  onChange,
  readOnly = false,
  showAIEnhancements = true,
}: MonacoEditorProps) => {
  const executionResult = useEditorStore((state) => state.executionResult);
  const lastExecutedFileId = useEditorStore((state) => state.lastExecutedFileId);
  const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);

  useEffect(() => {
    if (!monacoInstance) {
      return;
    }

    monacoInstance.editor.setTheme(resolveMonacoTheme(theme));
  }, [monacoInstance, theme]);

  const stderr = lastExecutedFileId === file?.id ? executionResult?.stderr ?? '' : '';
  const applyLineFix = useMemo(
    () => (lineNumber: number, replacementLine: string) => {
      if (!file) {
        return;
      }

      const lines = file.content.split('\n');

      if (lineNumber < 1 || lineNumber > lines.length) {
        return;
      }

      lines[lineNumber - 1] = replacementLine;
      onChange(lines.join('\n'));
      editorInstance?.focus();
    },
    [editorInstance, file, onChange],
  );

  if (!file) {
    return (
      <div
        className="flex h-full min-h-[60vh] items-center justify-center border border-dashed"
        style={{
          background: 'var(--yantra-active-tab)',
          borderColor: 'var(--yantra-border)',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--yantra-muted)' }}>
          Open a file to start editing.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[60vh] p-0 m-0" style={{ height: '100%', margin: 0, padding: 0 }}>
      <Editor
        beforeMount={setupMonaco}
        height="100%"
        keepCurrentModel
        language={languageToMonaco(file.language)}
        loading={
          <div className="flex h-full items-center justify-center text-sm" style={{ color: 'var(--yantra-muted)' }}>
            Preparing Yantra editor...
          </div>
        }
        onChange={(value) => onChange(value ?? '')}
        onMount={(nextEditorInstance, monaco) => {
          setEditorInstance(nextEditorInstance);
          setMonacoInstance(monaco);
          monaco.editor.setTheme(resolveMonacoTheme(theme));

          if (!readOnly) {
            nextEditorInstance.focus();
          }
        }}
        options={{
          ...editorOptions,
          readOnly,
        }}
        path={`${file.id}.${LANGUAGE_META[file.language].extension}`}
        saveViewState
        theme={resolveMonacoTheme(theme)}
        value={file.content}
      />

      {showAIEnhancements ? <HoverExplain editor={editorInstance} file={file} theme={theme} /> : null}
      {showAIEnhancements ? (
        <InlineErrorFix
          editor={editorInstance}
          monaco={monacoInstance}
          file={file}
          stderr={stderr}
          theme={theme}
          onApplyFix={applyLineFix}
        />
      ) : null}
    </div>
  );
};
