# Yantra

Yantra is a Next.js 16 prototype for an AI-native learning platform. The live build currently combines:

- a public marketing site
- Supabase-backed email/password authentication
- Supabase-backed Google sign-in
- a public docs/help center with article pages
- protected learner routes
- a persisted student profile
- persisted access requests
- authenticated chat history continuity
- a configurable Python Yantra AI microservice under `ai/`, targeted first by the main chat and Python Room feedback routes
- a room-only Sarvam-powered voice assistant layered onto the Python Room through Next.js server routes

The app is no longer just a static marketing-plus-dashboard shell. Authentication, profile persistence, docs/help content, chat continuity, and the first real Python Room are live. Most learner-state, recommendation, and broader room logic are still seeded or presentation-led.

## Current Routes

### Public pages

- `/` marketing landing page
- `/login` email/password sign-in
- `/signup` account creation
- `/docs` docs home
- `/docs/[slug]` docs article pages
- `/privacy`
- `/terms`
- `/status`
- `/auth/reset-password` password recovery completion
- `/reset-password` mirror of the reset-password experience

### Auth-required pages

- `/onboarding` onboarding flow for authenticated accounts
- `/dashboard` student dashboard
- `/dashboard/student-profile` editable student profile workspace
- `/dashboard/rooms/python` Python Room

### Auth handlers

- `/auth/confirm` email confirmation and Google OAuth callback
- `/auth/signout` sign-out route

### API routes

- `POST /api/chat`
- `GET /api/chat/health`
- `GET /api/chat/history`
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/access-requests`
- `POST /api/docs-support`
- `POST /api/rooms/python/feedback`
- `POST /api/sarvam/stt`
- `POST /api/sarvam/tts`

## What Works Today

- Next.js App Router runtime on a Vercel-compatible setup
- Supabase SSR auth with cookie refresh handled through `proxy.ts`
- automatic profile seeding in `public.profiles` for first-time signed-in users
- onboarding shown after new account creation, with returning login going to the dashboard
- profile persistence from `/dashboard/student-profile`
- auth-required dashboard and Python Room redirects for signed-out visitors
- password reset email flow and reset page
- Google OAuth sign-in through Supabase
- reusable chat widget on the marketing site and dashboard
- main Yantra chat routed through the Python AI service target resolved by `src/lib/yantra-ai-service.ts`
- docs-only Support Desk answers powered by Gemini through `/api/docs-support`
- authenticated chat history restore across sessions
- Python Room execution in-browser through Pyodide, with runtime-error line highlighting
- Python Room feedback through `/api/rooms/python/feedback`, which targets the Python AI service first and can fall back to Gemini
- room-only push-to-talk voice assistant using Sarvam STT/TTS plus `/api/chat`
- automated coverage for the room-feedback route, Pyodide error parsing, and the Python service test suite

## What Is Still Seeded Or Limited

- dashboard skills, progress cards, curriculum nodes, and recommendations are still starter data
- most room cards outside the Python Room are still presentation-led
- Python Room correctness checking is still exception-only; successful-but-wrong output is not evaluated yet
- chat moderation, analytics, and tool use are not built yet
- adaptive roadmap logic and deeper learner memory are still future work

## Project Structure

```text
Yantra/
|-- ai/
|   |-- knowledge/
|   |-- tests/
|   |-- yantra_ai/
|   |-- main.py
|   `-- pyproject.toml
|-- app/
|   |-- api/
|   |-- auth/
|   |-- dashboard/
|   |-- docs/
|   |-- login/
|   |-- signup/
|   |-- layout.tsx
|   `-- page.tsx
|-- docs/
|-- src/
|   |-- features/
|   |   |-- docs/
|   |   `-- rooms/
|   |-- lib/
|   |   |-- supabase/
|   |   |-- yantra-ai-service.ts
|   |   `-- yantra-student-context.ts
|   `-- styles/
|-- supabase/schema.sql
|-- proxy.ts
`-- package.json
```

## Local Setup

### Requirements

- Node.js 20 or newer
- npm
- a Supabase project
- a Gemini API key
- a Sarvam API key for Python Room voice
- Python 3.11 or newer if you want to run `ai/` locally

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env.local` and set:

```env
YANTRA_AI_TARGET="local"
YANTRA_AI_LOCAL_URL="http://127.0.0.1:8000"
YANTRA_AI_RENDER_URL="https://YOUR-YANTRA-AI-SERVICE.onrender.com"
YANTRA_AI_SERVICE_URL="https://YOUR-YANTRA-AI-SERVICE.onrender.com"
YANTRA_AI_SERVICE_TIMEOUT_MS="65000"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
SARVAM_API_KEY="YOUR_SARVAM_API_KEY"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

Notes:

- `YANTRA_AI_TARGET` selects the web app target. `local` is the default and points the app at `http://127.0.0.1:8000` unless you override `YANTRA_AI_LOCAL_URL`.
- `YANTRA_AI_RENDER_URL` is used when `YANTRA_AI_TARGET="render"`.
- `YANTRA_AI_SERVICE_URL` is a legacy alias that still works for older setups.
- `POST /api/docs-support` remains Gemini-only.
- `POST /api/chat` only falls back to Gemini when no AI service URL can be resolved. With the default local target, a stopped local service causes chat failure until you start the service or switch the target.

### Database setup

Run the SQL in `supabase/schema.sql` against your Supabase project. It creates:

- `public.profiles`
- `public.access_requests`
- `public.chat_histories`
- `public.student_dashboard_paths`
- `public.student_skill_progress`
- `public.student_curriculum_nodes`
- `public.student_weekly_activity`
- the relevant update triggers and row-level security policies

Current mismatch to know about:

- `src/lib/supabase/dashboard.ts` also expects `public.student_practice_rooms`
- `supabase/schema.sql` does not currently create that table
- when it is missing, the dashboard falls back to starter room data instead of loading persisted room rows

### Start the web app

```bash
npm run dev
```

### Start the local AI microservice

```bash
cd ai
python -m venv .venv
pip install -e .[dev]
python scripts/reindex_knowledge.py
uvicorn main:app --reload --port 8000
```

On Windows PowerShell, activate the virtual environment with `.venv\Scripts\Activate.ps1`.

When the root app stays on the default local target, `/api/chat`, `/api/chat/health`, and `/api/rooms/python/feedback` all expect this service at `http://127.0.0.1:8000`.

### Validate

```bash
npm run lint
npx tsx --test app/api/rooms/python/feedback/route.test.ts src/features/rooms/__tests__/pyodide-runtime.test.ts
```

Python service tests:

```bash
cd ai
pytest
```

## Start Here

If you are new to the repo, read these in order:

1. `docs/README.md`
2. `docs/handoff/CURRENT_STATE.md`
3. `docs/engineering/SETUP_AND_DEPLOYMENT.md`
4. `docs/engineering/CODEBASE_MAP.md`
5. the relevant feature doc inside `docs/features/`

## Documentation Rule

When routes, auth behavior, AI target selection, environment setup, persistence, or major UI surfaces change, update the docs in `docs/` and any affected in-app docs content in the same pass.
