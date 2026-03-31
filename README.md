# Yantra

Yantra is a Next.js 16 prototype for an AI-native learning platform. The current build combines:

- a public marketing site
- Supabase-backed email/password authentication
- Supabase-backed Google sign-in
- protected dashboard routes
- a persisted student profile
- persisted access requests
- authenticated chat history continuity
- a Render-backed Yantra chat assistant routed through the Python AI microservice
- a separate Python AI microservice under `ai/`

The app is no longer just a static marketing-plus-dashboard shell. Authentication and profile persistence are live; most learning data, roadmap logic, and room functionality are still demo content.
The main Yantra chat route now proxies into the Python AI microservice when `YANTRA_AI_SERVICE_URL` is set.

## Current Routes

### Public pages

- `/` marketing landing page
- `/login` email/password sign-in
- `/signup` account creation
- `/auth/reset-password` password recovery completion

### Protected pages

- `/dashboard` student dashboard
- `/dashboard/student-profile` editable student profile workspace
- `/onboarding` required role selection after signup

### Auth handlers

- `/auth/confirm` email confirmation callback
- `/auth/signout` sign-out route

### API routes

- `/api/chat` Next.js proxy to the Python Yantra AI service
- `/api/chat/history` authenticated chat-history load
- `/api/profile` authenticated profile read/update
- `/api/access-requests` access-intent form submission

## What Works Today

- Next.js App Router runtime on Vercel-compatible setup
- Supabase SSR auth with cookie refresh handled through `proxy.ts`
- automatic profile seeding in `public.profiles` for first-time signed-in users
- onboarding shown after new account creation, with login returning to the dashboard
- profile persistence from `/dashboard/student-profile`
- protected dashboard redirects for signed-out visitors
- password reset email flow and reset page
- Google OAuth sign-in through Supabase
- reusable chat widget on the marketing site and dashboard
- authenticated chat history restore across sessions
- access-request form validation, persistence, and server handling

## What Is Still Placeholder Or Static

- dashboard skills, progress cards, momentum charts, and room cards
- curriculum and performance content inside the dashboard UI
- chat moderation, analytics, and tool use
- practice-room execution engines and dynamic roadmap logic

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
|   |-- login/
|   |-- signup/
|   |-- layout.tsx
|   `-- page.tsx
|-- docs/
|-- src/
|   |-- features/
|   |-- lib/supabase/
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
- a deployed Yantra AI service URL for the main chat path

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env.local` and set:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
YANTRA_AI_SERVICE_URL="https://YOUR-YANTRA-AI-SERVICE.onrender.com"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### Database setup

Run the SQL in `supabase/schema.sql` against your Supabase project. That creates `public.profiles`, `public.access_requests`, `public.chat_histories`, plus the update triggers and row-level security policies used by auth, profile persistence, access requests, and authenticated chat continuity.

### Start

```bash
npm run dev
```

### Local AI microservice

The separate Python service can be started independently:

```bash
cd ai
python -m venv .venv
pip install -e .[dev]
uvicorn main:app --reload --port 8000
```

On Windows PowerShell, activate the virtual environment with `.venv\\Scripts\\Activate.ps1`.

If `YANTRA_AI_SERVICE_URL` is set in the root `.env.local`, the website chat uses the deployed Python service. If it is missing, `/api/chat` falls back to Gemini directly.

### Validate

```bash
npm run lint
npm run build
```

## Start Here

If you are new to the repo, read these in order:

1. `docs/README.md`
2. `docs/handoff/CURRENT_STATE.md`
3. `docs/engineering/SETUP_AND_DEPLOYMENT.md`
4. `docs/engineering/CODEBASE_MAP.md`
5. the relevant feature doc inside `docs/features/`

## Documentation Rule

When routes, auth behavior, environment setup, persistence, or major UI surfaces change, update the docs in `docs/` in the same pass.
