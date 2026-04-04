from __future__ import annotations

from dataclasses import dataclass
import json
import re
from time import monotonic

from yantra_ai.core.config import ProviderLaneSettings, get_settings
from yantra_ai.core.copilot_cli import CopilotCliError, get_copilot_cli_client
from yantra_ai.core.providers import (
    GeminiChatClient,
    ProviderError,
    ProviderExhaustedError,
    build_provider_ring_router,
)
from yantra_ai.core.prompts import (
    INTENT_FALLBACKS,
    build_dashboard_generation_prompt,
    build_personalization_extract_prompt,
    build_system_prompt,
    build_python_room_feedback_system_prompt,
    detect_intent,
    format_grounded_sections,
    make_voice_friendly_reply,
    take_key_sentences,
)
from yantra_ai.core.rag import RetrievalBatch, SearchResult, search_knowledge_details
from yantra_ai.schemas.chat import (
    ChatRequest,
    ChatResponse,
    DashboardGenerationRequest,
    DashboardGenerationResponse,
    DashboardRecommendationRequest,
    DashboardRecommendationResponse,
    Message,
    PersonalizationExtractRequest,
    PersonalizationExtractResponse,
    SourceSnippet,
)
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

YANTRA_SUPPORTED_GOALS = [
    "Artificial Intelligence & ML",
    "Web Development",
    "App Development",
    "Data Science & Analytics",
    "Cloud & DevOps",
    "Cybersecurity",
    "UI/UX Design",
    "Digital Marketing",
    "Entrepreneurship & Startups",
]

