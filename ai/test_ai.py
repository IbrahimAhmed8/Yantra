import os, time
from dotenv import load_dotenv
load_dotenv(".env")
from yantra_ai.core.config import get_settings
from yantra_ai.core.providers import ProviderRingRouter
from yantra_ai.schemas.chat import Message
from dataclasses import replace

def test_groq():
    print("--- GROQ TEST ---")
    settings = get_settings()
    settings = replace(settings,
        groq_primary_api_key=os.getenv("YANTRA_GROQ_PRIMARY_API_KEY"),
        gemini_primary_api_key=None,
        groq_secondary_api_key=None,
        gemini_secondary_api_key=None,
        github_models_token=None,
        provider_chain=("groq_primary",),
        provider_max_attempts=2,
        provider_request_timeout_s=15,
    )
    router = ProviderRingRouter(settings)
    start = time.time()
    result = router.generate(
        system_prompt="You are Yantra, a helpful Python learning assistant.",
        messages=[Message(role="user", content="What is a list comprehension in Python?")]
    )
    elapsed = round((time.time() - start) * 1000)
    print(f"Provider: {result.provider}")
    print(f"Lane: {result.lane_name}")
    print(f"Model: {result.model}")
    print(f"Latency: {elapsed}ms")
    print(f"Response preview: {result.text[:300]}")
    print()

def test_gemini():
    print("--- GEMINI TEST ---")
    settings = get_settings()
    settings = replace(settings,
        groq_primary_api_key=None,
        gemini_primary_api_key=os.getenv("YANTRA_GEMINI_PRIMARY_API_KEY"),
        groq_secondary_api_key=None,
        gemini_secondary_api_key=None,
        github_models_token=None,
        provider_chain=("gemini_primary",),
        provider_max_attempts=2,
        provider_request_timeout_s=15,
    )
    router = ProviderRingRouter(settings)
    start = time.time()
    result = router.generate(
        system_prompt="You are Yantra, a helpful Python learning assistant.",
        messages=[Message(role="user", content="What is a list comprehension in Python?")]
    )
    elapsed = round((time.time() - start) * 1000)
    print(f"Provider: {result.provider}")
    print(f"Lane: {result.lane_name}")
    print(f"Model: {result.model}")
    print(f"Latency: {elapsed}ms")
    print(f"Response preview: {result.text[:300]}")
    print()

def test_failover():
    print("--- FAILOVER TEST ---")
    settings = get_settings()
    settings = replace(settings,
        groq_primary_api_key="INVALID_KEY_TO_FORCE_FAILOVER",
        gemini_primary_api_key=os.getenv("YANTRA_GEMINI_PRIMARY_API_KEY"),
        groq_secondary_api_key=None,
        gemini_secondary_api_key=None,
        github_models_token=None,
        provider_chain=("groq_primary", "gemini_primary"),
        provider_max_attempts=3,
        provider_request_timeout_s=15,
    )
    router = ProviderRingRouter(settings)
    start = time.time()
    result = router.generate(
        system_prompt="You are Yantra, a helpful Python learning assistant.",
        messages=[Message(role="user", content="Explain Python decorators briefly.")]
    )
    elapsed = round((time.time() - start) * 1000)
    print(f"Landed on: {result.provider} / {result.lane_name}")
    print(f"Attempts needed: {result.attempts}")
    print(f"Latency: {elapsed}ms")
    print(f"Response preview: {result.text[:200]}")
    print()

if __name__ == "__main__":
    test_groq()
    test_gemini()
    test_failover()
