from __future__ import annotations

from dataclasses import dataclass
import re
from time import monotonic

from yantra_ai.core.config import get_settings
from yantra_ai.core.copilot_cli import CopilotCliError, get_copilot_cli_client
from yantra_ai.core.providers import ProviderExhaustedError, build_provider_ring_router
from yantra_ai.core.prompts import (
    INTENT_FALLBACKS,
    build_system_prompt,
    build_python_room_feedback_system_prompt,
    detect_intent,
    format_grounded_sections,
    make_voice_friendly_reply,
    take_key_sentences,
)
from yantra_ai.core.rag import RetrievalBatch, SearchResult, search_knowledge_details
from yantra_ai.schemas.chat import ChatRequest, ChatResponse, Message, SourceSnippet
from yantra_ai.schemas.room_feedback import PythonRoomFeedbackRequest, PythonRoomFeedbackResponse

SMALLTALK_RE = re.compile(
    r"^(hi|hello|hey|yo|sup|hola|good morning|good afternoon|good evening)"
    r"( yantra| there| bud| man)?[!?. ]*$",
    re.IGNORECASE,
)
CHITCHAT_RE = re.compile(
    r"^(wow(?: .+)?|ok(?:ay)?|cool|nice|great|awesome|amazing|thanks?|thank you|thx|"
    r"how are you|what'?s up|whats up|you are the best|you're the best|yu are the best|"
    r"haha|lol|hmm+|good job)[!?. ]*$",
    re.IGNORECASE,
)
NAME_ERROR_RE = re.compile(r"name ['\"]([^'\"]+)['\"] is not defined", re.IGNORECASE)
ATTRIBUTE_ERROR_RE = re.compile(r"['\"]([^'\"]+)['\"] object has no attribute ['\"]([^'\"]+)['\"]", re.IGNORECASE)
KEY_ERROR_RE = re.compile(r"['\"]([^'\"]+)['\"]")


@dataclass
class CacheEntry:
    expires_at: float
    value: object


