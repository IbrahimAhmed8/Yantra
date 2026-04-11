type PythonRunStatus = 'success' | 'error';

type PythonRunResult = {
  status: PythonRunStatus;
  stdout: string;
  stderr: string;
  output: string;
};

type PyodideInterface = {
  loadPackagesFromImports: (code: string) => Promise<void>;
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdin?: (options: { stdin?: () => string | Uint8Array | number | null | undefined; isatty?: boolean }) => void;
  setStdout?: (options: { batched?: (value: string) => void; raw?: (value: string) => void }) => void;
  setStderr?: (options: { batched?: (value: string) => void; raw?: (value: string) => void }) => void;
};

declare global {
  interface Window {
    __yantraPyodidePromise?: Promise<PyodideInterface>;
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

const PYODIDE_VERSION = '0.27.4';
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const PYODIDE_SCRIPT_URL = `${PYODIDE_INDEX_URL}pyodide.js`;

function trimTrailingNewline(value: string) {
  return value.replace(/\n+$/g, '');
}

function createStdinHandler(stdin: string) {
  const normalized = stdin.replace(/\r\n/g, '\n');

  if (!normalized) {
    return () => undefined;
  }

  const lines = normalized.endsWith('\n') ? normalized.slice(0, -1).split('\n') : normalized.split('\n');
  let index = 0;

  return () => lines[index++] ?? undefined;
}

async function ensurePyodideScript() {
  if (typeof window === 'undefined') {
    throw new Error('Pyodide can only run in the browser.');
  }

  if (window.loadPyodide) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-yantra-pyodide="true"]');

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load the Pyodide runtime.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = PYODIDE_SCRIPT_URL;
    script.async = true;
    script.dataset.yantraPyodide = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load the Pyodide runtime.'));
    document.head.appendChild(script);
  });
}

async function getPyodide() {
  if (typeof window === 'undefined') {
    throw new Error('Pyodide can only run in the browser.');
  }

  window.__yantraPyodidePromise ??= (async () => {
    await ensurePyodideScript();

    if (!window.loadPyodide) {
      throw new Error('Pyodide did not initialize correctly.');
    }

    return window.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
  })();

  return window.__yantraPyodidePromise;
}

export async function warmPyodideRuntime() {
  try {
    await getPyodide();
  } catch {
    // The editor can still render even if the runtime has not finished warming.
  }
}

export async function runPythonInBrowser(code: string, stdin = ''): Promise<PythonRunResult> {
  try {
    const pyodide = await getPyodide();
    let stdout = '';
    let stderr = '';

    pyodide.setStdout?.({
      batched: (value) => {
        stdout += `${value}\n`;
      },
      raw: (value) => {
        stdout += value;
      },
    });

    pyodide.setStderr?.({
      batched: (value) => {
        stderr += `${value}\n`;
      },
      raw: (value) => {
        stderr += value;
      },
    });

    pyodide.setStdin?.({
      stdin: createStdinHandler(stdin),
      isatty: false,
    });

    await pyodide.loadPackagesFromImports(code);
    const result = await pyodide.runPythonAsync(code);
    const normalizedStdout = trimTrailingNewline(stdout);
    const normalizedStderr = trimTrailingNewline(stderr);
    const resultText =
      result === undefined || result === null || String(result).trim().length === 0
        ? normalizedStdout || 'Python finished without output.'
        : normalizedStdout
          ? `${normalizedStdout}\n${String(result)}`
          : String(result);

    return {
      status: normalizedStderr ? 'error' : 'success',
      stdout: normalizedStdout,
      stderr: normalizedStderr,
      output: normalizedStderr || resultText,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to run Python in the browser.';

    return {
      status: 'error',
      stdout: '',
      stderr: message,
      output: message,
    };
  }
}
