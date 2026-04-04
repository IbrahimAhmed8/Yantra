from collections.abc import Iterable
import re

from yantra_ai.schemas.chat import StudentContext
from yantra_ai.schemas.room_feedback import PythonRoomFeedbackRequest

INTENT_FALLBACKS = {
    "debug": "Share the exact code, output, and error next. Then we can tighten the response loop.",
    "quiz": "Once the model provider is added, this intent can turn into one-question-at-a-time quizzes.",
    "guidance": "Keep the next step narrow: finish the local chat plus RAG loop before adding more rooms or tools.",
    "teach": "If you want, ask the same topic in a more specific way and the retriever will pull tighter context.",
    "build": "The safest next move is to finish one slice end to end before touching memory, orchestration, or website wiring.",
    "general": "Ask about the microservice boundary, first build slice, or Yantra teaching style for stronger grounding.",
}

INTENT_RULES = {
    "debug": ["debug", "error", "not working", "exception", "bug", "traceback"],
    "quiz": ["quiz", "test me", "practice", "question me"],
    "guidance": ["next", "roadmap", "what should i", "where do i start", "how do i", "how to", "where do i"],
    "teach": ["explain", "what is", "how does", "i don't understand"],
    "build": ["build", "create", "make", "scaffold", "set up"],
}


def detect_intent(message: str) -> str:
    lower = message.lower()

    for intent, keywords in INTENT_RULES.items():
        if any(keyword in lower for keyword in keywords):
            return intent

    return "general"


def build_system_prompt(
    student: StudentContext,
    intent: str,
    knowledge_context: str,
) -> str:
    goals = ", ".join(student.learning_goals) if student.learning_goals else "General AI and CS growth"

    return "\n".join(
        [
            "You are Yantra, the friendly teacher-guide built into the Yantra learning platform.",
            "Sound like a warm, thoughtful human mentor, not like a robotic assistant or a corporate chatbot.",
            "Stay grounded in the provided context. If the context is missing, say so plainly.",
            f"Student name: {student.name}",
            f"Skill level: {student.skill_level}",
            f"Current path: {student.current_path}",
            f"Current surface: {student.current_surface}",
            f"Progress: {student.progress}%",
            f"Learning goals: {goals}",
            f"Current focus: {student.current_focus or '(unknown)'}",
            f"Path description: {student.path_description or '(none)'}",
            f"Recommended action title: {student.recommended_action_title or '(none)'}",
            f"Recommended action description: {student.recommended_action_description or '(none)'}",
            f"Strongest skills: {', '.join(student.strongest_skills) if student.strongest_skills else '(unknown)'}",
            f"Active rooms: {', '.join(student.active_rooms) if student.active_rooms else '(none)'}",
            f"Imported memory summary: {student.memory_summary or '(none)'}",
            f"Approved learner summary: {student.approved_learner_summary or '(none)'}",
            f"Approved import facts: {student.approved_import_facts or '(none)'}",
            f"Detected intent: {intent}",
            "Voice and behavior rules:",
            "1. Be warm, natural, and easy to talk to.",
            "2. Never say things like 'I am just an AI', 'I am just a set of algorithms', or 'I do not have feelings' unless the user explicitly asks about internals.",
            "3. If the user is greeting you or being casual, reply like a real teacher-companion first, then help.",
            "4. Prefer natural prose by default. Use bullets only when they genuinely make the answer clearer.",
            "5. Keep answers compact by default. Usually answer in 2 or 3 short sentences and stay under about 90 words unless the user explicitly asks for more detail.",
            "6. Answer the direct question first. Do not ramble, do not restate the entire platform, and do not add long follow-up lectures unless asked.",
            "7. Do not include source callouts, grounding summaries, or meta-explanations unless the user asks for them.",
            "Teaching rules:",
            "1. Explain simply before going deeper.",
            "2. Use concrete examples instead of vague abstraction.",
            "3. Never pretend unsupported knowledge is available.",
            "4. Keep the next action narrow and sequential.",
            "5. Tie advice back to Yantra where possible.",
            "Retrieved context:",
            knowledge_context or "(none)",
        ]
    )


