'use client';

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

export function extractPythonErrorLine(traceback: string) {
  const matches = [...traceback.matchAll(MAIN_FILE_TRACEBACK_RE)];
  const lastMatch = matches.at(-1);
  if (!lastMatch) return null;
  const parsed = Number.parseInt(lastMatch[1], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function extractPythonRunError(traceback: string, fallbackMessage = ''): PythonRunError {
  const normalizedTraceback = traceback.trim();
  const lines = normalizedTraceback.split('\n').map((line) => line.trim()).filter(Boolean);
  const summaryLine = lines.at(-1) || fallbackMessage.trim() || 'Python execution failed.';
  const parsedSummary = summaryLine.match(PYTHON_ERROR_LINE_RE);

  return {
    type: parsedSummary?.[1] || 'PythonError',
    message: parsedSummary?.[2] || summaryLine,
    traceback: normalizedTraceback || fallbackMessage.trim() || 'Python execution failed.',
    line: extractPythonErrorLine(normalizedTraceback),
  };
}

let workerInstance: Worker | null = null;
let messageIdCounter = 0;
const pendingRequests = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>();

function getPyodideWorker(): Worker {
  if (typeof window === 'undefined') {
    throw new Error('Web Workers can only be created in the browser.');
  }

  if (!workerInstance) {
    workerInstance = new Worker(new URL('./pyodide.worker.ts', import.meta.url));

    workerInstance.onmessage = (event) => {
      const { id, traceback, error: errorMessage, ...result } = event.data;
      const pending = pendingRequests.get(id);
      
      if (pending) {
        if (result.status === 'error') {
          result.error = extractPythonRunError(traceback, errorMessage);
        }
        pending.resolve(result);
        pendingRequests.delete(id);
      }
    };
  }
  return workerInstance;
}

export function warmPyodideRuntime(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const worker = getPyodideWorker();
      const messageId = ++messageIdCounter;
      
      pendingRequests.set(messageId, {
        resolve: (response) => resolve(response.status === 'ready'),
        reject: () => resolve(false),
      });

      worker.postMessage({ id: messageId, action: 'warmup' });
    } catch {
      resolve(false);
    }
  });
}

export function runPythonInBrowser(code: string): Promise<PythonRunResult> {
  return new Promise((resolve, reject) => {
    try {
      const worker = getPyodideWorker();
      const messageId = ++messageIdCounter;
      
      pendingRequests.set(messageId, { resolve, reject });
      worker.postMessage({ id: messageId, code, action: 'run' });
    } catch (error) {
      reject(error);
    }
  });
}

export async function getPyodideRuntime() {
  await warmPyodideRuntime();
  return true;
}