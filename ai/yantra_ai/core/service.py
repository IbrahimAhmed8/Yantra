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
    detect_intent,
    format_grounded_sections,
    take_key_sentences,
)
from yantra_ai.core.rag import RetrievalBatch, SearchResult, search_knowledge_details
from yantra_ai.schemas.chat import ChatRequest, ChatResponse, SourceSnippet

SMALLTALK_RE = re.compile(
    r"^(hi|hello|hey|yo|sup|hola|good morning|good afternoon|good evening)"
    r"( yantra| there| bud| man)?[!. ]*$",
    re.IGNORECASE,
)
CHITCHAT_RE = re.compile(
    r"^(wow(?: .+)?|ok(?:ay)?|cool|nice|great|awesome|amazing|thanks?|thank you|thx|"
    r"how are you|what'?s up|whats up|you are the best|you're the best|yu are the best|"
    r"haha|lol|hmm+|good job)[!. ]*$",
    re.IGNORECASE,
)


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
                "Provider ring is enabled, but no upstream API keys are configured. "
                "Add at least one Groq, Gemini, or GitHub Models key and restart Yantra.",
                "ring-unconfigured",
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

    def _build_prompt_context(self, results: list[SearchResult]) -> str:
        sections = []
        for result in results[:2]:
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
        goals = ", ".join(student.learning_goals[:2]) if student.learning_goals else "set one with /goal add"

        return (
            f"Hi {student.name} - I am Yantra, your local AI teacher for the {student.current_path} path. "
            f"You are at {student.progress}% progress. "
            f"Next quick actions: check your path with /path, set progress with /progress, and set a goal with /goal add. "
            f"Current goal focus: {goals}."
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
            "debug": f"{student_name}, let us keep the diagnosis narrow.",
            "quiz": f"{student_name}, the first slice is not running quizzes yet, but I can ground the topic before we add that route.",
            "guidance": f"{student_name}, the next step should stay small enough that we can verify it locally.",
            "teach": f"{student_name}, here is the simplest grounded version first.",
            "build": f"{student_name}, here is the safest way to build this without rework.",
            "general": f"{student_name}, here is the best grounded answer from the current Yantra knowledge base.",
        }[intent]

        if not results:
            return (
                f"{opener} The local microservice is running, but the current knowledge files do not cover "
                f"'{question}'. {INTENT_FALLBACKS[intent]}"
            )

        sections = [
            take_key_sentences(results[0].text, limit=2),
        ]

        if len(results) > 1:
            sections.append(take_key_sentences(results[1].text, limit=2))

        source_names = ", ".join(result.title for result in results[:2])

        return (
            f"{opener}\n\n"
            f"{format_grounded_sections(sections)}\n\n"
            f"Current grounding came from: {source_names}.\n"
            f"Next step: {INTENT_FALLBACKS[intent]}"
        )
