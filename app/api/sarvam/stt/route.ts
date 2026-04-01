import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SARVAM_STT_URL = 'https://api.sarvam.ai/speech-to-text';

function requireSarvamKey() {
  const key = process.env.SARVAM_API_KEY?.trim();

  if (!key) {
    throw new Error('Missing SARVAM_API_KEY in the Next.js environment.');
  }

  return key;
}

function sanitizeAudioFile(file: File) {
  const rawType = file.type?.trim().toLowerCase() || '';

  if (rawType.startsWith('audio/webm')) {
    return new File([file], file.name || 'yantra-room.webm', { type: 'audio/webm' });
  }

  if (rawType.startsWith('audio/ogg')) {
    return new File([file], file.name || 'yantra-room.ogg', { type: 'audio/ogg' });
  }

  if (rawType.startsWith('audio/mp4')) {
    return new File([file], file.name || 'yantra-room.mp4', { type: 'audio/mp4' });
  }

  return file;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Audio file is required.' }, { status: 400 });
    }

    const normalizedFile = sanitizeAudioFile(file);
    const payload = new FormData();
    payload.append('file', normalizedFile, normalizedFile.name || 'yantra-room.webm');
    payload.append('model', process.env.YANTRA_SARVAM_STT_MODEL?.trim() || 'saaras:v3');
    payload.append('language_code', process.env.YANTRA_SARVAM_STT_LANGUAGE?.trim() || 'unknown');
    payload.append('with_timestamps', 'false');
    payload.append('with_diarization', 'false');

    const mode = process.env.YANTRA_SARVAM_STT_MODE?.trim();
    if (mode) {
      payload.append('mode', mode);
    }

    const response = await fetch(SARVAM_STT_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': requireSarvamKey(),
      },
      body: payload,
      cache: 'no-store',
    });

    const data = (await response.json().catch(() => ({}))) as {
      transcript?: string;
      language_code?: string;
      error?: { message?: string };
      detail?: string;
    };

    if (!response.ok || !data.transcript?.trim()) {
      return NextResponse.json(
        {
          error:
            data.error?.message ||
            data.detail ||
            'Sarvam could not transcribe the audio.',
        },
        { status: response.status || 500 },
      );
    }

    return NextResponse.json({
      transcript: data.transcript.trim(),
      languageCode: data.language_code ?? null,
    });
  } catch (error) {
    console.error('Sarvam STT route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sarvam STT failed.' },
      { status: 500 },
    );
  }
}
