# Chat System

## Purpose

Yantra chat is the main live AI feature in the repo.

It currently serves as:

- an AI teacher for learners
- a product explainer on the marketing site
- a contextual helper inside the protected dashboard
- a shared reply path that the Python Room voice assistant can feed after transcription

This file describes the main `Yantra` assistant only. The docs/help center uses a separate support assistant called `Support Desk`, documented in `features/DOCS_SYSTEM.md`.

## Main Files

- client UI and provider: `src/features/chat/ChatWidget.tsx`
- rich message rendering: `src/features/chat/ChatMessageContent.tsx`
- shared model, prompt, constants, and quick prompts: `src/features/chat/yantra-chat.ts`
- chat route: `app/api/chat/route.ts`
- chat health route: `app/api/chat/health/route.ts`
- chat-history route: `app/api/chat/history/route.ts`
- AI target selector: `src/lib/yantra-ai-service.ts`
- learner-context builder: `src/lib/yantra-student-context.ts`
- Supabase history helpers: `src/lib/supabase/chat-history.ts`

## Where It Is Used

- marketing landing page
- protected dashboard
- Python Room voice flow, after speech is transcribed into text

The auth pages and docs pages do not embed the Yantra chat widget.

## How It Works

1. A page wraps its surface in `ChatProvider`.
2. The provider opens the launcher and modal UI for Yantra.
3. On first open, the provider attempts to load `GET /api/chat/history`.
4. Authenticated users receive their latest rolling conversation when a history row exists.
5. Logged-out users keep the in-memory welcome state only.
6. Sending a message posts recent conversation to `POST /api/chat`.
7. The route sanitizes the message list, trims model input to the last 12 messages, and builds learner context from the authenticated profile when available.
8. The route targets the Python Yantra AI service first whenever `src/lib/yantra-ai-service.ts` resolves a service URL.
9. If no service URL resolves, the route falls back to Gemini directly.
10. When Supabase is configured and a user session exists, the route upserts the updated rolling history into `public.chat_histories`.

## Current Runtime Details

- primary backend: Python Yantra AI microservice over HTTP
- Gemini fallback model: `gemini-2.5-flash`
- fallback API package: `@google/genai`
- server runtime: Node.js
- model input window: 12 sanitized messages
- persisted history window: 40 sanitized messages
- welcome and quick prompts are defined in `yantra-chat.ts`
- markdown and LaTeX rendering are supported in the message UI

## AI Target Resolution

Current env behavior:

- `YANTRA_AI_TARGET` chooses `local` or `render`
- the default target is `local`
- local mode resolves `YANTRA_AI_LOCAL_URL` or `http://127.0.0.1:8000`
- render mode resolves `YANTRA_AI_RENDER_URL` or legacy `YANTRA_AI_SERVICE_URL`
- `YANTRA_AI_SERVICE_TIMEOUT_MS` controls route timeout

This means:

- Gemini fallback is not the normal local-path behavior
- with the default local target, the main chat expects the local Python service unless you change the target
- `GET /api/chat/health` reports on the currently targeted backend

## Current Capabilities

- reusable modal chat UI
- floating launcher
- CTA-driven prompts from the landing page
- dashboard quick prompts
- loading and error states
- authenticated rolling history restore
- concise teacher-oriented system prompt tailored to Yantra's product context
- Python-service-first request routing

## Current Limitations

- only one rolling authenticated thread, not a multi-thread inbox
- no tool calling
- no streaming responses
- no moderation or analytics layer
- no richer learner-memory layer beyond the saved conversation itself
- no live connection to a real progress engine or adaptive roadmap service

## Environment Dependency

For the main chat route:

- preferred: `YANTRA_AI_TARGET` plus the matching service URL envs
- fallback: `GEMINI_API_KEY` or `GOOGLE_API_KEY`

For docs support:

- `GEMINI_API_KEY` or `GOOGLE_API_KEY`

For Python Room voice:

- `SARVAM_API_KEY`

## Important Separation

Do not confuse the two assistants in this repo:

- `Yantra`
  The teacher-style assistant used on the marketing site, dashboard, and room voice flow.
- `Support Desk`
  The docs-grounded customer-care assistant used only inside `/docs`.

They have different prompts, different UI surfaces, and different intended jobs.

## Existing Automated Coverage

Current relevant coverage includes:

- `app/api/rooms/python/feedback/route.test.ts`
- `src/features/rooms/__tests__/pyodide-runtime.test.ts`
- the Python AI service test suite under `ai/tests/`

There is still no broad frontend or chat-route coverage around the main widget flow.

## Recommended Next Work

- add observability and error tracking for chat failures
- decide whether to support streaming responses
- pass richer structured learner context into Yantra prompts once the dashboard data model is real
- decide whether Yantra should evolve from one rolling thread into named or task-based conversations
- add broader tests around `/api/chat`, `/api/chat/history`, and the AI target-selection path
