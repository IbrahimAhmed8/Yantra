# Yantra Docs

This folder is the working handbook for the Yantra codebase.

Use it as the first stop before making product, design, or engineering changes.

## What Is Here

- `engineering/ARCHITECTURE.md`
  Current system architecture, runtime flow, and app boundaries.
- `engineering/CODEBASE_MAP.md`
  File and folder map for the live codebase and the recommended direction for future organization.
- `engineering/SETUP_AND_DEPLOYMENT.md`
  Local setup, environment variables, build commands, and Vercel deployment guidance.
- `engineering/WORKFLOW.md`
  Contribution workflow, documentation expectations, and safe cleanup rules.
- `features/MARKETING_SITE.md`
  Breakdown of the public landing page and its current responsibilities.
- `features/DASHBOARD.md`
  Breakdown of the `/dashboard` route and its sections.
- `features/CHAT_SYSTEM.md`
  Breakdown of the client chat widget, API route, and prompt layer.
- `product/PRODUCT_BRIEF.md`
  What Yantra is building, who it is for, and what the current product already communicates.
- `product/ROADMAP.md`
  Current delivery phases based on the build plan and the live app state.
- `product/OPEN_WORK.md`
  Remaining product and engineering work that still needs to be built.
- `handoff/CURRENT_STATE.md`
  A practical handoff note for the next builder joining the repo.
- `reference/SOURCE_ASSETS.md`
  Notes on the design references, build-plan PDF, and root-level artifacts currently used as inputs.

## Fast Start For A New Builder

1. Read `handoff/CURRENT_STATE.md`.
2. Read `engineering/CODEBASE_MAP.md`.
3. Read `engineering/SETUP_AND_DEPLOYMENT.md`.
4. Read `engineering/WORKFLOW.md`.
5. Read the relevant file inside `features/`.
6. Review `product/OPEN_WORK.md` before starting implementation.

## Documentation Rules

- Treat this folder as the source of truth for project context.
- Update docs whenever routes, environment setup, architecture, or product direction changes.
- Do not remove or relocate root-level reference assets until approved. Those cleanup recommendations are documented, but intentionally not executed yet.
