# Chat System

## Purpose

Yantra chat is the first live backend-powered feature in the repo.

It gives the product:

- an AI teacher voice
- a waitlist and product explanation tool
- a context-aware dashboard assistant entry point

## Main Files

- client UI: `src/features/chat/ChatWidget.tsx`
- server route: `app/api/chat/route.ts`
- shared prompt and chat constants: `src/features/chat/yantra-chat.ts`

## How It Works

1. Pages are wrapped with `ChatProvider`.
2. UI calls `openChat()` from context.
3. Messages are stored locally in provider state.
4. Provider posts the recent conversation to `/api/chat`.
5. API route sanitizes and truncates messages.
6. Gemini generates a response using the Yantra system prompt.
7. Response is returned and appended in the UI.

## Current Capabilities

- modal chat UI
- quick prompts
- CTA-driven prompts from other components
- dashboard prompt actions
- friendly error states

## Current Limitations

- no persistence
- no user identity
- no long-term memory
- no tool calling
- no analytics or moderation layer
- single provider only

## Environment Dependency

Requires:

- `GEMINI_API_KEY`

## Recommended Future Work

- save sessions
- connect chat to user identity
- add observability
- support richer structured context
- eventually support orchestration or tool use if the product needs it
