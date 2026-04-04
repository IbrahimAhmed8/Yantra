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


def test_dashboard_recommendation_route_imports_memory_and_path_context() -> None:
    response = client.post(
        "/dashboard/recommendation",
        json={
            "student": {
                "name": "Aarav",
                "skill_level": "Beginner",
                "current_path": "AI Foundations",
                "current_surface": "Yantra Dashboard",
                "progress": 24,
                "learning_goals": ["Ship the first AI project"],
                "current_focus": "Neural Networks Basics",
                "path_description": "Moving from logic confidence into visual model understanding.",
                "recommended_action_title": "Enter Neural Net Builder",
                "recommended_action_description": "Move into a more spatial model-building exercise next.",
                "strongest_skills": ["Python Basics", "Logic Building"],
                "active_rooms": ["Python Room", "Neural Net Builder"],
                "memory_summary": "Recent learner questions: What should I learn next?",
            }
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Enter Neural Net Builder"
    assert "Recent learner questions" in data["description"]
    assert "Neural Networks Basics" in data["prompt"]


def test_personalization_extract_route_returns_reviewable_fact_sections() -> None:
    response = client.post(
        "/personalization/extract",
        json={
            "source_provider": "chatgpt",
            "source_summary": "\n".join(
                [
                    "Confirmed Facts:",
                    "- Wants to build AI projects.",
                    "- Likes learning with small practical exercises.",
                    "Goals:",
                    "- Artificial Intelligence & ML",
                    "Current Skill Level:",
                    "- Beginner",
                    "Time Availability:",
                    "- Focused",
                    "Topics of Interest:",
                    "- Neural networks",
                    "Confidence:",
                    "- Mostly based on prior learner requests, with some uncertainty about pace.",
                ]
            ),
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["source_provider"] == "chatgpt"
    assert "approved_facts" in data
    assert "confirmed_facts" in data["approved_facts"]
    assert data["approved_facts"]["normalized"]["target_goals"] == ["Artificial Intelligence & ML"]
    assert data["approved_facts"]["normalized"]["inferred_skill_level"] == "Beginner"
    assert data["approved_facts"]["normalized"]["time_availability"] == "Focused"


def test_dashboard_generate_route_stays_honest_for_no_history_users() -> None:
    response = client.post(
        "/dashboard/generate",
        json={
            "profile": {
                "name": "Aarav",
                "skill_level": "Beginner",
                "progress": 0,
                "user_role": "College Student (Undergraduate)",
                "age_range": "19-22",
                "primary_learning_goals": ["Artificial Intelligence & ML"],
                "learning_pace": "Focused",
            },
            "personalization": {
                "learner_summary": "Aarav wants to build AI projects and prefers guided practice.",
                "approved_facts": {
                    "confirmed_facts": ["Wants to build AI projects."],
                    "likely_preferences": ["Prefers guided practice."],
                    "uncertain_inferences": [],
                    "missing_information": [],
                    "normalized": {
                        "target_goals": ["Artificial Intelligence & ML"],
                        "inferred_skill_level": "Beginner",
                        "prior_projects": [],
                        "topics_of_interest": ["Neural networks"],
                        "time_availability": "Focused",
                        "preferred_learning_style": ["Guided practice"],
                        "constraints": [],
                    },
                },
            },
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["path"]["weekly_completed_sessions"] == 0
    assert data["path"]["weekly_change_label"] == "No prior week yet"
    assert data["path"]["next_session_date_day"] == "--"
    assert data["path"]["next_session_time_label"] == "Pick a room to begin"
    assert data["path"]["next_session_instructor_name"] == "Yantra Guide"
    assert all(day["fill_height"] == 0 for day in data["weekly_activity"])


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
