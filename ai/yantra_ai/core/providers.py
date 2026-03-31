from __future__ import annotations

from dataclasses import dataclass
import json
from time import monotonic
from typing import Protocol
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from groq import APIConnectionError as GroqAPIConnectionError
from groq import APIStatusError as GroqAPIStatusError
from groq import Groq
from yantra_ai.core.config import ProviderLaneSettings, Settings, get_settings
from yantra_ai.schemas.chat import Message

RETRYABLE_STATUS_CODES = {408, 429, 500, 502, 503, 504}


class ProviderError(RuntimeError):
    def __init__(
        self,
        message: str,
        *,
        provider: str,
        lane_name: str,
        retryable: bool,
        status_code: int | None = None,
    ) -> None:
        super().__init__(message)
        self.provider = provider
        self.lane_name = lane_name
        self.retryable = retryable
        self.status_code = status_code


class ProviderExhaustedError(RuntimeError):
    def __init__(self, message: str, attempts: list[ProviderError]) -> None:
        super().__init__(message)
        self.attempts = attempts


@dataclass(frozen=True)
class ProviderResult:
    text: str
    provider: str
    lane_name: str
    model: str
    attempts: int


class LaneClient(Protocol):
    def generate(
        self,
        *,
        lane: ProviderLaneSettings,
        system_prompt: str,
        messages: list[Message],
    ) -> str: ...


class OpenAICompatibleChatClient:
    def __init__(self, *, base_url: str, provider_name: str, default_headers: dict[str, str] | None = None) -> None:
        self.base_url = base_url
        self.provider_name = provider_name
        self.default_headers = default_headers or {}

    def generate(
        self,
        *,
        lane: ProviderLaneSettings,
        system_prompt: str,
        messages: list[Message],
        timeout_s: int,
    ) -> str:
        if not lane.api_key:
            raise ProviderError(
                f"Missing API key for {lane.name}.",
                provider=self.provider_name,
                lane_name=lane.name,
                retryable=False,
            )

        payload = {
            "model": lane.model,
            "messages": self._build_messages(system_prompt=system_prompt, messages=messages),
            "temperature": 0.2,
        }
        data = self._post_json(
            headers={
                **self.default_headers,
                "Authorization": f"Bearer {lane.api_key}",
                "Content-Type": "application/json",
            },
            payload=payload,
            timeout_s=timeout_s,
            lane=lane,
        )
        return self._extract_text(data, lane=lane)

    def _build_messages(self, *, system_prompt: str, messages: list[Message]) -> list[dict[str, str]]:
        payload = [{"role": "system", "content": system_prompt}]
        payload.extend({"role": message.role, "content": message.content} for message in messages[-8:])
        return payload

    def _post_json(
        self,
        *,
        headers: dict[str, str],
        payload: dict[str, object],
        timeout_s: int,
        lane: ProviderLaneSettings,
    ) -> dict[str, object]:
        request = Request(
            self.base_url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )

        try:
            with urlopen(request, timeout=timeout_s) as response:
                body = response.read().decode("utf-8", errors="replace")
                return json.loads(body)
        except HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            retryable = exc.code in RETRYABLE_STATUS_CODES
            raise ProviderError(
                body or f"{self.provider_name} request failed with status {exc.code}.",
                provider=self.provider_name,
                lane_name=lane.name,
                retryable=retryable,
                status_code=exc.code,
            ) from exc
        except URLError as exc:
            raise ProviderError(
                str(exc.reason) or f"{self.provider_name} request failed.",
                provider=self.provider_name,
                lane_name=lane.name,
                retryable=True,
            ) from exc
        except TimeoutError as exc:
            raise ProviderError(
                f"{self.provider_name} request timed out.",
                provider=self.provider_name,
                lane_name=lane.name,
                retryable=True,
            ) from exc

    def _extract_text(self, data: dict[str, object], *, lane: ProviderLaneSettings) -> str:
        choices = data.get("choices")
        if not isinstance(choices, list) or not choices:
            raise ProviderError(
                f"{self.provider_name} returned no choices.",
                provider=self.provider_name,
                lane_name=lane.name,
                retryable=True,
            )

        message = choices[0].get("message", {})
        content = message.get("content")
        if isinstance(content, str) and content.strip():
            return content.strip().replace("—", "-")

        if isinstance(content, list):
            texts = [item.get("text", "") for item in content if isinstance(item, dict)]
            joined = "\n".join(text for text in texts if text).strip()
            if joined:
                return joined.replace("—", "-")

        raise ProviderError(
            f"{self.provider_name} returned an empty assistant message.",
            provider=self.provider_name,
            lane_name=lane.name,
            retryable=True,
        )


