import { GoogleGenAI, type Content } from '@google/genai';
import { NextResponse } from 'next/server';
import {
  MAX_MODEL_CHAT_MESSAGES,
  normalizeYantraChatMessages,
  YANTRA_MODEL,
  yantraSystemPrompt,
  type YantraChatMessage,
} from '@/src/features/chat/yantra-chat';
import { getYantraAiServiceTimeoutMs, getYantraAiServiceUrl } from '@/src/lib/yantra-ai-service';
import { buildYantraStudentContext } from '@/src/lib/yantra-student-context';
import { upsertAuthenticatedChatHistory } from '@/src/lib/supabase/chat-history';
import { hasSupabaseEnv } from '@/src/lib/supabase/env';

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

function toGeminiContent(message: YantraChatMessage): Content {
  return {
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  };
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
      student: await buildYantraStudentContext(request),
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
