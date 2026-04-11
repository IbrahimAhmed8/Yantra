# Yantra

Yantra is a Next.js 16 prototype for an AI-native learning platform. The current build combines:

- a public marketing site
- a public learner dashboard
- a locally persisted student profile
- a public editor with local project storage
- a public docs/help center
- optional Supabase-backed auth surfaces (email/password, Google, GitHub, password reset)
- persisted access requests
- authenticated chat history continuity when Supabase auth is available
- a Render-backed Yantra chat assistant routed through the Python AI microservice when configured
- a room-only Sarvam-powered voice assistant layered onto the Python Room
- a separate Python AI microservice under `ai/`

The app is no longer just a static marketing shell. The public dashboard, student profile, editor, docs, and live Python room are real. Some learner-state, recommendation, and deeper roadmap logic are still seeded or presentation-led.

## Current Routes

### Public pages

- `/` marketing landing page
- `/dashboard` student dashboard
- `/dashboard/student-profile` editable student profile workspace
- `/dashboard/rooms/python` Python room index
- `/dashboard/rooms/python/control-flow-calibration` live Python room
- `/editor` public editor workspace
- `/editor/projects` local project list
- `/editor/share/[shareSlug]` shared project view
- `/docs` docs home
- `/docs/[slug]` docs article pages
- `/features`
- `/guide`
- `/login`
- `/signup`
- `/privacy`
- `/terms`
- `/status`
- `/auth/reset-password`
- `/reset-password`

### Additional app routes

- `/onboarding`
- `/auth/confirm`
- `/auth/signout`

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
- `GET /api/editor/projects`
- `POST /api/editor/projects`
- `GET /api/editor/projects/[projectId]`
- `PATCH /api/editor/projects/[projectId]`
- `PUT /api/editor/projects/[projectId]/files`
- `POST /api/editor/projects/[projectId]/share`
- `GET /api/editor/share/[shareSlug]`

## What Works Today

- Next.js App Router runtime on a Vercel-compatible setup
- public dashboard access with no required sign-in
- profile persistence from `/dashboard/student-profile`
- local editor projects and shared-project remix flows
- Supabase-backed auth pages and recovery flows
- reusable chat widget on the marketing site and dashboard
- main Yantra chat routed through the Python AI service target resolved by `src/lib/yantra-ai-service.ts`
- docs-only Support Desk answers powered by Gemini through `/api/docs-support`
- authenticated chat history restore across sessions when Supabase auth is available
- Python Room execution in-browser through Pyodide, with runtime-error line highlighting
- Python Room feedback through `/api/rooms/python/feedback`, which targets the Python AI service first and can fall back to Gemini
- room-only push-to-talk voice assistant using Sarvam STT/TTS plus `/api/chat`
- access-request form validation, persistence, and server handling

## What Is Still Seeded Or Limited

- dashboard skills, progress cards, curriculum nodes, and recommendations are still starter data
- some room cards and roadmap visuals outside the live Python room remain presentation-led
- Python Room correctness checking is still exception-only; successful-but-wrong output is not evaluated yet
- chat moderation, analytics, and tool use are not built yet
- cross-device sync for public-mode profiles and editor projects is still future work
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

### One-command bootstrap

For a new local machine, start with:

```powershell
npm run setup
```

That command creates the local env files if needed, installs the web and Python dependencies, and runs the current validation suite. Full details live in `docs/engineering/ONE_COMMAND_SETUP.md`.

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

Run the SQL in `supabase/schema.sql` against your Supabase project. That creates `public.profiles`, `public.access_requests`, `public.chat_histories`, plus the update triggers and row-level security policies used by access requests and any Supabase-backed legacy profile/chat persistence that is still enabled.

- `public.profiles`
- `public.access_requests`
- `public.chat_histories`
- `public.student_dashboard_paths`
- `public.student_skill_progress`
- `public.student_curriculum_nodes`
- `public.student_practice_rooms`
- `public.student_weekly_activity`
- the relevant update triggers and row-level security policies

Dashboard room persistence is also included:

- `src/lib/supabase/dashboard.ts` reads and seeds `public.student_practice_rooms`
- `supabase/schema.sql` now creates that table with matching RLS policies
- if your Supabase project was initialized before this change, re-run `supabase/schema.sql` to add the table before expecting persisted room rows

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
