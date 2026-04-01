'use client';

const PYODIDE_VERSION = '0.29.3';
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const PYODIDE_SCRIPT_URL = `${PYODIDE_INDEX_URL}pyodide.js`;

const noop = () => {};
const MAIN_FILE_TRACEBACK_RE = /File "(?:.*[\\/])?main\.py", line (\d+)/g;
const PYTHON_ERROR_LINE_RE = /^([A-Za-z_][\w.]*)\s*:\s*(.+)$/;

export type PythonRunError = {
  type: string;
  message: string;
  traceback: string;
  line: number | null;
};

export type PythonRunResult = {
  status: 'success' | 'error';
  output: string;
  stdout: string;
  stderr: string;
  error: PythonRunError | null;
};

type PyodideLoaderOptions = {
  indexURL: string;
  fullStdLib?: boolean;
  stdin?: () => string | null;
  stdout?: (message: string) => void;
  stderr?: (message: string) => void;
};

type PyodideStreamHandler = {
  batched: (output: string) => void;
};

type PyodideStdinHandler = {
  stdin: () => string | null;
  error?: boolean;
};

type PyodideLike = {
  setStdout: (handler: PyodideStreamHandler) => void;
  setStderr: (handler: PyodideStreamHandler) => void;
  setStdin: (handler: PyodideStdinHandler) => void;
  loadPackagesFromImports: (
    code: string,
    options?: {
      errorCallback?: (message: string) => void;
    },
  ) => Promise<void>;
  runPythonAsync: (code: string, options?: { filename?: string }) => Promise<unknown>;
};

declare global {
  interface Window {
    loadPyodide?: (options?: PyodideLoaderOptions) => Promise<PyodideLike>;
  }
}

let pyodideScriptPromise: Promise<void> | null = null;
let pyodidePromise: Promise<PyodideLike> | null = null;

function normalizeLines(lines: string[]) {
  return lines
    .join('\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

function getResultPreview(result: unknown) {
  if (result === undefined || result === null) {
    return '';
  }

  const rendered = String(result).trim();

  if (typeof result === 'object' && result && 'destroy' in result && typeof result.destroy === 'function') {
    result.destroy();
  }

  return rendered;
}

export function extractPythonErrorLine(traceback: string) {
  const matches = [...traceback.matchAll(MAIN_FILE_TRACEBACK_RE)];
  const lastMatch = matches.at(-1);

  if (!lastMatch) {
    return null;
  }

  const parsed = Number.parseInt(lastMatch[1], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function extractPythonRunError(traceback: string, fallbackMessage = ''): PythonRunError {
  const normalizedTraceback = traceback.trim();
  const lines = normalizedTraceback
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const summaryLine = lines.at(-1) || fallbackMessage.trim() || 'Python execution failed.';
  const parsedSummary = summaryLine.match(PYTHON_ERROR_LINE_RE);

  return {
    type: parsedSummary?.[1] || 'PythonError',
    message: parsedSummary?.[2] || summaryLine,
    traceback: normalizedTraceback || fallbackMessage.trim() || 'Python execution failed.',
    line: extractPythonErrorLine(normalizedTraceback),
  };
}

function getRuntimeScriptNode() {
  return document.querySelector<HTMLScriptElement>('script[data-yantra-pyodide="true"]');
}

function ensurePyodideScript() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Pyodide can only be loaded in the browser.'));
  }

  if (window.loadPyodide) {
    return Promise.resolve();
  }

  if (pyodideScriptPromise) {
    return pyodideScriptPromise;
  }

  pyodideScriptPromise = new Promise<void>((resolve, reject) => {
    const failLoad = (message: string) => {
      pyodideScriptPromise = null;
      reject(new Error(message));
    };

    const completeLoad = () => {
      if (!window.loadPyodide) {
        failLoad('Pyodide script loaded but the runtime bootstrap was unavailable.');
        return;
      }

      resolve();
    };

    const existingScript = getRuntimeScriptNode();
    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        completeLoad();
        return;
      }

      existingScript.addEventListener('load', completeLoad, { once: true });
      existingScript.addEventListener('error', () => failLoad('Failed to load the Pyodide runtime script from the CDN.'), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = PYODIDE_SCRIPT_URL;
    script.async = true;
    script.dataset.yantraPyodide = 'true';
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        completeLoad();
      },
      { once: true },
    );
    script.addEventListener('error', () => failLoad('Failed to load the Pyodide runtime script from the CDN.'), { once: true });
    document.head.appendChild(script);
  });

  return pyodideScriptPromise;
}

export async function getPyodideRuntime() {
  if (!pyodidePromise) {
    pyodidePromise = ensurePyodideScript()
      .then(async () => {
        if (!window.loadPyodide) {
          throw new Error('Pyodide bootstrap is unavailable in this browser context.');
        }

        return window.loadPyodide({
          indexURL: PYODIDE_INDEX_URL,
          fullStdLib: false,
          stdin: () => null,
          stdout: noop,
          stderr: noop,
        });
      })
      .catch((error) => {
        pyodidePromise = null;
        throw error;
      });
  }

  return pyodidePromise;
}

export async function warmPyodideRuntime() {
  try {
    await getPyodideRuntime();
    return true;
  } catch {
    return false;
  }
}

export async function runPythonInBrowser(code: string) {
  const stdoutBuffer: string[] = [];
  const stderrBuffer: string[] = [];
  let pyodide: PyodideLike | null = null;

  try {
    pyodide = await getPyodideRuntime();

    pyodide.setStdout({
      batched: (output) => {
        if (output) {
          stdoutBuffer.push(output);
        }
      },
    });

    pyodide.setStderr({
      batched: (output) => {
        if (output) {
          stderrBuffer.push(output);
        }
      },
    });

    pyodide.setStdin({
      stdin: () => null,
    });

    await pyodide.loadPackagesFromImports(code, {
      errorCallback: (message) => {
        if (message) {
          stderrBuffer.push(message);
        }
      },
    });

    const result = await pyodide.runPythonAsync(code, { filename: 'main.py' });
    const stdout = normalizeLines(stdoutBuffer);
    const stderr = normalizeLines(stderrBuffer);
    const resultPreview = getResultPreview(result);

    const output = [stdout, stderr ? `stderr\n------\n${stderr}` : '', !stdout && !stderr ? resultPreview : '']
      .filter(Boolean)
      .join('\n\n')
      .trim();

    return {
      status: 'success' as const,
      output: output || 'Program completed with no output.',
      stdout,
      stderr,
      error: null,
    };
  } catch (error) {
    const stdout = normalizeLines(stdoutBuffer);
    const stderr = normalizeLines(stderrBuffer);
    const message = error instanceof Error ? error.message.trim() : String(error).trim();
    const traceback = [stderr, message].filter(Boolean).join('\n\n').trim();

    return {
      status: 'error' as const,
      output: [stdout, stderr, message].filter(Boolean).join('\n\n').trim() || 'Python execution failed.',
      stdout,
      stderr,
      error: extractPythonRunError(traceback, message),
    };
  } finally {
    if (pyodide) {
      pyodide.setStdout({ batched: noop });
      pyodide.setStderr({ batched: noop });
      pyodide.setStdin({
        stdin: () => null,
      });
    }
  }
}
