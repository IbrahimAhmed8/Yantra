import type { Monaco } from '@monaco-editor/react';
import type { editor, Position } from 'monaco-editor';
import type { EditorTheme } from '@/types';

export type MonacoLanguage =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'cpp'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'plaintext';

const YANTRA_THEME_MAP = {
  dark: 'yantra-dark',
  light: 'yantra-light',
} as const;

const LANGUAGE_IDS: Record<MonacoLanguage, string> = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  java: 'java',
  cpp: 'cpp',
  html: 'html',
  css: 'css',
  json: 'json',
  markdown: 'markdown',
  plaintext: 'plaintext',
};

const LANGUAGE_SNIPPETS: Partial<Record<
  MonacoLanguage,
  Array<{
    label: string;
    insertText: string;
    detail: string;
  }>
>> = {
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
  typescript: [
    {
      label: 'function',
      insertText: 'function ${1:name}(${2:param}: ${3:string}): ${4:void} {\n\t${5:// code}\n}',
      detail: 'TypeScript function',
    },
    {
      label: 'interface',
      insertText: 'interface ${1:Name} {\n\t${2:key}: ${3:string};\n}',
      detail: 'TypeScript interface',
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
  html: [
    {
      label: 'section',
      insertText: '<section class="${1:section}">\n\t<h2>${2:Title}</h2>\n\t<p>${3:Content}</p>\n</section>',
      detail: 'HTML section',
    },
    {
      label: 'button',
      insertText: '<button type="button">${1:Click me}</button>',
      detail: 'HTML button',
    },
  ],
  css: [
    {
      label: 'center-grid',
      insertText: 'display: grid;\nplace-items: center;',
      detail: 'Center content with CSS grid',
    },
    {
      label: 'flex-center',
      insertText: 'display: flex;\nalign-items: center;\njustify-content: center;',
      detail: 'Center content with flexbox',
    },
  ],
  json: [
    {
      label: 'object',
      insertText: '{\n\t"${1:key}": "${2:value}"\n}',
      detail: 'JSON object',
    },
  ],
  markdown: [
    {
      label: 'heading',
      insertText: '# ${1:Heading}',
      detail: 'Markdown heading',
    },
    {
      label: 'code',
      insertText: '```\\n${1:code}\\n```',
      detail: 'Markdown code block',
    },
  ],
};

let monacoConfigured = false;

function normalizeMonacoLanguage(language?: string | null): MonacoLanguage {
  switch ((language ?? '').toLowerCase()) {
    case 'python':
      return 'python';
    case 'javascript':
      return 'javascript';
    case 'typescript':
      return 'typescript';
    case 'java':
      return 'java';
    case 'cpp':
      return 'cpp';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'markdown':
      return 'markdown';
    case 'plaintext':
      return 'plaintext';
    default:
      return 'plaintext';
  }
}

const registerSnippetProvider = (monaco: Monaco, language: MonacoLanguage) => {
  const snippets = LANGUAGE_SNIPPETS[language];

  if (!snippets?.length) {
    return;
  }

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
        suggestions: snippets.map((snippet) => ({
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

export const languageToMonaco = (language: MonacoLanguage) => LANGUAGE_IDS[language];

export function pathToMonacoLanguage(path: string, fallbackLanguage?: string | null): MonacoLanguage {
  const extensionIndex = path.lastIndexOf('.');
  const extension = extensionIndex >= 0 ? path.slice(extensionIndex).toLowerCase() : '';

  switch (extension) {
    case '.py':
      return 'python';
    case '.html':
      return 'html';
    case '.css':
      return 'css';
    case '.js':
    case '.mjs':
    case '.cjs':
      return 'javascript';
    case '.ts':
    case '.tsx':
      return 'typescript';
    case '.json':
      return 'json';
    case '.md':
    case '.mdx':
      return 'markdown';
    case '.txt':
      return 'plaintext';
    default:
      return normalizeMonacoLanguage(fallbackLanguage);
  }
}

export const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  autoClosingBrackets: 'always',
  cursorBlinking: 'blink',
  cursorSmoothCaretAnimation: 'on',
  cursorStyle: 'line',
  cursorWidth: 2,
  fontFamily: 'Fira Code, SF Mono, JetBrains Mono, monospace',
  fontLigatures: true,
  fontSize: 13,
  formatOnPaste: true,
  glyphMargin: true,
  lineHeight: 22,
  lineNumbers: 'on',
  lineNumbersMinChars: 4,
  minimap: {
    enabled: true,
  },
  mouseWheelZoom: true,
  multiCursorModifier: 'ctrlCmd',
  padding: {
    top: 0,
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
      { token: 'comment', foreground: '374151', fontStyle: 'italic' },
      { token: 'string', foreground: '86EFAC' },
      { token: 'number', foreground: 'FB923C' },
      { token: 'keyword', foreground: 'C084FC' },
      { token: 'keyword.control', foreground: 'C084FC' },
      { token: 'function', foreground: '60A5FA' },
      { token: 'function.declaration', foreground: '60A5FA' },
      { token: 'entity.name.function', foreground: '60A5FA' },
      { token: 'identifier', foreground: 'E2E8F0' },
      { token: 'variable', foreground: 'E2E8F0' },
      { token: 'variable.predefined', foreground: 'E2E8F0' },
      { token: 'type.identifier', foreground: 'E2E8F0' },
      { token: 'delimiter', foreground: 'E2E8F0' },
    ],
    colors: {
      'editor.background': '#08080F',
      'editor.foreground': '#E2E8F0',
      'editor.lineHighlightBackground': '#6366F10F',
      'editor.lineHighlightBorder': '#00000000',
      'editorCursor.foreground': '#6366F1',
      'editorCursor.background': '#08080F',
      'editorLineNumber.foreground': '#374151',
      'editorLineNumber.activeForeground': '#818CF8',
      'editor.selectionBackground': '#6366F133',
      'editor.selectionHighlightBackground': '#6366F122',
      'editor.inactiveSelectionBackground': '#1E1E3840',
      'editor.findMatchBackground': '#1A1A35',
      'editor.wordHighlightBackground': '#6366F11A',
      'editorIndentGuide.background1': '#1E1E38',
      'editorIndentGuide.activeBackground1': '#6366F166',
      'editorGutter.background': '#08080F',
      'editorWidget.background': '#1A1A35',
      'editorWidget.border': '#1E1E38',
      'editorSuggestWidget.background': '#1A1A35',
      'editorSuggestWidget.border': '#1E1E38',
      'editorSuggestWidget.selectedBackground': '#11112A',
      'editorHoverWidget.background': '#1A1A35',
      'editorHoverWidget.border': '#1E1E38',
      'scrollbarSlider.background': '#1E1E38CC',
      'scrollbarSlider.hoverBackground': '#6366F199',
      'scrollbarSlider.activeBackground': '#6366F1CC',
      'focusBorder': '#6366F1',
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
  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
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
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    allowJs: true,
    checkJs: false,
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    target: monaco.languages.typescript.ScriptTarget.ES2020,
  });

  registerSnippetProvider(monaco, 'python');
  registerSnippetProvider(monaco, 'javascript');
  registerSnippetProvider(monaco, 'typescript');
  registerSnippetProvider(monaco, 'java');
  registerSnippetProvider(monaco, 'cpp');
  registerSnippetProvider(monaco, 'html');
  registerSnippetProvider(monaco, 'css');
  registerSnippetProvider(monaco, 'json');
  registerSnippetProvider(monaco, 'markdown');

  monacoConfigured = true;
};
