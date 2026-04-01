# DMonkey Brief

## What this job is

You are doing the setup and support plumbing work.

Repo note:

- repo: `akyourowngames/Yantra`
- default branch: `main`
- open PRs found during check: none
- open issues found during check: none

Your job is to:

1. add bundle analyzer setup
2. create the model router skeleton file
3. update env example values
4. create classroom placeholder routes
5. add Vercel Analytics

This is not the final AI wiring.

You are building the shell around it.

## Why this matters

Your work helps the team move faster.

You are setting up:

- speed checking tools
- a clean place for future model routing
- placeholder classroom screens
- analytics

This work makes later AI work easier.

Krish will connect the real AI calls later.

## What already exists in the repo

These files already exist:

- `package.json`
- `.env.example`
- `app/layout.tsx`
- `next.config.ts`

Things that do not exist yet:

- bundle analyzer setup
- Vercel Analytics component in layout
- classroom routes
- `src/lib/ai/orchestrator.ts`

So your job is mostly setup and new small files.

## Do this first

Do these in order:

1. bundle analyzer setup
2. orchestrator skeleton
3. env var updates
4. classroom route placeholders
5. Vercel Analytics

Keep the changes small and clean.

Do not mix in AI behavior.

## Step-by-step work

### Step 1: Bundle analyzer setup

Open:

- `package.json`
- maybe `next.config.ts`

Add:

- `@next/bundle-analyzer` to dev dependencies
- an `npm run analyze` script

Plain meaning:

The bundle analyzer helps the team see what code is making the app heavy.

It is a size-checking tool.

After setup:

- run the analyzer
- take a screenshot
- post it in `#deployments`

### Step 2: Build the orchestrator skeleton

Create:

- `src/lib/ai/orchestrator.ts`

Put only the routing shell here.

Use the exact logic from the task:

- `selectModel(...)`
- `scoreComplexity(...)`

Plain meaning:

This file only chooses which model name should be used.

It does not call the model.

It does not stream.

It does not do AI chat.

Krish will connect the real model calls later.

### Step 3: Update env vars

Open:

- `.env.example`

Add:

- `ANTHROPIC_API_KEY`
- `SERPER_API_KEY`

Keep the file style the same as the existing env example.

Also confirm these are set in Vercel.

Do not add random extra env vars.

### Step 4: Create classroom route skeletons

Create:

- `app/classroom/page.tsx`
- `app/classroom/teacher/page.tsx`

These are placeholder pages only.

They should:

- feel fullscreen
- hide normal distractions
- use `100vw` and `100vh` style layout
- feel touch-friendly

For `app/classroom/page.tsx`:

- read `?topic=`
- read `?mode=`
- render a simple placeholder shell

For `app/classroom/teacher/page.tsx`:

- make a teacher placeholder layout
- keep it protected if needed by the same route-guard pattern the repo already uses

These pages are not the full product yet.

They are just shells for later work.

### Step 5: Add Vercel Analytics

Open:

- `package.json`
- `app/layout.tsx`

Add:

- `@vercel/analytics`
- `<Analytics />` in the app layout

This is a very small setup task.

Do not redesign the layout.

Just wire the analytics component cleanly.

## Files you will probably touch

- `package.json`
- `.env.example`
- `app/layout.tsx`
- `next.config.ts`
- `src/lib/ai/orchestrator.ts` new
- `app/classroom/page.tsx` new
- `app/classroom/teacher/page.tsx` new

## Files you must not touch

Do not touch these unless Krish says yes:

- `app/api/chat/route.ts`
- anything in `src/features/chat/`
- `src/lib/supabase/profiles.ts`

Also do not turn the orchestrator into real AI logic.

Keep it as a shell only.

## How to know you are done

You are done when:

- the bundle analyzer package and script are added
- the analyzer runs
- the screenshot is ready
- `src/lib/ai/orchestrator.ts` exists with the shell logic
- `.env.example` includes the 2 new keys
- classroom placeholder routes exist
- Vercel Analytics is added to `app/layout.tsx`

## What to post in #deployments

Post these things:

- bundle analyzer screenshot
- what setup files you changed
- the preview URL
- note that the orchestrator is only a shell and not full AI wiring
- note that classroom pages are placeholders

## Good branch name examples

- `perf/bundle-audit`
- `feat/orchestrator-shell`
- `feat/classroom-shell`
- `chore/env-and-analytics`

## Shared rules

- Tobe’s database work lands first.
- All PRs go to Krish for review.
- Do not touch protected AI-core files without asking.
- Use clean branch names.
- Post your preview URL in `#deployments`.
