# Python Rooms Research Brief

## What this job is

You are doing the research part.

Repo note:

- repo: `akyourowngames/Yantra`
- default branch: `main`
- open PRs found during check: not checked for this brief
- open issues found during check: not checked for this brief

Your job is to:

1. research each Beginner Python topic
2. write very simple topic notes
3. list common learner mistakes
4. list good task patterns for each topic
5. hand clean notes to the blueprint person

This job does not include:

- writing final room blueprints
- generating final room packs
- changing app code

## Why this matters

This work matters because the rest of the flow depends on it.

If the research is weak:

- the blueprint will be weak
- the LLM output will be weak
- the rooms will feel random

Good research makes the next 2 jobs easier.

## What already exists in the repo

These things already work:

- the Python room shell exists
- one hardcoded Python room already exists
- learner `skill_level` already exists
- learner skill progress already exists

These files already exist:

- `src/features/rooms/python-room-content.ts`
- `docs/product/ROOMS_BUILD_PLAN.md`
- `supabase/schema.sql`
- `docs/handoff/PYTHON_ROOMS_TEAM_WORKFLOW.md`

This means you are not designing the app from zero.

You are preparing clean topic knowledge for the content system.

## Do this first

Do the work in this exact order:

1. lock the Beginner topic list
2. research one topic at a time
3. write one markdown note per topic
4. send the note to the blueprint person

Do not jump to room writing.

## Step-by-step work

### Step 1: Lock the topic list

Only work on these Beginner topics:

1. variables
2. print and simple strings
3. input and type conversion
4. if/else
5. loops
6. lists
7. simple functions

Plain meaning:

Do not research Intermediate Python right now.

Keep the first wave small.

### Step 2: Research one topic at a time

For each topic, answer these questions:

- What does this topic mean?
- What should a beginner learn from it?
- What mistakes do beginners often make?
- What task styles fit this topic?
- What should not appear yet?

Use very simple words.

Keep the topic clean.

Example:

For `variables`, do not mix in loops.

### Step 3: Write one topic note

Make one markdown note per topic.

Each note should include:

- topic name
- level
- plain meaning
- learning goal
- 5-10 common mistakes
- 8-15 task pattern ideas
- banned ideas for this level
- tiny examples if useful

Plain meaning:

A task pattern is a room shape.

Example task patterns for `variables`:

- store a name and print it
- store 2 prices and print total
- store age and city and print one sentence

### Step 4: Keep the notes beginner-safe

Make sure your note does not accidentally include:

- lists inside variables-only topics
- loops inside print-only topics
- nested logic
- dictionaries
- advanced Python words

If a task needs a later topic, remove it.

### Step 5: Hand off to the blueprint person

When one topic note is clean:

- send it to the blueprint person
- say what topic it is
- say if anything feels risky or confusing

This depends on the research being clean first.

Do not send messy notes.

## Files you will probably touch

- `docs/handoff/PYTHON_ROOMS_TEAM_WORKFLOW.md`
- `docs/product/ROOMS_BUILD_PLAN.md`
- `src/features/rooms/python-room-content.ts`
- `docs/handoff/python-rooms/research/variables.md` new
- `docs/handoff/python-rooms/research/print-and-strings.md` new
- `docs/handoff/python-rooms/research/input-and-type-conversion.md` new
- `docs/handoff/python-rooms/research/if-else.md` new
- `docs/handoff/python-rooms/research/loops.md` new
- `docs/handoff/python-rooms/research/lists.md` new
- `docs/handoff/python-rooms/research/simple-functions.md` new

## Files you must not touch

Do not touch these unless Krish says yes:

- `src/features/rooms/PythonRoomShell.tsx`
- `app/api/rooms/python/feedback/route.ts`
- `supabase/schema.sql`

Also do not:

- make final blueprint rules
- generate final room packs

## How to know you are done

You are done when:

- all 7 Beginner topics have notes
- each note is simple to read
- each note lists common mistakes
- each note lists task patterns
- each note clearly says what is banned
- the blueprint person can use the notes without guessing

## What to post in #deployments

Post these things:

- which topic notes are finished
- one screenshot or snippet of a clean topic note
- what blockers you hit
- which note is ready for blueprint work

## Good branch name examples

- `docs/python-rooms-research`
- `docs/beginner-python-topics`
- `docs/variables-research`

## Shared rules

- Research one topic at a time.
- Keep everything Beginner only.
- Use very simple English.
- Do not mix roles.
- All PRs go to Krish for review.
- Do not touch protected core files without asking.
- Use clean branch names.
- Post your update in `#deployments`.