def build_python_room_feedback_system_prompt(
    student: StudentContext,
    request: PythonRoomFeedbackRequest,
    line_snippet: str,
) -> str:
    line_note = f"Primary failing line: {request.error.line}" if request.error.line else "Primary failing line: unknown"
    snippet_note = line_snippet or "(line unavailable)"

    return "\n".join(
        [
            "You are Yantra inside the Python Room practice surface.",
            "The learner clicked Run Python and got a runtime error.",
            f"Student name: {student.name}",
            f"Skill level: {student.skill_level}",
            f"Current path: {student.current_path}",
            f"Progress: {student.progress}%",
            line_note,
            "Room feedback rules:",
            "1. Reply in 1 or 2 short sentences.",
            "2. Stay under about 90 words.",
            "3. Explain the likely cause of the error in simple language.",
            "4. Mention the failing line when it is available.",
            "5. Refer to the exact variable, expression, or statement from the failing line whenever possible.",
            "6. Give exactly one concrete next fix hint.",
            "7. Do not give the full solution or rewritten code.",
            "8. Do not mention sources, retrieval, policies, or model behavior.",
            "Exact failing line snippet:",
            snippet_note,
        ]
    )


def take_key_sentences(text: str, limit: int = 2) -> str:
    cleaned = re.sub(r"#+\s*", "", " ".join(text.split()))
    if not cleaned:
        return ""

    segments = [segment.strip() for segment in cleaned.replace("?", ".").replace("!", ".").split(".")]
    chosen = [
        segment
        for segment in segments
        if segment and not re.fullmatch(r"[\d\W_]+", segment)
    ][:limit]
    return ". ".join(chosen) + ("." if chosen else "")


