---
title: Python Microservice Structure
tags: python, fastapi, structure, microservice
---

# Python Microservice Structure

The Python service plan is clear about separation of concerns: the web app handles interface, and the Python service handles intelligence. Even though the website is not wired in yet, the service should be shaped as if it can become the AI brain later.

The intended structure includes:

- FastAPI entry point
- route modules such as chat and later room-specific routes
- core modules for retrieval, prompts, orchestration, and memory
- knowledge documents
- scripts for indexing or setup
- tests that can run without the browser

This repo already follows that shape in a simplified form. The local AI service contains:

- `main.py` for FastAPI boot
- a terminal-only chat runner for local testing
- retrieval and embedding logic in `yantra_ai/core`
- request and response schemas
- a growing knowledge base under `ai/knowledge`

The value of this structure is speed. AI logic can be changed, tested, and iterated independently of the frontend. That is exactly what the Python service PDF recommends.
