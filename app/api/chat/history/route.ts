import { NextResponse } from 'next/server';
import { getAuthenticatedChatHistory } from '@/src/lib/supabase/chat-history';
import { hasSupabaseEnv } from '@/src/lib/supabase/env';

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const result = await getAuthenticatedChatHistory();

    if (!result) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ messages: result.messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load chat history.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
