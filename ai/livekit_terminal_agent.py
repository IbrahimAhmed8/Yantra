from __future__ import annotations

import asyncio
import logging
import os
import sys

from dotenv import load_dotenv

try:
    from livekit.agents import Agent, AgentServer, AgentSession, JobContext, JobProcess, cli, inference
    from livekit.agents.llm import ChatMessage
    from livekit.plugins import sarvam, silero
except ImportError as exc:  # pragma: no cover - exercised only when voice extras are missing
    raise SystemExit(
        "LiveKit voice extras are not installed. Run: python -m pip install -e .[voice]"
    ) from exc

from yantra_ai.core.service import ChatService
from yantra_ai.core.prompts import make_voice_friendly_reply
from yantra_ai.schemas.chat import ChatRequest, Message, StudentContext

load_dotenv()

logger = logging.getLogger("yantra-livekit")


def _student_from_env() -> StudentContext:
    return StudentContext(
        name=os.getenv("YANTRA_VOICE_STUDENT_NAME", "Learner"),
        skill_level=os.getenv("YANTRA_VOICE_STUDENT_LEVEL", "Beginner"),
        current_path=os.getenv("YANTRA_VOICE_STUDENT_PATH", "AI Foundations"),
        progress=int(os.getenv("YANTRA_VOICE_STUDENT_PROGRESS", "0")),
    )


def _running_console_mode() -> bool:
    return "console" in sys.argv[1:]


def _running_text_mode() -> bool:
    return "--text" in sys.argv[1:]


def _requesting_help() -> bool:
    return any(arg in {"-h", "--help", "help"} for arg in sys.argv[1:])


def _audio_enabled() -> bool:
    return True


def _voice_backend() -> str:
    backend = os.getenv("YANTRA_VOICE_BACKEND", "inference").strip().lower()
    if backend == "sarvam" and not os.getenv("SARVAM_API_KEY"):
        logger.warning(
            "YANTRA_VOICE_BACKEND=sarvam but SARVAM_API_KEY is missing. Falling back to LiveKit Inference."
        )
        return "inference"
    return backend


def _ensure_livekit_secret_for_room_modes() -> None:
    if _requesting_help():
        return

    if _running_console_mode():
        return

    if len(sys.argv) == 1:
        raise SystemExit(
            "Choose a LiveKit mode. For terminal-only testing, run: "
            "python livekit_terminal_agent.py console"
        )

    if os.getenv("LIVEKIT_API_SECRET"):
        return

    raise SystemExit(
        "LIVEKIT_API_SECRET is required for LiveKit dev/connect/start modes. "
        "For terminal-only local testing, run: python livekit_terminal_agent.py console --text"
    )


def _build_session(ctx: JobContext) -> AgentSession:
    if _audio_enabled() and _voice_backend() == "sarvam":
        return AgentSession(
            stt=sarvam.STT(
                language=os.getenv("YANTRA_SARVAM_STT_LANGUAGE", "en-IN"),
                model=os.getenv("YANTRA_SARVAM_STT_MODEL", "saaras:v3"),
            ),
            tts=sarvam.TTS(
                target_language_code=os.getenv("YANTRA_SARVAM_TTS_LANGUAGE", "en-IN"),
                model=os.getenv("YANTRA_SARVAM_TTS_MODEL", "bulbul:v3-beta"),
                speaker=os.getenv("YANTRA_SARVAM_TTS_SPEAKER", "shubh"),
                pace=float(os.getenv("YANTRA_SARVAM_TTS_PACE", "1.0")),
            ),
            vad=ctx.proc.userdata["vad"],
        )

    logger.info("Starting LiveKit agent with built-in LiveKit Inference STT/TTS.")
    return AgentSession(
        stt=inference.STT(
            model=os.getenv("YANTRA_LIVEKIT_STT_MODEL", "deepgram/nova-3"),
            language=os.getenv("YANTRA_LIVEKIT_STT_LANGUAGE", "en-IN"),
        ),
        tts=inference.TTS(
            model=os.getenv("YANTRA_LIVEKIT_TTS_MODEL", "deepgram/aura-2"),
            voice=os.getenv("YANTRA_LIVEKIT_TTS_VOICE", "zeus"),
            language=os.getenv("YANTRA_LIVEKIT_TTS_LANGUAGE", "en"),
        ),
        vad=ctx.proc.userdata["vad"],
    )


def prewarm(proc: JobProcess) -> None:
    if _audio_enabled():
        proc.userdata["vad"] = silero.VAD.load()


server = AgentServer(setup_fnc=prewarm)


@server.rtc_session(agent_name=os.getenv("YANTRA_LIVEKIT_AGENT_NAME", "yantra-terminal-voice"))
async def yantra_agent(ctx: JobContext) -> None:
    student = _student_from_env()
    chat_service = ChatService()
    session = _build_session(ctx)
    conversation: list[Message] = []
    reply_lock = asyncio.Lock()
    handled_user_inputs: set[str] = set()

    if _running_text_mode():
        logger.info("Console text flag detected. If audio capture is unavailable, use terminal text only.")

    async def handle_user_text(user_text: str) -> None:
        cleaned = user_text.strip()
        if not cleaned:
            return

        dedupe_key = cleaned.casefold()
        if dedupe_key in handled_user_inputs:
            return

        async with reply_lock:
            handled_user_inputs.add(dedupe_key)
            logger.info("Yantra heard: %s", cleaned)
            conversation.append(Message(role="user", content=cleaned))
            request = ChatRequest(
                messages=conversation[-8:],
                student=student,
                top_k=chat_service.settings.top_k,
            )
            response = await asyncio.to_thread(chat_service.reply, request)
            spoken_reply = make_voice_friendly_reply(
                response.reply,
                sentence_limit=int(os.getenv("YANTRA_VOICE_SENTENCE_LIMIT", "0")),
                char_limit=int(os.getenv("YANTRA_VOICE_CHAR_LIMIT", "0")),
            )
            conversation.append(Message(role="assistant", content=spoken_reply))
            logger.info(
                "Yantra reply via %s/%s",
                response.provider,
                response.model_used or "local",
            )
            await session.say(spoken_reply)

    @session.on("user_input_transcribed")
    def on_user_input_transcribed(ev) -> None:
        is_final = getattr(ev, "is_final", False)
        transcript = getattr(ev, "transcript", "")
        if not is_final or not isinstance(transcript, str) or not transcript.strip():
            return

        asyncio.create_task(handle_user_text(transcript))

    @session.on("conversation_item_added")
    def on_conversation_item_added(ev) -> None:
        item = getattr(ev, "item", None)
        if not isinstance(item, ChatMessage) or item.role != "user":
            return

        content = getattr(item, "content", None)
        if not isinstance(content, str) or not content.strip():
            return

        asyncio.create_task(handle_user_text(content))

    @session.on("error")
    def on_session_error(ev) -> None:
        error = getattr(ev, "error", None)
        logger.error("LiveKit session error: %s", error)

    await session.start(
        agent=Agent(
            instructions=(
                "You are Yantra, a warm teacher-guide for the Yantra platform. "
                "Keep spoken replies natural and easy to follow. "
                "Do not artificially shorten the answer for voice unless the learner asks for a very brief reply. "
                "Do not describe yourself as a machine unless the user directly asks."
            )
        ),
        room=ctx.room,
    )
    await ctx.connect()


def main() -> None:
    _ensure_livekit_secret_for_room_modes()
    cli.run_app(server)


if __name__ == "__main__":
    main()
