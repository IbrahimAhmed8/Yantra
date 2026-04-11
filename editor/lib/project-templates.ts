import type {
  EditorFileLanguage,
  EditorPrimaryLanguage,
  EditorProjectFileInput,
  EditorTemplateKey,
} from '@/editor/types';

type EditorTemplateDefinition = {
  title: string;
  primaryLanguage: EditorPrimaryLanguage;
  files: EditorProjectFileInput[];
};

const PYTHON_HELLO_WORLD = `print("Hello, Yantra!")`;
const JS_HELLO_WORLD = `console.log("Hello, Yantra JS Playground!");`;

const WEB_INDEX = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Yantra Web Playground</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main class="app-shell">
      <h1>Yantra Web Playground</h1>
      <p>Edit the files, click Run, and see the preview update here.</p>
      <button id="hello-button" type="button">Click me</button>
      <p id="message"></p>
    </main>

    <script src="script.js"></script>
  </body>
</html>`;

const WEB_CSS = `:root {
  color-scheme: light;
  font-family: "Inter", system-ui, sans-serif;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #f6f7fb 0%, #eef2ff 100%);
  color: #111827;
}

.app-shell {
  width: min(32rem, calc(100vw - 2rem));
  padding: 2rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
}

button {
  border: 0;
  border-radius: 999px;
  padding: 0.8rem 1.15rem;
  background: #111827;
  color: white;
  cursor: pointer;
}`;

const WEB_JS = `const button = document.getElementById("hello-button");
const message = document.getElementById("message");

button?.addEventListener("click", () => {
  if (message) {
    message.textContent = "Hello from the Yantra web playground!";
  }
});`;

const TEMPLATE_DEFINITIONS: Record<EditorTemplateKey, EditorTemplateDefinition> = {
  'python-playground': {
    title: 'Python Playground',
    primaryLanguage: 'python',
    files: [
      {
        path: 'main.py',
        language: 'python',
        content: PYTHON_HELLO_WORLD,
        sortOrder: 0,
        isEntry: true,
      },
    ],
  },
  'web-playground': {
    title: 'Web Playground',
    primaryLanguage: 'html',
    files: [
      {
        path: 'index.html',
        language: 'html',
        content: WEB_INDEX,
        sortOrder: 0,
        isEntry: true,
      },
      {
        path: 'style.css',
        language: 'css',
        content: WEB_CSS,
        sortOrder: 1,
        isEntry: false,
      },
      {
        path: 'script.js',
        language: 'javascript',
        content: WEB_JS,
        sortOrder: 2,
        isEntry: false,
      },
    ],
  },
  'js-playground': {
    title: 'JavaScript Playground',
    primaryLanguage: 'javascript',
    files: [
      {
        path: 'script.js',
        language: 'javascript',
        content: JS_HELLO_WORLD,
        sortOrder: 0,
        isEntry: true,
      },
    ],
  },
};

export function isEditorTemplateKey(value: string): value is EditorTemplateKey {
  return value === 'python-playground' || value === 'web-playground' || value === 'js-playground';
}

export function getEditorProjectTemplate(templateKey: EditorTemplateKey): EditorTemplateDefinition {
  return TEMPLATE_DEFINITIONS[templateKey];
}

export function getEditorLanguageFromPath(path: string): EditorFileLanguage {
  const normalizedPath = path.trim().toLowerCase();

  if (normalizedPath.endsWith('.py')) {
    return 'python';
  }

  if (normalizedPath.endsWith('.css')) {
    return 'css';
  }

  if (normalizedPath.endsWith('.html')) {
    return 'html';
  }

  if (normalizedPath.endsWith('.ts') || normalizedPath.endsWith('.tsx')) {
    return 'typescript';
  }

  if (normalizedPath.endsWith('.json')) {
    return 'json';
  }

  if (normalizedPath.endsWith('.md') || normalizedPath.endsWith('.mdx')) {
    return 'markdown';
  }

  if (normalizedPath.endsWith('.txt')) {
    return 'plaintext';
  }

  return 'javascript';
}
