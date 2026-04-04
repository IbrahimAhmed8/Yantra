# Architecture

## Current Stack

- Framework: Next.js 16 App Router
- UI: React 19
- Styling: Tailwind CSS v4 through `src/styles/globals.css`
- Motion and scroll behavior: `motion` and `lenis`
- Icons: `lucide-react`
- Auth and persistence: Supabase SSR + `@supabase/supabase-js`
- Main AI path: Python Yantra AI microservice selected through `src/lib/yantra-ai-service.ts`
- Docs support AI path: Google Gemini through `@google/genai`
- Room voice: Sarvam STT/TTS through Next.js server routes
- Deployment target: Vercel

## Runtime Surfaces

### Marketing Site

- route: `/`
- entry: `app/page.tsx`
- main implementation: `src/features/marketing/MarketingLandingPage.tsx`
- responsibilities:
  - public product narrative
  - access-request CTA surface
  - signup, login, and docs entry points
  - Yantra chat entry points

### Authentication And Onboarding

- routes: `/login`, `/signup`, `/onboarding`, `/auth/confirm`, `/auth/reset-password`, `/reset-password`, `/auth/signout`
- main implementations:
  - `src/features/auth/AuthExperience.tsx`
  - `src/features/auth/ResetPasswordExperience.tsx`
  - `src/features/onboarding/RoleOnboardingExperience.tsx`
- responsibilities:
  - email/password sign-in
  - email/password sign-up
  - Google sign-in through Supabase OAuth
  - email verification redirect handling
  - password recovery and password update
  - onboarding for new accounts
  - sign-out
  - redirecting authenticated users away from auth pages

### Docs And Support

- routes: `/docs`, `/docs/[slug]`
- main implementation: `src/features/docs/`
- responsibilities:
  - standalone public docs/help center
  - article-based support content
  - local docs search
  - separate Support Desk customer-care assistant

### Student Dashboard

- route: `/dashboard`
- entry: `app/dashboard/page.tsx`
- main implementation: `src/features/dashboard/StudentDashboard.tsx`
- responsibilities:
  - protected learner dashboard shell
  - display of learner identity from authenticated profile data
  - loading seeded persisted starter dashboard data
  - linking into Yantra chat and room entry points

### Student Profile

- route: `/dashboard/student-profile`
- entry: `app/dashboard/student-profile/page.tsx`
- main implementation: `src/features/dashboard/StudentProfilePage.tsx`
- responsibilities:
  - protected profile editing experience
  - loading current learner profile from Supabase
  - persisting edits through `/api/profile`
  - linking into the docs/help system

### Python Room

- route: `/dashboard/rooms/python`
- entry: `app/dashboard/rooms/python/page.tsx`
- main implementation: `src/features/rooms/PythonRoomShell.tsx`
- responsibilities:
  - protected in-browser Python execution through Pyodide
  - runtime-error line highlighting
  - room-only voice interaction through Sarvam STT/TTS
  - room feedback through `/api/rooms/python/feedback`

### APIs

- `POST /api/chat`
  - validates and sanitizes recent Yantra chat messages
  - builds learner context from the authenticated profile when available
  - targets the Python AI service first
  - falls back to Gemini only when no service URL resolves
  - persists rolling chat history for authenticated users
- `GET /api/chat/health`
  - checks the currently targeted Python AI service health
- `POST /api/rooms/python/feedback`
  - validates Python Room runtime-error payloads
  - targets the Python AI service first
  - can fall back to Gemini for a short hint-oriented reply
  - does not persist chat history
- `GET /api/chat/history`
  - returns the authenticated learner's latest persisted Yantra conversation
- `GET /api/profile`
  - returns the authenticated learner profile and seeded defaults
- `PUT /api/profile`
  - validates profile input and upserts the authenticated learner profile
- `POST /api/access-requests`
  - validates name, email, and message and persists the request
- `POST /api/docs-support`
  - validates Support Desk messages
  - builds docs-grounded context
  - calls Gemini with the separate Support Desk prompt
- `POST /api/sarvam/stt`
  - proxies room audio to Sarvam speech-to-text
- `POST /api/sarvam/tts`
  - proxies room text to Sarvam text-to-speech

## AI Routing Boundary

`src/lib/yantra-ai-service.ts` is the main AI target selector.

Current behavior:

- `YANTRA_AI_TARGET` chooses `local` or `render`
- the default target is `local`
- local mode uses `YANTRA_AI_LOCAL_URL` or `http://127.0.0.1:8000`
- render mode uses `YANTRA_AI_RENDER_URL` or legacy `YANTRA_AI_SERVICE_URL`
- `YANTRA_AI_SERVICE_TIMEOUT_MS` controls request timeout

This means:

- the main Yantra assistant is not Gemini-first anymore
- the Python Room feedback route is also Python-service-first
- Support Desk remains Gemini-only

## Auth And Session Boundary

Supabase SSR is wired through three layers:

1. `src/lib/supabase/client.ts`
   Browser client for interactive auth actions inside client components.
2. `src/lib/supabase/server.ts`
   Server client for route handlers and server components.
3. `proxy.ts` plus `src/lib/supabase/proxy.ts`
   Request-level cookie refresh for Supabase sessions.

Protected routes do not rely on client-only checks.

Current route behavior:

- `/dashboard`
- `/dashboard/student-profile`
- `/dashboard/rooms/python`

all call `requireAuthenticatedProfile()` server-side and redirect unauthenticated requests to `/login`.

Important nuance:

- the guard helper supports onboarding enforcement
- the current dashboard, profile, and Python Room routes do not pass `requireOnboarding: true`
- onboarding is part of the new-account flow, but it is not currently enforced as a hard gate on those routes once auth is satisfied

## Persistence Model

### Current persisted data

