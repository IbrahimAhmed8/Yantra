# Current State

## Repo Summary

Yantra is now a Next.js project with two live frontend experiences and one live backend endpoint:

- landing page at `/`
- dashboard concept at `/dashboard`
- AI chat route at `/api/chat`

## What Works Today

- local Next.js development
- Vercel deployment
- Gemini-powered chat
- dashboard route rendering
- shared visual language between landing page and dashboard

## What Is Still Static

- landing page content
- dashboard progress metrics
- dashboard skills
- dashboard room availability
- AI prompt suggestions

There is no live user data behind these yet.

## Important Product Reality

The current repo is a polished product shell, not a full learning platform.

That is a good place to be, but new contributors should not mistake UI direction for completed platform capability.

## Known Structural Reality

- `src/App.tsx` is still a large landing-page file
- the dashboard is already isolated in its own component folder
- chat is cleanly separated into widget UI, API route, and shared prompt config
- project and design references still live at the repo root

## Important Root Assets

- `Dashboard/` contains the dashboard design references
- `Yantra_AI_Build_Plan.pdf` contains the broader product strategy
- `tmp_yantra_pdf.txt` is a text extraction of that PDF

These are useful and should not be deleted without approval.

## Immediate Recommended Builder Flow

1. Read the docs folder.
2. Decide whether you are working on marketing, dashboard, chat, or platform foundations.
3. Keep runtime code changes separate from cleanup changes.
4. Do not remove legacy or reference files without explicit approval.

## Immediate Next Good Tasks

- introduce persistent data
- define the student model
- formalize dashboard data contracts
- split the marketing page into smaller files when approved
- start the first real practice-room implementation
