# Architecture

## Current Stack

- Framework: Next.js 16 App Router
- UI: React 19
- Styling: Tailwind CSS v4 via `src/styles/globals.css`
- Motion: `motion`
- Icons: `lucide-react`
- AI Provider: Google Gemini through `@google/genai`
- Deployment Target: Vercel

## Live Runtime Surfaces

### Marketing Site

- Route: `/`
- Entry: `app/page.tsx`
- Main implementation: `src/features/marketing/MarketingLandingPage.tsx`
- Purpose: public-facing landing page for positioning, access, and waitlist/demo CTAs

### Student Dashboard

- Route: `/dashboard`
- Entry: `app/dashboard/page.tsx`
- Main implementation: `src/features/dashboard/StudentDashboard.tsx`
- Purpose: immersive student-facing dashboard concept with roadmap, rooms, and contextual AI entry points

### Chat Assistant

- Client UI: `src/features/chat/ChatWidget.tsx`
- Server route: `app/api/chat/route.ts`
- Shared prompt/config: `src/features/chat/yantra-chat.ts`
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

- The public site currently lives in one large feature file: `src/features/marketing/MarketingLandingPage.tsx`.
- The dashboard is isolated in `src/features/dashboard/`.
- Chat UI and chat prompt config are isolated in `src/features/chat/`.
- Shared visual language is centralized in `src/styles/globals.css` and route layout wiring lives in `app/layout.tsx`.

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
- Reference assets now live under `docs/reference/`.

## Recommended Evolution

Near-term architectural direction:

- keep `app/` for route wiring and API routes
- keep feature-specific code in `src/features/`
- keep styles in `src/styles/`
- keep long-term project context in `docs/`
- split `src/features/marketing/MarketingLandingPage.tsx` into smaller section files when approved
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
