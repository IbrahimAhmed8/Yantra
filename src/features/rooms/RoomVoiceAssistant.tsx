'use client';

import {
  BarVisualizer,
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  TrackToggle,
  useLocalParticipant,
  useConnectionState,
  useTranscriptions,
  useVoiceAssistant,
} from '@livekit/components-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  Bot,
  LoaderCircle,
  Mic,
  PanelRightClose,
  PanelRightOpen,
  Power,
  Radio,
  Sparkles,
  Volume2,
  Waves,
  X,
} from 'lucide-react';
import { Track } from 'livekit-client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useOverlayLock } from '@/src/features/motion/ExperienceProvider';

type RoomVoiceAssistantProps = {
  roomKey: string;
  roomLabel: string;
  roomSummary: string;
};

type VoiceSessionPayload = {
  token: string;
  url: string;
  roomName: string;
  participantName: string;
  agentName: string;
};

type VoiceAssistantState = ReturnType<typeof useVoiceAssistant>['state'];

type DesktopLaunchCardProps = {
  roomLabel: string;
  roomSummary: string;
  isPreparing: boolean;
  error: string | null;
  onStart: () => void;
};

type LiveAssistantPanelProps = {
  mode: 'desktop' | 'mobile';
  roomLabel: string;
  roomSummary: string;
  roomName: string;
  isPreparing: boolean;
  error: string | null;
  onClose: () => void;
  onEndSession: () => void;
};

type FloatingLauncherProps = {
  isPreparing: boolean;
  onOpen: () => void;
  label: string;
  stateLabel: string;
  active: boolean;
};

function useDesktopSidebar() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return isDesktop;
}

function toneForState(state: string) {
  switch (state) {
    case 'speaking':
      return 'from-cyan-300/70 via-white/85 to-cyan-300/70';
    case 'thinking':
      return 'from-amber-300/70 via-white/85 to-amber-300/70';
    case 'listening':
      return 'from-emerald-300/70 via-white/80 to-emerald-300/70';
    case 'connecting':
    case 'initializing':
      return 'from-white/28 via-white/78 to-white/28';
    default:
      return 'from-white/15 via-white/52 to-white/15';
  }
}

function labelForState(state: string, connectionState: string) {
  if (connectionState !== 'connected') {
    return connectionState.toLowerCase();
  }

  switch (state) {
    case 'speaking':
    case 'thinking':
    case 'listening':
    case 'initializing':
      return state;
    default:
      return 'ready';
  }
}

function VoiceOrb({
  state,
  audioTrack,
  size = 'large',
}: {
  state: VoiceAssistantState;
  audioTrack: ReturnType<typeof useVoiceAssistant>['audioTrack'];
  size?: 'large' | 'small';
}) {
  const tone = toneForState(state);
  const shellSize = size === 'large' ? 'h-36 w-36' : 'h-12 w-12';
  const middleSize = size === 'large' ? 'inset-[16%]' : 'inset-[18%]';
  const visualizerSize = size === 'large' ? 'h-16 w-16 gap-[3px]' : 'h-6 w-6 gap-[2px]';
  const barClass = size === 'large' ? 'w-[4px]' : 'w-[3px]';
  const iconSize = size === 'large' ? 24 : 16;

  return (
    <div className={`relative flex items-center justify-center ${shellSize}`}>
      <div className="absolute inset-0 rounded-full border border-cyan-300/12 bg-cyan-300/[0.03]" />
      <div className={`absolute inset-[8%] rounded-full bg-gradient-to-br ${tone} opacity-30 blur-2xl`} />
      <div className={`absolute ${middleSize} rounded-full border border-white/10 bg-black/60`} />
      <div className="relative z-10 flex items-center justify-center">
        {audioTrack ? (
          <BarVisualizer track={audioTrack} state={state} barCount={size === 'large' ? 7 : 5} className={`${visualizerSize} items-end`}>
            <span className={`${barClass} rounded-full bg-white/18 transition-colors data-[lk-highlighted=true]:bg-cyan-200`} />
          </BarVisualizer>
        ) : (
          <Waves size={iconSize} className="text-cyan-100/76" />
        )}
      </div>
    </div>
  );
}