- Supabase auth users
- `public.profiles`
- `public.access_requests`
- `public.chat_histories`
- `public.student_dashboard_paths`
- `public.student_skill_progress`
- `public.student_curriculum_nodes`
- `public.student_weekly_activity`

### `public.profiles` fields

- `id`
- `email`
- `full_name`
- `class_designation`
- `skill_level`
- `progress`
- `academic_year`
- `user_role`
- `age_range`
- `primary_learning_goals`
- `learning_pace`
- `onboarding_completed`
- `onboarding_completed_at`
- `created_at`
- `updated_at`

The profile model is defined in the app as `StudentProfile` in `src/features/dashboard/student-profile-model.ts`. Writes are sanitized before persistence.

### Dashboard starter-data tables

The dashboard loader reads starter product data from:

- `public.student_dashboard_paths`
- `public.student_skill_progress`
- `public.student_curriculum_nodes`
- `public.student_practice_rooms`
- `public.student_weekly_activity`

Dashboard room persistence note:

- `src/lib/supabase/dashboard.ts` expects `student_practice_rooms`
- `supabase/schema.sql` now creates that table with the matching RLS policies
- older Supabase projects still need the updated schema applied before room rows persist

## Request Flows

### Login flow

1. User opens `/login`.
2. `app/login/page.tsx` checks whether Supabase env vars exist.
3. If a valid session already exists, the route redirects to `/dashboard`.
4. `AuthExperience` submits `signInWithPassword()` from the browser client.
5. On success, the client transitions to `/dashboard`.

### Google sign-in flow

1. User clicks the Google button on `/login` or `/signup`.
2. `AuthExperience` calls `signInWithOAuth({ provider: 'google' })`.
3. Supabase returns through `/auth/confirm` with an OAuth `code`.
4. `/auth/confirm` exchanges the code for the session cookie.
5. The route redirects to `/dashboard` or `/onboarding`, depending on the requested `next` path.

### Signup flow

1. User opens `/signup`.
2. `AuthExperience` calls `signUp()` with `emailRedirectTo=/auth/confirm?next=/onboarding`.
3. Supabase sends the confirmation email when email confirmation is enabled.
4. `/auth/confirm` verifies the OTP and redirects into `/onboarding`.
5. If Supabase returns a session immediately, the client routes straight to `/onboarding`.

### Onboarding flow

1. `/onboarding` requires an authenticated user.
2. If the onboarding schema is unavailable, the route redirects to `/dashboard`.
3. If onboarding is already complete, the route redirects to `/dashboard`.
4. `RoleOnboardingExperience` collects role, age range, learning goals, and pace.
5. The resulting state is stored in `public.profiles`.

### Dashboard and profile load flow

1. A protected route checks `hasSupabaseEnv()`.
2. The route calls `requireAuthenticatedProfile()`.
3. If no session exists, the route redirects to `/login`.
4. If the learner has no `profiles` row yet, the server inserts a seeded default row.
5. `/dashboard` then calls `getAuthenticatedDashboardData()`.
6. The dashboard loader queries the dashboard tables, seeds them if needed, and falls back gracefully when the schema or RLS is missing.

### Yantra chat flow

1. Marketing and dashboard pages wrap their UI in `ChatProvider`.
2. On first open, the provider tries to load `/api/chat/history`.
3. Authenticated learners receive their last persisted conversation. Public users keep the in-memory welcome state.
4. The provider sends the most recent sanitized conversation to `/api/chat`.
5. The route targets the configured Python AI service URL first.
6. If no service URL resolves, the route falls back to Gemini.
7. When Supabase is configured and a user session exists, the route upserts rolling history into `public.chat_histories`.

### Docs Support Desk flow

1. Docs pages mount `DocsSupportWidget`.
2. The widget posts recent support messages plus the current article slug to `/api/docs-support`.
3. `docs-support.ts` ranks relevant docs sections from the local docs content source.
4. The route sends the selected excerpts to Gemini with the separate Support Desk system prompt.
5. The client renders the answer plus article source links.

### Python Room feedback and voice flow

1. The learner opens `/dashboard/rooms/python`.
2. Code runs locally through Pyodide in the browser.
3. Runtime errors can trigger `POST /api/rooms/python/feedback`.
4. That route targets the Python AI service first and can fall back to Gemini.
5. Voice input goes through `POST /api/sarvam/stt`.
6. The room then uses the existing web routes for text reply generation and `POST /api/sarvam/tts` for audio playback.

## State Boundaries

### Persistent

- auth session
- student profile row
- access-request rows
- authenticated Yantra chat history
- starter dashboard rows

### Client-only

- dashboard section state
- mobile nav and panel open states
- access-request form status
- docs search query
- docs support open and expand state
- docs support conversation state
- Python Room editor, run, and voice UI state

### Seeded or presentation-led

- most room cards outside the Python Room
- many dashboard recommendation phrases
- marketing copy blocks
- docs article content and support knowledge base

## Current Constraints

- dashboard logic is seeded and starter-oriented, not truly adaptive
- only the Python Room is a real dedicated room route today
- Python Room feedback is runtime-error-only for now
- successful runs do not trigger AI analysis yet
- Yantra chat continuity is limited to one rolling authenticated conversation
- Support Desk is grounded to local docs content only
- automated coverage exists, but it is still limited to a few route/runtime areas
- there is no analytics layer or monitoring stack yet

## Recommended Evolution

- keep route wiring and API handlers in `app/`
- keep surface-specific UI in `src/features/`
- keep Supabase integration inside `src/lib/supabase/`
- keep Yantra and Support Desk as separate assistants with separate prompts and jobs
- harden the Python-service-first AI path before adding more surfaces
- add richer dashboard intelligence, chat and support observability, and access-request review tooling before expanding product surface area further
