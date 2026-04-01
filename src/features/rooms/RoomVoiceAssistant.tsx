'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  LoaderCircle,
  Mic,
  PanelRightClose,
  Power,
  Sparkles,
  Square,
  Volume2,
  Waves,
  X,
} from 'lucide-react';
import { forwardRef, type ReactNode, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useOverlayLock } from '@/src/features/motion/ExperienceProvider';

type RoomVoiceAssistantProps = {
  roomKey: string;
  roomLabel: string;
  roomSummary: string;
};

export type RoomVoiceAssistantAnnouncement = {
  transcriptLabel: string;
  reply: string;
  autoOpen?: boolean;
  autoSpeak?: boolean;
};

export type RoomVoiceAssistantHandle = {
  announceSystemReply: (announcement: RoomVoiceAssistantAnnouncement) => Promise<void>;
  clearSystemReply: () => void;
};

type VoiceStatus = 'ready' | 'warming' | 'recording' | 'transcribing' | 'thinking' | 'speaking' | 'error';

type ChatReply = { reply?: string; error?: string };
type TranscriptReply = { transcript?: string; languageCode?: string | null; error?: string };

const MAX_RECORDING_MS = 20_000;
const SPEECH_LEVEL_THRESHOLD = 0.02;
const SILENCE_AUTOSTOP_MS = 1400;
const NO_SPEECH_TIMEOUT_MS = 7000;
const MIN_SPEECH_MS = 450;
const MIN_CAPTURED_LEVEL = 0.08;
const HANDS_FREE_REARM_DELAY_MS = 900;
const PLAYBACK_BOOST_GAIN = 2.4;

