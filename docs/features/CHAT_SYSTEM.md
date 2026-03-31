# Chat System

## Purpose

Yantra chat is the main live AI feature in the repo.

It currently serves as:

- an AI teacher for learners
- a product explainer on the marketing site
- a contextual helper inside the protected dashboard

This file describes the main `Yantra` assistant only. The docs/help center uses a separate support assistant called `Support Desk`, which is documented in `features/DOCS_SYSTEM.md`.

## Main Files

- client UI and provider: `src/features/chat/ChatWidget.tsx`
- rich message rendering: `src/features/chat/ChatMessageContent.tsx`
- shared model, prompt, constants, and quick prompts: `src/features/chat/yantra-chat.ts`
- chat route: `app/api/chat/route.ts`
- chat-history route: `app/api/chat/history/route.ts`
- Supabase history helpers: `src/lib/supabase/chat-history.ts`

## Where It Is Used

- marketing landing page
- protected dashboard

The auth pages and docs pages do not embed the Yantra chat widget.

## How It Works

1. A page wraps its surface in `ChatProvider`.
2. The provider opens the launcher and modal UI for Yantra.
3. On first open, the provider attempts to load `GET /api/chat/history`.
4. Authenticated users receive their latest rolling conversation when a history row exists.
5. Logged-out users keep the in-memory welcome state only.
6. Sending a message posts recent conversation to `POST /api/chat`.
7. The route sanitizes the message list, trims model input to the last 12 messages, builds learner context from the authenticated profile when available, and proxies the request to the Python Yantra AI service when `YANTRA_AI_SERVICE_URL` is set.
8. If the AI service URL is not configured, the route falls back to Gemini directly.
9. When Supabase is configured and a user session exists, the route upserts the updated rolling history into `public.chat_histories`.

## Current Runtime Details

- primary backend: Python Yantra AI microservice over HTTP
- fallback model: `gemini-2.5-flash`
- fallback API package: `@google/genai`
- server runtime: Node.js
- model input window: 12 sanitized messages
- persisted history window: 40 sanitized messages
- welcome and quick prompts are defined in `yantra-chat.ts`
- markdown and LaTeX rendering are supported in the message UI

## Current Capabilities

- reusable modal chat UI
- floating launcher
- CTA-driven prompts from the landing page
- dashboard quick prompts
- loading and error states
- authenticated rolling history restore
- concise teacher-oriented system prompt tailored to Yantra's product context

## Current Limitations

- only one rolling authenticated thread, not a multi-thread inbox
- no tool calling
- no streaming responses
- no moderation or analytics layer
- no richer learner-memory layer beyond the saved conversation itself
- no live connection to a real progress engine or adaptive roadmap service

## Environment Dependency

Preferred:

- `YANTRA_AI_SERVICE_URL`

Optional fallback:

- `GEMINI_API_KEY`

The route also accepts `GOOGLE_API_KEY` as a fallback when the microservice URL is not configured.

## Important Separation

Do not confuse the two assistants in this repo:

- `Yantra`
  The teacher-style assistant used on the marketing site and dashboard.
- `Support Desk`
  The docs-grounded customer-care assistant used only inside `/docs`.

They have different prompts, different UI surfaces, and different intended jobs.

## Recommended Next Work

- add observability and error tracking for chat failures
- decide whether to support streaming responses
- pass richer structured learner context into Yantra prompts once the dashboard data model is real
- decide whether Yantra should evolve from one rolling thread into named or task-based conversations