class ChatService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.provider_router = build_provider_ring_router(self.settings)
        self._retrieval_cache: dict[tuple[object, ...], CacheEntry] = {}
        self._response_cache: dict[tuple[object, ...], CacheEntry] = {}

    def reply(self, request: ChatRequest) -> ChatResponse:
        last_user_message = next(
            (message.content for message in reversed(request.messages) if message.role == "user"),
            "",
        )

        response_key = self._response_cache_key(request)
        cached_response = self._cache_get(self._response_cache, response_key)
        if isinstance(cached_response, ChatResponse):
            return cached_response.model_copy(deep=True)

        if self._is_smalltalk(last_user_message):
            response = ChatResponse(
                reply=self._compose_smalltalk_reply(request),
                intent="general",
                context_used=False,
                retrieval_mode="none",
                provider="local-greeting",
                model_used=None,
                sources=[],
            )
            self._cache_set(
                self._response_cache,
                response_key,
                response,
                ttl_s=self.settings.response_cache_ttl_s,
                max_entries=self.settings.response_cache_max_entries,
            )
            return response.model_copy(deep=True)

        intent = detect_intent(last_user_message)
        if self._should_skip_retrieval(question=last_user_message, intent=intent):
            retrieval = RetrievalBatch(mode="none", results=[])
        else:
            retrieval = self._get_retrieval(last_user_message, top_k=request.top_k)
        results = retrieval.results
        knowledge_context = self._build_prompt_context(results)
        system_prompt = build_system_prompt(request.student, intent, knowledge_context)

        reply, provider, model_used = self._generate_reply(
            request=request,
            question=last_user_message,
            intent=intent,
            results=results,
            system_prompt=system_prompt,
        )

        response = ChatResponse(
            reply=reply,
            intent=intent,
            context_used=bool(results),
            retrieval_mode=retrieval.mode,
            provider=provider,
            model_used=model_used,
            sources=[
                SourceSnippet(
                    title=result.title,
                    path=result.path,
                    score=result.score,
                    excerpt=result.text[: self.settings.max_excerpt_chars].strip(),
                )
                for result in results
            ],
        )
        self._cache_set(
            self._response_cache,
            response_key,
            response,
            ttl_s=self.settings.response_cache_ttl_s,
            max_entries=self.settings.response_cache_max_entries,
        )
        return response.model_copy(deep=True)

    def python_room_feedback(self, request: PythonRoomFeedbackRequest) -> PythonRoomFeedbackResponse:
        response_key = self._python_room_feedback_cache_key(request)
        cached_response = self._cache_get(self._response_cache, response_key)
        if isinstance(cached_response, PythonRoomFeedbackResponse):
            return cached_response.model_copy(deep=True)

        line_snippet = self._python_room_line_snippet(request)
        system_prompt = build_python_room_feedback_system_prompt(
            request.student,
            request,
            line_snippet,
        )
        reply, provider, model_used = self._generate_python_room_feedback_reply(
            request=request,
            system_prompt=system_prompt,
        )

        response = PythonRoomFeedbackResponse(
            reply=make_voice_friendly_reply(reply, sentence_limit=2, char_limit=220) or self._compose_python_room_feedback_reply(request),
            provider=provider,
            model_used=model_used,
        )
        if provider not in {"local-room-feedback", "ring-exhausted"}:
            self._cache_set(
                self._response_cache,
                response_key,
                response,
                ttl_s=self.settings.response_cache_ttl_s,
                max_entries=self.settings.response_cache_max_entries,
            )
        return response.model_copy(deep=True)

    def _generate_reply(
        self,
        *,
        request: ChatRequest,
        question: str,
        intent: str,
        results: list[SearchResult],
        system_prompt: str,
    ) -> tuple[str, str, str | None]:
        if self.settings.chat_provider == "ring" and not self._has_configured_provider_credentials():
            return (
                self._compose_reply(
                    question=question,
                    student_name=request.student.name,
                    intent=intent,
                    results=results,
                ),
                "local-fallback",
                None,
            )

        if self._should_use_fast_path(question=question, intent=intent, results=results):
            return (
                self._compose_reply(
                    question=question,
                    student_name=request.student.name,
                    intent=intent,
                    results=results,
                ),
                "local-fast",
                None,
            )

        if self.settings.chat_provider == "ring":
            try:
                result = self.provider_router.generate(
                    system_prompt=system_prompt,
                    messages=request.messages,
                )
                return result.text, result.lane_name, result.model
            except ProviderExhaustedError as exc:
                return str(exc), "ring-exhausted", None

        if self.settings.chat_provider == "copilot-cli":
            try:
                reply = get_copilot_cli_client(self.settings).generate(
                    system_prompt=system_prompt,
                    messages=request.messages,
                    knowledge_dir=self.settings.knowledge_dir,
                )
                return reply, "copilot-cli", self.settings.copilot_model
            except CopilotCliError:
                pass

        return (
            self._compose_reply(
                question=question,
                student_name=request.student.name,
                intent=intent,
                results=results,
            ),
            "local",
            None,
        )

    def _generate_python_room_feedback_reply(
        self,
        *,
        request: PythonRoomFeedbackRequest,
        system_prompt: str,
    ) -> tuple[str, str, str | None]:
        if self.settings.chat_provider == "ring" and not self._has_configured_provider_credentials():
            return self._compose_python_room_feedback_reply(request), "local-room-feedback", None

        messages = [Message(role="user", content=self._format_python_room_feedback_message(request))]

        if self.settings.chat_provider == "ring":
            try:
                result = self.provider_router.generate(
                    system_prompt=system_prompt,
                    messages=messages,
                )
                return result.text, result.lane_name, result.model
            except ProviderExhaustedError:
                return self._compose_python_room_feedback_reply(request), "local-room-feedback", None

        if self.settings.chat_provider == "copilot-cli":
            try:
                reply = get_copilot_cli_client(self.settings).generate(
                    system_prompt=system_prompt,
                    messages=messages,
                    knowledge_dir=self.settings.knowledge_dir,
                )
                return reply, "copilot-cli", self.settings.copilot_model
            except CopilotCliError:
                pass

        return self._compose_python_room_feedback_reply(request), "local-room-feedback", None

    def _build_prompt_context(self, results: list[SearchResult]) -> str:
        sections = []
        for result in results[:3]:
            sections.append(
                f"## {result.title}\n{take_key_sentences(result.text, limit=2)}"
            )

        return format_grounded_sections(sections)

    def _get_retrieval(self, question: str, *, top_k: int) -> object:
        key = (question.strip().lower(), top_k, self.settings.embedding_backend)
        cached = self._cache_get(self._retrieval_cache, key)
        if cached is not None:
            return cached

        retrieval = search_knowledge_details(question, top_k=top_k, settings=self.settings)
        self._cache_set(
            self._retrieval_cache,
            key,
            retrieval,
            ttl_s=self.settings.retrieval_cache_ttl_s,
            max_entries=self.settings.retrieval_cache_max_entries,
        )
        return retrieval

    def _should_use_fast_path(
        self,
        *,
        question: str,
        intent: str,
        results: list[SearchResult],
    ) -> bool:
        if (
            not self.settings.fast_responses
            or not results
            or self.settings.chat_provider == "ring"
        ):
            return False

        word_count = len(question.split())
        return intent == "teach" and word_count <= 8

    def _should_skip_retrieval(self, *, question: str, intent: str) -> bool:
        if intent != "general":
            return False

        return bool(CHITCHAT_RE.fullmatch(question.strip()))

    def _has_configured_provider_credentials(self) -> bool:
        for lane_name in self.settings.provider_chain:
            lane = self.settings.provider_lane(lane_name)
            if lane is not None and lane.api_key:
                return True

        return False

    def _response_cache_key(self, request: ChatRequest) -> tuple[object, ...]:
        message_items = tuple((message.role, message.content) for message in request.messages[-8:])
        student = request.student
        goals = tuple(student.learning_goals)
        return (
            self.settings.chat_provider,
            self.settings.fast_responses,
            request.top_k,
            student.name,
            student.skill_level,
            student.current_path,
            student.progress,
            goals,
            message_items,
        )

    def _python_room_feedback_cache_key(self, request: PythonRoomFeedbackRequest) -> tuple[object, ...]:
        return (
            "python-room-feedback",
            self.settings.chat_provider,
            request.student.name,
            request.student.skill_level,
            request.student.current_path,
            request.task,
            request.code,
            request.error.type,
            request.error.message,
            request.error.line,
        )

    def _cache_get(self, store: dict[tuple[object, ...], CacheEntry], key: tuple[object, ...]) -> object | None:
        entry = store.get(key)
        if entry is None:
            return None
        if entry.expires_at <= monotonic():
            store.pop(key, None)
            return None
        return entry.value

    def _cache_set(
        self,
        store: dict[tuple[object, ...], CacheEntry],
        key: tuple[object, ...],
        value: object,
        *,
        ttl_s: int,
        max_entries: int,
    ) -> None:
        if max_entries <= 0 or ttl_s <= 0:
            return

        store[key] = CacheEntry(expires_at=monotonic() + ttl_s, value=value)
        if len(store) <= max_entries:
            return

        while len(store) > max_entries:
            oldest_key = min(store, key=lambda item: store[item].expires_at)
            store.pop(oldest_key, None)

    def _is_smalltalk(self, message: str) -> bool:
        return bool(SMALLTALK_RE.fullmatch(message.strip()))

    def _compose_smalltalk_reply(self, request: ChatRequest) -> str:
        student = request.student
        goals = ", ".join(student.learning_goals[:1]) if student.learning_goals else "set one with /goal add"

        return (
            f"Hey {student.name}, good to see you. You’re in {student.current_path} and at {student.progress}% progress. "
            f"Current focus: {goals}."
        )

    def _compose_reply(
        self,
        *,
        question: str,
        student_name: str,
        intent: str,
        results: list[SearchResult],
    ) -> str:
        opener = {
            "debug": f"{student_name}, let us keep this diagnosis narrow.",
            "quiz": f"{student_name}, quizzes are not live yet, but here is the grounded version.",
            "guidance": f"{student_name}, here is the clearest next move.",
            "teach": f"{student_name}, here is the simplest grounded version.",
            "build": f"{student_name}, here is the safest path.",
            "general": f"{student_name}, here is the grounded answer.",
        }[intent]

        if not results:
            return (
                f"{opener} The current Yantra knowledge base does not cover '{question}' yet. "
                f"{INTENT_FALLBACKS[intent]}"
            )

        sections = [take_key_sentences(results[0].text, limit=2)]

        if len(results) > 1 and intent in {"teach", "guidance", "build", "general"}:
            sections.append(take_key_sentences(results[1].text, limit=1))

        answer = format_grounded_sections(sections)
        if intent == "debug":
            return f"{opener}\n\n{answer}\n\n{INTENT_FALLBACKS[intent]}"
        return f"{opener}\n\n{answer}"

    def _format_python_room_feedback_message(self, request: PythonRoomFeedbackRequest) -> str:
        line_note = f"line {request.error.line}" if request.error.line else "an unknown line"
        line_snippet = self._python_room_line_snippet(request) or "(line unavailable)"
        return "\n".join(
            [
                f"Trigger: {request.trigger}",
                f"Task: {request.task}",
                f"Error type: {request.error.type}",
                f"Error message: {request.error.message}",
                f"Primary failing line: {line_note}",
                f"Primary failing line snippet: {line_snippet}",
                "Student code:",
                request.code,
                "Stdout:",
                request.stdout or "(none)",
                "Stderr:",
                request.stderr or "(none)",
                "Traceback:",
                request.error.traceback,
            ]
        )

    def _compose_python_room_feedback_reply(self, request: PythonRoomFeedbackRequest) -> str:
        line_note = f"on line {request.error.line}" if request.error.line else "during the run"
        error_type = request.error.type
        line_snippet = self._python_room_line_snippet(request)

        if error_type == "NameError":
            missing_name = self._extract_missing_name(request.error.message)
            if missing_name and line_snippet:
                return (
                    f"Line {request.error.line or '?'} uses `{missing_name}` in `{line_snippet}`, but that name has not been assigned yet. "
                    f"Define `{missing_name}` before this line or use the correct variable name, then run again."
                )
            if missing_name:
                return (
                    f"Your run stopped {line_note} because `{missing_name}` does not exist yet. "
                    f"Create `{missing_name}` before you use it, then run again."
                )

        if error_type == "ZeroDivisionError":
            divisor = self._extract_divisor_name(line_snippet)
            if divisor and line_snippet:
                return (
                    f"Line {request.error.line or '?'} divides by `{divisor}` in `{line_snippet}`, and that value is 0 in this run. "
                    f"Check or guard `{divisor}` before dividing, then run again."
                )
            return (
                f"Your run stopped {line_note} because the division is using 0 as the divisor. "
                f"Check the value being divided by before that line runs, then run again."
            )

        if error_type == "SyntaxError":
            return (
                f"Python could not parse {line_note}{f' in `{line_snippet}`' if line_snippet else ''}. "
                f"Check the brackets, quotes, commas, or colon around that statement, then run again."
            )

        if error_type == "IndentationError":
            return (
                f"The block spacing is wrong {line_note}{f' near `{line_snippet}`' if line_snippet else ''}. "
                f"Align that line with the correct loop or if-block, then run again."
            )

        if error_type == "AttributeError":
            subject, attribute = self._extract_attribute_error_parts(request.error.message)
            if subject and attribute:
                return (
                    f"Line {request.error.line or '?'} calls `{attribute}` on a `{subject}` value, but that attribute is not available there. "
                    f"Check the object type on that line and use the right method or data shape, then run again."
                )

        if error_type == "KeyError":
            missing_key = self._extract_key_error_value(request.error.message)
            if missing_key:
                return (
                    f"Your run stopped {line_note} because the dictionary key `{missing_key}` was not found. "
                    f"Check that the key exists before reading it, then run again."
                )

        generic_hints = {
            "TypeError": "An operation is using the wrong kind of value. Check the values on that line and make sure they match the operation, then run again.",
            "IndexError": "The code is reaching past the available list items. Check the index or loop bounds on that line, then run again.",
            "ModuleNotFoundError": "That import is not available in this runtime. Remove or replace the import, then run again.",
            "ImportError": "That import did not resolve in this runtime. Recheck the module and symbol names, then run again.",
        }
        hint = generic_hints.get(
            error_type,
            f"{error_type} means Python stopped {line_note}{f' near `{line_snippet}`' if line_snippet else ''}. Check that exact statement first, then run again.",
        )

        return f"Your run stopped {line_note}. {hint}"

    def _python_room_line_snippet(self, request: PythonRoomFeedbackRequest) -> str:
        if not request.error.line:
            return ""

        lines = request.code.splitlines()
        index = request.error.line - 1
        if index < 0 or index >= len(lines):
            return ""

        return lines[index].strip()

    def _extract_missing_name(self, message: str) -> str | None:
        match = NAME_ERROR_RE.search(message)
        return match.group(1) if match else None

    def _extract_divisor_name(self, line_snippet: str) -> str | None:
        if not line_snippet or "/" not in line_snippet:
            return None

        divisor = line_snippet.split("/", 1)[1].strip().rstrip(")")
        if not divisor:
            return None

        return divisor

    def _extract_attribute_error_parts(self, message: str) -> tuple[str | None, str | None]:
        match = ATTRIBUTE_ERROR_RE.search(message)
        if not match:
            return None, None
        return match.group(1), match.group(2)

    def _extract_key_error_value(self, message: str) -> str | None:
        match = KEY_ERROR_RE.search(message)
        return match.group(1) if match else None
