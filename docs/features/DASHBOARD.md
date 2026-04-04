# Dashboard

## Routes And Ownership

- `/dashboard`
- `/dashboard/student-profile`
- `/dashboard/rooms/python`
- dashboard entry: `app/dashboard/page.tsx`
- dashboard implementation: `src/features/dashboard/StudentDashboard.tsx`
- dashboard data loader: `src/lib/supabase/dashboard.ts`
- student profile entry: `app/dashboard/student-profile/page.tsx`
- student profile implementation: `src/features/dashboard/StudentProfilePage.tsx`
- Python Room entry: `app/dashboard/rooms/python/page.tsx`
- Python Room implementation: `src/features/rooms/PythonRoomShell.tsx`

## Route Protection

All three routes are protected server-side.

Each route:

- checks whether Supabase env vars are configured
- reads the authenticated learner through `requireAuthenticatedProfile()`
- redirects unauthenticated requests to `/login`

Important nuance:

- the route-guard helper supports onboarding enforcement
- the current dashboard, profile, and Python Room routes do not require onboarding completion before render
- new accounts still reach onboarding first through the signup flow, but auth is the actual route gate today

## `/dashboard`

### Purpose

The main dashboard is the protected learner home surface. It mixes real identity and persisted starter dashboard data with polished UI shells for future product layers.

### What is dynamic today

- learner full name
- learner first name
- learner email
- learner profile-derived role and onboarding context
- dashboard path row from `student_dashboard_paths`
- skill cards from `student_skill_progress`
- curriculum nodes from `student_curriculum_nodes`
- weekly momentum bars from `student_weekly_activity`

### Starter-data behavior

`src/lib/supabase/dashboard.ts` now does more than just return hardcoded UI data.

It:

1. loads the authenticated learner
2. queries the dashboard tables
3. seeds starter rows when data is missing
4. falls back to a local starter dashboard shape when the dashboard schema or RLS is missing

That means the dashboard state is persisted, but it is still starter content rather than a real adaptive learner engine.

### Room-table mismatch

The loader expects:

- `student_dashboard_paths`
- `student_skill_progress`
- `student_curriculum_nodes`
- `student_practice_rooms`
- `student_weekly_activity`

Dashboard room persistence now ships in the checked-in schema:

- `supabase/schema.sql` creates `student_practice_rooms` with the row shape expected by the loader
- if a Supabase project predates this change, re-run `supabase/schema.sql` so room rows persist instead of falling back to starter data

### What is still static or seeded today

- AI quick prompts are product copy, not dynamic recommendations
- unlock logic is still starter logic
- next-action intelligence is still seeded
- there is no analytics or event pipeline
- most room cards outside Python remain preview surfaces

### Embedded behavior

- the main AI panel opens the shared Yantra chat modal
- the header includes a docs entry point
- same-page section links intentionally bypass the global route-transition loader
- the Python Room card can route into the live room surface

## `/dashboard/student-profile`

### Purpose

This is the most direct persisted dashboard surface in the current product. It lets the authenticated learner review and update their profile record while still exposing surrounding dashboard-style panels.

### Current profile fields

- `name`
- `classDesignation`
- `skillLevel`
- `progress`
- `academicYear`
- `userRole`
- `ageRange`
- `primaryLearningGoals`
- `learningPace`
- `onboardingCompleted`
- `onboardingCompletedAt`

### Persistence behavior

- the server seeds a default profile row on first access if one does not exist
- the page saves changes through `PUT /api/profile`
- the payload is validated with `normalizeStudentProfileInput()`
- stored values are sanitized before upsert

### Supporting UI

The page also includes:

- overview, roster, curriculum, and performance sections
- docs and logout shortcuts in the side support area
- updates and settings panels
- a direct sign-out path through `/auth/signout`

Only the profile record is genuinely user-edited today. The surrounding roster, curriculum, notifications, and performance content remains demo or seeded product copy.

## `/dashboard/rooms/python`

### Purpose

This is the first real dedicated room route in the product.

### Live behavior today

- protected route behind auth
- in-browser Python execution through Pyodide
- runtime-error line highlighting
- runtime-error-only feedback through `POST /api/rooms/python/feedback`
- Python-service-first room feedback with Gemini fallback
- room-only push-to-talk voice assistant using `/api/sarvam/stt`, `/api/chat`, and `/api/sarvam/tts`

### Current limits

- only runtime errors trigger AI feedback
- successful-but-wrong output is not evaluated yet
- the first runtime warmup can take a few seconds

## Current Strengths

- protected routes are real
- learner identity and profile are backed by Supabase
- the dashboard has a persisted starter-data layer instead of only local arrays
- the profile screen exposes a genuine save path
- the Python Room is a real dedicated room route
- dashboard, profile, and room surfaces share a consistent visual system

## Current Limitations

- only the Python Room is a real dedicated room route today
- most other room cards are still preview or prompt-launch surfaces
- dashboard persistence is starter-state persistence, not adaptive personalization
- no real curriculum or recommendation engine
- no analytics or event tracking
- no tests around protected-route, dashboard-seed, or profile-save behavior

## Existing Automated Coverage

Current relevant tests include:

- `app/api/rooms/python/feedback/route.test.ts`
- `src/features/rooms/__tests__/pyodide-runtime.test.ts`
- the Python service suite in `ai/tests/`

There is still no broad dashboard-route or profile-save test coverage.

## Recommended Next Work

- replace seeded dashboard copy with real learner-adaptive state
- add tests for `/api/profile`, dashboard seeding, and route protection
- deepen Python Room evaluation beyond runtime errors
- design additional real room routes before treating the wider room grid as shipped
