# Architecture

## Current Stack

- Framework: Next.js 16 App Router
- UI: React 19
- Styling: Tailwind CSS v4 via `src/index.css`
- Motion: `motion`
- Icons: `lucide-react`
- AI Provider: Google Gemini through `@google/genai`
- Deployment Target: Vercel

## Live Runtime Surfaces

### Marketing Site

- Route: `/`
- Entry: `app/page.tsx`
- Main implementation: `src/App.tsx`
- Purpose: public-facing landing page for positioning, access, and waitlist/demo CTAs

### Student Dashboard

- Route: `/dashboard`
- Entry: `app/dashboard/page.tsx`
- Main implementation: `src/components/dashboard/StudentDashboard.tsx`
- Purpose: immersive student-facing dashboard concept with roadmap, rooms, and contextual AI entry points

### Chat Assistant

- Client UI: `src/components/chat/ChatWidget.tsx`
- Server route: `app/api/chat/route.ts`
- Shared prompt/config: `lib/yantra-chat.ts`
- Purpose: modal AI teacher experience available from the landing page and dashboard

## Request Flow

1. User opens the site or dashboard.
2. A page-level component wraps content in `ChatProvider`.
3. User submits a message through the chat widget.
4. Client sends `POST /api/chat` with recent message history.
5. Server sanitizes and truncates messages.
6. Server calls Gemini using the shared Yantra system prompt.
7. Response is returned to the client and appended to the local conversation state.

## Current Architecture Boundaries

### Frontend

- The public site is still implemented in a single large file: `src/App.tsx`.
- The dashboard already lives in its own component folder and is easier to extend.
- Shared visual language is centralized in `src/index.css` and route layout wiring lives in `app/layout.tsx`.

### Backend

- Only one backend capability exists today: `POST /api/chat`.
- There is no database, auth, session persistence, analytics pipeline, roadmap engine, or file storage yet.

### State

- Chat history is client-side only.
- There is no persistent student profile.
- Dashboard data is currently static and hardcoded for presentation.

## Important Constraints

- The repo has been migrated from Vite to Next.js.
- Do not reintroduce Vite config or Vite-only packages unless the architecture is intentionally changed again.
- Some root-level assets and legacy files still exist or are pending cleanup. Those are documented in `reference/SOURCE_ASSETS.md` and `engineering/CODEBASE_MAP.md`.

## Recommended Evolution

Near-term architectural direction:

- keep `app/` for route wiring and API routes
- keep `lib/` for shared non-UI logic
- split `src/App.tsx` into feature folders when approved
- move toward domain folders such as `src/features/marketing`, `src/features/chat`, `src/features/dashboard`
- add persistence before making the dashboard truly dynamic

## Not Built Yet

- Authentication
- Student profile storage
- Skill diagnosis engine
- Dynamic roadmap generation
- Practice room execution engine
- Teacher dashboard
- Class analytics
- Certificates and portfolio export
- Multi-LLM routing
- Smartboard mode
