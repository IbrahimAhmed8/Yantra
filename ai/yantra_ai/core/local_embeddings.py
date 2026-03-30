from __future__ import annotations

from contextlib import redirect_stderr, redirect_stdout
from functools import lru_cache
import io

from yantra_ai.core.config import Settings, get_settings


class LocalEmbeddingClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def _prepare_document(self, text: str) -> str:
        if self.settings.local_embedding_model.startswith("nomic-ai/nomic-embed-text"):
            return f"search_document: {text}"

        return text

    def _prepare_query(self, text: str) -> str:
        if self.settings.local_embedding_model.startswith("nomic-ai/nomic-embed-text"):
            return f"search_query: {text}"

        if "bge" in self.settings.local_embedding_model.lower():
            return f"Represent this sentence for searching relevant passages: {text}"

        return text

    def encode_documents(self, texts: list[str]) -> list[list[float]]:
        model = _load_model(
            self.settings.local_embedding_model,
            self.settings.local_embedding_device,
            self.settings.local_embedding_trust_remote_code,
        )
        sink = io.StringIO()
        with redirect_stdout(sink), redirect_stderr(sink):
            vectors = model.encode(
                [self._prepare_document(text) for text in texts],
                normalize_embeddings=True,
                show_progress_bar=False,
                convert_to_numpy=True,
            )
        return [[float(value) for value in row] for row in vectors]

    def encode_query(self, text: str) -> list[float]:
        model = _load_model(
            self.settings.local_embedding_model,
            self.settings.local_embedding_device,
            self.settings.local_embedding_trust_remote_code,
        )
        sink = io.StringIO()
        with redirect_stdout(sink), redirect_stderr(sink):
            vector = model.encode(
                self._prepare_query(text),
                normalize_embeddings=True,
                show_progress_bar=False,
                convert_to_numpy=True,
            )
        return [float(value) for value in vector]


@lru_cache(maxsize=2)
def _load_model(model_name: str, device: str, trust_remote_code: bool):
    from sentence_transformers import SentenceTransformer
    from transformers import logging as transformers_logging

    transformers_logging.set_verbosity_error()
    sink = io.StringIO()
    with redirect_stdout(sink), redirect_stderr(sink):
        return SentenceTransformer(
            model_name,
            device=device,
            trust_remote_code=trust_remote_code,
        )


def get_local_embedding_client(settings: Settings | None = None) -> LocalEmbeddingClient:
    return LocalEmbeddingClient(settings or get_settings())
