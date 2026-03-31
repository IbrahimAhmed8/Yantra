from dataclasses import replace

import pytest

from yantra_ai.core.config import get_settings
from yantra_ai.core.providers import ProviderError, ProviderExhaustedError, ProviderRingRouter
from yantra_ai.schemas.chat import Message


class FakeLaneClient:
    def __init__(self, outcomes):
        self.outcomes = list(outcomes)
        self.calls = 0

    def generate(self, *, lane, system_prompt, messages, timeout_s):
        outcome = self.outcomes[self.calls] if self.calls < len(self.outcomes) else self.outcomes[-1]
        self.calls += 1
        if isinstance(outcome, Exception):
            raise outcome
        return outcome


def _build_settings():
    base = get_settings()
    return replace(
        base,
        chat_provider="ring",
        provider_chain=("groq_primary", "gemini_primary", "groq_secondary", "gemini_secondary", "github_models"),
        provider_max_attempts=7,
        provider_max_request_time_ms=12000,
        provider_lane_cooldown_s=0,
        groq_primary_api_key="groq-primary",
        gemini_primary_api_key="gemini-primary",
        groq_secondary_api_key="groq-secondary",
        gemini_secondary_api_key="gemini-secondary",
        github_models_token="github-models",
    )


def test_provider_ring_wraps_back_to_stage_one() -> None:
    settings = _build_settings()
    clients = {
        "groq_primary": FakeLaneClient(
            [
                ProviderError(
                    "rate limited",
                    provider="groq",
                    lane_name="groq_primary",
                    retryable=True,
                    status_code=429,
                ),
                "Groq primary succeeded on wrap.",
            ]
        ),
        "gemini_primary": FakeLaneClient(
            [
                ProviderError(
                    "temporary error",
                    provider="gemini",
                    lane_name="gemini_primary",
                    retryable=True,
                    status_code=503,
                )
            ]
        ),
        "groq_secondary": FakeLaneClient(
            [
                ProviderError(
                    "temporary error",
                    provider="groq",
                    lane_name="groq_secondary",
                    retryable=True,
                    status_code=503,
                )
            ]
        ),
        "gemini_secondary": FakeLaneClient(
            [
                ProviderError(
                    "temporary error",
                    provider="gemini",
                    lane_name="gemini_secondary",
                    retryable=True,
                    status_code=503,
                )
            ]
        ),
        "github_models": FakeLaneClient(
            [
                ProviderError(
                    "temporary error",
                    provider="github-models",
                    lane_name="github_models",
                    retryable=True,
                    status_code=503,
                )
            ]
        ),
    }
    router = ProviderRingRouter(settings, lane_clients=clients)

    result = router.generate(
        system_prompt="You are Yantra.",
        messages=[Message(role="user", content="Hello")],
    )

    assert result.provider == "groq"
    assert result.lane_name == "groq_primary"
    assert result.attempts == 6
    assert result.text == "Groq primary succeeded on wrap."


def test_provider_ring_exhausts_after_budget() -> None:
    settings = replace(_build_settings(), provider_max_attempts=3)
    failing_error = ProviderError(
        "rate limited",
        provider="groq",
        lane_name="groq_primary",
        retryable=True,
        status_code=429,
    )
    clients = {
        "groq_primary": FakeLaneClient([failing_error]),
        "gemini_primary": FakeLaneClient(
            [
                ProviderError(
                    "rate limited",
                    provider="gemini",
                    lane_name="gemini_primary",
                    retryable=True,
                    status_code=429,
                )
            ]
        ),
        "groq_secondary": FakeLaneClient(
            [
                ProviderError(
                    "rate limited",
                    provider="groq",
                    lane_name="groq_secondary",
                    retryable=True,
                    status_code=429,
                )
            ]
        ),
        "gemini_secondary": FakeLaneClient(
            [
                ProviderError(
                    "rate limited",
                    provider="gemini",
                    lane_name="gemini_secondary",
                    retryable=True,
                    status_code=429,
                )
            ]
        ),
        "github_models": FakeLaneClient(
            [
                ProviderError(
                    "rate limited",
                    provider="github-models",
                    lane_name="github_models",
                    retryable=True,
                    status_code=429,
                )
            ]
        ),
    }
    router = ProviderRingRouter(settings, lane_clients=clients)

    with pytest.raises(ProviderExhaustedError) as exc:
        router.generate(
            system_prompt="You are Yantra.",
            messages=[Message(role="user", content="Hello")],
        )

    assert len(exc.value.attempts) == 3


def test_provider_ring_reports_missing_credentials() -> None:
    settings = replace(
        _build_settings(),
        groq_primary_api_key=None,
        gemini_primary_api_key=None,
        groq_secondary_api_key=None,
        gemini_secondary_api_key=None,
        github_models_token=None,
    )
    router = ProviderRingRouter(settings, lane_clients={})

    with pytest.raises(ProviderExhaustedError) as exc:
        router.generate(
            system_prompt="You are Yantra.",
            messages=[Message(role="user", content="Hello")],
        )

    assert "no upstream api keys" in str(exc.value).lower()


def test_provider_ring_continues_after_non_retryable_lane_error() -> None:
    settings = replace(
        _build_settings(),
        provider_chain=("groq_primary", "gemini_primary"),
        provider_max_attempts=2,
    )
    clients = {
        "groq_primary": FakeLaneClient(
            [
                ProviderError(
                    "forbidden",
                    provider="groq",
                    lane_name="groq_primary",
                    retryable=False,
                    status_code=403,
                )
            ]
        ),
        "gemini_primary": FakeLaneClient(["Gemini fallback succeeded."]),
    }
    router = ProviderRingRouter(settings, lane_clients=clients)

    result = router.generate(
        system_prompt="You are Yantra.",
        messages=[Message(role="user", content="Hello")],
    )

    assert result.lane_name == "gemini_primary"
    assert result.text == "Gemini fallback succeeded."
