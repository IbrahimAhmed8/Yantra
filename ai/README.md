# Yantra AI Microservice

This is the first local-only Yantra AI slice. It is intentionally narrow:

- separate Python service under `ai/`
- no website integration
- no Supabase, pgvector, memory, or orchestration yet
- local markdown knowledge base
- local semantic embeddings plus local vector RAG
- Copilot CLI backed chat generation
- `/chat` endpoint with grounded responses

## Run locally

```powershell
cd ai
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e .[dev]
Copy-Item .env.example .env
python scripts/reindex_knowledge.py
uvicorn main:app --reload --port 8000
```

Open `http://localhost:8000/docs` for the FastAPI UI.

## Terminal chat only

If you want to test Yantra without the website and without starting FastAPI, run:

```powershell
cd ai
.venv\Scripts\Activate.ps1
python terminal_chat.py
```

Inside the terminal chat:

- `/login` runs `gh auth login`
- `/logout` runs `gh auth logout --hostname github.com`
- `/status` shows GitHub auth status
- `/provider local` forces fully local replies
- `/provider copilot` re-enables Copilot-backed replies
- `/provider ring` enables the Groq/Gemini/GitHub Models provider ring
- `/speed fast` keeps fast local shortcuts enabled
- `/speed full` disables the fast shortcuts and prefers the full provider path
- `/reindex` rebuilds the local vector index
- `/clear` resets the conversation
- `/student` shows the current student context

Anything that does not start with `/` is sent to Yantra as a chat message.

You can also do a one-shot test:

```powershell
python terminal_chat.py --once "How should we start building Yantra AI?"
```

The default local embedding model is now `sentence-transformers/all-MiniLM-L6-v2`. It maps text to a 384-dimensional vector space and is a safer default for lightweight local or low-memory deployment targets. If you want to switch back to a larger retrieval-focused model later, override `YANTRA_LOCAL_EMBEDDING_MODEL` in `.env`.

For chat generation, the service uses the official GitHub Copilot CLI and defaults to `gpt-5-mini`. The current installed Copilot CLI does not expose a `gpt-4.5 mini` option. It does expose `gpt-5-mini` and `gpt-4.1`.

## LiveKit terminal voice

There is now a separate LiveKit terminal entrypoint at `livekit_terminal_agent.py`. It is designed so the voice layer stays thin and still reuses the existing Yantra `ChatService`.

Install the optional voice stack:

```powershell
cd ai
pip install -e .[voice]
```

Set these env vars in `.env`:

```env
LIVEKIT_URL=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
```

For terminal-only local testing, start in console mode:

```powershell
python livekit_terminal_agent.py console --text
```

By default, the terminal agent now uses LiveKit Inference for speech-to-text and text-to-speech, so Sarvam is not required. You can try audio console mode with:

```powershell
python livekit_terminal_agent.py console
```

Notes:

- `console` mode is the right local-first path before website wiring.
- `dev`, `connect`, and `start` modes need `LIVEKIT_API_SECRET`.
- LiveKit Inference is included in LiveKit Cloud and can provide STT/TTS without a separate provider key.
- The safer default for terminal speech is `deepgram/aura-2` with voice `athena`.
- If you want Sarvam specifically, set `YANTRA_VOICE_BACKEND=sarvam` and add `SARVAM_API_KEY`.
- The LiveKit agent still uses Yantra retrieval and the provider ring through the existing Python service code.

The default chat mode is now the bounded provider ring:

- `groq_primary`
- `gemini_primary`
- `groq_secondary`
- `gemini_secondary`
- `github_models`
- then wrap back to `groq_primary` until the retry budget is exhausted

The `.env.example` already points at this mode. Fill the keys and keep:

```env
YANTRA_CHAT_PROVIDER=ring
YANTRA_PROVIDER_CHAIN=groq_primary,gemini_primary,groq_secondary,gemini_secondary,github_models
YANTRA_PROVIDER_MAX_ATTEMPTS=7
YANTRA_PROVIDER_MAX_REQUEST_TIME_MS=12000
YANTRA_PROVIDER_LANE_COOLDOWN_S=30
YANTRA_GROQ_PRIMARY_API_KEY=...
YANTRA_GEMINI_PRIMARY_API_KEY=...
YANTRA_GROQ_SECONDARY_API_KEY=...
YANTRA_GEMINI_SECONDARY_API_KEY=...
YANTRA_GITHUB_MODELS_TOKEN=...
```

If the ring is enabled without valid upstream keys, the service returns: `Yantra upstream providers are temporarily unavailable.`

To reduce repeated latency, the service now has in-memory caches for:

- retrieval results
- full chat responses for identical requests

Default cache knobs:

```env
YANTRA_RETRIEVAL_CACHE_TTL_S=180
YANTRA_RETRIEVAL_CACHE_MAX_ENTRIES=256
YANTRA_RESPONSE_CACHE_TTL_S=120
YANTRA_RESPONSE_CACHE_MAX_ENTRIES=256
```

The default behavior is now hybrid for speed:

- greetings and trivial prompts return from a local fast path
- short grounded teaching and guidance questions prefer local fast replies
- deeper prompts can still fall through to the selected provider mode

If you want maximum speed and do not care about Copilot-backed phrasing, set `YANTRA_CHAT_PROVIDER=local` in `.env`.

If `gh auth status` already shows you as logged in, the service can reuse that token automatically. Otherwise run:

```powershell
gh auth login
```

## Test locally

```powershell
cd ai
.venv\Scripts\Activate.ps1
pytest
```

The test suite forces lexical retrieval so tests stay fast and do not download the embedding model.

## Example request

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Help me build the first Yantra AI slice." }
    ],
    "student": {
      "name": "Aarav",
      "skill_level": "Beginner",
      "current_path": "Yantra AI"
    }
  }'
```

## Current boundary

The service is designed so later slices can swap in:

- another hosted provider instead of Copilot CLI if we change direction later
- pgvector or Supabase for retrieval persistence
- session memory and skill tracking
- extra routes for quiz, void feedback, and roadmap logic

This slice proves the local service shape, local vector retrieval, and test harness.
