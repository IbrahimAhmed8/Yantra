# Setup And Deployment

## Requirements

- Node.js 20 or newer
- npm
- a Supabase project
- a Gemini API key
- a Sarvam API key for Python Room voice
- Python 3.11 or newer if you want to run `ai/` locally

## One-Command Bootstrap

For a fresh local machine, start from the repo root with:

```powershell
npm run setup
```

That command is implemented by [`scripts/setup.mjs`](/c:/Users/pavan/Contribute/Yantra/scripts/setup.mjs) and will:

- create `.env.local` from `.env.example` when missing
- create `ai/.env` from `ai/.env.example` when missing
- install root dependencies
- create and hydrate `ai/.venv`
- run the current web and Python validation commands

Use these flags when needed:

```powershell
npm run setup -- --reindex
npm run setup -- --skip-validation
```

Read [`ONE_COMMAND_SETUP.md`](/c:/Users/pavan/Contribute/Yantra/docs/engineering/ONE_COMMAND_SETUP.md) for the streamlined onboarding version.

## Install

```bash
npm install
```

## Environment Variables

Create `.env.local` and set:

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

### Notes

- `YANTRA_AI_TARGET` chooses the web app target and defaults to `local`
- local mode defaults to `http://127.0.0.1:8000` unless `YANTRA_AI_LOCAL_URL` overrides it
- `YANTRA_AI_RENDER_URL` is used when `YANTRA_AI_TARGET="render"`
- `YANTRA_AI_SERVICE_URL` is the legacy alias still accepted by the render path
- `POST /api/chat` and `POST /api/rooms/python/feedback` target the Python AI service first whenever a service URL resolves
- `POST /api/docs-support` remains Gemini-only
- Gemini is not the default local-path behavior for the main chat route
- `GEMINI_API_KEY` or `GOOGLE_API_KEY` is still required for docs support and for Gemini fallbacks
- `SARVAM_API_KEY` is required for `/api/sarvam/stt` and `/api/sarvam/tts`

## Required Supabase Step

Run the SQL in `supabase/schema.sql` against your Supabase project before using the protected product surfaces.

That script creates:

- `public.profiles`
- `public.access_requests`
- `public.chat_histories`
- `public.student_dashboard_paths`
- `public.student_skill_progress`
- `public.student_curriculum_nodes`
- `public.student_weekly_activity`
- the relevant `updated_at` trigger functions and triggers
- row-level security policies for authenticated users and anonymous access requests

Dashboard room persistence note:

- `src/lib/supabase/dashboard.ts` also expects `public.student_practice_rooms`
- `supabase/schema.sql` now creates that table with matching RLS policies
- if your Supabase project predates this change, re-run `supabase/schema.sql` before expecting persisted room rows

## Local Development

### Start the app

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

When the root app stays on the default local target, these routes all expect the Python service at `http://127.0.0.1:8000`:

- `POST /api/chat`
- `GET /api/chat/health`
- `POST /api/rooms/python/feedback`

### Validate TypeScript

```bash
npm run lint
```

Current `lint` behavior is:

```bash
next typegen && npx tsc --noEmit
```

### Validate targeted tests

```bash
npx tsx --test app/api/rooms/python/feedback/route.test.ts src/features/rooms/__tests__/pyodide-runtime.test.ts
```

### Validate Python service tests

```bash
cd ai
pytest
```

### Production build

```bash
npm run build
```

## Main Routes To Test Locally

### Public

- `/`
- `/login`
- `/signup`
- `/docs`
- `/docs/welcome`
- `/privacy`
- `/terms`
- `/status`
- `/auth/reset-password`
- `/reset-password`

### Auth-required

- `/onboarding`
- `/dashboard`
- `/dashboard/student-profile`
- `/dashboard/rooms/python`

### APIs

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
- `GET http://localhost:8000/health`
- `POST http://localhost:8000/chat`
- `POST http://localhost:8000/rooms/python/feedback`

## Recommended Local Smoke Test

1. Start the app with `npm run dev`.
2. If you want the default local AI path, start the Python service from `ai/`.
3. Open `/signup` and create an account.
4. If email confirmation is enabled, follow the email link back to `/auth/confirm` and confirm the new account lands on `/onboarding`.
5. Complete onboarding and confirm it forwards to `/dashboard`.
6. Open `/dashboard/student-profile`, edit the record, and save it.
7. Reload the page to confirm the profile persisted.
8. Refresh `/dashboard` and confirm the starter dashboard renders.
9. Open the Yantra chat widget as the authenticated user, send a prompt, reload, and confirm the conversation resumes.
10. Open `/dashboard/rooms/python`, run code that throws a runtime error, and confirm room feedback responds.
11. Test room voice once and confirm `/api/sarvam/stt` plus `/api/sarvam/tts` succeed.
12. Open `/docs`, use Support Desk once, and confirm the docs support route responds.
13. Submit the landing-page access form and confirm the success state appears.
14. Sign out, log back in from `/login`, and confirm the same account goes straight to `/dashboard`.
15. Enable the Google and GitHub providers in Supabase Auth and test both OAuth sign-in paths from `/login` or `/signup`.

