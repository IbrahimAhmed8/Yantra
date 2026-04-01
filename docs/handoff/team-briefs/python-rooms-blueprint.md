# Python Rooms Blueprint Brief

## What this job is

You are doing the blueprint and schema part.

Repo note:

- repo: `akyourowngames/Yantra`
- default branch: `main`
- open PRs found during check: not checked for this brief
- open issues found during check: not checked for this brief

Your job is to:

1. read the research notes
2. turn each topic into a reusable blueprint
3. make the schema shape clear
4. prepare clean LLM input blocks
5. hand approved blueprints to the generation person

This job does not include:

- doing the original topic research
- inventing curriculum order on your own
- generating final room packs
- changing the app runtime

## Why this matters

Your work is the middle layer.

Research alone is too loose.

LLM generation alone is too risky.

The blueprint makes the room family stable.

It tells the LLM what it may do and what it may not do.

## What already exists in the repo

These things already work:

- one hardcoded Python room exists
- learner `skill_level` exists
- learner skill progress exists
- the room build plan already points to generated challenge flow

These files already exist:

- `docs/handoff/PYTHON_ROOMS_TEAM_WORKFLOW.md`
- `docs/product/ROOMS_BUILD_PLAN.md`
- `supabase/schema.sql`
- `src/lib/supabase/dashboard.ts`

This means your job is not product invention.

Your job is to turn the topic research into a repeatable room recipe.

## Do this first

Do the work in this exact order:

1. wait for a research note
2. turn it into one blueprint
3. send the blueprint for lead approval
4. only after approval, hand it to generation

Do not skip approval.

## Step-by-step work

### Step 1: Read one research note

Read only one topic at a time.

Look for:

- what the topic teaches
- what is allowed
- what is not allowed
- common mistakes
- useful task patterns

Plain meaning:

You are turning notes into rules.

### Step 2: Write one clean blueprint

Each blueprint should define:

- topic name
- level
- learning goal
- allowed concepts
- banned concepts
- task types
- common mistakes
- starter code shape
- success check type
- hint style
- generation rules

Keep it strict.

Do not leave fuzzy parts.

If the LLM could misread it, tighten it.

### Step 3: Make the schema shape clear

The schema is the exact data format.

You should make 2 shapes clear:

1. the blueprint input schema
2. the room output schema

Plain meaning:

The first shape is what we send in.

The second shape is what we expect back.

### Step 4: Keep Beginner scope clean

The first wave is only:

- variables
- print and simple strings
- input and type conversion
- if/else
- loops
- lists
- simple functions

If a blueprint sneaks in:

- dictionaries
- nested loops
- advanced logic

remove it.

### Step 5: Ask for blueprint approval

Before generation starts:

- send the blueprint to Krish
- wait for approval

This depends on the research note being done first.

Do not hand off unapproved blueprints.

### Step 6: Hand off to generation

After approval:

- send the blueprint to the generation person
- say what topic it belongs to
- say what rules matter most

Example:

- `Variables blueprint approved. Most important rule: no loops, no lists, only strings, numbers, print.`

## Files you will probably touch

- `docs/handoff/PYTHON_ROOMS_TEAM_WORKFLOW.md`
- `docs/handoff/python-rooms/research/variables.md`
- `docs/handoff/python-rooms/research/print-and-strings.md`
- `docs/handoff/python-rooms/research/input-and-type-conversion.md`
- `docs/handoff/python-rooms/research/if-else.md`
- `docs/handoff/python-rooms/research/loops.md`
- `docs/handoff/python-rooms/research/lists.md`
- `docs/handoff/python-rooms/research/simple-functions.md`
- `docs/handoff/python-rooms/blueprints/variables.json` new
- `docs/handoff/python-rooms/blueprints/print-and-strings.json` new
- `docs/handoff/python-rooms/blueprints/input-and-type-conversion.json` new
- `docs/handoff/python-rooms/blueprints/if-else.json` new
- `docs/handoff/python-rooms/blueprints/loops.json` new
- `docs/handoff/python-rooms/blueprints/lists.json` new
- `docs/handoff/python-rooms/blueprints/simple-functions.json` new

## Files you must not touch

Do not touch these unless Krish says yes:

- `src/features/rooms/PythonRoomShell.tsx`
- `src/features/rooms/python-room-content.ts`
- `app/api/rooms/python/feedback/route.ts`

Also do not:

- invent a new topic order by yourself
- generate final room packs

## How to know you are done

You are done when:

- each Beginner topic has a blueprint
- each blueprint has clear allowed and banned concepts
- each blueprint has a clear schema shape
- each blueprint has a success check type
- each blueprint is approved before generation starts

## What to post in #deployments

Post these things:

- which blueprint is approved
- one screenshot or snippet of the schema shape
- what topic is ready for generation
- any rule that still feels risky

## Good branch name examples

- `docs/python-rooms-blueprints`
- `docs/variables-blueprint`
- `docs/beginner-room-schema`

## Shared rules

- One blueprint per topic.
- Keep the schema strict.
- Keep the scope Beginner only.
- Do not start generation before approval.
- All PRs go to Krish for review.
- Do not touch protected core files without asking.
- Use clean branch names.
- Post your update in `#deployments`.
