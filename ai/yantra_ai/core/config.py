from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
import os


@dataclass(frozen=True)
class ProviderLaneSettings:
    name: str
    provider: str
    model: str
    api_key: str | None


@dataclass(frozen=True)
class Settings:
    base_dir: Path
    data_dir: Path
    knowledge_dir: Path
    vector_index_path: Path
    chat_provider: str
    copilot_model: str
    copilot_command: str
    copilot_timeout_s: int
    provider_chain: tuple[str, ...]
    provider_max_attempts: int
    provider_max_request_time_ms: int
    provider_lane_cooldown_s: int
    provider_request_timeout_s: int
    groq_primary_model: str
    groq_primary_api_key: str | None
    gemini_primary_model: str
    gemini_primary_api_key: str | None
    groq_secondary_model: str
    groq_secondary_api_key: str | None
    gemini_secondary_model: str
    gemini_secondary_api_key: str | None
    github_models_model: str
    github_models_token: str | None
    embedding_backend: str
    local_embedding_model: str
    local_embedding_device: str
    local_embedding_trust_remote_code: bool
    fast_responses: bool
    retrieval_cache_ttl_s: int
    retrieval_cache_max_entries: int
    response_cache_ttl_s: int
    response_cache_max_entries: int
    auto_reindex: bool
    top_k: int
    min_retrieval_score: float
    min_vector_score: float
    max_excerpt_chars: int

    def provider_lane(self, lane_name: str) -> ProviderLaneSettings | None:
        lanes = {
            "groq_primary": ProviderLaneSettings(
                name="groq_primary",
                provider="groq",
                model=self.groq_primary_model,
                api_key=self.groq_primary_api_key,
            ),
            "gemini_primary": ProviderLaneSettings(
                name="gemini_primary",
                provider="gemini",
                model=self.gemini_primary_model,
                api_key=self.gemini_primary_api_key,
            ),
            "groq_secondary": ProviderLaneSettings(
                name="groq_secondary",
                provider="groq",
                model=self.groq_secondary_model,
                api_key=self.groq_secondary_api_key,
            ),
            "gemini_secondary": ProviderLaneSettings(
                name="gemini_secondary",
                provider="gemini",
                model=self.gemini_secondary_model,
                api_key=self.gemini_secondary_api_key,
            ),
            "github_models": ProviderLaneSettings(
                name="github_models",
                provider="github-models",
                model=self.github_models_model,
                api_key=self.github_models_token,
            ),
        }
        return lanes.get(lane_name)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    base_dir = Path(__file__).resolve().parents[2]
    knowledge_dir = Path(os.getenv("YANTRA_KNOWLEDGE_DIR", base_dir / "knowledge"))
    data_dir = base_dir / "data"
    vector_index_path = Path(os.getenv("YANTRA_VECTOR_INDEX_PATH", data_dir / "knowledge_index.json"))

    if not knowledge_dir.is_absolute():
        knowledge_dir = base_dir / knowledge_dir

    if not vector_index_path.is_absolute():
        vector_index_path = base_dir / vector_index_path

    provider_chain = tuple(
        item.strip()
        for item in os.getenv(
            "YANTRA_PROVIDER_CHAIN",
            "groq_primary,gemini_primary,groq_secondary,gemini_secondary,github_models",
        ).split(",")
        if item.strip()
    )

    return Settings(
        base_dir=base_dir,
        data_dir=data_dir,
        knowledge_dir=knowledge_dir,
        vector_index_path=vector_index_path,
        chat_provider=os.getenv("YANTRA_CHAT_PROVIDER", "ring").lower(),
        copilot_model=os.getenv("YANTRA_COPILOT_MODEL", "gpt-5-mini"),
        copilot_command=os.getenv("YANTRA_COPILOT_COMMAND", "copilot"),
        copilot_timeout_s=int(os.getenv("YANTRA_COPILOT_TIMEOUT_S", "120")),
        provider_chain=provider_chain,
        provider_max_attempts=int(os.getenv("YANTRA_PROVIDER_MAX_ATTEMPTS", "7")),
        provider_max_request_time_ms=int(os.getenv("YANTRA_PROVIDER_MAX_REQUEST_TIME_MS", "9000")),
        provider_lane_cooldown_s=int(os.getenv("YANTRA_PROVIDER_LANE_COOLDOWN_S", "30")),
        provider_request_timeout_s=int(os.getenv("YANTRA_PROVIDER_REQUEST_TIMEOUT_S", "4")),
        groq_primary_model=os.getenv("YANTRA_GROQ_PRIMARY_MODEL", "llama-3.1-8b-instant"),
        groq_primary_api_key=os.getenv("YANTRA_GROQ_PRIMARY_API_KEY"),
        gemini_primary_model=os.getenv("YANTRA_GEMINI_PRIMARY_MODEL", "gemini-2.0-flash"),
        gemini_primary_api_key=os.getenv("YANTRA_GEMINI_PRIMARY_API_KEY"),
        groq_secondary_model=os.getenv("YANTRA_GROQ_SECONDARY_MODEL", "llama-3.1-8b-instant"),
        groq_secondary_api_key=os.getenv("YANTRA_GROQ_SECONDARY_API_KEY"),
        gemini_secondary_model=os.getenv("YANTRA_GEMINI_SECONDARY_MODEL", "gemini-2.0-flash"),
        gemini_secondary_api_key=os.getenv("YANTRA_GEMINI_SECONDARY_API_KEY"),
        github_models_model=os.getenv("YANTRA_GITHUB_MODELS_MODEL", "openai/gpt-4.1"),
        github_models_token=os.getenv("YANTRA_GITHUB_MODELS_TOKEN"),
        embedding_backend=os.getenv("YANTRA_EMBEDDING_BACKEND", "local").lower(),
        local_embedding_model=os.getenv(
            "YANTRA_LOCAL_EMBEDDING_MODEL",
            "sentence-transformers/all-MiniLM-L6-v2",
        ),
        local_embedding_device=os.getenv("YANTRA_LOCAL_EMBEDDING_DEVICE", "cpu"),
        local_embedding_trust_remote_code=os.getenv(
            "YANTRA_LOCAL_EMBEDDING_TRUST_REMOTE_CODE",
            "false",
        ).lower()
        in {"1", "true", "yes", "on"},
        fast_responses=os.getenv("YANTRA_FAST_RESPONSES", "true").lower() in {"1", "true", "yes", "on"},
        retrieval_cache_ttl_s=int(os.getenv("YANTRA_RETRIEVAL_CACHE_TTL_S", "180")),
        retrieval_cache_max_entries=int(os.getenv("YANTRA_RETRIEVAL_CACHE_MAX_ENTRIES", "256")),
        response_cache_ttl_s=int(os.getenv("YANTRA_RESPONSE_CACHE_TTL_S", "120")),
        response_cache_max_entries=int(os.getenv("YANTRA_RESPONSE_CACHE_MAX_ENTRIES", "256")),
        auto_reindex=os.getenv("YANTRA_AUTO_REINDEX", "true").lower() in {"1", "true", "yes", "on"},
        top_k=int(os.getenv("YANTRA_TOP_K", "2")),
        min_retrieval_score=float(os.getenv("YANTRA_MIN_RETRIEVAL_SCORE", "0.3")),
        min_vector_score=float(os.getenv("YANTRA_MIN_VECTOR_SCORE", "0.35")),
        max_excerpt_chars=int(os.getenv("YANTRA_MAX_EXCERPT_CHARS", "360")),
    )