function DesktopLaunchCard({ roomLabel, roomSummary, isPreparing, error, onStart }: DesktopLaunchCardProps) {
  return (
    <aside className="hidden xl:block xl:sticky xl:top-28 xl:self-start">
      <div className="overflow-hidden rounded-[2rem] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(4,10,16,0.96),rgba(2,6,10,0.98))] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.3)] backdrop-blur-[24px] sm:p-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/16 bg-cyan-300/8 text-cyan-100">
            {isPreparing ? <LoaderCircle size={18} className="animate-spin" /> : <Sparkles size={18} />}
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-cyan-100/42">Yantra Live</div>
            <div className="mt-1 text-lg font-semibold tracking-tight text-white">{roomLabel}</div>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-white/60">{roomSummary}</p>

        <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-black/28 p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/38">Room AI</div>
          <div className="mt-3 text-sm leading-relaxed text-white/72">
            Launch the sidebar to talk with Yantra while you code. Once connected, you can collapse the panel and keep the session alive in the background.
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-[1.35rem] border border-rose-300/18 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={onStart}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-black transition-transform duration-300 hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isPreparing}
        >
          {isPreparing ? <LoaderCircle size={16} className="animate-spin" /> : <Radio size={16} />}
          {isPreparing ? 'Launching' : 'Launch Yantra'}
        </button>
      </div>
    </aside>
  );
}

function DesktopCollapsedCard({
  roomLabel,
  roomName,
  onOpen,
  onEndSession,
}: {
  roomLabel: string;
  roomName: string;
  onOpen: () => void;
  onEndSession: () => void;
}) {
  const connectionState = useConnectionState();
  const { state, audioTrack, agent } = useVoiceAssistant();
  const stateLabel = labelForState(state, String(connectionState));

  return (
    <aside className="hidden xl:block xl:sticky xl:top-28 xl:self-start">
      <div className="overflow-hidden rounded-[2rem] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(4,10,16,0.96),rgba(2,6,10,0.98))] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.3)] backdrop-blur-[24px] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <VoiceOrb state={state} audioTrack={audioTrack} size="small" />
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-100/42">Yantra Live</div>
              <div className="truncate text-base font-semibold tracking-tight text-white">{agent?.name || 'Yantra'}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100/62">{stateLabel}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onEndSession}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/58 transition-colors hover:border-rose-300/28 hover:text-rose-200"
            aria-label="End Yantra session"
          >
            <Power size={15} />
          </button>
        </div>

        <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-black/26 p-4">
          <div className="text-sm leading-relaxed text-white/74">
            Yantra is still connected to <span className="font-semibold text-white">{roomLabel}</span>. Open the sidebar when you want the full voice surface back.
          </div>
          <div className="mt-3 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-white/36">{roomName}</div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-cyan-300/18 bg-cyan-300/8 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-100 transition-colors hover:border-cyan-200/36 hover:bg-cyan-300/14"
        >
          <PanelRightOpen size={16} />
          Open Sidebar
        </button>
      </div>
    </aside>
  );
}

