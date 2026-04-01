# Python Rooms Generation + QA Brief

## What this job is

You are doing the room generation and quality check part.

Repo note:

- repo: `akyourowngames/Yantra`
- default branch: `main`
- open PRs found during check: not checked for this brief
- open issues found during check: not checked for this brief

Your job is to:

1. take approved blueprints
2. use Claude, GPT, and research tools to generate room drafts
3. make 5-10 room drafts per approved topic
4. reject weak or duplicate drafts
5. save only clean room packs

This job does not include:

- doing the original topic research
- writing the blueprint rules
- changing the Python room runtime
- inventing new topic order

## Why this matters

This is the step that turns the blueprint into real room content.

If this part is rushed:

- the rooms feel repetitive
- the difficulty gets messy
- bad rooms reach the learner

Good QA is part of your job.

Generation without checking is not enough.

## What already exists in the repo

These things already work:

- one hardcoded Python room exists
- the room shell already runs Python
- the room plan already points to generated challenge flow
- learner level and progress are already in the repo

These files already exist:

- `docs/handoff/PYTHON_ROOMS_TEAM_WORKFLOW.md`
- `docs/product/ROOMS_BUILD_PLAN.md`
- `src/features/rooms/python-room-content.ts`
- `src/lib/supabase/dashboard.ts`

This means your job is content production.

It is not app code work.

## Do this first

Do the work in this exact order:

1. wait for an approved blueprint
2. generate 5-10 room drafts from that blueprint
3. run the quality checklist
4. save only the clean room pack
5. send the pack to Krish for review

Do not generate from unapproved notes.

## Step-by-step work

### Step 1: Read the approved blueprint

Before you generate anything, check:

- topic
- level
- allowed concepts
- banned concepts
- task types
- success check type

Plain meaning:

The blueprint is your fence.

Stay inside it.

### Step 2: Generate room drafts

For each approved blueprint:

- make 5-10 room drafts
- use the blueprint schema
- keep the wording simple
- keep the learner task clear

You may use:

- Claude
- GPT
- research tools
- scraping tools if needed for idea gathering

But the output must still obey the blueprint.

### Step 3: Check each draft

For every room draft, check:

- Is the topic correct?
- Is the level still Beginner?
- Does it use only allowed concepts?
- Did advanced concepts sneak in?
- Is the task too similar to another room?
- Is the starter code clean?
- Is the hint short and useful?

Reject any room that fails.

### Step 4: Reject weak rooms

Do not keep rooms that are:

- duplicates
- too vague
- too hard
- too easy
- mixed with later concepts
- badly written

Plain meaning:

Bad room drafts should not be “fixed later.”

Just reject them and generate better ones.

### Step 5: Save the final room pack

When the good rooms are selected:

- normalize the output shape
- save the final pack cleanly
- label the topic clearly

Example:

- `variables-room-pack-v1`

The final pack should be easy for Yantra to use later.

### Step 6: Post QA result

For each pack, say:

- how many drafts were generated
- how many passed
- why the failed ones were rejected

This depends on blueprint approval first.

## Files you will probably touch

- `docs/handoff/PYTHON_ROOMS_TEAM_WORKFLOW.md`
- `docs/handoff/python-rooms/blueprints/variables.json`
- `docs/handoff/python-rooms/blueprints/print-and-strings.json`
- `docs/handoff/python-rooms/blueprints/input-and-type-conversion.json`
- `docs/handoff/python-rooms/blueprints/if-else.json`
- `docs/handoff/python-rooms/blueprints/loops.json`
- `docs/handoff/python-rooms/blueprints/lists.json`
- `docs/handoff/python-rooms/blueprints/simple-functions.json`
- `docs/handoff/python-rooms/room-packs/variables-room-pack-v1.md` new
- `docs/handoff/python-rooms/room-packs/print-and-strings-room-pack-v1.md` new
- `docs/handoff/python-rooms/room-packs/input-and-type-conversion-room-pack-v1.md` new
- `docs/handoff/python-rooms/room-packs/if-else-room-pack-v1.md` new
- `docs/handoff/python-rooms/room-packs/loops-room-pack-v1.md` new
- `docs/handoff/python-rooms/room-packs/lists-room-pack-v1.md` new
- `docs/handoff/python-rooms/room-packs/simple-functions-room-pack-v1.md` new

## Files you must not touch

Do not touch these unless Krish says yes:

- `src/features/rooms/PythonRoomShell.tsx`
- `src/features/rooms/python-room-content.ts`
- `supabase/schema.sql`

Also do not:

- generate rooms before blueprint approval
- invent new blueprint rules
- let the LLM decide the course order

## How to know you are done

You are done when:

- each approved blueprint has 5-10 room drafts
- weak drafts are rejected
- duplicate drafts are rejected
- each final room pack is clean and labeled
- each final room pack stays inside Beginner scope
- each pack is easy for review

## What to post in #deployments

Post these things:

- which topic pack you worked on
- how many drafts were made
- how many passed QA
- one screenshot or snippet of the final pack
- blockers if the blueprint felt weak

## Good branch name examples

- `docs/python-room-packs`
- `docs/variables-room-pack`
- `docs/beginner-room-qa`

## Shared rules

- Only generate from approved blueprints.
- Keep the rooms Beginner only.
- Reject weak or duplicate drafts.
- Do not use live generation for every learner.
- All PRs go to Krish for review.
- Do not touch protected core files without asking.
- Use clean branch names.
- Post your update in `#deployments`.
