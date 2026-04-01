# Current State

## Repo Summary

Yantra is a Next.js 16 App Router product with live authentication, a protected learner area, a public docs/help center, Supabase-backed persistence, and two separate assistants:

- `Yantra` for learning and product guidance inside the main app
- `Support Desk` for docs-grounded customer care inside `/docs`

Current assistant/runtime split:

- the main Yantra chat route targets the Python AI microservice first through `src/lib/yantra-ai-service.ts`
- the Python Room feedback route targets the same AI service first
- `Support Desk` remains Gemini-only through `POST /api/docs-support`
- room voice uses Sarvam STT/TTS through Next.js server routes, not a separate Python voice worker

The codebase is best described as:

- a polished public product and conversion layer
- a real auth, onboarding, and profile foundation
- a protected learner dashboard with seeded persisted starter data
- a live docs/help center
- a live Python Room with in-browser execution and voice-side assistance

## Live Runtime Surfaces

### Public app routes

- `/` marketing landing page
- `/login` sign-in experience
- `/signup` sign-up experience
- `/docs`
- `/docs/[slug]`
- `/privacy`
- `/terms`
- `/status`
- `/auth/reset-password`
- `/reset-password`

### Auth-required routes

- `/onboarding`
- `/dashboard`
- `/dashboard/student-profile`
- `/dashboard/rooms/python`

### Auth utility routes

- `/auth/confirm` handles Supabase email confirmation and Google OAuth code exchange
- `/auth/signout` clears the session and redirects to `/login`

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

- local Next.js development, type checking, and production builds
- Vercel-compatible deployment
- Supabase SSR auth with cookie refresh through `proxy.ts`
- email/password auth
- Google sign-in through Supabase OAuth
- password reset email flow and reset page
- onboarding flow for new accounts
- auth-required redirects for `/dashboard`, `/dashboard/student-profile`, and `/dashboard/rooms/python`
- automatic first-profile creation in Supabase for signed-in users
- profile editing and saving from the student profile page
- dashboard data loading from Supabase starter tables, with fallback behavior when schema or RLS is missing
- main Yantra chat routed through the configured Python AI service target, with Gemini only as a no-service-url fallback
- authenticated Yantra chat history restore across sessions
- standalone docs system with searchable guides and article pages
- a separate docs-grounded `Support Desk` assistant inside `/docs`
- Python Room browser execution through Pyodide with runtime-error line highlighting
- a dedicated Python Room feedback route that targets the Python AI service first and can fall back to Gemini
- automatic room-assistant text/speech feedback for Python runtime errors, with raw-text fallback if audio fails
- automated coverage for room-feedback route validation, Pyodide error parsing, and the Python service

## What Is Real But Limited

### Access requests

The landing-page access form is wired end to end from the public site to `POST /api/access-requests`, and the route persists records in Supabase. There is still no internal admissions or partner-review UI in this repo.

### Dashboard data

The dashboard is no longer purely hardcoded. `src/lib/supabase/dashboard.ts` loads starter dashboard data from:

- `student_dashboard_paths`
- `student_skill_progress`
- `student_curriculum_nodes`
- `student_practice_rooms`
- `student_weekly_activity`

Important mismatch:

- the loader expects `student_practice_rooms`
- `supabase/schema.sql` does not currently create that table
- on a fresh schema, dashboard room data falls back to starter content instead of persisted room rows

The broader limitation is that these records still represent starter product content, not a genuinely adaptive learner engine.

### Student profile persistence

The student profile is real. It is stored in Supabase, seeded on first access, sanitized on write, and exposed through `/api/profile`.

The profile includes onboarding-oriented fields as well:

- `userRole`
- `ageRange`
- `primaryLearningGoals`
- `learningPace`
- `onboardingCompleted`
- `onboardingCompletedAt`

### Yantra chat continuity

Authenticated learners resume a single rolling Yantra conversation from Supabase-backed history. Public marketing chat remains ephemeral. This is one rolling thread, not a multi-thread inbox.

### Docs and Support Desk

`/docs` is a real product surface with:

- a docs home page
- article pages under `/docs/[slug]`
- a separate `Support Desk` support assistant

`Support Desk` is not Yantra. It is grounded locally against `src/features/docs/docs-content.ts` through `app/api/docs-support/route.ts`. It does not read live user data and does not persist support conversations.

### Python Room

`/dashboard/rooms/python` is the first real room surface. It currently includes:

- a protected route
- Pyodide-powered in-browser Python execution
- runtime-error line highlighting
- a room-side Yantra voice assistant
- Sarvam STT/TTS routed through Next.js

Current limits:

- only runtime errors trigger AI feedback
- successful-but-wrong output is not evaluated yet
- the first runtime warmup can take a few seconds

## Known Placeholder Areas

- most room cards outside the Python Room are still preview surfaces
- dashboard recommendations are seeded, not truly adaptive
- teacher, institution, analytics, certification, and hiring flows are not built
- access requests have no internal review workflow yet
- docs support has no ticket handoff, analytics, or escalation layer

## Important Runtime Structure

- `app/` contains route entrypoints and API handlers
- `src/features/marketing/` contains the public landing page
- `src/features/auth/` contains login, signup, and reset experiences
- `src/features/onboarding/` contains the onboarding experience
- `src/features/dashboard/` contains the dashboard and profile experiences
- `src/features/docs/` contains the docs home, article pages, and support widget
- `src/features/chat/` contains the main Yantra chat widget and prompt configuration
- `src/features/rooms/` contains the active Python Room shell, Pyodide runtime, room voice assistant, and room tests
- `src/lib/supabase/` contains browser, server, env, proxy, profile, and dashboard helpers
- `src/lib/yantra-ai-service.ts` resolves local vs render AI service targets
- `src/lib/yantra-student-context.ts` builds learner context for the AI service
- `supabase/schema.sql` defines the current baseline database tables and RLS policies
- `proxy.ts` refreshes Supabase auth cookies on matching requests

## Important Reference Assets

- `docs/reference/dashboard-sample/` contains dashboard design references
- `docs/reference/Login-signup-sample/` contains login/signup design references
- `docs/reference/Docs page design/` contains docs design references
- `docs/reference/build-plan/` contains broader product-plan PDFs and extracted text

These are still useful inputs and should not be removed without approval, but they are not the source of truth for current runtime behavior.

## Immediate Recommended Builder Flow

1. Confirm env vars and Supabase setup from `engineering/SETUP_AND_DEPLOYMENT.md`.
2. Check whether the task touches marketing, auth, onboarding, docs, dashboard, Python Room, chat, or platform foundations.
3. Keep runtime work separate from cleanup or archival changes.
4. Update the relevant feature doc and this handoff note when behavior changes.

## Best Next Work

- replace seeded dashboard behavior with real learner-adaptive state
- add broader tests around auth redirects, profile APIs, dashboard seeding, and chat/support routes
- align `supabase/schema.sql` with the dashboard loader’s `student_practice_rooms` expectation
- add internal review tooling for access requests
- add observability for Yantra chat and Support Desk