## Deployment

### Platform

- Vercel

### Expected settings

- Framework preset: `Next.js`
- Install command: default `npm install`
- Build command: default Next.js build or `next build`
- Output directory: default Next.js output
- Production branch: typically `main`

### Required environment variables in Vercel

- `YANTRA_AI_TARGET`
- `YANTRA_AI_RENDER_URL` or legacy `YANTRA_AI_SERVICE_URL`
- `YANTRA_AI_SERVICE_TIMEOUT_MS`
- `GEMINI_API_KEY`
- `SARVAM_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Deployment note:

- set `YANTRA_AI_TARGET="render"` in Vercel if production should call the hosted Python backend
- if you omit it, the app defaults to the local target and will try `http://127.0.0.1:8000`

## Supabase Auth URL Configuration

Configure these in Supabase Auth settings:

### Site URL

Use your production domain here once the app is deployed, for example:

- `https://YOUR-PRODUCTION-DOMAIN`

### Redirect URLs

Keep both local and production routes in Redirect URLs:

- `http://localhost:3000/auth/confirm`
- `http://localhost:3000/auth/reset-password`
- `https://YOUR-PRODUCTION-DOMAIN/auth/confirm`
- `https://YOUR-PRODUCTION-DOMAIN/auth/reset-password`

## Google OAuth Provider Setup

Configure these in Supabase Auth -> Providers -> Google:

- enable the Google provider
- paste your Google OAuth client ID
- paste your Google OAuth client secret

In Google Cloud:

- create a Web application OAuth client
- add your local and production app URLs as authorized JavaScript origins
- add the exact Supabase Google callback URL shown inside the Supabase Google provider screen as an authorized redirect URI

Yantra routes auth confirmations and Google sign-in back through `/auth/confirm`, which exchanges the code for the session cookie and then redirects by flow:

- new-account signup -> `/onboarding`
- returning login -> `/dashboard`

## GitHub OAuth Provider Setup

Configure these in Supabase Auth -> Providers -> GitHub:

- enable the GitHub provider
- paste your GitHub OAuth app client ID
- paste your GitHub OAuth app client secret

In GitHub:

- create an OAuth App
- use the exact Supabase GitHub callback URL shown inside the Supabase GitHub provider screen as the Authorization callback URL

Yantra routes GitHub sign-in back through `/auth/confirm`, which exchanges the code for the session cookie and then redirects by flow:

- new-account signup -> `/onboarding`
- returning login -> `/dashboard`

## Deployment Reality

### What depends on Supabase being configured

- login and signup becoming usable
- Google and GitHub sign-in becoming usable
- onboarding becoming usable
- protected dashboard and Python Room access
- `/api/profile`
- dashboard starter-data persistence
- student-profile persistence
- authenticated chat continuity
- access-request persistence

### What still works without Supabase

- the marketing page
- the docs pages
- the docs support route, as long as a Gemini key is present
- the main chat route, as long as the Python service target or Gemini fallback is configured
- the Python Room route shell will not open, because it is auth-protected

Without Supabase env vars, auth pages stay visible but display configuration guidance, and protected routes redirect back to `/login`.

## Troubleshooting

### Chat or room feedback fails

Check:

- `YANTRA_AI_TARGET` points where you expect
- the target URL resolves to a running Python service
- `YANTRA_AI_RENDER_URL` or `YANTRA_AI_SERVICE_URL` is set for render mode
- `GEMINI_API_KEY` or `GOOGLE_API_KEY` exists if you expect fallback behavior

### Docs support fails

Check:

- `GEMINI_API_KEY` or `GOOGLE_API_KEY` is set
- the deployment has restarted after env changes
- the request body contains at least one valid message

### Python Room voice fails

Check:

- `SARVAM_API_KEY` is set in the Next.js environment
- `/api/sarvam/stt` is receiving an actual audio file
- `/api/sarvam/tts` receives non-empty text

### Dashboard renders fallback content instead of persisted room rows

Check:

- `supabase/schema.sql` has been applied
- the dashboard tables and RLS policies exist
- `student_practice_rooms` exists in the applied schema and dashboard room rows can load without fallback
