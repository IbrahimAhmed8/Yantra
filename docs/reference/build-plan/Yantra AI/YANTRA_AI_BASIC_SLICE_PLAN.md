# Yantra AI Basic Slice Plan

Created after reviewing:

- `Yantra_AI_Build_Plan.pdf`
- `Yantra_Python_AI_Service.pdf`

## Decision

Do not start with the full Jarvis-level architecture. Start with a local-only Python microservice that proves the smallest end-to-end AI loop:

1. service scaffold
2. local knowledge files
3. local retrieval
4. chat endpoint
5. tests

This keeps the first slice cheap to change and avoids rework while the product is still moving.

## What We Are Building Now

Current slice scope:

- standalone `ai/` FastAPI service
- local markdown knowledge base
- local RAG retrieval
- GitHub Copilot CLI for chat generation
- `/chat` endpoint
- pytest coverage
- FastAPI `/docs` and `/health`

Current embedding choice:

- local model: `sentence-transformers/all-MiniLM-L6-v2`
- reason: smaller, simpler, and safer for low-memory or free-tier deployment targets while we keep the service local-first

Current chat choice:

- provider: GitHub Copilot CLI
- default model: `gpt-5-mini`
- note: the currently installed Copilot CLI on this machine does not expose a `gpt-4.5 mini` option

See the production provider plan for the post-Copilot rollout:

- `YANTRA_AI_PROVIDER_ROLLOUT_PLAN.md`

## What We Are Explicitly Not Building Yet

- website integration
- Supabase or pgvector
- multi-model orchestration
- per-student memory
- quiz route
- void feedback route
- skill graph and roadmap engine

## Build Order

### Step 1

Create the Python service and make sure it boots locally.

Exit criteria:

- `uvicorn main:app --reload --port 8000` starts cleanly
- `/health` returns `{"status":"ok"}`

### Step 2

Create 3-5 Yantra-specific markdown knowledge files from the PDF architecture.

Exit criteria:

- knowledge files describe Yantra, the AI service boundary, teaching style, and first build sequence

### Step 3

Add a tiny local retrieval layer.

Exit criteria:

- a query about Yantra AI returns relevant knowledge chunks
- an unrelated query returns no chunks

### Step 4

Add a `/chat` route that retrieves context before replying.

Exit criteria:

- chat replies reference grounded knowledge
- chat does not hallucinate when context is missing

### Step 5

Add tests for retrieval and chat.

Exit criteria:

- `pytest` passes locally

## Next Slice After This

Only after Step 5 is stable:

1. plug in a real model provider
2. replace local retrieval with embeddings plus vector search
3. add student memory
4. add room-specific feedback routes
5. connect the web app over HTTP