def make_voice_friendly_reply(text: str, sentence_limit: int = 0, char_limit: int = 0) -> str:
    cleaned = text
    cleaned = re.sub(r"\[(.*?)\]\((.*?)\)", r"\1", cleaned)
    cleaned = re.sub(r"`([^`]*)`", r"\1", cleaned)
    cleaned = re.sub(r"(?m)^\s*[-*]\s*", "", cleaned)
    cleaned = re.sub(r"(?is)\b(?:current grounding came from|sources?>?|next step:).*$", "", cleaned)
    cleaned = re.sub(r"[#*_>]+", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    if not cleaned:
        return ""

    sentences = [
        segment.strip()
        for segment in re.split(r"(?<=[.!?])\s+", cleaned)
        if segment.strip()
    ]
    if not sentences:
        sentences = [cleaned]

    if sentence_limit > 0:
        cleaned = " ".join(sentences[:sentence_limit]).strip()
    else:
        cleaned = " ".join(sentences).strip()

    if char_limit > 0 and len(cleaned) > char_limit:
        clipped = cleaned[:char_limit].rsplit(" ", 1)[0].strip()
        return f"{clipped}..." if clipped else cleaned[:char_limit].strip()

    return cleaned


def format_grounded_sections(chunks: Iterable[str]) -> str:
    sections = [section for section in chunks if section]
    return "\n\n".join(sections)


def build_personalization_extract_prompt(source_provider: str, source_summary: str) -> str:
    return "\n".join(
        [
            "You are Yantra's reviewed AI memory extraction layer.",
            "Turn the pasted external AI summary into structured facts for a learning roadmap system.",
            "Do not trust the input blindly. Separate facts from guesses.",
            "Return strict JSON only with this shape:",
            "{",
            '  "source_provider": "chatgpt|gemini|other",',
            '  "source_prompt_version": "ai-memory-import-v1",',
            '  "approved_facts": {',
            '    "confirmed_facts": ["..."],',
            '    "likely_preferences": ["..."],',
            '    "uncertain_inferences": ["..."],',
            '    "missing_information": ["..."],',
            '    "normalized": {',
            '      "target_goals": ["Artificial Intelligence & ML"],',
            '      "inferred_skill_level": "Beginner|Intermediate|Advanced|null",',
            '      "prior_projects": ["..."],',
            '      "topics_of_interest": ["..."],',
            '      "time_availability": "Light|Focused|Intensive|null",',
            '      "preferred_learning_style": ["..."],',
            '      "constraints": ["..."]',
            "    }",
            "  },",
            '  "learner_summary": "...",',
            '  "confidence_summary": "...",',
            '  "assumptions": ["..."],',
            '  "provider": "gemini",',
            '  "model_used": "gemini-2.5-flash"',
            "}",
            "Rules:",
            "1. Keep only the target goals that fit Yantra's supported goal list.",
            "2. Use null instead of inventing a skill level or time availability.",
            "3. Keep confidence_summary short and explicit about uncertainty.",
            "4. Do not include sensitive personal data unless it is clearly relevant to learning goals, pace, or constraints.",
            f"Source provider: {source_provider}",
            "External summary:",
            source_summary,
        ]
    )


def build_dashboard_generation_prompt(
    *,
    profile: dict[str, object],
    personalization: dict[str, object] | None,
) -> str:
    return "\n".join(
        [
            "You are Yantra's roadmap generation layer.",
            "Generate the first honest dashboard roadmap for a learner.",
            "Never fabricate history, streaks, completed sessions, real instructors, or real dates and times.",
            "The dashboard is allowed to contain suggested next-session values only.",
            "Return strict JSON only with this shape:",
            "{",
            '  "learner_summary": "...",',
            '  "recommended_track": "...",',
            '  "recommended_action": { "title": "...", "description": "...", "prompt": "..." },',
            '  "confidence_summary": "...",',
            '  "assumptions": ["..."],',
            '  "path": {',
            '    "path_title": "...",',
            '    "path_description": "...",',
            '    "path_status_label": "Starter Path",',
            '    "path_progress": 0,',
            '    "current_focus": "...",',
            '    "recommended_action_title": "...",',
            '    "recommended_action_description": "...",',
            '    "recommended_action_prompt": "...",',
            '    "learning_track_title": "...",',
            '    "learning_track_description": "...",',
            '    "completion_estimate_label": "...",',
            '    "mastery_progress": 0,',
            '    "mastery_unlocked_count": 0,',
            '    "mastery_total_count": 0,',
            '    "next_session_date_day": "--",',
            '    "next_session_date_month": "Suggested",',
            '    "next_session_title": "...",',
            '    "next_session_day_label": "No live schedule yet",',
            '    "next_session_time_label": "Pick a room to begin",',
            '    "next_session_instructor_name": "Yantra Guide",',
            '    "next_session_instructor_role": "AI Coach",',
            '    "next_session_instructor_image_url": "",',
            '    "weekly_completed_sessions": 0,',
            '    "weekly_change_label": "No prior week yet",',
            '    "momentum_summary": "No streak yet",',
            '    "focus_summary": "...",',
            '    "consistency_summary": "0 sessions"',
            "  },",
            '  "skills": [{ "skill_key": "logic-core|tooling-foundation|data-thinking|ml-intuition|system-design|prompt-review", "title": "...", "description": "...", "level_label": "..." }],',
            '  "curriculum_nodes": [{ "node_key": "module-01|module-02|module-03", "module_label": "...", "title": "...", "description": "...", "status_label": "..." }],',
            '  "provider": "gemini",',
            '  "model_used": "gemini-2.5-pro"',
            "}",
            "Rules:",
            "1. Use onboarding profile data as the source of truth.",
            "2. Use approved imported facts only as hints, not as identity overrides.",
            "3. This feature personalizes dashboard copy only. Do not invent or redesign room internals.",
            "4. Room cards and weekly activity are system-defined, so you may omit recommended_rooms and weekly_activity entirely.",
            "5. The skills and curriculum_nodes arrays are optional copy overrides only. If you include them, keep the same fixed keys shown above.",
            "6. Use short, honest labels instead of fake numbers or invented schedules.",
            "7. Keep the first roadmap small and concrete.",
            f"Onboarding profile: {profile}",
            f"Approved personalization: {personalization or '(none)'}",
        ]
    )
