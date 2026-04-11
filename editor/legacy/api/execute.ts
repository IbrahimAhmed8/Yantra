import type { ExecuteCodePayload, ExecutionResult } from '@/types';

const EXECUTION_TIMEOUT_MS = 15000;

const readEnvValue = (key: 'NEXT_PUBLIC_USE_MOCK_API' | 'VITE_USE_MOCK_API') => {
  if (typeof process === 'undefined') {
    return undefined;
  }

  const processValue = process.env[key];
  return typeof processValue === 'string' ? processValue : undefined;
};

const readMockFlag = () => {
  const configuredValue = readEnvValue('NEXT_PUBLIC_USE_MOCK_API') ?? readEnvValue('VITE_USE_MOCK_API');
  return configuredValue === 'true';
};

const USE_MOCK_API = readMockFlag();

const MOCK_RESULT: ExecutionResult = {
  stdout: 'Hello, World!',
  stderr: '',
  exitCode: 0,
  time: '87ms',
  memory: '14.1 MB',
};

const sleep = (durationMs: number) => new Promise((resolve) => window.setTimeout(resolve, durationMs));

const toErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to reach the execution service right now. Please try again.';
};

export const executeCode = async (payload: ExecuteCodePayload): Promise<ExecutionResult> => {
  if (USE_MOCK_API) {
    await sleep(700);
    return {
      ...MOCK_RESULT,
      stdout: payload.code.trim().length > 0 ? MOCK_RESULT.stdout : '',
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), EXECUTION_TIMEOUT_MS);

  try {
    const response = await fetch('/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Execution request failed with status ${response.status}.`);
    }

    const result = (await response.json()) as Partial<ExecutionResult>;

    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exitCode: typeof result.exitCode === 'number' ? result.exitCode : 1,
      time: result.time ?? '0ms',
      memory: result.memory ?? '0 MB',
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Execution timed out after ${Math.round(EXECUTION_TIMEOUT_MS / 1000)} seconds.`);
    }

    throw new Error(toErrorMessage(error));
  } finally {
    window.clearTimeout(timeoutId);
  }
};
