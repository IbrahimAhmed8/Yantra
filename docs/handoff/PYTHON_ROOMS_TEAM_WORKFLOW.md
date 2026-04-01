# Python Rooms Team Workflow

## Why this doc exists

This doc explains how our team will design Beginner Python rooms for Yantra.

We are not making every room by hand.

We are also not asking the LLM to invent the whole course live for each learner.

We will do this in a safer way:

1. pick one Python topic
2. research that topic well
3. turn the research into a blueprint
4. send the blueprint schema to an LLM
5. get 5-10 room drafts
6. review the drafts
7. save only the good rooms

This keeps quality high.

This also keeps cost lower.

## Four important words

### Topic

A topic is one Python part.

Examples:

- `variables`
- `if/else`
- `loops`
- `lists`

Plain meaning:

A topic is the lesson idea we want to teach.

### Room

A room is one challenge the learner solves.

Example:

- `Store a student's name and age in variables, then print one sentence.`

Plain meaning:

A room is one small practice problem.

### Blueprint

A blueprint is the rule sheet for making rooms.

It tells us:

- what the room should teach
- what code ideas are allowed
- what code ideas are not allowed yet
- what mistakes beginners usually make
- what a good answer should look like

Plain meaning:

A blueprint is the recipe.

### Schema

A schema is the exact data shape.

It is the format we send to the LLM and the format we expect back.

Plain meaning:

A schema is the box shape for the data.

If the box shape is clear, the output is easier to trust.

## What already exists in the repo

These things are already true in Yantra:

- `src/features/rooms/python-room-content.ts` still has one hardcoded Python room
- `docs/product/ROOMS_BUILD_PLAN.md` already says we want generated challenge flow
- `supabase/schema.sql` already has learner `skill_level`
- `supabase/schema.sql` already has `student_skill_progress`
- `src/lib/supabase/dashboard.ts` already expects room data on the dashboard side

Plain meaning:

We are not starting from zero.

The room shell already exists.

The learner level already exists.

Now we are building the content system that will feed the room shell.

## First sprint scope

This first sprint is **Beginner Python only**.

We will start with this topic ladder:

1. variables
2. print and simple strings
3. input and type conversion
4. if/else
5. loops
6. lists
7. simple functions

We will **not** do these in the first sprint:

- dictionaries
- nested loops
- advanced string parsing
- intermediate logic
- algorithm-heavy tasks

Those come later.

## The full flow

```text
Learner level
   ↓
Pick topic
   ↓
Read blueprint
   ↓
Send schema to LLM
   ↓
Get 5-10 room drafts
   ↓
Human check
   ↓
Save final rooms
   ↓
Use in Yantra
```

This is an offline batch flow.

It is not a live flow for every learner run.

## The team flow

```text
Research finishes topic note
   ↓
Blueprint person turns it into schema
   ↓
Lead approves blueprint
   ↓
Generation person makes 5-10 rooms
   ↓
QA check against blueprint
   ↓
Final room pack saved
```

This order matters.

Do not skip steps.

## What each teammate does

### 1. Research person

This person studies one topic at a time.

They write simple notes like:

- what the topic means
- what it teaches
- what mistakes beginners make
- what kinds of tasks fit this topic
- what should not appear yet

Their output becomes the source for the blueprint.

### 2. Blueprint person

This person turns research into a structured blueprint.

They decide:

- learning goal
- allowed concepts
- banned concepts
- task types
- code shape
- success check type
- hint style
- generation rules

Their output becomes the exact schema we send to the LLM.

### 3. Generation + QA person

This person uses the approved blueprint to make room drafts.

They can use:

- Claude
- GPT
- research tools
- content scraping tools

But they must stay inside the blueprint rules.

They:

- generate 5-10 room drafts
- reject weak rooms
- reject duplicate rooms
- clean the final output
- save only approved room packs

## What the LLM does

The LLM is a helper.

It does **not** decide the course order.

It does **not** replace the blueprint.

It does **not** replace human review.

The LLM only helps with:

- making room drafts
- making variations
- writing challenge text in the correct shape

## Why we do not use live generation for every learner

If we generate live every time:

- quality changes too much
- cost goes up
- rate limits become a problem
- two learners may get very uneven room quality

So we do this instead:

1. generate room drafts in batches
2. review them
3. save good rooms
4. serve saved rooms in Yantra later

Plain meaning:

We make the room pack first.

Then learners use the saved room pack.

## Example: Variables topic

```text
Topic: Variables

Blueprint says:
- teach storing values
- allow only strings, numbers, print
- do not use loops yet
- common mistake: missing quotes

LLM then makes:
- Room 1: student name and age
- Room 2: shop bill total
- Room 3: weather summary
- Room 4: marks summary
- Room 5: travel ticket price
```

That means the blueprint controls the room family.

The LLM only makes safe variations inside that family.

## Example blueprint shape

This is a simple example.

It is not final code.

It is the kind of structure we want.

```json
{
  "topic": "variables",
  "level": "Beginner",
  "learningGoal": "Store values and use them in print statements.",
  "allowedConcepts": ["variables", "strings", "numbers", "print"],
  "bannedConcepts": ["loops", "lists", "functions"],
  "taskTypes": ["store-and-print", "simple-total", "one-line-summary"],
  "commonMistakes": [
    "missing quotes",
    "using a variable before assignment",
    "bad variable names"
  ],
  "starterCodeShape": "partial",
  "successCheckType": "stdout-match",
  "hintStyle": "short",
  "generationRules": {
    "minLines": 2,
    "maxLines": 8
  }
}
```

## Example room output shape

This is the kind of room draft we want back from the LLM.

```json
{
  "title": "Student Card",
  "task": "Store a student's name and age in variables and print one clean sentence.",
  "starterCode": "name = \"Asha\"\nage = 14\n# print one sentence here\n",
  "hint": "Use the 2 variables in one print statement.",
  "expectedOutputHint": "Asha is 14 years old."
}
```

## What good work looks like

Good research:

- simple
- topic-focused
- beginner-safe
- clear about common mistakes

Good blueprint:

- strict
- small in scope
- easy to test
- easy to send to an LLM

Good room pack:

- 5-10 rooms
- no repeats
- no mixed-level concepts
- no advanced Python slipping in
- clear learner wording

## What we must not do

- do not generate rooms before blueprint approval
- do not mix Beginner and Intermediate concepts
- do not let the LLM invent the curriculum order
- do not save unreviewed rooms as final
- do not change another person’s role area without asking
- do not call the LLM on every learner run
- do not build intermediate topics in this first wave

## Output of this first sprint

By the end of the first wave, we want:

- topic research notes for Beginner Python
- approved blueprints for Beginner Python topics
- at least one finished room pack for one locked topic
- a repeatable workflow the team can follow again and again

## Very short summary

```text
Topic = what we teach
Blueprint = rules for the room family
Schema = exact data shape
Room = one challenge
```

And the full idea is:

```text
Research first
Blueprint second
LLM generation third
Human review fourth
Saved room packs last
```
