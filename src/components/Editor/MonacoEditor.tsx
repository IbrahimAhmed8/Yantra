import Editor, { type Monaco } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import type { editor } from 'monaco-editor';
import { editorOptions, languageToMonaco, resolveMonacoTheme, setupMonaco } from '@/lib/monaco';
import { LANGUAGE_META, type EditorFile, type EditorTheme } from '@/types';

interface MonacoEditorProps {
  file: EditorFile | null;
  theme: EditorTheme;
  onChange: (value: string) => void;
}

export const MonacoEditor = ({ file, theme, onChange }: MonacoEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    if (!monacoRef.current) {
      return;
    }

    monacoRef.current.editor.setTheme(resolveMonacoTheme(theme));
  }, [theme]);

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-black/10">
        <p className="text-sm text-slate-400">Open a file to start editing.</p>
      </div>
    );
  }

  return (
    <Editor
      beforeMount={setupMonaco}
      height="100%"
      keepCurrentModel
      language={languageToMonaco(file.language)}
      loading={
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          Preparing Yantra editor...
        </div>
      }
      onChange={(value) => onChange(value ?? '')}
      onMount={(editorInstance, monaco) => {
        editorRef.current = editorInstance;
        monacoRef.current = monaco;
        monaco.editor.setTheme(resolveMonacoTheme(theme));
        editorInstance.focus();
      }}
      options={editorOptions}
      path={`${file.id}.${LANGUAGE_META[file.language].extension}`}
      saveViewState
      theme={resolveMonacoTheme(theme)}
      value={file.content}
    />
  );
};