function LiveAssistantPanel({
  mode,
  roomLabel,
  roomSummary,
  roomName,
  isPreparing,
  error,
  onClose,
  onEndSession,
}: LiveAssistantPanelProps) {
  const connectionState = useConnectionState();
  const { state, audioTrack, agent, agentTranscriptions } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const transcriptions = useTranscriptions();
  const transcript = useMemo(
    () =>
      agentTranscriptions
        .slice(-8)
        .map((segment) => segment.text.trim())
        .filter(Boolean)
        .join(' ')
        .trim(),
    [agentTranscriptions],
  );
  const userTranscript = useMemo(
    () =>
      [...transcriptions]
        .reverse()
        .find(
          (stream) =>
            stream.participantInfo.identity === localParticipant.identity && stream.text.trim(),
        )
        ?.text.trim() ?? '',
    [localParticipant.identity, transcriptions],
  );
  const localMicPublication = localParticipant.getTrackPublication(Track.Source.Microphone);
  const micEnabled = Boolean(localMicPublication?.isUpstreamPaused === false || localMicPublication?.track);
  const stateLabel = labelForState(state, String(connectionState));
  const shellClassName =
    mode === 'desktop'
      ? 'sticky top-28 max-h-[calc(100svh-8.5rem)] self-start overflow-hidden rounded-[2rem] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(4,10,16,0.96),rgba(2,6,10,0.98))] shadow-[0_20px_64px_rgba(0,0,0,0.3)] backdrop-blur-[24px]'
      : 'fixed inset-x-3 bottom-3 top-20 z-[72] flex overflow-hidden rounded-[2rem] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(4,10,16,0.96),rgba(2,6,10,0.98))] shadow-[0_28px_100px_rgba(0,0,0,0.55)] backdrop-blur-[24px]';

  return (
    <motion.aside
      initial={mode === 'desktop' ? { opacity: 0, x: 18 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={mode === 'desktop' ? { opacity: 0, x: 14 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className={shellClassName}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="border-b border-white/8 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-100/42">Yantra Live</div>
              <div className="mt-3 flex min-w-0 items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/18 bg-cyan-300/8 text-cyan-100">
                  <Sparkles size={17} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold tracking-tight text-white">{roomLabel}</div>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-100/58">
                    <Radio size={12} />
                    <span>{stateLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onEndSession}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/58 transition-colors hover:border-rose-300/28 hover:text-rose-200"
                aria-label="End Yantra session"
              >
                <Power size={15} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/58 transition-colors hover:border-white/20 hover:text-white"
                aria-label="Close Yantra sidebar"
              >
                {mode === 'desktop' ? <PanelRightClose size={15} /> : <X size={15} />}
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-white/58">{roomSummary}</p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4 pt-4">
            <div className="shrink-0 rounded-[1.75rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(90,220,255,0.14),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] px-4 py-5">
              <div className="flex flex-col items-center text-center">
                <VoiceOrb state={state} audioTrack={audioTrack} />
                <div className="mt-4 text-2xl font-semibold tracking-tight text-white">{agent?.name || 'Yantra'}</div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/58">{stateLabel}</div>
              </div>
            </div>

            <div className="shrink-0 rounded-[1.5rem] border border-white/8 bg-black/28 p-4">
            <div className="mb-3 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-white/40">
              <span>User mic</span>
              <span className={micEnabled ? 'text-emerald-200' : 'text-rose-200'}>
                {micEnabled ? 'live' : 'muted'}
              </span>
            </div>
            <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">Heard you say</div>
              <div className="mt-2 text-sm leading-relaxed text-white/74">
                {userTranscript || 'Your latest recognized speech will appear here.'}
              </div>
            </div>
            <div className="mt-3 rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
                <Volume2 size={13} />
                Yantra reply
              </div>
              <div className="mt-2 max-h-32 overflow-y-auto text-sm leading-relaxed text-white/74">
                {transcript || 'Yantra will speak here once the first reply lands.'}
              </div>
            </div>
          </div>

            <div className="shrink-0 rounded-[1.5rem] border border-white/8 bg-black/24 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/38">Session</div>
              <div className="mt-3 space-y-2 text-sm text-white/64">
                <div className="flex items-center justify-between gap-3">
                  <span>Connection</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/72">{String(connectionState).toLowerCase()}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Room</span>
                  <span className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-white/42">{roomName}</span>
                </div>
              </div>
            </div>

            {(isPreparing || error) && (
              <div className="shrink-0 rounded-[1.35rem] border border-white/8 bg-white/[0.035] p-4 text-sm text-white/70">
                {isPreparing ? (
                  <div className="flex items-center gap-3">
                    <LoaderCircle size={16} className="animate-spin text-cyan-100/72" />
                    <span>Warming Yantra’s room link and dispatching the agent.</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 text-rose-200">
                    <AlertTriangle size={16} className="mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-white/8 bg-black/26 px-5 py-4">
            <div className="grid grid-cols-2 gap-3">
              <TrackToggle
                source={Track.Source.Microphone}
                showIcon={false}
                captureOptions={{
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                }}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[1.2rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-medium text-white transition-colors hover:border-cyan-200/28 hover:bg-cyan-300/10"
              >
                <Mic size={16} />
                <span>Mic</span>
              </TrackToggle>

              <button
                type="button"
                onClick={onEndSession}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[1.2rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-medium text-white transition-colors hover:border-rose-300/24 hover:bg-rose-400/10"
              >
                <Power size={16} />
                <span>End</span>
              </button>
            </div>

            <StartAudio
              label="Enable audio"
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[1.05rem] border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-cyan-200/24 hover:bg-cyan-300/8"
            />
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

function FloatingLauncher({ isPreparing, onOpen, label, stateLabel, active }: FloatingLauncherProps) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className="pointer-events-auto fixed bottom-5 right-4 z-[55] flex items-center gap-3 rounded-full border border-cyan-300/18 bg-black/78 px-4 py-3 text-left shadow-[0_20px_70px_rgba(0,0,0,0.56)] backdrop-blur-2xl transition-colors hover:border-cyan-200/34 sm:right-5 lg:bottom-7 lg:right-6 xl:hidden"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Open Yantra room assistant"
    >
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,rgba(80,230,255,0.22),rgba(0,0,0,0.92))]">
        <div className="absolute inset-[0.22rem] rounded-full bg-cyan-300/18 blur-md" />
        {isPreparing ? <LoaderCircle size={18} className="relative z-10 animate-spin text-white" /> : <Bot size={18} className="relative z-10 text-white" />}
      </div>

      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">Room AI</div>
        <div className="mt-1 text-sm font-medium text-white">{label}</div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100/62">
          {active ? stateLabel : isPreparing ? 'starting' : 'voice mentor'}
        </div>
      </div>
    </motion.button>
  );
}

function MobileLiveLauncher({ onOpen }: { onOpen: () => void }) {
  const connectionState = useConnectionState();
  const { state } = useVoiceAssistant();
  const stateLabel = labelForState(state, String(connectionState));
  return <FloatingLauncher isPreparing={false} onOpen={onOpen} label="Yantra Live" stateLabel={stateLabel} active />;
}

export default function RoomVoiceAssistant({ roomKey, roomLabel, roomSummary }: RoomVoiceAssistantProps) {
  const isDesktop = useDesktopSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [connect, setConnect] = useState(false);
  const [session, setSession] = useState<VoiceSessionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionInstance, setSessionInstance] = useState(0);
  const isIntentionalShutdownRef = useRef(false);

  useOverlayLock('room-voice-assistant', isOpen && !isDesktop);

  async function startSession() {
    if (isPreparing) {
      return;
    }

    isIntentionalShutdownRef.current = false;
    setIsPreparing(true);
    setError(null);
    setIsOpen(true);
    setConnect(false);
    setSession(null);
    setSessionInstance((current) => current + 1);

    try {
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({
          roomKey,
          roomLabel,
        }),
      });

      const data = (await response.json()) as Partial<VoiceSessionPayload> & { error?: string };

      if (!response.ok || !data.token || !data.url || !data.roomName || !data.agentName || !data.participantName) {
        throw new Error(data.error || 'Unable to start the Yantra room assistant.');
      }

      setSession({
        token: data.token,
        url: data.url,
        roomName: data.roomName,
        participantName: data.participantName,
        agentName: data.agentName,
      });

      setConnect(true);
    } catch (sessionError) {
      setError(
        sessionError instanceof Error ? sessionError.message : 'Unable to start the Yantra room assistant right now.',
      );
      setConnect(false);
    } finally {
      setIsPreparing(false);
    }
  }

  function endSession() {
    isIntentionalShutdownRef.current = true;
    setConnect(false);
    setIsPreparing(false);
    setError(null);
    setIsOpen(false);
    setSession(null);
    setSessionInstance((current) => current + 1);
  }

  if (!session) {
    return (
      <>
        <DesktopLaunchCard
          roomLabel={roomLabel}
          roomSummary={roomSummary}
          isPreparing={isPreparing}
          error={error}
          onStart={() => {
            void startSession();
          }}
        />

        <FloatingLauncher
          isPreparing={isPreparing}
          onOpen={() => {
            void startSession();
          }}
          label="Launch Yantra"
          stateLabel="voice mentor"
          active={false}
        />
      </>
    );
  }

  return (
    <LiveKitRoom
      key={`${session.roomName}-${session.participantName}-${sessionInstance}`}
      serverUrl={session.url}
      token={session.token}
      connect={connect}
      audio={
        connect
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false
      }
      connectOptions={{
        autoSubscribe: true,
      }}
      className="contents"
      onError={(livekitError) => {
        if (isIntentionalShutdownRef.current) {
          return;
        }
        setError(livekitError.message || 'Yantra voice is unavailable right now.');
      }}
      onDisconnected={() => {
        const intentional = isIntentionalShutdownRef.current;
        setConnect(false);
        if (intentional) {
          isIntentionalShutdownRef.current = false;
          setSession(null);
          setError(null);
        }
      }}
    >
      <RoomAudioRenderer />

      {isOpen ? (
        <>
          <div className="hidden xl:block">
            <LiveAssistantPanel
              mode="desktop"
              roomLabel={roomLabel}
              roomSummary={roomSummary}
              roomName={session.roomName}
              isPreparing={isPreparing}
              error={error}
              onClose={() => setIsOpen(false)}
              onEndSession={endSession}
            />
          </div>

          <div className="xl:hidden">
            <AnimatePresence>
              <motion.button
                type="button"
                aria-label="Close Yantra assistant"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[71] bg-black/70 backdrop-blur-md"
              />
            </AnimatePresence>

            <LiveAssistantPanel
              mode="mobile"
              roomLabel={roomLabel}
              roomSummary={roomSummary}
              roomName={session.roomName}
              isPreparing={isPreparing}
              error={error}
              onClose={() => setIsOpen(false)}
              onEndSession={endSession}
            />
          </div>
        </>
      ) : (
        <>
          <DesktopCollapsedCard
            roomLabel={roomLabel}
            roomName={session.roomName}
            onOpen={() => setIsOpen(true)}
            onEndSession={endSession}
          />

          <MobileLiveLauncher onOpen={() => setIsOpen(true)} />
        </>
      )}
    </LiveKitRoom>
  );
}
