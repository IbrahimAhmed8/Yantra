import os
from dataclasses import replace

os.environ["YANTRA_CHAT_PROVIDER"] = "local"

from fastapi.testclient import TestClient

from main import app
from yantra_ai.core.prompts import make_voice_friendly_reply
from yantra_ai.core.providers import ProviderResult
from yantra_ai.core.rag import RetrievalBatch, SearchResult
from yantra_ai.core.service import ChatService
from yantra_ai.schemas.chat import ChatRequest, Message, StudentContext

client = TestClient(app)


def test_chat_returns_grounded_reply() -> None:
    response = client.post(
        "/chat",
        json={
            "messages": [{"role": "user", "content": "Help me build the first Yantra AI slice."}],
            "student": {
                "name": "Aarav",
                "skill_level": "Beginner",
                "current_path": "Yantra AI",
                "learning_goals": ["Ship the first local service"],
            },
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "build"
    assert data["context_used"] is True
    assert data["retrieval_mode"] == "lexical"
    assert data["provider"] == "local"
    assert data["model_used"] is None
    assert len(data["sources"]) >= 1
    assert "build this without rework" in data["reply"] or "first Yantra AI slice" in data["reply"]


def test_chat_handles_unknown_topic() -> None:
    response = client.post(
        "/chat",
        json={
            "messages": [{"role": "user", "content": "volcanic rock mineral composition in iceland"}],
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["context_used"] is False
    assert data["retrieval_mode"] == "lexical"
    assert data["provider"] == "local"
    assert data["model_used"] is None
    assert "does not cover" in data["reply"]


def test_chat_greeting_uses_fast_local_path() -> None:
    response = client.post(
        "/chat",
        json={
            "messages": [{"role": "user", "content": "hi"}],
            "student": {
                "name": "Aarav",
                "current_path": "Yantra AI",
                "progress": 10,
            },
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "local-greeting"
    assert data["retrieval_mode"] == "none"
    assert data["sources"] == []
    assert "Yantra AI" in data["reply"]


def test_chat_service_caches_identical_requests(monkeypatch) -> None:
    service = ChatService()
    calls = {"retrieval": 0, "generate": 0}

    def fake_retrieval(question, *, top_k, settings):
        calls["retrieval"] += 1
        return RetrievalBatch(
            mode="lexical",
            results=[
                SearchResult(
                    title="Cached Topic",
                    path="cached/topic.md",
                    text="Cached response body for Yantra.",
                    score=1.2,
                )
            ],
        )

    def fake_generate(*, request, question, intent, results, system_prompt):
        calls["generate"] += 1
        return ("Cached final answer.", "local-fast", None)

    monkeypatch.setattr("yantra_ai.core.service.search_knowledge_details", fake_retrieval)
    monkeypatch.setattr(service, "_generate_reply", fake_generate)

    request = ChatRequest(
        messages=[Message(role="user", content="Explain the cached topic.")],
        student=StudentContext(name="Aarav"),
    )

    first = service.reply(request)
    second = service.reply(request)

    assert first.reply == "Cached final answer."
    assert second.reply == "Cached final answer."
    assert calls["retrieval"] == 1
    assert calls["generate"] == 1


def test_chat_can_answer_account_creation_questions_from_yantra_docs() -> None:
    response = client.post(
        "/chat",
        json={
            "messages": [{"role": "user", "content": "How do I create an account on Yantra?"}],
            "student": {
                "name": "Aarav",
                "current_path": "Python Room",
                "progress": 22,
            },
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["context_used"] is True
    assert data["provider"] == "local"
    assert any("account" in source["excerpt"].lower() or "signup" in source["excerpt"].lower() for source in data["sources"])


def test_make_voice_friendly_reply_trims_long_grounding_sections() -> None:
    spoken = make_voice_friendly_reply(
        "Open the Yantra signup page. Use your email and password or continue with Google. "
        "Current grounding came from: Create Account, Student Profile. "
        "Next step: finish onboarding after signup.",
        sentence_limit=2,
        char_limit=180,
    )

    assert "Current grounding" not in spoken
    assert "Next step" not in spoken
    assert spoken.count(".") <= 2


def test_ring_social_prompt_skips_retrieval_and_uses_provider(monkeypatch) -> None:
    service = ChatService()
    service.settings = replace(
        service.settings,
        chat_provider="ring",
        fast_responses=True,
        provider_chain=("groq_primary",),
        groq_primary_api_key="groq-primary",
    )

    class FakeRouter:
        def generate(self, *, system_prompt, messages):
            return ProviderResult(
                text="Live provider answer.",
                provider="groq",
                lane_name="groq_primary",
                model="llama-3.1-8b-instant",
                attempts=1,
            )

    def fail_retrieval(question, *, top_k, settings):
        raise AssertionError("retrieval should not run for short social prompts")

    service.provider_router = FakeRouter()
    monkeypatch.setattr("yantra_ai.core.service.search_knowledge_details", fail_retrieval)

    request = ChatRequest(
        messages=[Message(role="user", content="How are you?")],
        student=StudentContext(name="Aarav"),
    )

    response = service.reply(request)

    assert response.reply == "Live provider answer."
    assert response.provider == "groq_primary"
    assert response.retrieval_mode == "none"
