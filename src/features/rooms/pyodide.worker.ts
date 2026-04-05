/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope;

const PYODIDE_VERSION = '0.29.3';
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

importScripts(`${PYODIDE_INDEX_URL}pyodide.js`);

let pyodidePromise: Promise<any> | null = null;

async function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = (self as any).loadPyodide({
      indexURL: PYODIDE_INDEX_URL,
      fullStdLib: false,
    });
  }
  return pyodidePromise;
}

function normalizeLines(lines: string[]) {
  return lines.join('\n').split('\n').map((line) => line.trimEnd()).join('\n').trim();
}

self.onmessage = async (event: MessageEvent) => {
  const { id, code, action } = event.data;

  if (action === 'warmup') {
    try {
      await getPyodide();
      self.postMessage({ id, status: 'ready' });
    } catch (e) {
      self.postMessage({ id, status: 'error' });
    }
    return;
  }

  const stdoutBuffer: string[] = [];
  const stderrBuffer: string[] = [];
  let pyodide: any = null;

  try {
    pyodide = await getPyodide();

    pyodide.setStdout({ batched: (output: string) => output && stdoutBuffer.push(output) });
    pyodide.setStderr({ batched: (output: string) => output && stderrBuffer.push(output) });
    pyodide.setStdin({ stdin: () => null });

    await pyodide.loadPackagesFromImports(code, {
      errorCallback: (message: string) => message && stderrBuffer.push(message),
    });

    const result = await pyodide.runPythonAsync(code, { filename: 'main.py' });
    
    let resultPreview = '';
    if (result !== undefined && result !== null) {
      resultPreview = String(result).trim();
      if (typeof result === 'object' && 'destroy' in result && typeof result.destroy === 'function') {
        result.destroy();
      }
    }

    const stdout = normalizeLines(stdoutBuffer);
    const stderr = normalizeLines(stderrBuffer);
    const output = [stdout, stderr ? `stderr\n------\n${stderr}` : '', !stdout && !stderr ? resultPreview : '']
      .filter(Boolean)
      .join('\n\n')
      .trim();

    self.postMessage({
      id,
      status: 'success',
      output: output || 'Program completed with no output.',
      stdout,
      stderr,
      error: null,
      traceback: null
    });

  } catch (error: any) {
    const stdout = normalizeLines(stdoutBuffer);
    const stderr = normalizeLines(stderrBuffer);
    const message = error instanceof Error ? error.message.trim() : String(error).trim();
    const traceback = [stderr, message].filter(Boolean).join('\n\n').trim();

    self.postMessage({
      id,
      status: 'error',
      output: [stdout, stderr, message].filter(Boolean).join('\n\n').trim() || 'Python execution failed.',
      stdout,
      stderr,
      error: message, 
      traceback: traceback
    });
  } finally {
    if (pyodide) {
      pyodide.setStdout({ batched: () => {} });
      pyodide.setStderr({ batched: () => {} });
      pyodide.setStdin({ stdin: () => null });
    }
  }
};