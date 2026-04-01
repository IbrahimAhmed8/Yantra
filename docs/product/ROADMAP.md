# Roadmap

## Current Phase

Yantra has moved out of the "shell only" stage. The repo now sits between foundation hardening and deeper product execution.

What already exists:

- branded public landing page
- login, signup, onboarding, password reset, and Google sign-in flows
- public docs/help center with article pages
- a separate Support Desk assistant for docs and troubleshooting
- Supabase-backed protected learner routes
- persisted learner profiles
- persisted public access requests
- persisted starter dashboard data
- main Yantra chat routed to the Python AI service first, with authenticated history restore
- docs support that remains Gemini-only through `/api/docs-support`
- a live Python Room at `/dashboard/rooms/python`
- Python Room runtime-error feedback that targets the Python AI service first and can fall back to Gemini
- Sarvam-backed room voice handled through Next.js server routes

What is still incomplete:

- real adaptive learning state
- a dynamic roadmap engine
- broader practice-room coverage beyond the Python Room
- richer evaluation logic for successful room submissions
- analytics and observability
- internal support and access-request operations
- teacher and institution workflows

## Practical Roadmap

### Phase 1: Foundation Layer

Status: largely shipped

What this phase delivered:

- auth foundation
- onboarding foundation
- profile persistence
- starter dashboard persistence
- access-request persistence
- main Yantra chat
- docs/help center and Support Desk
- deployment-ready Next.js + Supabase setup
- initial Python AI service integration
- initial Python Room with voice assistance

### Phase 2: Make The Learner Surface Truly Data-Driven

Goal: replace seeded dashboard behavior with real learner state.

Priority items:

- typed learner dashboard data model
- dynamic progress and milestone data
- recommendation logic tied to learner activity
- curriculum state tied to profile and onboarding context
- room unlock logic
- schema alignment for persisted room rows

### Phase 3: Deepen AI Continuity And Support

Goal: make both assistants more useful and more operationally trustworthy.

Priority items:

- richer learner context for Yantra
- observability for Yantra and Support Desk
- decide on streaming
- decide whether Support Desk needs persistence, escalation, or handoff
- improve docs retrieval once the knowledge base grows
- harden Python-service-first chat and room-feedback operations

### Phase 4: Expand Practice Rooms

Goal: make Yantra hands-on instead of mostly explanatory.

Priority items:

- deepen the live Python Room
- neural-network builder
- dataset explorer
- prompt lab
- shared evaluation and feedback loops

### Phase 5: Expand Into Institutional And Outcome Layers

Goal: turn the learner product into a broader platform.

Priority items:

- teacher dashboard
- class analytics
- classroom and smartboard behaviors
- certifications
- portfolio and employer-facing signals

## Rule For Contributors

Before starting a feature, be explicit about whether it:

- hardens the current foundation
- makes existing learner surfaces truly data-driven
- deepens support and AI continuity
- expands the live room system
- adds new product surface area

That distinction matters because the repo already has a real auth/profile/docs/chat base and one real room surface. Work that ignores those shipped layers will usually create churn.
