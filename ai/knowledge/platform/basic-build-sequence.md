---
title: Basic Yantra AI Build Sequence
tags: roadmap, build-order, scaffold, rag
---

# Basic Yantra AI Build Sequence

If someone asks what the first Yantra AI build slice is, this file is the answer.

Build the first Yantra AI slice in the smallest useful order:

1. Create a standalone FastAPI service under `ai/`.
2. Add a small knowledge base in markdown so the system has product-specific context.
3. Implement local retrieval against those knowledge files.
4. Add a `/chat` route that uses retrieval before replying.
5. Add pytest coverage so the service can be changed without rework.

After this first slice is stable, the next upgrades are a real model provider, vector retrieval, student memory, practice-room feedback, and website integration.
