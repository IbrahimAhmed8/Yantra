# Codebase Map

## Active Runtime Structure

```text
Yantra/
|-- app/
|   |-- api/chat/route.ts
|   |-- dashboard/page.tsx
|   |-- layout.tsx
|   `-- page.tsx
|-- lib/
|   `-- yantra-chat.ts
|-- src/
|   |-- App.tsx
|   |-- index.css
|   `-- components/
|       |-- chat/ChatWidget.tsx
|       `-- dashboard/StudentDashboard.tsx
|-- package.json
|-- next.config.ts
|-- tsconfig.json
`-- docs/
```

## Folder Roles

### `app/`

- Next.js route entrypoints
- global layout
- server API route for chat

### `lib/`

- shared configuration and reusable non-UI constants
- current example: chat model name, prompts, quick actions

### `src/`

- actual UI implementation
- landing page still lives in `src/App.tsx`
- reusable UI/state logic is under `src/components/`

### `docs/`

- product, engineering, reference, and handoff documentation
- intended to become the onboarding surface for future contributors

## Root-Level Reference And Legacy Items

These are intentionally left in place for now because you asked not to delete anything without permission:

- `Dashboard/`
  sample dashboard design inputs and reference image
- `Yantra_AI_Build_Plan.pdf`
  product vision and long-range build plan
- `tmp_yantra_pdf.txt`
  extracted text from the build plan PDF
- `dist/`
  likely old build artifact from the previous tooling setup
- `node_modules_broken/`
  legacy dependency folder that should be reviewed before removal

## Current File-Organization Pain Points

- `src/App.tsx` is too large and currently mixes multiple landing-page sections in one file.
- Design references and planning artifacts live at the repo root instead of under a dedicated project-docs area.
- Some old root files are already outside the active Next.js runtime and should be reviewed before cleanup.

## Safe Next Organization Steps

These are recommendations only. They are not executed yet.

### High-confidence moves

- keep all new documentation under `docs/`
- keep new route code in `app/`
- keep route-specific UI in `src/components/` or future `src/features/`

### Cleanup moves that should happen only after approval

- move `Dashboard/` into `docs/reference/dashboard-sample/`
- move `Yantra_AI_Build_Plan.pdf` into `docs/reference/build-plan/`
- move `tmp_yantra_pdf.txt` into `docs/reference/build-plan/`
- review whether `dist/` should be removed from version control
- review whether `node_modules_broken/` should be removed from the workspace
- recreate a root `README.md` that points into `docs/`

## Suggested Future Structure

```text
Yantra/
|-- app/
|-- docs/
|   |-- engineering/
|   |-- handoff/
|   |-- product/
|   `-- reference/
|-- lib/
|-- src/
|   |-- features/
|   |   |-- dashboard/
|   |   |-- marketing/
|   |   `-- chat/
|   |-- shared/
|   `-- styles/
`-- public/
```

That future layout is a recommendation for later work, not a requirement for the current repo.
