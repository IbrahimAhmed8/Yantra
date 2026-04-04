# Yantra Editor Playground Build Plan - Corrected

Date: April 4, 2026

## Executive Summary

The original PDF is only partially aligned with the current Yantra repo.

What is aligned:

- the editor should feel native to Yantra
- Monaco is already the right editor surface
- Supabase-authenticated learner context should shape the experience
- saved learner work should persist across sessions

What is not aligned:

- the repo is not starting from zero
- the current runtime foundation is Pyodide in-browser Python, not a new Piston-first execution path
- the current product already has a live Python Room with AI feedback
- the existing `/editor` route is a separate shell and is not yet wired into the protected app architecture
- a single-file snippet plan is too small if the goal is a real freestyle project playground

If the real goal is "let learners build freestyle projects inside Yantra," then the build should be project-based from day 1, browser-first for Python, and only add remote sandboxes when the product truly needs them.

## Current Repo Truth

The current repo already uses:

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- Supabase SSR auth and persistence
- Monaco editor packages already installed
- an in-browser Python runtime through Pyodide
- a Python Yantra AI service for the main assistant path
- Gemini still used for docs support
- Vercel as the deployment target

The current product state matters:

- `/dashboard/rooms/python` is already the live protected coding surface
- that room already runs Python in the browser through Pyodide
- that room already highlights runtime-error lines and requests AI feedback on errors
- `/editor` already exists, but it is a separate editor shell, not a protected server-guarded Yantra route
- the existing generic editor client calls `/execute`, which is not the current repo's protected app API shape
- there is no `code_snippets` table in the current Supabase schema

## What Is Wrong In The Original PDF

### 1. It treats `/editor` as a greenfield feature

That is incorrect.

Yantra already has:

- a live Python coding room
- Monaco integration
- Pyodide runtime logic
- AI feedback plumbing
- an existing `/editor` shell

The correct plan is to consolidate and harden what already exists, not build a second disconnected coding surface.

### 2. It makes public Piston the core v1 execution model

That is the wrong default for Yantra's current architecture.

Why this is misaligned:

- the repo already has a working Python-in-browser execution path
- Piston is good for code execution demos, but weak for project-style workspaces
- public Piston does not give a true project environment
- it does not solve file trees, assets, browser preview, or package-aware project workflows
- it introduces a new remote dependency for the exact thing Yantra already does locally for Python

Correction:

- Python v1 should run through the existing Pyodide path
- remote execution should be added later only for runtimes that cannot reasonably run in the browser

### 3. It scopes v1 as "single file per session"

That is too narrow if the goal is a freestyle project playground.

Even if the first UI only opens one file, the storage model should be project-based from day 1 so Yantra does not need a migration from "snippets" to "projects" later.

Correction:

- use a project entity from day 1
- allow a default one-file project on creation
- keep the door open for multiple files, assets, and templates without reworking the data model

### 4. It assumes Gemini should own the editor AI path

That is outdated relative to the repo direction.

The current app already routes core learner-facing AI through the Yantra Python service, with Gemini still used in more limited paths like docs support and fallback scenarios.

Correction:

- editor assist should follow the main Yantra AI boundary where possible
- if a dedicated editor route is added, it should still share the same learner-context and prompt architecture
- Gemini can remain a fallback, not the defining editor architecture

### 5. It proposes `code_snippets` as the primary persistence layer

That storage model is too small for a playground.

Correction:

- persist projects, not just snippets
- treat share/remix as a project capability, not a detached snippet utility

### 6. It says the route should be protected, but the current `/editor` implementation is not yet aligned with that

The PDF is correct about the desired protection model but does not reflect the current repo reality.

Correction:

- keep `/editor` only if it becomes a protected server-guarded route
- otherwise place the playground under `/dashboard` so it inherits Yantra's protected product structure more naturally

### 7. It promises a freestyle playground, but the technical plan only supports snippet execution

This is the biggest product mismatch.

Freestyle projects need at least:

- a project workspace
- saved files
- templates
- reopen/edit flows
- share or remix flows
- for web projects, a preview surface

The original PDF describes a good "run a snippet and explain it" tool, not yet a real freestyle project playground.

## Corrected Product Goal

Ship one protected Yantra Playground where an authenticated learner can:

1. create a project from a template
2. edit code in Monaco
3. run the project or current file
4. get learner-aware AI help
5. save and reopen the project
6. share or remix the project

That is the minimum experience that actually matches the phrase "freestyle projects."

## Corrected V1 Scope

### V1 surface

- Route: keep `/editor` only if it is server-protected with `requireAuthenticatedProfile`, or move to a protected dashboard route
- UI: reuse the existing editor shell, Monaco setup, output panel, and AI panel patterns already present in the repo
- Theme: keep the Yantra-native visual system

### V1 project model

- project-based from day 1
- each new project starts with a template
- default template for v1: Python Playground
- optional second template if time allows: HTML/CSS/JS Web Playground

### V1 execution model

For Python:

- run in browser with the existing Pyodide runtime
- reuse the Python Room execution and runtime-error handling patterns

