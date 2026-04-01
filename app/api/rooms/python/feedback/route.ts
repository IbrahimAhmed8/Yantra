import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import {
  type PythonRoomFeedbackRequest,
  type PythonRoomFeedbackResponse,
} from '@/src/features/rooms/python-feedback';
import { YANTRA_MODEL } from '@/src/features/chat/yantra-chat';
import { getYantraAiServiceTimeoutMs, getYantraAiServiceUrl } from '@/src/lib/yantra-ai-service';
import { buildYantraStudentContext } from '@/src/lib/yantra-student-context';

export const runtime = 'nodejs';

type YantraAiRoomFeedbackResponse = {
  reply?: string;
  provider?: string;
  model_used?: string | null;
  detail?: string;
};

const LOCAL_ONLY_PROVIDERS = new Set(['local-room-feedback', 'ring-exhausted']);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseRoomFeedbackRequest(body: unknown): PythonRoomFeedbackRequest | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const request = body as Partial<PythonRoomFeedbackRequest>;
  const error = request.error;

  if (
    request.trigger !== 'runtime_error' ||
    !isNonEmptyString(request.task) ||
    !isNonEmptyString(request.code) ||
    !error ||
    typeof error !== 'object' ||
    !isNonEmptyString(error.type) ||
    !isNonEmptyString(error.message) ||
    !isNonEmptyString(error.traceback)
  ) {
    return null;
  }

  return {
    trigger: 'runtime_error',
    task: request.task.trim(),
    code: request.code,
    stdout: typeof request.stdout === 'string' ? request.stdout : '',
    stderr: typeof request.stderr === 'string' ? request.stderr : '',
    error: {
      type: error.type.trim(),
      message: error.message.trim(),
      traceback: error.traceback.trim(),
      line: typeof error.line === 'number' && Number.isFinite(error.line) && error.line > 0 ? error.line : null,
    },
  };
}

function buildGeminiPrompt(body: PythonRoomFeedbackRequest) {
  const lineNote = body.error.line ? `Primary failing line: ${body.error.line}` : 'Primary failing line: unknown';
  const lineSnippet =
    body.error.line && body.code.split('\n')[body.error.line - 1]
      ? body.code.split('\n')[body.error.line - 1].trim()
      : '(line unavailable)';

  return [
    'The learner clicked Run Python and got a runtime error in Yantra.',
    'Respond in 1 or 2 short sentences, under 90 words.',
    'Explain the likely cause simply, mention the failing line when available, and give exactly one next fix hint.',
    'You must refer to the exact variable, expression, or statement from the failing line whenever possible.',
    'Do not provide the full solution or rewritten code.',
    lineNote,
    `Primary failing line snippet: ${lineSnippet}`,
    `Task: ${body.task}`,
    `Error type: ${body.error.type}`,
    `Error message: ${body.error.message}`,
    'Student code:',
    body.code,
    'Stdout:',
    body.stdout || '(none)',
    'Stderr:',
    body.stderr || '(none)',
    'Traceback:',
    body.error.traceback,
  ].join('\n');
}

function hasUsableGeminiKey() {
  const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  if (!key) {
    return false;
  }

  if (key === 'MY_GEMINI_API_KEY' || key.includes('YOUR_') || key.includes('PLACEHOLDER')) {
    return false;
  }

  return true;
}

async function proxyToYantraAiService(request: Request, body: PythonRoomFeedbackRequest): Promise<PythonRoomFeedbackResponse> {
  const serviceUrl = getYantraAiServiceUrl();

  const response = await fetch(`${serviceUrl}/rooms/python/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(getYantraAiServiceTimeoutMs()),
    body: JSON.stringify({
      ...body,
      student: await buildYantraStudentContext(request),
    }),
  });

  const data = (await response.json().catch(() => ({}))) as YantraAiRoomFeedbackResponse;

  if (!response.ok || !data.reply?.trim()) {
    throw new Error(data.detail || `Yantra AI service returned ${response.status}.`);
  }

  return {
    reply: data.reply.trim(),
    provider: data.provider ?? 'yantra-ai-service',
    modelUsed: data.model_used ?? null,
  };
}

async function generateWithGemini(body: PythonRoomFeedbackRequest): Promise<PythonRoomFeedbackResponse> {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

  if (!hasUsableGeminiKey()) {
    throw new Error('Missing Gemini API key for Python room feedback.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: YANTRA_MODEL,
    contents: [{ role: 'user', parts: [{ text: buildGeminiPrompt(body) }] }],
    config: {
      systemInstruction:
        'You are Yantra inside the Python Room. Keep runtime-error feedback short, specific, and hint-oriented.',
      temperature: 0.2,
      maxOutputTokens: 180,
    },
  });

  const reply = response.text?.trim();

  if (!reply) {
    throw new Error('Yantra returned an empty room-feedback response.');
  }

  return {
    reply,
    provider: 'gemini-fallback',
    modelUsed: YANTRA_MODEL,
  };
}

export async function POST(request: Request) {
  try {
    const parsedBody = parseRoomFeedbackRequest(await request.json().catch(() => null));

    if (!parsedBody) {
      return NextResponse.json(
        {
          error:
            'Invalid Python room feedback payload. `trigger`, `task`, `code`, and `error { type, message, traceback }` are required.',
        },
        { status: 400 },
      );
    }

    try {
      const result = await proxyToYantraAiService(request, parsedBody);
      if (!LOCAL_ONLY_PROVIDERS.has(result.provider || '')) {
        return NextResponse.json(result);
      }

      if (!hasUsableGeminiKey()) {
        return NextResponse.json(result);
      }

      const upgraded = await generateWithGemini(parsedBody);
      return NextResponse.json(upgraded);
    } catch (serviceError) {
      console.error('Python room feedback service error:', serviceError);
      const fallback = await generateWithGemini(parsedBody);
      return NextResponse.json(fallback);
    }
  } catch (error) {
    console.error('Python room feedback route error:', error);
    return NextResponse.json(
      { error: 'Yantra could not analyze this Python error right now.' },
      { status: 500 },
    );
  }
}
