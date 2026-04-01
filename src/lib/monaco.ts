import type { Monaco } from '@monaco-editor/react';
import type { editor, Position } from 'monaco-editor';
import type { EditorTheme, Language } from '@/types';

const YANTRA_THEME_MAP = {
  dark: 'yantra-dark',
  light: 'yantra-light',
} as const;

const LANGUAGE_IDS: Record<Language, string> = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp',
};

const LANGUAGE_SNIPPETS: Record<
  Language,
  Array<{
    label: string;
    insertText: string;
    detail: string;
  }>
> = {
  python: [
    {
      label: 'def',
      insertText: 'def ${1:name}(${2:args}):\n\t${3:pass}',
      detail: 'Python function',
    },
    {
      label: 'class',
      insertText: 'class ${1:Name}:\n\tdef __init__(self, ${2:value}):\n\t\tself.${2:value} = ${2:value}',
      detail: 'Python class',
    },
  ],
  javascript: [
    {
      label: 'function',
      insertText: 'function ${1:name}(${2:params}) {\n\t${3:return null;}\n}',
      detail: 'JavaScript function',
    },
    {
      label: 'async',
      insertText: 'async function ${1:name}(${2:params}) {\n\t${3:return await ${4:task};}\n}',
      detail: 'Async function',
    },
  ],
  java: [
    {
      label: 'main',
      insertText:
        'public static void main(String[] args) {\n\t${1:System.out.println("Hello Yantra");}\n}',
      detail: 'Java main method',
    },
    {
      label: 'class',
      insertText:
        'public class ${1:App} {\n\tprivate final ${2:String} ${3:name};\n\n\tpublic ${1:App}(${2:String} ${3:name}) {\n\t\tthis.${3:name} = ${3:name};\n\t}\n}',
      detail: 'Java class',
    },
  ],
  cpp: [
    {
      label: 'main',
      insertText: 'int main() {\n\t${1:return 0;}\n}',
      detail: 'C++ main function',
    },
    {
      label: 'vector',
      insertText:
        'std::vector<${1:int}> ${2:values} = {${3:1, 2, 3}};\nfor (const auto& value : ${2:values}) {\n\t${4:std::cout << value << std::endl;}\n}',
      detail: 'Vector loop',
    },
  ],
};

let monacoConfigured = false;

const registerSnippetProvider = (monaco: Monaco, language: Language) => {
  monaco.languages.registerCompletionItemProvider(LANGUAGE_IDS[language], {
    provideCompletionItems: (model: editor.ITextModel, position: Position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: LANGUAGE_SNIPPETS[language].map((snippet) => ({
          label: snippet.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: snippet.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: snippet.detail,
          range,
        })),
      };
    },
  });
};

export const resolveMonacoTheme = (theme: EditorTheme) => YANTRA_THEME_MAP[theme];

export const languageToMonaco = (language: Language) => LANGUAGE_IDS[language];

export const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  autoClosingBrackets: 'always',
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace',
  fontLigatures: true,
  fontSize: 14,
  formatOnPaste: true,
  lineHeight: 22,
  minimap: {
    enabled: true,
  },
  mouseWheelZoom: true,
  multiCursorModifier: 'ctrlCmd',
  padding: {
    top: 20,
    bottom: 20,
  },
  quickSuggestions: {
    other: true,
    comments: false,
    strings: true,
  },
  roundedSelection: true,
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  snippetSuggestions: 'top',
  suggestOnTriggerCharacters: true,
  tabCompletion: 'on',
  wordBasedSuggestions: 'currentDocument',
};

export const setupMonaco = (monaco: Monaco) => {
  if (monacoConfigured) {
    return;
  }

  monaco.editor.defineTheme(YANTRA_THEME_MAP.dark, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
      { token: 'string', foreground: '10B981' },
      { token: 'keyword', foreground: '7C3AED', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: '7C3AED', fontStyle: 'bold' },
      { token: 'number', foreground: 'E5E5E5' },
      { token: 'type.identifier', foreground: 'E5E5E5' },
    ],
    colors: {
      'editor.background': '#0D0D0D',
      'editor.foreground': '#E5E5E5',
      'editor.lineHighlightBackground': '#1A1A2E',
      'editorCursor.foreground': '#7C3AED',
      'editorLineNumber.foreground': '#6B7280',
      'editorLineNumber.activeForeground': '#E5E5E5',
      'editor.selectionBackground': '#7C3AED33',
      'editor.selectionHighlightBackground': '#7C3AED1F',
      'editor.inactiveSelectionBackground': '#1F293733',
      'editor.findMatchBackground': '#10B98144',
      'editor.wordHighlightBackground': '#7C3AED1A',
      'editorIndentGuide.background1': '#1F2937',
      'editorIndentGuide.activeBackground1': '#7C3AED55',
    },
  });

  monaco.editor.defineTheme(YANTRA_THEME_MAP.light, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '9CA3AF', fontStyle: 'italic' },
      { token: 'string', foreground: '047857' },
      { token: 'keyword', foreground: '6D28D9', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: '6D28D9', fontStyle: 'bold' },
      { token: 'number', foreground: '111111' },
      { token: 'type.identifier', foreground: '111111' },
    ],
    colors: {
      'editor.background': '#FAFAFA',
      'editor.foreground': '#111111',
      'editor.lineHighlightBackground': '#F4F0FF',
      'editorCursor.foreground': '#6D28D9',
      'editorLineNumber.foreground': '#9CA3AF',
      'editorLineNumber.activeForeground': '#111111',
      'editor.selectionBackground': '#6D28D926',
      'editor.selectionHighlightBackground': '#6D28D914',
      'editor.inactiveSelectionBackground': '#E5E7EB55',
      'editor.findMatchBackground': '#04785726',
      'editor.wordHighlightBackground': '#6D28D910',
      'editorIndentGuide.background1': '#E5E7EB',
      'editorIndentGuide.activeBackground1': '#6D28D944',
    },
  });

  monaco.editor.setTheme(YANTRA_THEME_MAP.dark);

  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    allowJs: true,
    checkJs: true,
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    target: monaco.languages.typescript.ScriptTarget.ES2020,
  });

  registerSnippetProvider(monaco, 'python');
  registerSnippetProvider(monaco, 'javascript');
  registerSnippetProvider(monaco, 'java');
  registerSnippetProvider(monaco, 'cpp');

  monacoConfigured = true;
};