For web preview, only if time allows:

- render HTML/CSS/JS in an isolated iframe preview
- do not introduce Node or container execution in the first pass

Do not make public Piston the core v1 dependency.

### V1 AI model

- add an editor-specific assist route only if the current chat/feedback surface cannot support the editor experience cleanly
- pass learner profile context, current language, current file contents, and selected line or selection
- keep the response short, practical, and learning-oriented
- use the same Yantra AI service boundary where possible

### V1 persistence model

Use project tables instead of snippet tables.

Recommended tables:

`editor_projects`

- `id uuid primary key`
- `user_id uuid references auth.users(id) on delete cascade`
- `title text not null`
- `template_key text not null`
- `primary_language text not null`
- `created_at timestamptz not null default timezone('utc', now())`
- `updated_at timestamptz not null default timezone('utc', now())`

`editor_project_files`

- `id uuid primary key`
- `project_id uuid references editor_projects(id) on delete cascade`
- `path text not null`
- `language text not null`
- `content text not null default ''`
- `sort_order integer not null default 0`
- `is_entry boolean not null default false`
- `created_at timestamptz not null default timezone('utc', now())`
- `updated_at timestamptz not null default timezone('utc', now())`

Optional later table:

`editor_project_shares`

- `id uuid primary key`
- `project_id uuid references editor_projects(id) on delete cascade`
- `share_slug text unique not null`
- `created_by uuid references auth.users(id) on delete cascade`
- `created_at timestamptz not null default timezone('utc', now())`

All of these should use RLS.

## Corrected Route And API Shape

Recommended route and API surface:

### Route

- `app/editor/page.tsx`
  - server component
  - calls `requireAuthenticatedProfile()`
  - renders the client editor workspace only after auth passes

### Project APIs

- `GET /api/editor/projects`
  - list current user's projects
- `POST /api/editor/projects`
  - create a new project from a template
- `GET /api/editor/projects/[projectId]`
  - fetch one project and its files
- `PATCH /api/editor/projects/[projectId]`
  - update project title or metadata
- `PUT /api/editor/projects/[projectId]/files`
  - save the current project file set

### AI API

- `POST /api/editor/assist`
  - learner-aware code explanation, debugging help, and next-step guidance

### Share API

- `POST /api/editor/projects/[projectId]/share`
  - create a share link
- `GET /api/editor/share/[shareSlug]`
  - view a shared project

### Execution API

For v1 Python, no server run route is required.

Reason:

- Python already runs in-browser through Pyodide
- this keeps latency lower for simple learning loops
- this reuses code Yantra already owns

Only add a remote execution route when Yantra needs:

- non-browser runtimes
- heavier package installs
- long-running jobs
- server-side project environments

## Recommended Build Sequence

### Day 1 - Protect And Consolidate

- convert `/editor` into a protected route
- reuse the existing editor shell instead of creating a second editor stack
- align the route with the main Yantra auth model
- remove assumptions that `/editor` is a standalone public page

### Day 2 - Reuse Python Runtime

- connect the editor's Python execution path to the existing Pyodide runtime patterns
- reuse output formatting and runtime-error handling
- keep Python as the first truly supported language

### Day 3 - Project Persistence

- add `editor_projects` and `editor_project_files`
- autosave or explicit save
- project list and reopen flow
- default new project template

### Day 4 - AI Assist

- add learner-aware explain/debug help
- ground prompts in the user's profile and current learning level
- keep responses action-oriented

### Day 5 - Share And Remix

- create project share links
- allow "open as copy" or remix flow
- make this the first real collaborative growth loop for learner projects

### Day 6 - Optional Web Playground

If capacity remains after Python is stable:

- add a simple HTML/CSS/JS template
- render preview in an iframe
- keep it static and safe

Do not add Node, package install, or terminal emulation in this phase.

## What To Postpone

These are valid future directions, but they should not define v1:

- public Piston as the main runtime
- xterm.js plus Docker/WebSocket terminal
- self-hosted container sandboxes
- 70+ language marketing claims
- full-stack project sandboxes
- language-server heavy IDE work

Those are phase-2 or phase-3 concerns.

## Phase 2 For True Freestyle Projects

If Yantra wants genuine project-building beyond Python practice, phase 2 should add:

- multi-file project tabs backed by the project tables
- HTML/CSS/JS preview projects
- React or Vite-style template support through an isolated browser-based preview stack
- asset upload support
- remix gallery
- teacher review or portfolio submission flows

Only after that should Yantra consider remote execution products such as:

- self-hosted sandbox containers
- E2B-style dev sandboxes
- WebContainer-style browser Node environments

That is the level where "freestyle projects" becomes fully real.

## Final Decision

The original PDF should not be used as-is.

Use this corrected direction instead:

- keep Yantra-native UI
- protect the route
- reuse Monaco
- reuse Pyodide for Python
- align AI with the current Yantra service boundary
- store projects, not snippets
- treat public Piston and terminal-grade sandboxes as later expansions, not as the first foundation

That is the version that actually matches the current repo and the product goal of a learner playground where users can build and revisit their own projects.
