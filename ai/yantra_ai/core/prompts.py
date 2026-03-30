from collections.abc import Iterable
import re

from yantra_ai.schemas.chat import StudentContext

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
    "guidance": ["next", "roadmap", "what should i", "where do i start"],
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
            "You are Yantra, an AI teacher built into the Yantra learning platform.",
            "Stay grounded in the provided context. If the context is missing, say so plainly.",
            f"Student name: {student.name}",
            f"Skill level: {student.skill_level}",
            f"Current path: {student.current_path}",
            f"Progress: {student.progress}%",
            f"Learning goals: {goals}",
            f"Detected intent: {intent}",
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


def take_key_sentences(text: str, limit: int = 2) -> str:
    cleaned = re.sub(r"#+\s*", "", " ".join(text.split()))
    if not cleaned:
        return ""

    segments = [segment.strip() for segment in cleaned.replace("?", ".").replace("!", ".").split(".")]
    chosen = [segment for segment in segments if segment][:limit]
    return ". ".join(chosen) + ("." if chosen else "")


def format_grounded_sections(chunks: Iterable[str]) -> str:
    sections = [section for section in chunks if section]
    return "\n\n".join(sections)
