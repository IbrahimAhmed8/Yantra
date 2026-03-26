# Yantra

Yantra is a Next.js-based AI learning platform prototype with a public marketing site, a student dashboard concept, and a Gemini-powered AI teacher chat flow.

## Main Routes

- `/` public marketing site
- `/dashboard` student dashboard
- `/api/chat` AI chat endpoint

## Project Structure

- `app/` route entrypoints and API routes
- `src/features/` product feature implementations
- `src/styles/` global styling
- `docs/` project handbook, roadmap, handoff notes, and reference assets

## Start Here

If you are new to the repo, read:

1. `docs/README.md`
2. `docs/handoff/CURRENT_STATE.md`
3. `docs/engineering/CODEBASE_MAP.md`

## Local Setup

```bash
npm install
npm run dev
```

Add a Gemini key in your environment:

```env
GEMINI_API_KEY=YOUR_KEY_HERE
```