type PlaybackOptions = {
  blockedMessage: string;
  failHard?: boolean;
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

function labelForStatus(status: VoiceStatus) {
  switch (status) {
    case 'warming':
      return 'waking backend';
    case 'recording':
      return 'listening';
    case 'transcribing':
      return 'transcribing';
    case 'thinking':
      return 'thinking';
    case 'speaking':
      return 'speaking';
    case 'error':
      return 'needs attention';
    default:
      return 'ready';
  }
}

function createVoiceReply(text: string) {
  let cleaned = text
    .replace(/^Learner,\s*here is the grounded answer\.?\s*/i, '')
    .replace(/^Krish Verma,\s*here is the grounded answer\.?\s*/i, '')
    .replace(/\bsources?>.*$/gis, '')
    .replace(/\bCurrent grounding came from:.*$/gis, '')
    .replace(/\bNext step:.*$/gis, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || 'I am here. Ask me about your code, errors, or the next step in this room.';
}

function toneForStatus(status: VoiceStatus) {
  switch (status) {
    case 'recording':
      return 'from-emerald-300/70 via-white/80 to-emerald-300/70';
    case 'transcribing':
    case 'thinking':
      return 'from-amber-300/70 via-white/82 to-amber-300/70';
    case 'speaking':
      return 'from-cyan-300/70 via-white/88 to-cyan-300/70';
    case 'warming':
      return 'from-white/26 via-white/72 to-white/26';
    case 'error':
      return 'from-rose-300/70 via-white/82 to-rose-300/70';
    default:
      return 'from-white/15 via-white/52 to-white/15';
  }
}

function preferredMimeType() {
  if (typeof MediaRecorder === 'undefined') {
    return '';
  }

  for (const value of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']) {
    if (MediaRecorder.isTypeSupported(value)) {
      return value;
    }
  }

  return '';
}

function VoiceOrb({ status, small = false }: { status: VoiceStatus; small?: boolean }) {
  const tone = toneForStatus(status);
  const sizeClass = small ? 'h-12 w-12' : 'h-28 w-28';
  const pulse = status === 'recording' || status === 'thinking' || status === 'speaking';

  return (
    <div className={`relative flex items-center justify-center ${sizeClass}`}>
      <div className="absolute inset-0 rounded-full border border-cyan-300/12 bg-cyan-300/[0.03]" />
      <motion.div
        className={`absolute inset-[8%] rounded-full bg-gradient-to-br ${tone} blur-2xl`}
        animate={{ opacity: pulse ? [0.18, 0.42, 0.2] : 0.22, scale: pulse ? [0.96, 1.04, 0.98] : 1 }}
        transition={{ duration: 1.6, repeat: pulse ? Infinity : 0, ease: 'easeInOut' }}
      />
      <div className="absolute inset-[18%] rounded-full border border-white/10 bg-black/60" />
      <div className="relative z-10 text-cyan-100/84">
        {status === 'recording' ? <Mic size={small ? 16 : 20} /> : status === 'speaking' ? <Volume2 size={small ? 16 : 20} /> : status === 'warming' || status === 'transcribing' || status === 'thinking' ? <LoaderCircle size={small ? 16 : 20} className="animate-spin" /> : <Waves size={small ? 16 : 20} />}
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  children,
  tone = 'default',
}: {
  onClick: () => void;
  children: ReactNode;
  tone?: 'default' | 'primary' | 'danger';
}) {
  const className =
    tone === 'primary'
      ? 'border-cyan-300/18 bg-cyan-300/10 text-cyan-50 hover:border-cyan-200/30 hover:bg-cyan-300/16'
      : tone === 'danger'
        ? 'border-white/10 bg-white/[0.045] text-white hover:border-rose-300/24 hover:bg-rose-400/10'
        : 'border-white/10 bg-white/[0.045] text-white hover:border-cyan-200/28 hover:bg-cyan-300/10';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[1.2rem] border px-4 py-3 text-sm font-medium transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

const RoomVoiceAssistant = forwardRef<RoomVoiceAssistantHandle, RoomVoiceAssistantProps>(function RoomVoiceAssistant(
  { roomLabel, roomSummary }: RoomVoiceAssistantProps,
  ref,
) {
  const isDesktop = useDesktopSidebar();
  const [isLaunched, setIsLaunched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [handsFreeEnabled, setHandsFreeEnabled] = useState(false);
  const [status, setStatus] = useState<VoiceStatus>('ready');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [backendReady, setBackendReady] = useState(false);
  const [audioPrimed, setAudioPrimed] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const autoStopTimerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);
  const requestNonceRef = useRef(0);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const inputMonitorFrameRef = useRef<number | null>(null);
  const heardSpeechRef = useRef(false);
  const heardSpeechMsRef = useRef(0);
  const peakMicLevelRef = useRef(0);
  const silentSinceRef = useRef<number | null>(null);
  const noSpeechTimerRef = useRef<number | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const shouldResumeAfterSpeechRef = useRef(false);
  const handsFreeEnabledRef = useRef(false);
  const lastAnalyserTickRef = useRef<number | null>(null);

  useOverlayLock('room-voice-assistant', isOpen && !isDesktop);

  const stateLabel = useMemo(() => labelForStatus(status), [status]);

  useEffect(() => {
    handsFreeEnabledRef.current = handsFreeEnabled;
  }, [handsFreeEnabled]);

  useEffect(() => {
    return () => {
      if (autoStopTimerRef.current !== null) {
        window.clearTimeout(autoStopTimerRef.current);
      }
      if (noSpeechTimerRef.current !== null) {
        window.clearTimeout(noSpeechTimerRef.current);
      }
      mediaRecorderRef.current?.stop();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
      }
      if (inputMonitorFrameRef.current !== null) {
        window.cancelAnimationFrame(inputMonitorFrameRef.current);
      }
      if (inputAudioContextRef.current) {
        void inputAudioContextRef.current.close().catch(() => undefined);
      }
      if (outputAudioContextRef.current) {
        void outputAudioContextRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  async function ensureOutputBoost() {
    const element = audioRef.current;
    if (!element || typeof window.AudioContext === 'undefined') {
      return;
    }

    if (!outputAudioContextRef.current) {
      const context = new window.AudioContext();
      const source = context.createMediaElementSource(element);
      const gainNode = context.createGain();
      gainNode.gain.value = PLAYBACK_BOOST_GAIN;
      source.connect(gainNode);
      gainNode.connect(context.destination);
      outputAudioContextRef.current = context;
      outputSourceRef.current = source;
      outputGainRef.current = gainNode;
    }

    if (outputAudioContextRef.current.state === 'suspended') {
      await outputAudioContextRef.current.resume();
    }
  }

  async function primeAudio() {
    const element = audioRef.current;
    if (!element) {
      return;
    }
    await ensureOutputBoost();
    element.muted = false;
    element.volume = 1;
    setAudioPrimed(true);
    setNotice(null);
  }

  async function checkBackendHealth() {
    setStatus('warming');
    try {
      const response = await fetch('/api/chat/health', { method: 'GET', cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Yantra backend is still waking up.');
      }
      setBackendReady(true);
      setStatus('ready');
      setError(null);
      setNotice(null);
    } catch (healthError) {
      setBackendReady(false);
      setStatus('error');
      setError(healthError instanceof Error ? healthError.message : 'Yantra backend is unavailable right now.');
    }
  }

  async function openAssistant() {
    setIsLaunched(true);
    setIsOpen(true);
    setError(null);
    setNotice(null);
    await checkBackendHealth();
  }

  function clearDisplayedReply() {
    setUserTranscript('');
    setAssistantReply('');
    setNotice(null);
  }

  function clearRecordingState() {
    if (autoStopTimerRef.current !== null) {
      window.clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (noSpeechTimerRef.current !== null) {
      window.clearTimeout(noSpeechTimerRef.current);
      noSpeechTimerRef.current = null;
    }
    if (inputMonitorFrameRef.current !== null) {
      window.cancelAnimationFrame(inputMonitorFrameRef.current);
      inputMonitorFrameRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
    heardSpeechRef.current = false;
    heardSpeechMsRef.current = 0;
    peakMicLevelRef.current = 0;
    silentSinceRef.current = null;
    lastAnalyserTickRef.current = null;
    setMicLevel(0);
    inputSourceRef.current?.disconnect();
    inputAnalyserRef.current?.disconnect();
    inputSourceRef.current = null;
    inputAnalyserRef.current = null;
    if (inputAudioContextRef.current) {
      void inputAudioContextRef.current.close().catch(() => undefined);
      inputAudioContextRef.current = null;
    }
  }

  function beginHandsFreeLoop() {
    setHandsFreeEnabled(true);
    handsFreeEnabledRef.current = true;
  }

  function stopHandsFreeLoop() {
    setHandsFreeEnabled(false);
    handsFreeEnabledRef.current = false;
    shouldResumeAfterSpeechRef.current = false;
  }

  function stopRecordingWithReason() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }

  function startInputMonitoring(stream: MediaStream) {
    if (!window.AudioContext) {
      return;
    }

    const context = new window.AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.86;
    source.connect(analyser);

    inputAudioContextRef.current = context;
    inputSourceRef.current = source;
    inputAnalyserRef.current = analyser;

    const samples = new Float32Array(analyser.fftSize);

    const tick = () => {
      const activeAnalyser = inputAnalyserRef.current;
      const activeRecorder = mediaRecorderRef.current;

      if (!activeAnalyser || !activeRecorder || activeRecorder.state !== 'recording') {
        setMicLevel(0);
        return;
      }

      activeAnalyser.getFloatTimeDomainData(samples);
      let sumSquares = 0;
      for (const sample of samples) {
        sumSquares += sample * sample;
      }

      const rms = Math.sqrt(sumSquares / samples.length);
      const normalizedLevel = Math.min(1, rms * 10);
      setMicLevel(normalizedLevel);
      peakMicLevelRef.current = Math.max(peakMicLevelRef.current, normalizedLevel);

      const now = performance.now();
      const deltaMs = lastAnalyserTickRef.current === null ? 0 : now - lastAnalyserTickRef.current;
      lastAnalyserTickRef.current = now;
      if (rms >= SPEECH_LEVEL_THRESHOLD) {
        heardSpeechRef.current = true;
        heardSpeechMsRef.current += deltaMs;
        silentSinceRef.current = null;
      } else if (heardSpeechRef.current) {
        if (silentSinceRef.current === null) {
          silentSinceRef.current = now;
        } else if (now - silentSinceRef.current >= SILENCE_AUTOSTOP_MS) {
          stopRecordingWithReason();
          return;
        }
      }

      inputMonitorFrameRef.current = window.requestAnimationFrame(tick);
    };

    inputMonitorFrameRef.current = window.requestAnimationFrame(tick);
  }

  async function playReply(blob: Blob, options: PlaybackOptions) {
    const element = audioRef.current;
    if (!element) {
      return;
    }

    await ensureOutputBoost();

    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
    }

    const url = URL.createObjectURL(blob);
    currentAudioUrlRef.current = url;
    element.src = url;
    element.load();
    element.currentTime = 0;
    element.muted = false;
    element.volume = 1;
    setNotice(null);

    try {
      await element.play();
      setAudioPrimed(true);
      setStatus('speaking');
      shouldResumeAfterSpeechRef.current = handsFreeEnabledRef.current;
    } catch {
      if (options.failHard ?? true) {
        setStatus('error');
        setError(options.blockedMessage);
      } else {
        setStatus('ready');
        setNotice(options.blockedMessage);
      }
      shouldResumeAfterSpeechRef.current = false;
    }
  }

  async function speakAssistantReply(reply: string) {
    try {
      const ttsResponse = await fetch('/api/sarvam/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply }),
      });

      if (!ttsResponse.ok) {
        const ttsError = (await ttsResponse.json().catch(() => ({}))) as { error?: string };
        setStatus('ready');
        setNotice(ttsError.error || 'Yantra wrote the reply, but audio playback is unavailable right now.');
        return;
      }

      const audioBlob = await ttsResponse.blob();
      await playReply(audioBlob, {
        blockedMessage: 'Yantra wrote the reply, but the browser blocked audio playback. Use "Turn on audio" if you want spoken feedback.',
        failHard: false,
      });
    } catch (speechError) {
      setStatus('ready');
      setNotice(speechError instanceof Error ? speechError.message : 'Yantra wrote the reply, but audio playback is unavailable right now.');
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      async announceSystemReply({ transcriptLabel, reply, autoOpen = true, autoSpeak = true }) {
        const sanitizedReply = createVoiceReply(reply);
        const busyCapturing = status === 'recording' || status === 'transcribing' || status === 'thinking';

        requestNonceRef.current += 1;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        setBackendReady(true);
        setError(null);
        setNotice(null);
        setIsLaunched(true);
        setUserTranscript(transcriptLabel.trim());
        setAssistantReply(sanitizedReply);
        setMessages((current) => [...current.slice(-7), { role: 'assistant', content: sanitizedReply }]);

        if (!busyCapturing && autoOpen) {
          setIsOpen(true);
        }

        if (busyCapturing) {
          return;
        }

        setStatus('ready');

        if (autoSpeak) {
          await speakAssistantReply(sanitizedReply);
        }
      },
      clearSystemReply() {
        clearDisplayedReply();
      },
    }),
    [status],
  );

  async function handleAudio(blob: Blob) {
    if (blob.size === 0) {
      setStatus('error');
      setError('No voice was captured. Try speaking closer to the microphone.');
      return;
    }

    const requestNonce = requestNonceRef.current + 1;
    requestNonceRef.current = requestNonce;

    try {
      setStatus('transcribing');
      setError(null);
      setNotice(null);

      const formData = new FormData();
      formData.append('file', new File([blob], 'yantra-room.webm', { type: blob.type || 'audio/webm' }));

      const transcriptResponse = await fetch('/api/sarvam/stt', { method: 'POST', body: formData });
      const transcriptData = (await transcriptResponse.json()) as TranscriptReply;

      if (!transcriptResponse.ok || !transcriptData.transcript?.trim()) {
        if (handsFreeEnabledRef.current) {
          setStatus('ready');
          setError(null);
          setUserTranscript('');
          window.setTimeout(() => {
            if (handsFreeEnabledRef.current && !mediaRecorderRef.current) {
              void startRecording();
            }
          }, HANDS_FREE_REARM_DELAY_MS);
          return;
        }
        const message = transcriptData.error || 'Sarvam could not transcribe the audio.';
        throw new Error(message);
      }

      const transcript = transcriptData.transcript.trim();
      setUserTranscript(transcript);

      setStatus('thinking');
      const nextMessages = [...messages, { role: 'user' as const, content: transcript }];
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const chatData = (await chatResponse.json()) as ChatReply;

      if (!chatResponse.ok || !chatData.reply?.trim()) {
        throw new Error(chatData.error || 'Yantra could not answer right now.');
      }

      const reply = createVoiceReply(chatData.reply.trim());
      setMessages([...nextMessages, { role: 'assistant' as const, content: reply }].slice(-8));
      setAssistantReply(reply);

      const ttsResponse = await fetch('/api/sarvam/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: reply,
          languageCode: transcriptData.languageCode ?? undefined,
        }),
      });

      if (!ttsResponse.ok) {
        const ttsError = (await ttsResponse.json().catch(() => ({}))) as { error?: string };
        throw new Error(ttsError.error || 'Sarvam could not speak the reply.');
      }

      const audioBlob = await ttsResponse.blob();
      if (requestNonce === requestNonceRef.current) {
        await playReply(audioBlob, {
          blockedMessage: 'Yantra has a reply ready, but the browser blocked playback. Click "Turn on audio" and try again.',
        });
      }
    } catch (requestError) {
      if (handsFreeEnabledRef.current) {
        setStatus('ready');
        setError(null);
        shouldResumeAfterSpeechRef.current = false;
        setUserTranscript('');
        window.setTimeout(() => {
          if (handsFreeEnabledRef.current && !mediaRecorderRef.current) {
            void startRecording();
          }
        }, HANDS_FREE_REARM_DELAY_MS);
      } else {
        setStatus('error');
        setError(requestError instanceof Error ? requestError.message : 'Voice request failed.');
        shouldResumeAfterSpeechRef.current = false;
      }
    }
  }

  async function startRecording() {
    try {
      await primeAudio();
      setError(null);
      setNotice(null);
      setStatus('recording');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];

      const mimeType = preferredMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      startInputMonitoring(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      recorder.onerror = () => {
        setStatus('error');
        setError('The microphone stream failed while recording.');
        clearRecordingState();
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType || 'audio/webm' });
        const capturedSpeech = heardSpeechRef.current;
        const capturedSpeechMs = heardSpeechMsRef.current;
        const capturedPeakLevel = peakMicLevelRef.current;
        clearRecordingState();
        if (!capturedSpeech || capturedSpeechMs < MIN_SPEECH_MS || capturedPeakLevel < MIN_CAPTURED_LEVEL) {
          if (handsFreeEnabledRef.current) {
            setStatus('ready');
            setError(null);
            window.setTimeout(() => {
              if (handsFreeEnabledRef.current && !mediaRecorderRef.current) {
                void startRecording();
              }
            }, HANDS_FREE_REARM_DELAY_MS);
            return;
          }
          setStatus('error');
          setError('Yantra did not detect speech from the microphone. Check the selected mic, speak closer, or start hands-free again.');
          return;
        }
        void handleAudio(blob);
      };

      recorder.start();
      autoStopTimerRef.current = window.setTimeout(() => {
        stopRecordingWithReason();
      }, MAX_RECORDING_MS);
      noSpeechTimerRef.current = window.setTimeout(() => {
        if (!heardSpeechRef.current) {
          stopRecordingWithReason();
        }
      }, NO_SPEECH_TIMEOUT_MS);
    } catch (recordingError) {
      clearRecordingState();
      setStatus('error');
      setError(recordingError instanceof Error ? recordingError.message : 'Yantra could not access your microphone.');
    }
  }

  function stopRecording() {
    stopRecordingWithReason();
  }

  function toggleRecording() {
    if (handsFreeEnabled) {
      stopHandsFreeLoop();
      if (status === 'recording') {
        stopRecording();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (status !== 'error') {
        setStatus('ready');
      }
      return;
    }

    beginHandsFreeLoop();

    if (status === 'recording') {
      stopRecording();
      return;
    }

    if (status === 'transcribing' || status === 'thinking') {
      return;
    }

    void startRecording();
  }

  function retryAssistant() {
    setError(null);
    setStatus('ready');
    setBackendReady(false);
    void checkBackendHealth();
  }

  function endSession() {
    stopHandsFreeLoop();
    stopRecording();
    clearRecordingState();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }
    requestNonceRef.current += 1;
    setIsLaunched(false);
    setIsOpen(false);
    setStatus('ready');
    setError(null);
    setBackendReady(false);
    setUserTranscript('');
    setAssistantReply('');
    setMessages([]);
    setNotice(null);
  }

  function handleAudioEnded() {
    setStatus('ready');

    if (!shouldResumeAfterSpeechRef.current) {
      return;
    }

    shouldResumeAfterSpeechRef.current = false;

    window.setTimeout(() => {
      if (!handsFreeEnabledRef.current || mediaRecorderRef.current || status === 'error') {
        return;
      }

      void startRecording();
    }, HANDS_FREE_REARM_DELAY_MS);
  }

  const panel = (
    <motion.aside
      initial={isDesktop ? { opacity: 0, x: 18 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={isDesktop ? { opacity: 0, x: 14 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className={
        isDesktop
          ? 'sticky top-28 flex h-[calc(100svh-8.5rem)] max-h-[calc(100svh-8.5rem)] self-start overflow-hidden rounded-[2rem] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(4,10,16,0.96),rgba(2,6,10,0.98))] shadow-[0_20px_64px_rgba(0,0,0,0.3)] backdrop-blur-[24px]'
          : 'fixed inset-x-3 bottom-3 top-20 z-[72] flex overflow-hidden rounded-[2rem] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(4,10,16,0.96),rgba(2,6,10,0.98))] shadow-[0_28px_100px_rgba(0,0,0,0.55)] backdrop-blur-[24px]'
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="border-b border-white/8 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-100/42">Yantra Voice</div>
              <div className="mt-3 flex min-w-0 items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/18 bg-cyan-300/8 text-cyan-100">
                  <Sparkles size={17} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold tracking-tight text-white">{roomLabel}</div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-100/58">{stateLabel}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={endSession} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/58 transition-colors hover:border-rose-300/28 hover:text-rose-200" aria-label="End Yantra session"><Power size={15} /></button>
              <button type="button" onClick={() => setIsOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/58 transition-colors hover:border-white/20 hover:text-white" aria-label="Close Yantra sidebar">{isDesktop ? <PanelRightClose size={15} /> : <X size={15} />}</button>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-white/58">{roomSummary}</p>

          <div className="mt-4 space-y-3">
            <div className="rounded-[1.05rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/72">
              Backend: <span className={backendReady ? 'text-emerald-200' : 'text-amber-200'}>{backendReady ? 'awake' : 'warming up'}</span>
            </div>
            {status === 'recording' ? (
              <div className="rounded-[1.05rem] border border-cyan-300/14 bg-cyan-300/[0.06] px-4 py-3 text-sm text-cyan-50/86">
                Hands-free is on. Speak now and Yantra will send automatically when you pause.
              </div>
            ) : null}
            {handsFreeEnabled && status !== 'recording' && status !== 'transcribing' && status !== 'thinking' && status !== 'speaking' ? (
              <div className="rounded-[1.05rem] border border-emerald-300/14 bg-emerald-300/[0.06] px-4 py-3 text-sm text-emerald-50/86">
                Hands-free is armed. Yantra will start listening again after each spoken reply.
              </div>
            ) : null}
            {!audioPrimed ? (
              <ActionButton onClick={() => { void primeAudio(); }} tone="primary">
                <Volume2 size={15} />
                <span>Turn on audio</span>
              </ActionButton>
            ) : null}
            {error ? (
              <>
                <div className="max-h-40 overflow-y-auto break-words rounded-[1.05rem] border border-rose-300/18 bg-rose-400/10 px-4 py-3 text-sm leading-relaxed text-rose-100">
                  {error}
                </div>
                <ActionButton onClick={retryAssistant}>
                  <Sparkles size={15} />
                  <span>Try again</span>
                </ActionButton>
              </>
            ) : null}
            {notice ? (
              <div className="max-h-40 overflow-y-auto break-words rounded-[1.05rem] border border-amber-300/16 bg-amber-300/[0.08] px-4 py-3 text-sm leading-relaxed text-amber-50/88">
                {notice}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4 pt-4">
            <div className="shrink-0 rounded-[1.5rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(90,220,255,0.14),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] px-4 py-4">
              <div className="flex flex-col items-center text-center">
                <VoiceOrb status={status} />
                <div className="mt-3 text-2xl font-semibold tracking-tight text-white">Yantra</div>
                <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/58">{stateLabel}</div>
                <div className="mt-4 w-full rounded-full border border-white/8 bg-black/34 p-1">
                  <div className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(80,230,255,0.25),rgba(80,230,255,0.9))] transition-[width] duration-100" style={{ width: `${Math.max(4, micLevel * 100)}%` }} />
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/36">Mic level</div>
              </div>
            </div>

            <div className="shrink-0 rounded-[1.5rem] border border-white/8 bg-black/28 p-4">
              <div className="mb-3 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-white/40">
                <span>Your voice</span>
                <span className={status === 'recording' ? 'text-emerald-200' : 'text-white/48'}>{status === 'recording' ? 'capturing' : 'idle'}</span>
              </div>
              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">Heard you say</div>
                <div className="mt-2 text-sm leading-relaxed text-white/74">{userTranscript || 'Press Mic once to arm hands-free mode, then speak naturally. Yantra will send after you pause.'}</div>
              </div>
              <div className="mt-3 rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-3">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/38"><Volume2 size={13} />Yantra reply</div>
                <div className="mt-2 max-h-40 overflow-y-auto text-sm leading-relaxed text-white/74">{assistantReply || 'Yantra’s next spoken answer will appear here.'}</div>
              </div>
            </div>

            {error ? (
              <div className="shrink-0 rounded-[1.35rem] border border-rose-300/18 bg-rose-400/10 p-4 text-sm text-rose-100">
                <div className="flex items-start gap-3"><AlertTriangle size={16} className="mt-0.5" /><span>{error}</span></div>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-white/8 bg-black/26 px-5 py-4">
            <div className="grid grid-cols-2 gap-3">
              <ActionButton onClick={toggleRecording}>
                {handsFreeEnabled ? <Square size={16} /> : <Mic size={16} />}
                <span>{handsFreeEnabled ? 'Pause Voice' : 'Start Hands-Free'}</span>
              </ActionButton>
              <ActionButton onClick={endSession} tone="danger">
                <Power size={16} />
                <span>End</span>
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        playsInline
        onEnded={handleAudioEnded}
      />

      {!isLaunched ? (
        <>
          <aside className="hidden xl:block xl:sticky xl:top-28 xl:self-start">
            <div className="overflow-hidden rounded-[2rem] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(4,10,16,0.96),rgba(2,6,10,0.98))] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.3)] backdrop-blur-[24px] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/16 bg-cyan-300/8 text-cyan-100">
                  {status === 'warming' ? <LoaderCircle size={18} className="animate-spin" /> : <Sparkles size={18} />}
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-cyan-100/42">Yantra Voice</div>
                  <div className="mt-1 text-lg font-semibold tracking-tight text-white">{roomLabel}</div>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-white/60">{roomSummary}</p>
              <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-black/28 p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/38">Sarvam voice flow</div>
                <div className="mt-3 text-sm leading-relaxed text-white/72">Speak into the room, let Sarvam transcribe it, route the prompt through Yantra chat, then hear the answer back in a natural voice.</div>
              </div>
              {error ? <div className="mt-5 rounded-[1.35rem] border border-rose-300/18 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
              <button type="button" onClick={() => { void openAssistant(); }} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-black transition-transform duration-300 hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70" disabled={status === 'warming'}>
                {status === 'warming' ? <LoaderCircle size={16} className="animate-spin" /> : <Mic size={16} />}
                <span>{status === 'warming' ? 'Opening' : 'Open Yantra'}</span>
              </button>
            </div>
          </aside>

          <motion.button
            type="button"
            onClick={() => { void openAssistant(); }}
            className="pointer-events-auto fixed bottom-5 right-4 z-[55] flex items-center gap-3 rounded-full border border-cyan-300/18 bg-black/78 px-4 py-3 text-left shadow-[0_20px_70px_rgba(0,0,0,0.56)] backdrop-blur-2xl transition-colors hover:border-cyan-200/34 sm:right-5 lg:bottom-7 lg:right-6 xl:hidden"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Open Yantra room assistant"
          >
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,rgba(80,230,255,0.22),rgba(0,0,0,0.92))]">
              <div className="absolute inset-[0.22rem] rounded-full bg-cyan-300/18 blur-md" />
              {status === 'warming' ? <LoaderCircle size={18} className="relative z-10 animate-spin text-white" /> : <Sparkles size={18} className="relative z-10 text-white" />}
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">Room AI</div>
              <div className="mt-1 text-sm font-medium text-white">Launch Yantra</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100/62">{stateLabel}</div>
            </div>
          </motion.button>
        </>
      ) : !isOpen ? (
        <>
          <aside className="hidden xl:block xl:sticky xl:top-28 xl:self-start">
            <div className="overflow-hidden rounded-[2rem] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(4,10,16,0.96),rgba(2,6,10,0.98))] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.3)] backdrop-blur-[24px] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <VoiceOrb status={status} small />
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-100/42">Yantra Voice</div>
                    <div className="truncate text-base font-semibold tracking-tight text-white">{roomLabel}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100/62">{stateLabel}</div>
                  </div>
                </div>
                <button type="button" onClick={endSession} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/58 transition-colors hover:border-rose-300/28 hover:text-rose-200" aria-label="End Yantra session"><Power size={15} /></button>
              </div>

              <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-black/26 p-4">
                <div className="text-sm leading-relaxed text-white/74">
                  Yantra is ready on the side while you code in <span className="font-semibold text-white">{roomLabel}</span>. Open the sidebar whenever you want to talk.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-cyan-300/18 bg-cyan-300/8 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-100 transition-colors hover:border-cyan-200/36 hover:bg-cyan-300/14"
              >
                <Sparkles size={16} />
                Open Sidebar
              </button>
            </div>
          </aside>

          <motion.button
            type="button"
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto fixed bottom-5 right-4 z-[55] flex items-center gap-3 rounded-full border border-cyan-300/18 bg-black/78 px-4 py-3 text-left shadow-[0_20px_70px_rgba(0,0,0,0.56)] backdrop-blur-2xl transition-colors hover:border-cyan-200/34 sm:right-5 lg:bottom-7 lg:right-6 xl:hidden"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Open Yantra room assistant"
          >
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,rgba(80,230,255,0.22),rgba(0,0,0,0.92))]">
              <div className="absolute inset-[0.22rem] rounded-full bg-cyan-300/18 blur-md" />
              <Waves size={18} className="relative z-10 text-white" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">Room AI</div>
              <div className="mt-1 text-sm font-medium text-white">Yantra Voice</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100/62">{stateLabel}</div>
            </div>
          </motion.button>
        </>
      ) : (
        <>
          <div className="hidden xl:block">{panel}</div>
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
            {panel}
          </div>
        </>
      )}
    </>
  );
});

export default RoomVoiceAssistant;
