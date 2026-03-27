# Current State

## Repo Summary

Yantra is a Next.js 16 App Router project with live authentication, protected student routes, a persisted student profile, and a Gemini-backed chat assistant.

The current codebase is best described as:

- a polished marketing experience
- a real auth and profile foundation
- a protected dashboard shell
- a live AI assistant
- a live access pipeline

It is no longer accurate to describe the repo as only a static frontend shell.

## Live Runtime Surfaces

### Public

- `/` marketing landing page
- `/login` sign-in experience
- `/signup` sign-up experience
- `/auth/reset-password` password recovery completion

### Protected

- `/dashboard` student dashboard
- `/dashboard/student-profile` editable student profile

### Auth utility routes

- `/auth/confirm` handles Supabase email confirmation links
- `/auth/signout` clears the session and redirects to `/login`

### API routes

- `POST /api/chat`
- `GET /api/chat/history`
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/access-requests`

## What Works Today

- local Next.js development and production builds
- Vercel-compatible deployment
- Supabase SSR auth with cookie refresh through `proxy.ts`
- redirect protection for `/dashboard` and `/dashboard/student-profile`
- automatic first-profile creation in Supabase for signed-in users
- profile editing and saving from the student profile page
- Gemini chat requests using `gemini-2.5-flash`
- access-request submission with request validation, persistence, and success/error states
- password reset email flow and reset page
- Google sign-in through Supabase OAuth
- authenticated chat history restore across sessions

## What Is Real But Limited

### Access requests

The access-request form is wired end to end from the landing page to `POST /api/access-requests`, and the route now persists records in Supabase. There is still no internal admissions or partner-review UI in this repo.

### Dashboard personalization

The dashboard now receives the authenticated learner name and email from the profile/auth layer, but most dashboard cards, room states, curriculum items, and momentum visuals are still hardcoded presentation data.

### Student profile persistence

The student profile is real. It is stored in Supabase, seeded on first access, sanitized on write, and exposed through `/api/profile`. Only the profile data model is persisted today, not the rest of the dashboard state.

### Chat continuity

Authenticated learners now resume a single rolling Yantra conversation from Supabase-backed history. Public marketing chat still remains ephemeral.

## Known Placeholder Areas

- dashboard skills, rooms, and progression are static
- teacher, institution, analytics, and certification flows are not built

## Important Runtime Structure

- `app/` contains route entrypoints and API handlers
- `src/features/marketing/` contains the public landing page
- `src/features/auth/` contains the login/signup UI
- `src/features/dashboard/` contains the dashboard and profile experiences
- `src/features/chat/` contains the chat widget and prompt configuration
- `src/lib/supabase/` contains browser, server, env, proxy, and profile helpers
- `supabase/schema.sql` defines the required database table and RLS policies
- `proxy.ts` refreshes Supabase auth cookies on matching requests

## Important Reference Assets

- `docs/reference/dashboard-sample/` contains dashboard design references
- `docs/reference/Login-signup-sample/` contains login/signup design references
- `docs/reference/build-plan/` contains the broader product-plan PDF and extracted text

These are still useful inputs and should not be removed without approval.

## Immediate Recommended Builder Flow

1. Confirm local env vars and Supabase setup from `engineering/SETUP_AND_DEPLOYMENT.md`.
2. Decide whether the task belongs to marketing, auth, dashboard, chat, or platform foundations.
3. Keep runtime work separate from cleanup or archival changes.
4. Update the relevant feature doc and this handoff note when behavior changes.

## Best Next Work

- replace dashboard hardcoded content with a typed data contract
- add tests around profile APIs, auth redirects, and chat/access-request flows
- add internal review tooling for access requests
- evolve chat from a single rolling thread into richer learner memory and observability
