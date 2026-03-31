import { GoogleGenAI, type Content } from '@google/genai';
import { NextResponse } from 'next/server';
import {
  MAX_MODEL_CHAT_MESSAGES,
  normalizeYantraChatMessages,
  YANTRA_MODEL,
  yantraSystemPrompt,
  type YantraChatMessage,
} from '@/src/features/chat/yantra-chat';
import { upsertAuthenticatedChatHistory } from '@/src/lib/supabase/chat-history';
import { hasSupabaseEnv } from '@/src/lib/supabase/env';
import { getAuthenticatedProfile } from '@/src/lib/supabase/profiles';

export const runtime = 'nodejs';

type ChatRequestBody = {
  messages?: YantraChatMessage[];
};

type YantraAiServiceResponse = {
  reply?: string;
  intent?: string;
  context_used?: boolean;
  retrieval_mode?: string;
  provider?: string;
  model_used?: string | null;
  sources?: unknown[];
  detail?: string;
};

const DEFAULT_TOP_K = 3;
const DEFAULT_SERVICE_TIMEOUT_MS = 65000;

function toGeminiContent(message: YantraChatMessage): Content {
  return {
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  };
}

function getYantraAiServiceUrl() {
  const rawUrl = process.env.YANTRA_AI_SERVICE_URL?.trim();
  return rawUrl ? rawUrl.replace(/\/+$/, '') : null;
}

function getYantraAiServiceTimeoutMs() {
  const rawValue = process.env.YANTRA_AI_SERVICE_TIMEOUT_MS?.trim();
  const parsed = rawValue ? Number.parseInt(rawValue, 10) : Number.NaN;

  if (!Number.isFinite(parsed) || parsed < 1000) {
    return DEFAULT_SERVICE_TIMEOUT_MS;
  }

  return parsed;
}

function inferCurrentPath(request: Request) {
  const referer = request.headers.get('referer');

  if (!referer) {
    return 'Yantra Dashboard';
  }

  try {
    const { pathname } = new URL(referer);

    if (pathname.startsWith('/dashboard/rooms/python')) {
      return 'Python Room';
    }

    if (pathname.startsWith('/dashboard/student-profile')) {
      return 'Student Profile';
    }

    if (pathname.startsWith('/dashboard')) {
      return 'Yantra Dashboard';
    }

    if (pathname.startsWith('/docs')) {
      return 'Docs';
    }

    if (pathname.startsWith('/onboarding')) {
      return 'Onboarding';
    }

    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
      return 'Account Access';
    }
  } catch {
    return 'Yantra Dashboard';
  }

  return 'Yantra';
}

async function buildStudentContext(request: Request) {
  const defaultContext = {
    name: 'Learner',
    skill_level: 'Beginner' as const,
    current_path: inferCurrentPath(request),
    progress: 0,
    learning_goals: [] as string[],
  };

  if (!hasSupabaseEnv()) {
    return defaultContext;
  }

  try {
    const result = await getAuthenticatedProfile();
    const profile = result?.profile;

    if (!profile) {
      return defaultContext;
    }

    return {
      name: profile.name || defaultContext.name,
      skill_level: profile.skillLevel || defaultContext.skill_level,
      current_path: defaultContext.current_path,
      progress: typeof profile.progress === 'number' ? profile.progress : defaultContext.progress,
      learning_goals: [...profile.primaryLearningGoals],
    };
  } catch (error) {
    console.error('Yantra student-context lookup error:', error);
    return defaultContext;
  }
}

async function proxyToYantraAiService(request: Request, messages: YantraChatMessage[]) {
  const serviceUrl = getYantraAiServiceUrl();

  if (!serviceUrl) {
    return null;
  }

  const response = await fetch(`${serviceUrl}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(getYantraAiServiceTimeoutMs()),
    body: JSON.stringify({
      messages,
      student: await buildStudentContext(request),
      top_k: DEFAULT_TOP_K,
    }),
  });

  const data = (await response.json()) as YantraAiServiceResponse;

  if (!response.ok || !data.reply?.trim()) {
    throw new Error(data.detail || `Yantra AI service returned ${response.status}.`);
  }

  return {
    reply: data.reply.trim(),
    intent: data.intent ?? 'general',
    contextUsed: Boolean(data.context_used),
    retrievalMode: data.retrieval_mode ?? 'none',
    provider: data.provider ?? 'yantra-ai-service',
    modelUsed: data.model_used ?? null,
    sources: Array.isArray(data.sources) ? data.sources : [],
  };
}

async function generateWithGemini(messages: YantraChatMessage[]) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('Missing YANTRA_AI_SERVICE_URL or Gemini API key.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: YANTRA_MODEL,
    contents: messages.map(toGeminiContent),
    config: {
      systemInstruction: yantraSystemPrompt,
      temperature: 0.7,
      maxOutputTokens: 700,
    },
  });

  const reply = response.text?.trim();

  if (!reply) {
    throw new Error('Yantra returned an empty response.');
  }

  return {
    reply,
    intent: 'general',
    contextUsed: false,
    retrievalMode: 'none',
    provider: 'gemini-fallback',
    modelUsed: YANTRA_MODEL,
    sources: [],
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const fullConversation = normalizeYantraChatMessages(body.messages);
    const messages = fullConversation.slice(-MAX_MODEL_CHAT_MESSAGES);

    if (messages.length === 0) {
      return NextResponse.json({ error: 'A message is required to start the chat.' }, { status: 400 });
    }

    const result = getYantraAiServiceUrl()
      ? await proxyToYantraAiService(request, messages)
      : await generateWithGemini(messages);

    if (!result) {
      throw new Error('Yantra could not respond right now.');
    }

    if (hasSupabaseEnv()) {
      try {
        await upsertAuthenticatedChatHistory([...fullConversation, { role: 'assistant', content: result.reply }]);
      } catch (error) {
        console.error('Yantra chat history persistence error:', error);
      }
    }

    return NextResponse.json({
      reply: result.reply,
      intent: result.intent,
      contextUsed: result.contextUsed,
      retrievalMode: result.retrievalMode,
      provider: result.provider,
      modelUsed: result.modelUsed,
      sources: result.sources,
    });
  } catch (error) {
    console.error('Yantra chat error:', error);

    return NextResponse.json(
      { error: 'Yantra is unavailable right now. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
