import { NextResponse } from 'next/server';
import { getAuthenticatedProfile } from '@/src/lib/supabase/profiles';
import { getYantraAiServiceTimeoutMs, getYantraAiServiceUrl } from '@/src/lib/yantra-ai-service';
import type { EditorAssistRequest } from '@/editor/types';

export const runtime = 'nodejs';

type YantraAiServiceResponse = {
  reply?: string;
  provider?: string;
  model_used?: string | null;
  detail?: string;
};

function buildAssistPrompt(body: EditorAssistRequest) {
  const selectedSnippet = body.selectedText?.trim();
  const learnerLevel = body.learnerLevel?.trim();

  return [
    'You are Yantra, a patient coding tutor.',
    'Keep your answer under 200 words unless the learner explicitly asks for more detail.',
    learnerLevel ? `Learner level: ${learnerLevel}` : null,
    `Language: ${body.language}`,
    `Question: ${body.question.trim()}`,
    selectedSnippet ? `Selected text:\n${selectedSnippet}` : 'Selected text: none',
    `Current file content:\n\`\`\`${body.language}\n${body.fileContent}\n\`\`\``,
    'Give practical guidance, point to the likely next step, and keep the tone encouraging.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export async function POST(request: Request) {
  try {
    const profileResult = await getAuthenticatedProfile();

    if (!profileResult) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const serviceUrl = getYantraAiServiceUrl();

    if (!serviceUrl) {
      return NextResponse.json({ error: 'Yantra AI service is not configured.' }, { status: 500 });
    }

    const body = (await request.json().catch(() => null)) as EditorAssistRequest | null;

    if (!body || typeof body.question !== 'string' || typeof body.fileContent !== 'string') {
      return NextResponse.json({ error: 'Invalid editor assist payload.' }, { status: 400 });
    }

    if (!body.question.trim()) {
      return NextResponse.json({ error: 'A question is required for editor assist.' }, { status: 400 });
    }

    const response = await fetch(`${serviceUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(getYantraAiServiceTimeoutMs()),
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: buildAssistPrompt({
              ...body,
              learnerLevel: body.learnerLevel ?? profileResult.profile.skillLevel,
            }),
          },
        ],
        student: {
          name: profileResult.profile.name || 'Learner',
          skill_level: body.learnerLevel ?? profileResult.profile.skillLevel,
          current_path: 'Editor Playground',
          progress: typeof profileResult.profile.progress === 'number' ? profileResult.profile.progress : 0,
          learning_goals: [...profileResult.profile.primaryLearningGoals],
        },
        top_k: 2,
      }),
    });

    const data = (await response.json()) as YantraAiServiceResponse;

    if (!response.ok || !data.reply?.trim()) {
      throw new Error(data.detail || `Yantra AI service returned ${response.status}.`);
    }

    return NextResponse.json({
      reply: data.reply.trim(),
      provider: data.provider ?? 'yantra-ai-service',
      modelUsed: data.model_used ?? null,
    });
  } catch (error) {
    console.error('Editor assist error:', error);
    return NextResponse.json(
      { error: 'Yantra is unavailable right now. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
