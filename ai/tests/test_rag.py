from yantra_ai.core.rag import search_knowledge


def test_rag_finds_build_sequence() -> None:
    results = search_knowledge("What is the first Yantra AI build slice?")

    assert results
    assert any("basic-build-sequence" in result.path for result in results)


def test_rag_finds_service_boundary() -> None:
    results = search_knowledge("Should Yantra AI connect to the website right now?")

    assert results
    assert any("service boundary" in result.title.lower() for result in results)


def test_rag_returns_empty_for_irrelevant_query() -> None:
    results = search_knowledge("volcanic rock mineral composition in iceland")

    assert results == []
