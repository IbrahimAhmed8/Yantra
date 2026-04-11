import { LANGUAGE_META, type EditorFile, type SharePayload, type SharedSnippet } from '@/types';

const MOCK_SHARE_STORAGE_PREFIX = 'yantra-share-snippet:';
const PENDING_SHARE_STORAGE_KEY = 'yantra-pending-share-snippet';

const readEnvValue = (key: 'NEXT_PUBLIC_USE_MOCK_API' | 'VITE_USE_MOCK_API') => {
  if (typeof process !== 'undefined') {
    const processValue = process.env[key];

    if (typeof processValue === 'string') {
      return processValue;
    }
  }

  return (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.[key];
};

const readMockFlag = () => {
  const configuredValue = readEnvValue('NEXT_PUBLIC_USE_MOCK_API') ?? readEnvValue('VITE_USE_MOCK_API');
  return configuredValue === 'true';
};

const USE_MOCK_API = readMockFlag();

const createShareId = () => Math.random().toString(36).slice(2, 8);

const parseShareIdFromUrl = (url: string) => {
  const trimmedUrl = url.trim().replace(/\/+$/, '');
  const lastSegment = trimmedUrl.split('/').pop();

  if (!lastSegment) {
    throw new Error('The share service returned an invalid URL.');
  }

  return lastSegment;
};

const createEditorFileFromSnippet = (snippet: SharedSnippet): EditorFile => {
  const extension = LANGUAGE_META[snippet.language].extension;
  const shortId = snippet.shareId.replace(/^mock-/, '').slice(0, 6);

  return {
    id: `shared-${snippet.shareId}`,
    name: `shared-${shortId}.${extension}`,
    language: snippet.language,
    content: snippet.code,
  };
};

export const createShareLink = async (payload: SharePayload) => {
  if (USE_MOCK_API) {
    const shareId = `mock-${createShareId()}`;
    const shareUrl = `yantra-tau.vercel.app/s/${shareId}`;

    window.localStorage.setItem(
      `${MOCK_SHARE_STORAGE_PREFIX}${shareId}`,
      JSON.stringify({
        code: payload.code,
        language: payload.language,
      }),
    );

    return {
      shareId,
      url: shareUrl,
    };
  }

  const response = await fetch('/share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Share request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as { url?: string };

  if (!data.url) {
    throw new Error('The share service did not return a URL.');
  }

  return {
    shareId: parseShareIdFromUrl(data.url),
    url: data.url,
  };
};

export const fetchSharedSnippet = async (shareId: string): Promise<SharedSnippet> => {
  if (USE_MOCK_API) {
    const storedValue = window.localStorage.getItem(`${MOCK_SHARE_STORAGE_PREFIX}${shareId}`);

    if (!storedValue) {
      throw new Error('This shared snippet could not be found in mock mode.');
    }

    const parsedValue = JSON.parse(storedValue) as SharePayload;

    return {
      ...parsedValue,
      shareId,
    };
  }

  const response = await fetch(`/share/${shareId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Shared snippet request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as Partial<SharePayload>;

  if (typeof data.code !== 'string' || typeof data.language !== 'string') {
    throw new Error('The shared snippet payload was incomplete.');
  }

  return {
    code: data.code,
    language: data.language,
    shareId,
  } as SharedSnippet;
};

export const stashPendingSharedSnippet = (snippet: SharedSnippet) => {
  window.sessionStorage.setItem(PENDING_SHARE_STORAGE_KEY, JSON.stringify(snippet));
};

export const consumePendingSharedSnippet = () => {
  const rawValue = window.sessionStorage.getItem(PENDING_SHARE_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  window.sessionStorage.removeItem(PENDING_SHARE_STORAGE_KEY);
  const snippet = JSON.parse(rawValue) as SharedSnippet;

  return {
    snippet,
    file: createEditorFileFromSnippet(snippet),
  };
};
