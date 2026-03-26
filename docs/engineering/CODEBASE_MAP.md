# Codebase Map

## Active Runtime Structure

```text
Yantra/
|-- app/
|   |-- api/chat/route.ts
|   |-- dashboard/page.tsx
|   |-- layout.tsx
|   `-- page.tsx
|-- docs/
|   |-- engineering/
|   |-- features/
|   |-- handoff/
|   |-- product/
|   `-- reference/
|-- src/
|   |-- features/
|   |   |-- chat/
|   |   |   |-- ChatWidget.tsx
|   |   |   `-- yantra-chat.ts
|   |   |-- dashboard/StudentDashboard.tsx
|   |   `-- marketing/MarketingLandingPage.tsx
|   `-- styles/globals.css
|-- package.json
|-- next.config.ts
|-- tsconfig.json
`-- README.md
```

## Folder Roles

### `app/`

- Next.js route entrypoints
- global layout
- server API route for chat

### `src/features/`

- product-facing feature implementation
- organized by surface instead of keeping everything flat

### `src/styles/`

- global styling and shared theme tokens

### `docs/`

- product, engineering, reference, and handoff documentation
- intended to become the onboarding surface for future contributors

## Reference And Legacy Items

Current non-runtime reference assets now live in `docs/reference/`:

- `docs/reference/dashboard-sample/`
  dashboard design inputs and visual references
- `docs/reference/build-plan/`
  broader build-plan PDF and extracted text

Legacy/local workspace artifacts still present in the root:

- `dist/`
  likely old build artifact from the previous tooling setup
- `node_modules_broken/`
  legacy dependency folder that should be reviewed before removal

## Current File-Organization Pain Points

- `src/features/marketing/MarketingLandingPage.tsx` is still large and combines multiple landing-page sections in one file.
- Some old root files are already outside the active Next.js runtime and should be reviewed before cleanup.
- There are local legacy deletions in the workspace that have not been intentionally resolved yet.

## Safe Next Organization Steps

These are recommendations only. They are not executed yet.

### High-confidence moves

- keep all new documentation under `docs/`
- keep new route code in `app/`
- keep route-specific UI in `src/features/`
- keep global styles in `src/styles/`

### Cleanup moves that should happen only after approval

- review whether `dist/` should be removed from version control
- review whether `node_modules_broken/` should be removed from the workspace
- review old deleted legacy files and decide whether to archive, restore, or remove them intentionally
- split the landing page into smaller files if desired

## Suggested Future Structure

```text
Yantra/
|-- app/
|-- docs/
|   |-- engineering/
|   |-- handoff/
|   |-- product/
|   `-- reference/
|-- src/
|   |-- features/
|   |   |-- chat/
|   |   |-- dashboard/
|   |   `-- marketing/
|   `-- styles/
`-- public/
```

That future layout is a recommendation for later work, not a requirement for the current repo.
