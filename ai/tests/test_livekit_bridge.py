from types import SimpleNamespace

from yantra_ai.core.livekit_bridge import chat_request_from_livekit_messages, extract_livekit_message_text
from yantra_ai.schemas.chat import StudentContext


def test_extract_livekit_message_text_prefers_text_content() -> None:
    item = SimpleNamespace(role="user", text_content="Hello from LiveKit", content=["ignored"])

    assert extract_livekit_message_text(item) == "Hello from LiveKit"


def test_chat_request_from_livekit_messages_filters_non_messages() -> None:
    items = [
        SimpleNamespace(role="system", text_content="System context", content=["System context"]),
        SimpleNamespace(role="user", text_content="Hi Yantra", content=["Hi Yantra"]),
        SimpleNamespace(role="assistant", text_content="Hello learner", content=["Hello learner"]),
        SimpleNamespace(role="tool", text_content="ignored", content=["ignored"]),
    ]

    request = chat_request_from_livekit_messages(
        items,
        student=StudentContext(name="Aarav"),
        top_k=2,
    )

    assert request.top_k == 2
    assert [message.role for message in request.messages] == ["system", "user", "assistant"]
    assert request.messages[1].content == "Hi Yantra"
