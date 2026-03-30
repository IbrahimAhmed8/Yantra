from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from functools import lru_cache
from math import log, sqrt
from pathlib import Path
import json
import re

import numpy as np

from yantra_ai.core.config import Settings, get_settings
from yantra_ai.core.local_embeddings import get_local_embedding_client

TOKEN_RE = re.compile(r"[a-z0-9]+")
STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "been",
    "being",
    "by",
    "can",
    "could",
    "did",
    "do",
    "does",
    "for",
    "from",
    "had",
    "has",
    "have",
    "explain",
    "how",
    "i",
    "in",
    "into",
    "is",
    "it",
    "me",
    "my",
    "of",
    "on",
    "or",
    "our",
    "should",
    "that",
    "the",
    "their",
    "them",
    "they",
    "this",
    "to",
    "was",
    "we",
    "were",
    "what",
    "when",
    "where",
    "which",
    "who",
    "why",
    "with",
    "would",
    "you",
    "your",
}


@dataclass(frozen=True)
class Chunk:
    title: str
    path: str
    text: str
    token_counts: Counter[str]
    title_tokens: frozenset[str]


@dataclass(frozen=True)
class SearchResult:
    title: str
    path: str
    text: str
    score: float


@dataclass(frozen=True)
class KnowledgeIndex:
    chunks: tuple[Chunk, ...]
    document_frequency: dict[str, int]
    total_chunks: int


@dataclass(frozen=True)
class VectorChunk:
    title: str
    path: str
    text: str
    embedding: tuple[float, ...]


@dataclass(frozen=True)
class VectorIndex:
    model_name: str
    signature: tuple[tuple[str, int, int], ...]
    chunks: tuple[VectorChunk, ...]


@dataclass(frozen=True)
class PreparedVectorIndex:
    vector_index: VectorIndex
    matrix: np.ndarray


@dataclass(frozen=True)
class RetrievalBatch:
    mode: str
    results: list[SearchResult]


_PREPARED_VECTOR_CACHE: dict[tuple[str, str, tuple[tuple[str, int, int], ...]], PreparedVectorIndex] = {}


def tokenize(text: str) -> list[str]:
    return [token for token in TOKEN_RE.findall(text.lower()) if token not in STOP_WORDS]


def strip_frontmatter(text: str) -> str:
    if not text.startswith("---"):
        return text

    parts = text.split("---", 2)
    if len(parts) < 3:
        return text

    return parts[2].lstrip()


def extract_title(text: str, fallback: str) -> str:
    for line in strip_frontmatter(text).splitlines():
        stripped = line.strip()
        if stripped.startswith("# "):
            return stripped[2:].strip()

    return fallback.replace("-", " ").title()


def split_into_chunks(text: str, max_chars: int = 700) -> list[str]:
    paragraphs = [paragraph.strip() for paragraph in strip_frontmatter(text).split("\n\n") if paragraph.strip()]
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    for paragraph in paragraphs:
        paragraph_len = len(paragraph)
        if current and current_len + paragraph_len > max_chars:
            chunks.append("\n\n".join(current))
            current = [paragraph]
            current_len = paragraph_len
            continue

        current.append(paragraph)
        current_len += paragraph_len

    if current:
        chunks.append("\n\n".join(current))

    return chunks


def _knowledge_signature(knowledge_dir: Path) -> tuple[tuple[str, int, int], ...]:
    files = sorted(path for path in knowledge_dir.rglob("*.md") if path.is_file())
    return tuple(
        (
            path.relative_to(knowledge_dir).as_posix(),
            path.stat().st_mtime_ns,
            path.stat().st_size,
        )
        for path in files
    )


def _load_raw_chunks(signature: tuple[tuple[str, int, int], ...], knowledge_dir: Path) -> list[tuple[str, str, str]]:
    chunks: list[tuple[str, str, str]] = []

    for relative_path, _, _ in signature:
        path = knowledge_dir / relative_path
        text = path.read_text(encoding="utf-8")
        title = extract_title(text, path.stem)

        for chunk_text in split_into_chunks(text):
            chunks.append((title, relative_path, chunk_text))

    return chunks


