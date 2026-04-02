# Yantra Docs

This folder is the operating handbook for the live Yantra codebase.

Use it to understand what is actually implemented now, what is seeded but limited, and where the current code still has known mismatches.

## What Is In This Folder

### Engineering

- `engineering/ARCHITECTURE.md`
  Runtime boundaries, request flows, AI-routing behavior, persistence model, and technical constraints.
- `engineering/CODEBASE_MAP.md`
  Route-by-route and folder-by-folder map of the active codebase.
- `engineering/SETUP_AND_DEPLOYMENT.md`
  Local setup, environment variables, smoke tests, and deployment guidance.
- `engineering/ONE_COMMAND_SETUP.md`
  Fast onboarding path for a fresh machine with `npm run setup`.
- `engineering/SUPABASE_SETUP.md`
  Supabase auth setup, schema application, redirect configuration, OAuth setup, and persistence details.
- `engineering/WORKFLOW.md`
  Repo working rules, safe change categories, and contribution expectations.

### Features

- `features/MARKETING_SITE.md`
  What the landing page actually contains, including account entry, docs entry, access requests, and chat entry.
- `features/DASHBOARD.md`
  What the dashboard, student profile, and Python Room do today.
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
  Historical build sequence for the first Yantra Python Room.

### Handoff

- `handoff/CURRENT_STATE.md`
  Fast practical handoff for the next engineer picking up the repo.
- `handoff/FRONTEND_DEV_BRIEF.md`
  Detailed product, structure, progress, and task brief for a frontend-heavy contributor.

### Reference

- `reference/SOURCE_ASSETS.md`
  Non-runtime design and product inputs used to shape the current build.
- `reference/build-plan/`
  Historical planning inputs. These are reference assets, not the source of truth for live behavior.

## Fast Start For A New Builder

1. Read `handoff/CURRENT_STATE.md`.
2. Read `engineering/ONE_COMMAND_SETUP.md`.
3. Read `engineering/CODEBASE_MAP.md`.
4. Read the relevant file inside `features/`.
5. Read `product/OPEN_WORK.md` before starting implementation.

## Current Product Reality

Yantra now has:

- a public marketing surface
- login, signup, onboarding, password reset, and Google sign-in flows
- a public docs/help center with article pages and a separate Support Desk assistant
- Supabase-backed protected learner routes
- a persisted learner profile in `public.profiles`
- persisted starter dashboard data, with a known room-table mismatch documented in engineering docs
- main Yantra chat that targets the Python AI service first through configurable local/render routing
- a live Python Room at `/dashboard/rooms/python`
- Python Room feedback that targets the Python AI service first and can fall back to Gemini
- Sarvam-backed room voice through Next.js server routes
- persisted public access requests
- automated coverage for room-feedback route validation, Pyodide error parsing, and the Python service

Yantra still does not have:

- real adaptive learning-path generation
- real persisted learner intelligence behind most dashboard recommendations
- fully wired practice rooms beyond the Python Room
- analytics, observability, or moderation tooling
- an internal review UI for access requests
- teacher, institution, certification, or hiring workflows
- multi-thread or long-horizon learner memory beyond the current rolling chat history

The docs in this folder should reflect current code behavior first. Reference assets under `docs/reference/` are useful design and product inputs, but they are not the contract for live runtime behavior.

## Documentation Rules

- Treat this folder as the first source of truth for repo context.
- Update docs in the same change whenever routes, auth behavior, AI routing, environment setup, APIs, persistence, or architecture change.
- Distinguish between live behavior, seeded starter data, known code/schema mismatches, and future work.
- Keep reference assets under `docs/reference/`; do not delete or relocate them without approval.
