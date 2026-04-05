# Codebase Map

## Active Runtime Structure

```text
Yantra/
|-- ai/
|   |-- knowledge/
|   |-- tests/
|   |-- yantra_ai/
|   |-- .env.example
|   |-- main.py
|   |-- pyproject.toml
|   `-- README.md
|-- app/
|   |-- api/
|   |   |-- access-requests/route.ts
|   |   |-- chat/
|   |   |   |-- health/route.ts
|   |   |   |-- history/route.ts
|   |   |   `-- route.ts
|   |   |-- docs-support/route.ts
|   |   |-- profile/route.ts
|   |   |-- rooms/
|   |   |   `-- python/feedback/route.ts
|   |   `-- sarvam/
|   |       |-- stt/route.ts
|   |       `-- tts/route.ts
|   |-- auth/
|   |   |-- confirm/route.ts
|   |   |-- reset-password/page.tsx
|   |   `-- signout/route.ts
|   |-- dashboard/
|   |   |-- rooms/
|   |   |   `-- python/page.tsx
|   |   |-- student-profile/page.tsx
|   |   `-- page.tsx
|   |-- docs/
|   |   |-- [slug]/page.tsx
|   |   `-- page.tsx
|   |-- login/page.tsx
|   |-- onboarding/page.tsx
|   |-- privacy/page.tsx
|   |-- reset-password/page.tsx
|   |-- signup/page.tsx
|   |-- status/page.tsx
|   |-- terms/page.tsx
|   |-- icon.png
|   |-- layout.tsx
|   `-- page.tsx
|-- docs/
|-- src/
|   |-- features/
|   |   |-- access/AccessRequestForm.tsx
|   |   |-- auth/
|   |   |   |-- AuthExperience.tsx
|   |   |   `-- ResetPasswordExperience.tsx
|   |   |-- chat/
|   |   |   |-- ChatMessageContent.tsx
|   |   |   |-- ChatWidget.tsx
|   |   |   `-- yantra-chat.ts
|   |   |-- dashboard/
|   |   |   |-- StudentDashboard.tsx
|   |   |   |-- StudentProfileCard.tsx
|   |   |   |-- StudentProfilePage.tsx
|   |   |   |-- student-dashboard-model.ts
|   |   |   |-- student-profile-content.ts
|   |   |   |-- student-profile-model.ts
|   |   |   `-- YantraAmbientBackground.tsx
|   |   |-- docs/
|   |   |   |-- docs-content.ts
|   |   |   |-- docs-support.ts
|   |   |   |-- DocsArticlePage.tsx
|   |   |   |-- DocsHomePage.tsx
|   |   |   |-- DocsShell.tsx
|   |   |   `-- DocsSupportWidget.tsx
|   |   |-- legal/
|   |   |-- marketing/
|   |   |   |-- marketing-content.ts
|   |   |   `-- MarketingLandingPage.tsx
|   |   |-- motion/ExperienceProvider.tsx
|   |   |-- onboarding/RoleOnboardingExperience.tsx
|   |   `-- rooms/
|   |       |-- __tests__/
|   |       |-- PythonRoomShell.tsx
|   |       |-- python-feedback.ts
|   |       |-- pyodide-runtime.ts
|   |       `-- voice/
|   |-- lib/
|   |   |-- supabase/
|   |   |   |-- access-requests.ts
|   |   |   |-- chat-history.ts
|   |   |   |-- client.ts
|   |   |   |-- dashboard.ts
|   |   |   |-- env.ts
|   |   |   |-- profiles.ts
|   |   |   |-- proxy.ts
|   |   |   |-- route-guards.ts
|   |   |   `-- server.ts
|   |   |-- yantra-ai-service.ts
|   |   `-- yantra-student-context.ts
|   `-- styles/globals.css
|-- supabase/schema.sql
|-- proxy.ts
|-- package.json
|-- next.config.ts
`-- README.md
```

## Folder Roles

### `app/`

Route entrypoints, redirect logic, auth utility handlers, and API route handlers.

### `ai/`

Python FastAPI service used by the web app when the AI target resolves to the local or render backend. It currently owns:

- the `/health` endpoint
- the `/chat` endpoint
- the `/rooms/python/feedback` endpoint
- the local knowledge base under `ai/knowledge/`
- retrieval and provider logic
- pytest coverage for chat, retrieval, providers, room feedback, and terminal chat

### `src/features/access/`

Client-side access request form used by the marketing surface.

### `src/features/auth/`

The login and signup experience, validation, browser-side Supabase auth calls, Google and GitHub OAuth handoff, and status messaging.

### `src/features/chat/`

The main Yantra chat widget, prompt and config helpers, and rich message rendering.

### `src/features/dashboard/`

The protected dashboard and student-profile UI, plus the local dashboard and profile model helpers.

### `src/features/docs/`

The standalone docs/help center, article content model, and the separate Support Desk widget and retrieval logic.

### `src/features/legal/`

Legal and info-page UI used by `/privacy`, `/terms`, and `/status`.

### `src/features/marketing/`

The public landing page implementation plus its structured content config.

### `src/features/motion/`

Shared experience helpers such as route-transition loading and overlay locking.

### `src/features/onboarding/`

The role- and goal-selection onboarding experience used for newly created accounts.

### `src/features/rooms/`

Active room-related runtime code for the live Python Room, including:

- the protected room shell
- the Pyodide execution runtime
- runtime-error parsing helpers and tests
- room-feedback request typing
- room-side voice UI

### `src/lib/supabase/`

Shared Supabase integration code:

- `env.ts` checks and returns required env vars
- `client.ts` builds the browser client
- `server.ts` builds the server client
- `route-guards.ts` enforces auth and optionally onboarding constraints
- `profiles.ts` loads, seeds, and updates learner profile data
- `dashboard.ts` loads and seeds persisted starter dashboard data
- `access-requests.ts` validates and inserts public access requests
- `chat-history.ts` loads and upserts authenticated learner chat history
- `proxy.ts` refreshes auth cookies for requests

### `src/lib/yantra-ai-service.ts`

Resolves whether the web app should call the local or render Python AI backend.

### `src/lib/yantra-student-context.ts`

Builds learner context for the Python AI service from the authenticated request and profile data.

### `supabase/`

Project SQL required for the current auth, profile, dashboard, access-request, and chat-history persistence layers.

## Route Ownership

### Public routes

- `app/page.tsx` -> `src/features/marketing/MarketingLandingPage.tsx`
- `app/login/page.tsx` -> `src/features/auth/AuthExperience.tsx`
- `app/signup/page.tsx` -> `src/features/auth/AuthExperience.tsx`
- `app/docs/page.tsx` -> `src/features/docs/DocsHomePage.tsx`
- `app/docs/[slug]/page.tsx` -> `src/features/docs/DocsArticlePage.tsx`
- `app/privacy/page.tsx` -> `src/features/legal/`
- `app/terms/page.tsx` -> `src/features/legal/`
- `app/status/page.tsx` -> `src/features/legal/`
- `app/auth/reset-password/page.tsx` -> `src/features/auth/ResetPasswordExperience.tsx`
- `app/reset-password/page.tsx` -> `src/features/auth/ResetPasswordExperience.tsx`

### Auth-required routes

- `app/onboarding/page.tsx` -> `src/features/onboarding/RoleOnboardingExperience.tsx`
- `app/dashboard/page.tsx` -> `src/features/dashboard/StudentDashboard.tsx`
- `app/dashboard/student-profile/page.tsx` -> `src/features/dashboard/StudentProfilePage.tsx`
- `app/dashboard/rooms/python/page.tsx` -> `src/features/rooms/PythonRoomShell.tsx`

### API routes

- `app/api/chat/route.ts`
- `app/api/chat/health/route.ts`
- `app/api/chat/history/route.ts`
- `app/api/profile/route.ts`
- `app/api/access-requests/route.ts`
- `app/api/docs-support/route.ts`
- `app/api/rooms/python/feedback/route.ts`
- `app/api/sarvam/stt/route.ts`
- `app/api/sarvam/tts/route.ts`

### Auth utility routes

- `app/auth/confirm/route.ts`
- `app/auth/signout/route.ts`

## Current Organization Notes

- `MarketingLandingPage.tsx` is still one of the largest single UI files in the repo.
- `StudentDashboard.tsx` and `StudentProfilePage.tsx` still contain a significant amount of presentation-heavy layout code.
- `src/features/docs/docs-content.ts` is the content source of truth for the docs system and the Support Desk retrieval layer.
- `src/lib/supabase/dashboard.ts` is the persistence boundary for starter dashboard data and reads and seeds `student_practice_rooms`.
- `proxy.ts` at the repo root is required for Supabase SSR cookie refresh and should be treated as active runtime code, not a leftover file.
- `ai/` is part of the live AI path when the target resolves to it; it is not just a disconnected local experiment.

## Reference And Non-Runtime Items

### `docs/reference/`

Holds design and product inputs:

- `dashboard-sample/`
- `Docs page design/`
- `Login-signup-sample/`
- `build-plan/`
- `rooms/`

### Root-level local artifacts

- `dist/`
- `node_modules_broken/`
- `tmp/`

These are not part of the active application runtime and should not be deleted casually without approval.

## Safe Next Organization Steps

- keep new route handlers inside `app/`
- keep Supabase-specific helpers inside `src/lib/supabase/`
- keep AI target selection in `src/lib/yantra-ai-service.ts`
- keep route-specific UI in the matching `src/features/` folder
- split `MarketingLandingPage.tsx` into section files when that cleanup is explicitly chosen
- extract large dashboard, profile, docs, or room config blocks into typed data modules if those surfaces continue to grow
