# Tobe Brief

## What this job is

You are doing the backend and database part.

Repo note:

- repo: `akyourowngames/Yantra`
- default branch: `main`
- open PRs found during check: none
- open issues found during check: none

Your job is to:

- add new Supabase tables
- build new API routes
- extend the profile API so it also returns mastery data

This job does not include AI work.

Do not work on chat model code.

## Why this matters

Your work goes first.

The new tables are needed before other work can move.

Rishi needs these tables for:

- the certificate page
- the portfolio page

This means your database work is the first blocker.

## What already exists in the repo

These things already work:

- Supabase auth
- student profile save and load
- dashboard data load
- onboarding
- Python room

These files already exist:

- `supabase/schema.sql`
- `app/api/profile/route.ts`
- `src/lib/supabase/`

The app already knows how to:

- read the logged-in user
- use Supabase on the server
- return JSON from route files

So you are not starting from zero.

## Do this first

Do these in order:

1. Add the new SQL tables first.
2. Build the backend routes after the tables exist.
3. Extend `GET /api/profile` last so it also returns mastery rows.

Do not start with frontend pages.

Do not start with PDF UI.

Database first.

## Step-by-step work

### Phase 1: Add the database tables

Open `supabase/schema.sql`.

Add the new tables from the task:

- `student_skill_mastery`
- `student_void_sessions`
- `student_quiz_results`
- `yantra_challenges`
- `yantra_quiz_bank`
- `student_certificates`

Make the schema feel like the rest of the repo:

- use `user_id` with Supabase auth users where needed
- keep timestamps clear
- keep names simple

Also think about:

- primary keys
- foreign keys
- basic checks like difficulty `1-5`
- row access rules if the table needs user-based reads

Do not change old tables unless needed for this task.

### Phase 2: Build the mastery update route

Create a new route:

- `app/api/skill/update/route.ts`

This route should:

- accept quiz and void progress data
- calculate mastery with this rule:

`(quizzes_passed × 0.4) + (void_challenges_passed × 0.6)`

- cap the final result at `100`
- upsert into `student_skill_mastery`

Plain meaning:

- quiz progress counts
- void progress counts more
- mastery can never go above 100%

### Phase 3: Build the quiz grading route

Create a new route:

- `app/api/quiz/grade/route.ts`

This route should:

- take quiz answers from the request
- compare them to `yantra_quiz_bank`
- return:
  - score
  - wrong answer explanations
- save the quiz result
- call the mastery update flow after grading

Keep this route backend-only.

Do not put AI logic here.

This is just answer checking and saving data.

### Phase 4: Build the certificate PDF route

Create a new route:

- `app/api/certificate/[id]/pdf/route.ts`

This route should:

- load the certificate by id
- create a PDF
- return the PDF file

Use the rule from the task for the verification hash:

`SHA-256(user_id + skill_key + issued_at)`

The product plan says ReportLab is already part of the planned stack.

If you need a helper, keep it small and backend-only.

Possible helper location:

- `src/lib/supabase/`
- or a small new server helper file near the route

### Phase 5: Extend the profile API

Open:

- `app/api/profile/route.ts`

The `GET` route already returns profile data.

Extend it so it also returns the logged-in user’s rows from:

- `student_skill_mastery`

Do not break the current profile response.

Add mastery data beside the current profile payload.

Keep old fields working.

## Files you will probably touch

- `supabase/schema.sql`
- `app/api/profile/route.ts`
- `app/api/skill/update/route.ts` new
- `app/api/quiz/grade/route.ts` new
- `app/api/certificate/[id]/pdf/route.ts` new
- `src/lib/supabase/` helpers if needed

## Files you must not touch

Do not touch these unless Krish says yes:

- `app/api/chat/route.ts`
- anything in `src/features/chat/`
- `src/lib/supabase/profiles.ts`

Also do not add LLM code.

This job is database and route logic only.

## How to know you are done

You are done when:

- all 6 new tables are in the SQL file
- the new routes exist
- mastery is calculated and saved
- quiz grading returns score and explanations
- certificate PDF route works
- `GET /api/profile` also returns mastery rows
- nothing in chat or LLM code was changed by you

## What to post in #deployments

Post these things:

- which branch you used
- that the SQL migration is ready
- what new routes you added
- test proof or sample route responses
- the Vercel preview URL for your branch or PR

If the PDF route works, say that too.

## Good branch name examples

- `feat/supabase-mastery`
- `feat/quiz-grade-route`
- `feat/certificate-pdf`
- `feat/profile-mastery-api`

## Shared rules

- Tobe’s database work lands first.
- Rishi depends on your tables.
- All PRs go to Krish for review.
- Do not touch protected AI-core files without asking.
- Use clean branch names.
- Post your preview URL in `#deployments`.
