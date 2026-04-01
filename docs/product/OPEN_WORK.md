# Open Work

## Highest-Priority Product And Engineering Work

### Foundation hardening

- add broader tests for auth redirects, onboarding writes, profile reads and writes, dashboard seeding, chat routes, and docs-support routes
- add monitoring and error reporting for auth, chat, room feedback, and docs support
- harden deployment checks and post-deploy smoke validation
- align `supabase/schema.sql` with the dashboard loader's `student_practice_rooms` expectation

### Dashboard intelligence

- replace seeded dashboard copy with real learner-adaptive state
- connect progress, milestones, and recommendations to meaningful persistent learner activity
- define room unlock and recommendation logic
- replace demo curriculum and performance sections with real models

### Yantra chat and Support Desk

- pass richer learner context into Yantra prompts
- decide on streaming versus non-streaming responses
- add operational visibility for chat and docs-support failures
- decide whether Support Desk should stay ephemeral or gain persistence and escalation paths

### Access and support operations

- build an internal review workflow for `access_requests`
- define support analytics or ticket handoff if docs support becomes a core channel
- add clearer admissions or partner triage tooling

### Practice rooms

- deepen the live Python Room beyond runtime-error-only feedback
- add correctness checking for successful-but-wrong output
- design and build additional room surfaces beyond Python
- create a shared evaluation and feedback framework

### Institution and outcome layers

- teacher dashboard
- class analytics
- classroom mode or smartboard behavior
- certification workflows
- portfolio and hiring signals

## Current Product Gaps

- onboarding exists, but it is still a lean first-pass experience
- the dashboard persists starter data, but it is not truly adaptive yet
- the access pipeline persists requests, but no one can review them inside the product
- docs support exists, but it is still a docs-grounded support layer rather than a full customer-support system
- only the Python Room is a real dedicated room route today

## Current Engineering Gaps

- automated coverage exists, but it is still narrow
- no analytics or observability layer
- no internal access-request operations UI
- no content-management workflow for docs or marketing content
- no richer learner-memory or support-escalation system
- `supabase/schema.sql` still does not create `student_practice_rooms`

## Existing Automated Coverage

The repo is not test-free anymore. Current coverage includes:

- `app/api/rooms/python/feedback/route.test.ts`
- `src/features/rooms/__tests__/pyodide-runtime.test.ts`
- the Python service test suite under `ai/tests/`

The gap is breadth, not total absence.

## Cleanup Work That Needs Approval

These are intentionally not executed yet:

- deleting root-level local artifacts such as `dist/` or `node_modules_broken/`
- moving or removing reference assets under `docs/reference/`
- large-scale file-organization cleanup that is unrelated to runtime behavior
