import type { AIRequestPayload, RoadmapCompletionPayload } from '@/types';

const AI_STREAM_TIMEOUT_MS = 65000;
const MOCK_HINT_RESPONSE = "Here's a hint: think about edge cases when the input is zero...";
const MOCK_REVIEW_RESPONSE =
  'Your code looks clean! Consider: 1) Adding input validation 2) Using more descriptive variable names 3) Adding comments for complex logic.';

type AIEndpoint = '/ai/hint' | '/ai/review';

interface StreamAIResponseOptions {
  endpoint: AIEndpoint;
  payload: AIRequestPayload;
  signal?: AbortSignal;
  onToken: (token: string) => void;
}

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

const sleep = (durationMs: number) => new Promise((resolve) => window.setTimeout(resolve, durationMs));

const abortError = () => new DOMException('The AI request was aborted.', 'AbortError');

const assertNotAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw abortError();
  }
};

const toErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Yantra AI is unavailable right now. Please try again in a moment.';
};

const graduallyEmitText = async (value: string, onToken: (token: string) => void, signal?: AbortSignal, delayMs = 12) => {
  for (const character of Array.from(value)) {
    assertNotAborted(signal);
    onToken(character);
    await sleep(delayMs);
  }
};

const extractFocusedSnippet = (payload: AIRequestPayload) => payload.focusLineContent?.trim() || payload.context?.trim() || payload.code.trim();

const buildMockHint = (payload: AIRequestPayload) => {
  const task = payload.task.toLowerCase();
  const focusedSnippet = extractFocusedSnippet(payload);

  if (payload.errorMessage || task.includes('fix')) {
    const replacementLine =
      payload.language === 'python'
        ? '    return 0 if value == 0 else value * value'
        : payload.language === 'javascript'
          ? '  return value === 0 ? 0 : value * value;'
          : payload.language === 'java'
            ? '        return value == 0 ? 0 : value * value;'
            : '    return value == 0 ? 0 : value * value;';

    return `Replacement line: ${replacementLine}\n\nWhy: ${payload.errorMessage ?? 'This handles the failing edge case before the rest of the logic runs.'}`;
  }

  if (task.includes('explain')) {
    return focusedSnippet
      ? `This line is focused on \`${focusedSnippet}\`, so trace the value it reads and how the next few lines use that result.`
      : 'This line is part of the current control flow, so check the values entering it and how its output affects the next branch.';
  }

  if (task !== 'hint') {
    return `Let's think it through: ${task}. Start by checking the smallest inputs first, then compare your current output against the expected behavior.`;
  }

  return MOCK_HINT_RESPONSE;
};

const buildMockResponse = (endpoint: AIEndpoint, payload: AIRequestPayload) => {
  if (endpoint === '/ai/review') {
    return MOCK_REVIEW_RESPONSE;
  }

  return buildMockHint(payload);
};

const readStream = async (stream: ReadableStream<Uint8Array>, onToken: (token: string) => void, signal?: AbortSignal) => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      assertNotAborted(signal);
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });

      if (chunk) {
        await graduallyEmitText(chunk, onToken, signal, 8);
      }
    }

    const trailingChunk = decoder.decode();

    if (trailingChunk) {
      await graduallyEmitText(trailingChunk, onToken, signal, 8);
    }
  } finally {
    reader.releaseLock();
  }
};

export const streamAIResponse = async ({ endpoint, payload, signal, onToken }: StreamAIResponseOptions) => {
  if (USE_MOCK_API) {
    await graduallyEmitText(buildMockResponse(endpoint, payload), onToken, signal, 18);
    return;
  }

  const controller = new AbortController();
  let didTimeout = false;
  const timeoutId = window.setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, AI_STREAM_TIMEOUT_MS);
  const abortHandler = () => controller.abort();
  signal?.addEventListener('abort', abortHandler);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Yantra AI request failed with status ${response.status}.`);
    }

    if (!response.body) {
      const fallbackText = await response.text();

      if (fallbackText) {
        await graduallyEmitText(fallbackText, onToken, signal, 8);
      }

      return;
    }

    await readStream(response.body, onToken, signal);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      if (didTimeout && !signal?.aborted) {
        throw new Error(`Yantra AI timed out after ${Math.round(AI_STREAM_TIMEOUT_MS / 1000)} seconds.`);
      }

      throw abortError();
    }

    throw new Error(toErrorMessage(error));
  } finally {
    signal?.removeEventListener('abort', abortHandler);
    window.clearTimeout(timeoutId);
  }
};

export const streamHint = (payload: AIRequestPayload, options: Omit<StreamAIResponseOptions, 'endpoint' | 'payload'>) =>
  streamAIResponse({
    endpoint: '/ai/hint',
    payload,
    ...options,
  });

export const streamReview = (payload: AIRequestPayload, options: Omit<StreamAIResponseOptions, 'endpoint' | 'payload'>) =>
  streamAIResponse({
    endpoint: '/ai/review',
    payload,
    ...options,
  });

export const getYantraUserId = () => {
  if (typeof window === 'undefined') {
    return 'yantra-local-user';
  }

  const storageKey = 'yantra-user-id';
  const existingUserId = window.localStorage.getItem(storageKey);

  if (existingUserId) {
    return existingUserId;
  }

  const nextUserId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `yantra-user-${Date.now()}`;

  window.localStorage.setItem(storageKey, nextUserId);
  return nextUserId;
};

export const postRoadmapComplete = async (payload: RoadmapCompletionPayload) => {
  if (USE_MOCK_API) {
    await sleep(250);
    return;
  }

  const response = await fetch('/roadmap/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Roadmap completion request failed with status ${response.status}.`);
  }
};