@lru_cache(maxsize=4)
def _build_lexical_index(knowledge_dir_str: str, signature: tuple[tuple[str, int, int], ...]) -> KnowledgeIndex:
    knowledge_dir = Path(knowledge_dir_str)
    chunks: list[Chunk] = []
    document_frequency: Counter[str] = Counter()

    for title, relative_path, chunk_text in _load_raw_chunks(signature, knowledge_dir):
        tokens = tokenize(chunk_text)
        if not tokens:
            continue

        token_counts = Counter(tokens)
        title_tokens = frozenset(tokenize(title))
        chunks.append(
            Chunk(
                title=title,
                path=relative_path,
                text=chunk_text,
                token_counts=token_counts,
                title_tokens=title_tokens,
            )
        )
        document_frequency.update(token_counts.keys())

    return KnowledgeIndex(
        chunks=tuple(chunks),
        document_frequency=dict(document_frequency),
        total_chunks=len(chunks),
    )


def _load_vector_index_file(settings: Settings, signature: tuple[tuple[str, int, int], ...]) -> VectorIndex | None:
    if not settings.vector_index_path.exists():
        return None

    data = json.loads(settings.vector_index_path.read_text(encoding="utf-8"))
    stored_signature = tuple(tuple(item) for item in data.get("signature", []))
    if stored_signature != signature:
        return None

    if data.get("model_name") != settings.local_embedding_model:
        return None

    return VectorIndex(
        model_name=data["model_name"],
        signature=stored_signature,
        chunks=tuple(
            VectorChunk(
                title=item["title"],
                path=item["path"],
                text=item["text"],
                embedding=tuple(float(value) for value in item["embedding"]),
            )
            for item in data.get("chunks", [])
        ),
    )


def _prepared_vector_cache_key(
    settings: Settings,
    signature: tuple[tuple[str, int, int], ...],
) -> tuple[str, str, tuple[tuple[str, int, int], ...]]:
    return (
        str(settings.vector_index_path),
        settings.local_embedding_model,
        signature,
    )


def get_prepared_vector_index(settings: Settings | None = None) -> PreparedVectorIndex | None:
    active_settings = settings or get_settings()
    signature = _knowledge_signature(active_settings.knowledge_dir)
    cache_key = _prepared_vector_cache_key(active_settings, signature)
    cached = _PREPARED_VECTOR_CACHE.get(cache_key)
    if cached is not None:
        return cached

    vector_index = _load_vector_index_file(active_settings, signature)
    if vector_index is None:
        if not active_settings.auto_reindex:
            return None
        vector_index = build_vector_index(active_settings, force=True)

    if vector_index.chunks:
        matrix = np.asarray([chunk.embedding for chunk in vector_index.chunks], dtype=np.float32)
    else:
        matrix = np.empty((0, 0), dtype=np.float32)

    prepared = PreparedVectorIndex(vector_index=vector_index, matrix=matrix)
    if len(_PREPARED_VECTOR_CACHE) >= 4:
        oldest_key = next(iter(_PREPARED_VECTOR_CACHE))
        _PREPARED_VECTOR_CACHE.pop(oldest_key, None)
    _PREPARED_VECTOR_CACHE[cache_key] = prepared
    return prepared


def build_vector_index(settings: Settings | None = None, *, force: bool = False) -> VectorIndex:
    active_settings = settings or get_settings()
    signature = _knowledge_signature(active_settings.knowledge_dir)

    if not force:
        existing = _load_vector_index_file(active_settings, signature)
        if existing is not None:
            return existing

    raw_chunks = _load_raw_chunks(signature, active_settings.knowledge_dir)
    if not raw_chunks:
        vector_index = VectorIndex(
            model_name=active_settings.local_embedding_model,
            signature=signature,
            chunks=tuple(),
        )
        _write_vector_index(active_settings, vector_index)
        return vector_index

    client = get_local_embedding_client(active_settings)
    embeddings = client.encode_documents([chunk_text for _, _, chunk_text in raw_chunks])
    vector_index = VectorIndex(
        model_name=active_settings.local_embedding_model,
        signature=signature,
        chunks=tuple(
            VectorChunk(
                title=title,
                path=relative_path,
                text=chunk_text,
                embedding=tuple(embedding),
            )
            for (title, relative_path, chunk_text), embedding in zip(raw_chunks, embeddings, strict=True)
        ),
    )
    _write_vector_index(active_settings, vector_index)
    _PREPARED_VECTOR_CACHE.clear()
    return vector_index


