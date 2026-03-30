---
title: Testing Without The Website
tags: testing, terminal, fastapi, local-workflow
---

# Testing Without The Website

One of the strongest ideas in the Python service plan is that Yantra should be testable without opening the website. That keeps AI iteration fast and avoids frontend friction while the core behavior is still changing.

The local testing layers should include:

- pytest for automated checks
- FastAPI Swagger UI for route testing
- curl or terminal chat for quick manual prompts

This repo now supports all three patterns:

- `pytest` validates retrieval and chat behavior
- `uvicorn main:app --reload --port 8000` exposes `/docs`
- `python terminal_chat.py` runs a local terminal chat loop with no website involved

The terminal workflow is especially useful for knowledge-base work. When a response is too generic or misses a Yantra concept, the fastest fix is often:

1. add or improve a markdown knowledge doc
2. run `/reindex` in terminal chat or `python scripts/reindex_knowledge.py`
3. ask the same question again

That loop should stay central to development. The AI system should become reliable in terminal-first testing before it is pushed into the web runtime.
