from __future__ import annotations

from collections.abc import Iterable

from yantra_ai.schemas.chat import ChatRequest, Message, StudentContext


def extract_livekit_message_text(item: object) -> str:
    text_content = getattr(item, "text_content", None)
    if isinstance(text_content, str) and text_content.strip():
        return text_content.strip()

    content = getattr(item, "content", None)
    if isinstance(content, str) and content.strip():
        return content.strip()

    if isinstance(content, list):
        text_parts: list[str] = []
        for part in content:
            if isinstance(part, str) and part.strip():
                text_parts.append(part.strip())
            elif isinstance(part, dict):
                maybe_text = part.get("text")
                if isinstance(maybe_text, str) and maybe_text.strip():
                    text_parts.append(maybe_text.strip())
        return "\n".join(text_parts).strip()

    return ""


def chat_request_from_livekit_messages(
    items: Iterable[object],
    *,
    student: StudentContext,
    top_k: int = 3,
) -> ChatRequest:
    messages: list[Message] = []

    for item in items:
        role = getattr(item, "role", None)
        if role not in {"user", "assistant", "system"}:
            continue

        text = extract_livekit_message_text(item)
        if not text:
            continue

        messages.append(Message(role=role, content=text))

    return ChatRequest(messages=messages, student=student, top_k=top_k)