def _write_vector_index(settings: Settings, vector_index: VectorIndex) -> None:
    settings.vector_index_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "model_name": vector_index.model_name,
        "signature": [list(item) for item in vector_index.signature],
        "chunks": [
            {
                "title": chunk.title,
                "path": chunk.path,
                "text": chunk.text,
                "embedding": list(chunk.embedding),
            }
            for chunk in vector_index.chunks
        ],
    }
    settings.vector_index_path.write_text(json.dumps(payload), encoding="utf-8")
    _PREPARED_VECTOR_CACHE.clear()


def get_lexical_index(settings: Settings | None = None) -> KnowledgeIndex:
    active_settings = settings or get_settings()
    signature = _knowledge_signature(active_settings.knowledge_dir)
    return _build_lexical_index(str(active_settings.knowledge_dir), signature)


def _idf(term: str, index: KnowledgeIndex) -> float:
    df = index.document_frequency.get(term, 0)
    return log((1 + index.total_chunks) / (1 + df)) + 1


def _lexical_search(query: str, limit: int, settings: Settings) -> list[SearchResult]:
    index = get_lexical_index(settings)
    query_counts = Counter(tokenize(query))

    if not query_counts or not index.chunks:
        return []

    scored: list[SearchResult] = []

    for chunk in index.chunks:
        score = 0.0
        for term, query_tf in query_counts.items():
            doc_tf = chunk.token_counts.get(term)
            if not doc_tf:
                continue

            idf = _idf(term, index)
            score += query_tf * doc_tf * idf

            if term in chunk.title_tokens:
                score += idf * 0.35

        if score <= 0:
            continue

        normalized = score / sqrt(sum(chunk.token_counts.values()))
        if normalized < settings.min_retrieval_score:
            continue

        scored.append(
            SearchResult(
                title=chunk.title,
                path=chunk.path,
                text=chunk.text,
                score=round(normalized, 3),
            )
        )

    return sorted(scored, key=lambda item: item.score, reverse=True)[:limit]


def _vector_search(query: str, limit: int, settings: Settings) -> list[SearchResult]:
    prepared = get_prepared_vector_index(settings)
    if prepared is None or not prepared.vector_index.chunks:
        return []

    query_vector = np.asarray(
        get_local_embedding_client(settings).encode_query(query),
        dtype=np.float32,
    )
    scores = prepared.matrix @ query_vector
    scored: list[SearchResult] = []

    for index, score in enumerate(scores):
        numeric_score = float(score)
        if numeric_score < settings.min_vector_score:
            continue

        chunk = prepared.vector_index.chunks[index]
        scored.append(
            SearchResult(
                title=chunk.title,
                path=chunk.path,
                text=chunk.text,
                score=round(numeric_score, 3),
            )
        )

    return sorted(scored, key=lambda item: item.score, reverse=True)[:limit]


def warmup_retrieval(settings: Settings | None = None) -> None:
    active_settings = settings or get_settings()
    get_lexical_index(active_settings)

    if active_settings.embedding_backend != "local":
        return

    get_prepared_vector_index(active_settings)
    get_local_embedding_client(active_settings).encode_query("warmup")


def search_knowledge_details(
    query: str,
    *,
    top_k: int | None = None,
    settings: Settings | None = None,
) -> RetrievalBatch:
    active_settings = settings or get_settings()
    limit = top_k or active_settings.top_k
    lexical_results = _lexical_search(query, limit, active_settings)

    if lexical_results:
        return RetrievalBatch(mode="lexical", results=lexical_results)

    if active_settings.embedding_backend == "local":
        try:
            vector_results = _vector_search(query, limit, active_settings)
            if vector_results:
                return RetrievalBatch(mode="local-vector", results=vector_results)
        except Exception:
            pass

    return RetrievalBatch(mode="lexical", results=lexical_results)


def search_knowledge(
    query: str,
    *,
    top_k: int | None = None,
    settings: Settings | None = None,
) -> list[SearchResult]:
    return search_knowledge_details(query, top_k=top_k, settings=settings).results
