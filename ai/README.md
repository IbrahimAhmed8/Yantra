# Yantra AI Microservice

This service is the current Python backend for Yantra's AI-assisted routes.

Today it provides:

- the FastAPI service under `ai/`
- `GET /health`
- `POST /chat`
- `POST /rooms/python/feedback`
- local knowledge retrieval from `ai/knowledge/`
- provider-backed grounded replies
- pytest coverage for chat, retrieval, providers, terminal chat, and Python Room feedback

This service is not a disconnected experiment anymore. When the Next.js app targets it through `src/lib/yantra-ai-service.ts`, it is the first backend used by:

- `POST /api/chat`
- `GET /api/chat/health`
- `POST /api/rooms/python/feedback`

Docs support is separate and remains Gemini-only through `POST /api/docs-support`.

Room voice is also separate. The website handles room speech through Next.js server routes plus Sarvam STT/TTS, then uses the existing web chat and room-feedback paths. There is no separate Python voice worker in this repo.

## Runtime Targeting

The root web app decides where to send AI requests with:

```env
YANTRA_AI_TARGET="local"
YANTRA_AI_LOCAL_URL="http://127.0.0.1:8000"
YANTRA_AI_RENDER_URL="https://YOUR-YANTRA-AI-SERVICE.onrender.com"
YANTRA_AI_SERVICE_URL="https://YOUR-YANTRA-AI-SERVICE.onrender.com"
```

Notes:

- `YANTRA_AI_TARGET` defaults to `local`
- local mode defaults the web app to `http://127.0.0.1:8000`
- `YANTRA_AI_RENDER_URL` is used when `YANTRA_AI_TARGET="render"`
- `YANTRA_AI_SERVICE_URL` still works as a legacy render alias
- Gemini is not the default local-path behavior for the main chat route; if the app stays on the local target and this service is down, `/api/chat` fails until you start the service or change the target

## Run Locally

```powershell
cd ai
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e .[dev]
Copy-Item .env.example .env
python scripts/reindex_knowledge.py
uvicorn main:app --reload --port 8000
```

Open [http://localhost:8000/docs](http://localhost:8000/docs) for the FastAPI UI.

## Terminal Chat

If you want to test the Python service without the website and without starting FastAPI, run:

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

## Provider Notes

The current service supports local and upstream-backed reply generation, including the provider ring documented in `.env.example`.

If the ring is enabled without valid upstream keys, the service returns a bounded unavailable message instead of pretending the route succeeded.

The default local embedding model is `sentence-transformers/all-MiniLM-L6-v2`.

## Test Locally

```powershell
cd ai
.venv\Scripts\Activate.ps1
pytest
```

Current Python coverage includes:

- `ai/tests/test_chat.py`
- `ai/tests/test_providers.py`
- `ai/tests/test_rag.py`
- `ai/tests/test_room_feedback.py`
- `ai/tests/test_terminal_chat.py`

The test suite forces lexical retrieval so tests stay fast and do not download the embedding model.

## Example Request

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

## Current Boundary

This service currently focuses on grounded chat and Python Room feedback. Later slices can still add:

- different hosted providers
- pgvector or Supabase-backed retrieval persistence
- deeper learner memory and skill tracking
- additional room or evaluation routes
