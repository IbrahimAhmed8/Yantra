# Yantra Docs

This folder is the operating handbook for the live Yantra codebase.

Use it to understand what is actually implemented now, what is seeded but limited, and what still belongs to future product work.

## What Is In This Folder

### Engineering

- `engineering/ARCHITECTURE.md`
  Runtime boundaries, request flows, persistence model, and current technical constraints.
- `engineering/CODEBASE_MAP.md`
  Route-by-route and folder-by-folder map of the active codebase.
- `engineering/SETUP_AND_DEPLOYMENT.md`
  Local setup, environment variables, smoke tests, and deployment guidance.
- `engineering/SUPABASE_SETUP.md`
  Supabase auth setup, schema application, redirect configuration, OAuth setup, and persistence details.
- `engineering/WORKFLOW.md`
  Repo working rules, safe change categories, and contribution expectations.

### Features

- `features/MARKETING_SITE.md`
  What the landing page actually contains, including account entry, access requests, docs entry, and chat entry.
- `features/DASHBOARD.md`
  What the protected dashboard and student profile do today, including the seeded dashboard data layer.
- `features/CHAT_SYSTEM.md`
  How the main Yantra assistant works across the marketing site and dashboard.
- `features/DOCS_SYSTEM.md`
  How the standalone docs/help center and the separate Support Desk assistant work.

### Product

- `product/PRODUCT_BRIEF.md`
  Current product position, live capabilities, and the gap between the prototype and the full vision.
- `product/ROADMAP.md`
  What has already moved from roadmap into implementation, and what still belongs to future phases.
- `product/OPEN_WORK.md`
  Concrete unfinished product and engineering work.
- `product/ROOMS_BUILD_PLAN.md`
  Approved 7-day build sequence for the first real Yantra Python Room.

### Handoff

- `handoff/CURRENT_STATE.md`
  Fast practical handoff for the next engineer picking up the repo.
- `handoff/FRONTEND_DEV_BRIEF.md`
  Detailed product, structure, progress, and task brief for a frontend-heavy contributor.

### Reference

- `reference/SOURCE_ASSETS.md`
  Non-runtime design and product inputs used to shape the current build.
- `reference/build-plan/Yantra AI/YANTRA_AI_BASIC_SLICE_PLAN.md`
  Step-by-step plan for the first local Python AI service slice.

## Fast Start For A New Builder

1. Read `handoff/CURRENT_STATE.md`.
2. Read `engineering/SETUP_AND_DEPLOYMENT.md`.
3. Read `engineering/CODEBASE_MAP.md`.
4. Read the relevant file inside `features/`.
5. Read `product/OPEN_WORK.md` before starting implementation.

## Current Product Reality

Yantra now has:

- a public marketing surface
- login, signup, onboarding, password reset, and Google sign-in flows
- a public docs/help center with article pages and a separate Support Desk assistant
- Supabase-backed protected dashboard routes
- a persisted learner profile in `public.profiles`
- persisted starter dashboard data in dedicated dashboard tables
- Gemini-backed Yantra chat with authenticated history restore
- persisted public access requests
- a local-only Python AI microservice scaffold under `ai/` for separate chat and RAG work

Yantra still does not have:

- real adaptive learning-path generation
- live room execution engines
- analytics, observability, or moderation tooling
- an internal review UI for access requests
- teacher, institution, certification, or hiring workflows
- multi-thread or long-horizon learner memory beyond the current rolling chat history
- website integration with the new Python AI microservice

The local `ai/` service currently uses GitHub Copilot CLI for generation and local embeddings for retrieval. It should still be treated as a separate development surface, not a live product runtime.

The docs in this folder should reflect that distinction clearly. Avoid describing seeded content, polished UI shells, or roadmap ideas as if they are already intelligent product systems.

## Documentation Rules

- Treat this folder as the first source of truth for repo context.
- Update docs in the same change whenever routes, auth behavior, environment setup, APIs, persistence, or architecture change.
- Distinguish between live behavior, seeded starter data, placeholder UI, and future work.
- Keep reference assets under `docs/reference/`; do not delete or relocate them without approval.
