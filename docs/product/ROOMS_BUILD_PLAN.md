# Rooms Build Plan

This is the approved first build sequence for Yantra rooms.

The goal is not a broad room system yet. The goal is one working `Python Room` where:

- AI generates a challenge
- the student writes Python code
- the code runs in the browser
- AI gives teaching feedback
- progress is saved

If this loop works, it becomes the foundation for future rooms, voids, and classroom-style experiences.

## Core Goal

Build one real end-to-end Python practice experience inside Yantra.

After this 7-day sequence, the learner should be able to:

1. open Python Room
2. receive a challenge matched to their level
3. write Python code
4. run the code in-browser
5. receive AI feedback
6. save the session and reflect progress back into Yantra

## 7-Day Plan

### Day 1: Route + Shell

Create `/dashboard/rooms/python` with a split layout:

- left side: challenge description
- right side: Monaco Editor
- right side actions: `Run` button
- output panel below the editor

For Day 1:

- no AI yet
- hardcoded placeholder challenge text is fine
- fake output is fine

The purpose of Day 1 is to confirm the room layout works and feels like the start of a real product surface.

### Day 2: Python Execution

Wire in Pyodide so the `Run` button executes Python in the browser.

Expected result:

- student writes code
- student clicks `Run`
- real Python output appears in the output panel

No server is needed for this step.

This is the most important technical milestone because it proves the room is interactive, not just visual.

### Day 3: AI Challenge Generator

Add `POST /api/rooms/python/challenge`.

This route should:

- read the student skill level from the learner profile
- call Gemini
- return a structured challenge payload

Minimum challenge payload:

- `title`
- `description`
- `starterCode`
- `testCases`

At this point, the left panel should stop being hardcoded and begin showing real AI-generated challenge content.

### Day 4: AI Feedback Layer

After the student runs code, send this to Gemini:

- challenge
- student code
- output

Return teaching feedback, not only correctness.

The feedback should explain:

- what worked
- what did not work
- why
- what to try next

The product goal here is mentor-style feedback, not a bare pass/fail checker.

### Day 5: Progress Saving

Add a `room_sessions` table in Supabase.

Save each attempt with:

- challenge
- code written
- output
- feedback received
- timestamp

Also update the learner’s Python skill progress after completion so the room connects back into Yantra instead of feeling isolated.

### Day 6: Dashboard Integration

Connect the Python Room back into the dashboard.

Expected outcomes:

- the Python Room card links to the real room
- the dashboard can show a `last session` indicator
- the room starts feeling like a connected part of Yantra, not a disconnected prototype page

### Day 7: Polish + Test

Run through the complete learner flow as a new student.

Focus on:

- broken states
- bad code input
- Pyodide loading speed
- AI response quality
- UI rough edges

The goal is a stable first room experience, not feature expansion.

## What We Should Have After This

After this sequence, Yantra should have one real learning loop:

- dashboard entry
- Python challenge generation
- in-browser Python execution
- AI teaching feedback
- saved room session history

That becomes the foundation for:

- more rooms
- a larger room system
- future voids
- smartboard or classroom mode

## Guardrails

While building this plan:

- do not hardcode dozens of rooms
- do not build a generic multi-room engine first
- do not build broad AI features without a working room loop
- do not over-expand the scope before Python Room works end to end

The priority is depth over breadth.

## Current Status

- This plan is saved as the active reference.
- The dedicated room runtime was removed earlier.
- The dashboard still contains mock room UI cards.
- Day 1 shell is implemented at `/dashboard/rooms/python`.
- Day 2 browser execution is implemented with Pyodide inside the same room.
- The room now performs error-only verification on `Run Python`: runtime errors are highlighted in the editor and routed to Yantra for one short hint-oriented reply.
- Successful runs stay silent from the AI layer to avoid unnecessary model spend.
- Dashboard integration is still deferred until Day 6.

When room work continues, begin with Day 3 from this file.