class GroqChatClient:
    provider_name = "groq"

    def generate(
        self,
        *,
        lane: ProviderLaneSettings,
        system_prompt: str,
        messages: list[Message],
        timeout_s: int,
    ) -> str:
        if not lane.api_key:
            raise ProviderError(
                f"Missing API key for {lane.name}.",
                provider=self.provider_name,
                lane_name=lane.name,
                retryable=False,
            )

        client = Groq(api_key=lane.api_key, timeout=timeout_s, max_retries=0)
        try:
            completion = client.chat.completions.create(
                model=lane.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    *(
                        {"role": message.role, "content": message.content}
                        for message in messages[-8:]
                    ),
                ],
                temperature=0.2,
            )
        except GroqAPIStatusError as exc:
            body = ""
            try:
                body = json.dumps(exc.response.json())
            except Exception:
                body = str(exc)
            retryable = exc.status_code in RETRYABLE_STATUS_CODES
            raise ProviderError(
                body or f"{self.provider_name} request failed with status {exc.status_code}.",
                provider=self.provider_name,
                lane_name=lane.name,
                retryable=retryable,
                status_code=exc.status_code,
            ) from exc
        except GroqAPIConnectionError as exc:
            raise ProviderError(
                str(exc) or f"{self.provider_name} request failed.",
                provider=self.provider_name,
                lane_name=lane.name,
                retryable=True,
            ) from exc
        except TimeoutError as exc:
            raise ProviderError(
                f"{self.provider_name} request timed out.",
                provider=self.provider_name,
                lane_name=lane.name,
                retryable=True,
            ) from exc

        content = completion.choices[0].message.content if completion.choices else None
        if isinstance(content, str) and content.strip():
            return content.strip().replace("—", "-")

        raise ProviderError(
            f"{self.provider_name} returned an empty assistant message.",
            provider=self.provider_name,
            lane_name=lane.name,
            retryable=True,
        )


class GeminiChatClient(OpenAICompatibleChatClient):
    def __init__(self) -> None:
        super().__init__(
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
            provider_name="gemini",
        )


class GitHubModelsChatClient(OpenAICompatibleChatClient):
    def __init__(self) -> None:
        super().__init__(
            base_url="https://models.github.ai/inference/chat/completions",
            provider_name="github-models",
            default_headers={
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        )


class ProviderRingRouter:
    def __init__(
        self,
        settings: Settings,
        *,
        lane_clients: dict[str, LaneClient] | None = None,
    ) -> None:
        self.settings = settings
        self._lane_clients = lane_clients or {}
        self._cooldowns: dict[str, float] = {}

    def generate(
        self,
        *,
        system_prompt: str,
        messages: list[Message],
        chain: tuple[str, ...] | None = None,
    ) -> ProviderResult:
        lane_names = chain or self.settings.provider_chain
        if not any(
            (lane := self.settings.provider_lane(lane_name)) is not None and lane.api_key
            for lane_name in lane_names
        ):
            raise ProviderExhaustedError(
                "Provider ring is enabled, but no upstream API keys are configured.",
                attempts=[],
            )

        attempts: list[ProviderError] = []
        max_attempts = max(1, self.settings.provider_max_attempts)
        deadline = monotonic() + (self.settings.provider_max_request_time_ms / 1000)
        index = 0

        for attempt_number in range(1, max_attempts + 1):
            if monotonic() >= deadline:
                break

            lane_name, index = self._next_lane(lane_names, index)
            lane = self.settings.provider_lane(lane_name)
            if lane is None:
                attempts.append(
                    ProviderError(
                        f"Unknown provider lane '{lane_name}'.",
                        provider="router",
                        lane_name=lane_name,
                        retryable=False,
                    )
                )
                break

            if not lane.api_key:
                attempts.append(
                    ProviderError(
                        f"Missing credentials for {lane.name}.",
                        provider=lane.provider,
                        lane_name=lane.name,
                        retryable=True,
                    )
                )
                index = (index + 1) % len(lane_names)
                continue

            client = self._client_for_lane(lane)
            try:
                text = client.generate(
                    lane=lane,
                    system_prompt=system_prompt,
                    messages=messages,
                    timeout_s=self.settings.provider_request_timeout_s,
                )
            except ProviderError as exc:
                attempts.append(exc)
                if exc.retryable:
                    self._cooldowns[lane.name] = monotonic() + self.settings.provider_lane_cooldown_s
                index = (index + 1) % len(lane_names)
                continue

            self._cooldowns.pop(lane.name, None)
            return ProviderResult(
                text=text,
                provider=lane.provider,
                lane_name=lane.name,
                model=lane.model,
                attempts=attempt_number,
            )

        if attempts and all(
            str(attempt).startswith("Missing credentials") or str(attempt).startswith("Missing API key")
            for attempt in attempts
        ):
            raise ProviderExhaustedError(
                "Provider ring is enabled, but no upstream API keys are configured.",
                attempts=attempts,
            )

        raise ProviderExhaustedError(
            "Yantra upstream providers are temporarily unavailable.",
            attempts=attempts,
        )

    def _next_lane(self, lane_names: tuple[str, ...], index: int) -> tuple[str, int]:
        if not lane_names:
            raise ProviderExhaustedError("No provider lanes configured.", attempts=[])

        now = monotonic()
        for offset in range(len(lane_names)):
            candidate_index = (index + offset) % len(lane_names)
            candidate_name = lane_names[candidate_index]
            cooldown_until = self._cooldowns.get(candidate_name, 0)
            if cooldown_until <= now:
                return candidate_name, candidate_index

        fallback_index = index % len(lane_names)
        return lane_names[fallback_index], fallback_index

    def _client_for_lane(self, lane: ProviderLaneSettings) -> LaneClient:
        if lane.name in self._lane_clients:
            return self._lane_clients[lane.name]

        if lane.provider == "groq":
            return GroqChatClient()
        if lane.provider == "gemini":
            return GeminiChatClient()
        if lane.provider == "github-models":
            return GitHubModelsChatClient()

        raise ProviderError(
            f"Unsupported provider '{lane.provider}'.",
            provider=lane.provider,
            lane_name=lane.name,
            retryable=False,
        )


def build_provider_ring_router(settings: Settings | None = None) -> ProviderRingRouter:
    return ProviderRingRouter(settings or get_settings())
