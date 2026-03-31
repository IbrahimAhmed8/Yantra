import { NextResponse } from 'next/server';
import { AccessToken, AgentDispatchClient, RoomServiceClient } from 'livekit-server-sdk';
import { getAuthenticatedProfile } from '@/src/lib/supabase/profiles';

export const runtime = 'nodejs';

type VoiceTokenRequest = {
  roomKey?: string;
  roomLabel?: string;
};

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name} in the Next.js environment.`);
  }

  return value;
}

function toApiHost(livekitUrl: string) {
  return livekitUrl.replace(/^wss:/i, 'https:').replace(/^ws:/i, 'http:');
}

function sanitizeSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

function buildRoomName(roomKey: string, userId: string) {
  return `yantra-${sanitizeSegment(roomKey)}-${sanitizeSegment(userId)}`;
}

function buildParticipantIdentity(userId: string) {
  const nonce = Math.random().toString(36).slice(2, 10);
  return `${sanitizeSegment(userId)}-room-${nonce}`;
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedProfile();

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as VoiceTokenRequest;
    const roomKey = body.roomKey?.trim() || 'python-room';
    const roomLabel = body.roomLabel?.trim() || 'Python Room';
    const livekitUrl = requireEnv('LIVEKIT_URL');
    const livekitApiKey = requireEnv('LIVEKIT_API_KEY');
    const livekitApiSecret = requireEnv('LIVEKIT_API_SECRET');
    const agentName = process.env.YANTRA_LIVEKIT_AGENT_NAME?.trim() || 'yantra-terminal-voice';
    const apiHost = toApiHost(livekitUrl);
    const roomName = buildRoomName(roomKey, auth.user.id);
    const roomService = new RoomServiceClient(apiHost, livekitApiKey, livekitApiSecret);
    const dispatchClient = new AgentDispatchClient(apiHost, livekitApiKey, livekitApiSecret);

    try {
      await roomService.createRoom({
        name: roomName,
        emptyTimeout: 60 * 8,
        departureTimeout: 60 * 2,
        maxParticipants: 4,
        metadata: JSON.stringify({
          roomKey,
          roomLabel,
          learnerId: auth.user.id,
        }),
      });
    } catch {
      // Rooms can already exist for an active learner session. Reuse them.
    }

    const existingDispatches = await dispatchClient.listDispatch(roomName).catch(() => []);
    const hasYantraDispatch = existingDispatches.some((dispatch) => dispatch.agentName === agentName);

    if (!hasYantraDispatch) {
      await dispatchClient.createDispatch(roomName, agentName, {
        metadata: JSON.stringify({
          roomKey,
          roomLabel,
          learnerName: auth.profile.name,
          currentPath: auth.profile.primaryLearningGoals?.[0] || 'AI Foundations',
        }),
      });
    }

    const participantIdentity = buildParticipantIdentity(auth.user.id);
    const token = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: participantIdentity,
      name: auth.profile.name,
      metadata: JSON.stringify({
        learnerId: auth.user.id,
        learnerName: auth.profile.name,
        roomKey,
        roomLabel,
      }),
      ttl: '1h',
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return NextResponse.json({
      token: await token.toJwt(),
      url: livekitUrl,
      roomName,
      participantName: auth.profile.name,
      agentName,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create the Yantra room session.';
    console.error('LiveKit token route error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