PERSONALIZATION_SECTION_ALIASES = {
    "confirmed_facts": ["confirmed facts"],
    "likely_preferences": ["likely preferences"],
    "uncertain_inferences": ["uncertain inferences"],
    "missing_information": ["missing information"],
    "goals": ["goals"],
    "current_skill_level": ["current skill level", "skill level"],
    "prior_projects": ["prior projects"],
    "topics_of_interest": ["topics of interest"],
    "time_availability": ["time availability"],
    "preferred_learning_style": ["preferred learning style", "learning style"],
    "constraints": ["constraints"],
    "confidence": ["confidence"],
}


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

    def dashboard_recommendation(
        self, request: DashboardRecommendationRequest
    ) -> DashboardRecommendationResponse:
        student = request.student
        title = student.recommended_action_title or (
            f"Open {student.active_rooms[0]}" if student.active_rooms else f"Focus on {student.current_focus}"
        )

        detail_parts: list[str] = []

        if student.recommended_action_description:
            detail_parts.append(student.recommended_action_description)
        elif student.path_description:
            detail_parts.append(student.path_description)

        if student.strongest_skills:
            detail_parts.append(
                f"Lean on {student.strongest_skills[0]} while you work through {student.current_focus or student.current_path}."
            )

        if student.memory_summary:
            detail_parts.append(student.memory_summary)

        description = " ".join(part.strip() for part in detail_parts if part.strip())
        if not description:
            description = (
                f"Stay inside {student.current_path} and take the next step around {student.current_focus or student.current_surface}."
            )

        prompt_focus = student.current_focus or student.current_path or "my next learning step"
        prompt_action = student.recommended_action_title or title
        prompt = (
            f"Given my current dashboard state, memory, and focus on {prompt_focus}, help me take the next step: {prompt_action}."
        )

        return DashboardRecommendationResponse(
            title=title[:80].strip(),
            description=description[:280].strip(),
            prompt=prompt[:220].strip(),
            provider="local-dashboard-recommendation",
            model_used=None,
        )

    def personalization_extract(
        self, request: PersonalizationExtractRequest
    ) -> PersonalizationExtractResponse:
        response = self._local_personalization_extract(request)
        api_key = self._gemini_api_key()

        if not api_key:
            return response

        try:
            generated_text, model_used = self._generate_json_with_gemini(
                system_prompt=build_personalization_extract_prompt(
                    request.source_provider,
                    request.source_summary,
                ),
                primary_model="gemini-2.5-flash",
                fallback_model="gemini-2.5-flash",
                api_key=api_key,
                timeout_s=20,
            )
            payload = self._extract_json_object(generated_text)
            return PersonalizationExtractResponse.model_validate(payload)
        except Exception:
            return response

    def dashboard_generate(
        self, request: DashboardGenerationRequest
    ) -> DashboardGenerationResponse:
        response = self._local_dashboard_generate(request)
        api_key = self._gemini_api_key()

        if not api_key:
            return response

        try:
            generated_text, model_used = self._generate_json_with_gemini(
                system_prompt=build_dashboard_generation_prompt(
                    profile=request.profile.model_dump(),
                    personalization=request.personalization.model_dump() if request.personalization else None,
                ),
                primary_model="gemini-2.5-pro",
                fallback_model="gemini-2.5-flash",
                api_key=api_key,
                timeout_s=35,
            )
            payload = self._extract_json_object(generated_text)
            validated = DashboardGenerationResponse.model_validate(payload)
            return validated.model_copy(
                update={
                    "provider": validated.provider or "gemini-dashboard-generate",
                    "model_used": validated.model_used or model_used,
                }
            )
        except Exception:
            return response

    def _gemini_api_key(self) -> str | None:
        return self.settings.gemini_primary_api_key or self.settings.gemini_secondary_api_key

    def _generate_json_with_gemini(
        self,
        *,
        system_prompt: str,
        primary_model: str,
        fallback_model: str,
        api_key: str,
        timeout_s: int | None = None,
    ) -> tuple[str, str]:
        client = GeminiChatClient()
        messages = [Message(role="user", content="Return strict JSON only.")]

        models = [primary_model]
        if fallback_model != primary_model:
            models.append(fallback_model)

        last_error: Exception | None = None
        request_timeout_s = timeout_s if timeout_s is not None else max(self.settings.provider_request_timeout_s, 12)

        for model in models:
            lane = ProviderLaneSettings(
                name=f"gemini_{model}",
                provider="gemini",
                model=model,
                api_key=api_key,
            )
            try:
                return client.generate(
                    lane=lane,
                    system_prompt=system_prompt,
                    messages=messages,
                    timeout_s=request_timeout_s,
                ), model
            except ProviderError as exc:
                last_error = exc
                continue

        if last_error:
            raise last_error

        raise RuntimeError("Gemini generation failed.")

    def _extract_json_object(self, text: str) -> dict[str, object]:
        cleaned = text.strip()

        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)

        try:
            payload = json.loads(cleaned)
            if isinstance(payload, dict):
                return payload
        except json.JSONDecodeError:
            pass

        start = cleaned.find("{")
        end = cleaned.rfind("}")

        if start >= 0 and end > start:
            payload = json.loads(cleaned[start : end + 1])
            if isinstance(payload, dict):
                return payload

        raise ValueError("Model response did not contain a valid JSON object.")

    def _normalize_lines(self, lines: list[str], *, limit: int = 8) -> list[str]:
        normalized: list[str] = []
        seen: set[str] = set()

        for line in lines:
            trimmed = re.sub(r"\s+", " ", line.strip())
            if not trimmed:
                continue
            key = trimmed.lower()
            if key in seen:
                continue
            normalized.append(trimmed[:220])
            seen.add(key)
            if len(normalized) >= limit:
                break

        return normalized

    def _parse_personalization_sections(self, summary: str) -> dict[str, list[str]]:
        buckets: dict[str, list[str]] = {}
        active_section = "confirmed_facts"

        for raw_line in summary.splitlines():
            line = raw_line.strip()
            if not line:
                continue

            heading = line.lower().replace(":", "").replace("*", "")
            matched = next(
                (
                    key
                    for key, aliases in PERSONALIZATION_SECTION_ALIASES.items()
                    if any(heading == alias for alias in aliases)
                ),
                None,
            )

            if matched:
                active_section = matched
                buckets.setdefault(active_section, [])
                continue

            buckets.setdefault(active_section, []).append(re.sub(r"^[-*]\s*", "", line))

        return buckets

    def _infer_goals(self, text: str) -> list[str]:
        lowered = text.lower()
        return [
            goal for goal in YANTRA_SUPPORTED_GOALS if goal.lower() in lowered
        ][:3]

    def _infer_skill_level(self, text: str) -> str | None:
        lowered = text.lower()
        if "advanced" in lowered:
            return "Advanced"
        if "intermediate" in lowered:
            return "Intermediate"
        if "beginner" in lowered:
            return "Beginner"
        return None

    def _infer_time_availability(self, text: str) -> str | None:
        lowered = text.lower()
        if "intensive" in lowered:
            return "Intensive"
        if "light" in lowered:
            return "Light"
        if "focused" in lowered:
            return "Focused"
        return None

    def _local_personalization_extract(
        self, request: PersonalizationExtractRequest
    ) -> PersonalizationExtractResponse:
        sections = self._parse_personalization_sections(request.source_summary)
        confirmed = self._normalize_lines(
            sections.get("confirmed_facts")
            or re.split(r"[.!?]\s+", request.source_summary)
        )
        likely = self._normalize_lines(sections.get("likely_preferences", []))
        uncertain = self._normalize_lines(sections.get("uncertain_inferences", []))
        missing = self._normalize_lines(sections.get("missing_information", []))
        goals = self._infer_goals(
            " ".join(
                sections.get("goals", [])
                + sections.get("confirmed_facts", [])
                + sections.get("likely_preferences", [])
            )
        )
        skill_level = self._infer_skill_level(
            " ".join(sections.get("current_skill_level", [])) or request.source_summary
        )
        time_availability = self._infer_time_availability(
            " ".join(sections.get("time_availability", [])) or request.source_summary
        )
        prior_projects = self._normalize_lines(sections.get("prior_projects", []))
        topics = self._normalize_lines(sections.get("topics_of_interest", []))
        learning_style = self._normalize_lines(sections.get("preferred_learning_style", []))
        constraints = self._normalize_lines(sections.get("constraints", []))
        confidence = self._normalize_lines(
            sections.get("confidence", ["Built from the pasted summary only. Review each fact before saving."]),
            limit=2,
        )

        learner_summary = " ".join(item for item in [confirmed[:1], likely[:1], topics[:1]] for item in item)

        return PersonalizationExtractResponse(
            source_provider=request.source_provider,
            source_prompt_version="ai-memory-import-v1",
            approved_facts={
                "confirmed_facts": confirmed,
                "likely_preferences": likely,
                "uncertain_inferences": uncertain,
                "missing_information": missing,
                "normalized": {
                    "target_goals": goals,
                    "inferred_skill_level": skill_level,
                    "prior_projects": prior_projects,
                    "topics_of_interest": topics,
                    "time_availability": time_availability,
                    "preferred_learning_style": learning_style,
                    "constraints": constraints,
                },
            },
            learner_summary=learner_summary[:400]
            or "Imported context is ready for review before Yantra updates the roadmap.",
            confidence_summary=" ".join(confidence)[:240]
            or "Built from the pasted summary only. Review each field before saving.",
            assumptions=uncertain[:4],
            provider="local-personalization-extract",
            model_used=None,
        )

    def _local_dashboard_generate(
        self, request: DashboardGenerationRequest
    ) -> DashboardGenerationResponse:
        goal = (
            request.personalization.approved_facts.normalized.target_goals[0]
            if request.personalization and request.personalization.approved_facts and request.personalization.approved_facts.normalized.target_goals
            else request.profile.primary_learning_goals[0]
            if request.profile.primary_learning_goals
            else "Artificial Intelligence & ML"
        )

        if goal == "Data Science & Analytics":
            track = "Analytics Starter Track"
            focus = "clean data thinking and explainable analysis"
            action_title = "Enter Data Explorer"
            action_description = "Inspect structure and patterns before you move into heavier model or analytics work."
            action_prompt = "Show me the first data analysis move I should make from this dashboard."
        elif goal in {"UI/UX Design", "Digital Marketing", "Entrepreneurship & Startups"}:
            track = "Prompt and Product Thinking Track"
            focus = "product reasoning and AI-assisted critique"
            action_title = "Open Prompt Lab"
            action_description = "Use Prompt Lab to sharpen questions, critique outputs, and tighten the next build loop."
            action_prompt = "Teach me how to use Prompt Lab to improve the next step in my roadmap."
        else:
            track = "Machine Learning Starter Track"
            focus = "Python, data intuition, and model vocabulary"
            action_title = "Enter Python Room"
            action_description = "Use the first room to give Yantra real signals before the roadmap gets more specific."
            action_prompt = "Open the Python Room and tell me what to focus on in my first session."

        learner_summary = (
            request.personalization.learner_summary
            if request.personalization and request.personalization.learner_summary
            else (
                f"{request.profile.name} is starting "
                f"{'an' if goal[:1].lower() in {'a', 'e', 'i', 'o', 'u'} else 'a'} "
                f"{goal.lower()} path with the first focus on {focus}."
            )
        )
        confidence_summary = (
            "Built from approved import facts plus onboarding answers."
            if request.personalization and request.personalization.approved_facts
            else "Built from onboarding answers only. Real activity should tighten this roadmap."
        )

        return DashboardGenerationResponse(
            learner_summary=learner_summary[:400],
            recommended_track=track,
            recommended_action={
                "title": action_title,
                "description": action_description,
                "prompt": action_prompt,
            },
            confidence_summary=confidence_summary[:240],
            assumptions=[
                f"Primary goal assumed from onboarding: {goal}.",
                "No real activity history was provided, so weekly activity stays at zero.",
            ],
            path={
                "path_title": "AI Foundations" if goal == "Artificial Intelligence & ML" else track,
                "path_description": "Start with the technical basics that make the rest of the roadmap honest and usable.",
                "path_status_label": "Starter Path",
                "path_progress": 8 if request.profile.skill_level == "Beginner" else 16 if request.profile.skill_level == "Intermediate" else 24,
                "current_focus": focus,
                "recommended_action_title": action_title,
                "recommended_action_description": action_description,
                "recommended_action_prompt": action_prompt,
                "learning_track_title": track,
                "learning_track_description": f"This roadmap uses onboarding plus approved facts only. Goal: {goal}.",
                "completion_estimate_label": "4-week arc"
                if request.profile.learning_pace == "Intensive"
                else "10-week arc"
                if request.profile.learning_pace == "Light"
                else "7-week arc",
                "mastery_progress": 8,
                "mastery_unlocked_count": 1,
                "mastery_total_count": 6,
                "next_session_date_day": "--",
                "next_session_date_month": "Suggested",
                "next_session_title": action_title,
                "next_session_day_label": "No live schedule yet",
                "next_session_time_label": "Pick a room to begin",
                "next_session_instructor_name": "Yantra Guide",
                "next_session_instructor_role": "AI Coach",
                "next_session_instructor_image_url": "",
                "weekly_completed_sessions": 0,
                "weekly_change_label": "No prior week yet",
                "momentum_summary": "No streak yet",
                "focus_summary": focus,
                "consistency_summary": "0 sessions",
            },
            skills=[
                {
                    "skill_key": "logic-core",
                    "title": "Programming Logic",
                    "description": "Build the control-flow confidence that supports clearer technical work.",
                    "level_label": "Starting",
                    "progress": 16,
                    "icon_key": "logic",
                    "tone_key": "primary",
                    "locked": False,
                    "sort_order": 1,
                },
                {
                    "skill_key": "tooling-foundation",
                    "title": "Tooling Foundations",
                    "description": "Use guided rooms and prompts without losing the reasoning behind each step.",
                    "level_label": "In Progress",
                    "progress": 12,
                    "icon_key": "python",
                    "tone_key": "soft",
                    "locked": False,
                    "sort_order": 2,
                },
                {
                    "skill_key": "data-thinking",
                    "title": "Data Thinking",
                    "description": "Read structure and evidence before you make decisions or build on top of them.",
                    "level_label": "Locked",
                    "progress": 0,
                    "icon_key": "data",
                    "tone_key": "muted",
                    "locked": True,
                    "sort_order": 3,
                },
            ],
            curriculum_nodes=[
                {
                    "node_key": "module-01",
                    "module_label": "Module 01",
                    "title": "Programming Logic Core",
                    "description": "Start with the reasoning patterns that support later rooms and recommendations.",
                    "status_label": "Start here",
                    "unlocked": True,
                    "sort_order": 1,
                },
                {
                    "node_key": "module-02",
                    "module_label": "Module 02",
                    "title": "Data Thinking Basics",
                    "description": "Read structure, evidence, and patterns before jumping into larger projects.",
                    "status_label": "Locked",
                    "unlocked": False,
                    "sort_order": 2,
                },
                {
                    "node_key": "module-03",
                    "module_label": "Module 03",
                    "title": "First Model Intuition",
                    "description": "Move into model vocabulary only after the technical basics feel stable.",
                    "status_label": "Locked",
                    "unlocked": False,
                    "sort_order": 3,
                },
            ],
            recommended_rooms=[
                {
                    "room_key": "python-room",
                    "title": "Python Room",
                    "description": "Guided practice for logic, debugging, and tighter technical explanations.",
                    "status_label": "Start Here",
                    "cta_label": "Enter Room",
                    "prompt": action_prompt,
                    "featured": True,
                    "texture_key": "python-room",
                    "sort_order": 1,
                },
                {
                    "room_key": "neural-net-builder",
                    "title": "Neural Net Builder",
                    "description": "A visual model-building room that becomes more useful once your foundations are stable.",
                    "status_label": "Recommended Next",
                    "cta_label": "Preview Next Step",
                    "prompt": "Explain why this should be my second room and what it unlocks.",
                    "featured": True,
                    "texture_key": "neural-builder",
                    "sort_order": 2,
                },
                {
                    "room_key": "prompt-lab",
                    "title": "Prompt Lab",
                    "description": "Compare instructions, critique outputs, and sharpen the way you ask for help.",
                    "status_label": "Open",
                    "cta_label": "Enter Lab",
                    "prompt": "Teach me how to use Prompt Lab to improve my current learning path.",
                    "featured": False,
                    "texture_key": "prompt-lab",
                    "sort_order": 3,
                },
            ],
            weekly_activity=[
                {
                    "day_key": "mon",
                    "day_label": "MON",
                    "container_height": 96,
                    "fill_height": 0,
                    "highlighted": False,
                    "sort_order": 1,
                },
                {
                    "day_key": "tue",
                    "day_label": "TUE",
                    "container_height": 128,
                    "fill_height": 0,
                    "highlighted": False,
                    "sort_order": 2,
                },
                {
                    "day_key": "wed",
                    "day_label": "WED",
                    "container_height": 80,
                    "fill_height": 0,
                    "highlighted": False,
                    "sort_order": 3,
                },
                {
                    "day_key": "thu",
                    "day_label": "THU",
                    "container_height": 144,
                    "fill_height": 0,
                    "highlighted": False,
                    "sort_order": 4,
                },
                {
                    "day_key": "fri",
                    "day_label": "FRI",
                    "container_height": 112,
                    "fill_height": 0,
                    "highlighted": False,
                    "sort_order": 5,
                },
                {
                    "day_key": "sat",
                    "day_label": "SAT",
                    "container_height": 48,
                    "fill_height": 0,
                    "highlighted": False,
                    "sort_order": 6,
                },
                {
                    "day_key": "sun",
                    "day_label": "SUN",
                    "container_height": 48,
                    "fill_height": 0,
                    "highlighted": False,
                    "sort_order": 7,
                },
            ],
            provider="local-dashboard-generate",
            model_used=None,
        )

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
        strongest_skills = tuple(student.strongest_skills)
        active_rooms = tuple(student.active_rooms)
        return (
            self.settings.chat_provider,
            self.settings.fast_responses,
            request.top_k,
            student.name,
            student.skill_level,
            student.current_path,
            student.current_surface,
            student.progress,
            student.current_focus,
            student.recommended_action_title,
            student.recommended_action_description,
            student.memory_summary,
            goals,
            strongest_skills,
            active_rooms,
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
            f"Hey {student.name}, good to see you. You’re in {student.current_path} on {student.current_surface} and at {student.progress}% progress. "
            f"Current focus: {student.current_focus or goals}."
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
