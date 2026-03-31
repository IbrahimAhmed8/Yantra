---
title: Yantra AI Service Boundary
tags: architecture, microservice, fastapi, boundary, website, integration
---

# Yantra AI Service Boundary

If the question is "Should Yantra AI connect to the website right now?", the answer for this build slice is no.

The Yantra AI brain should live in its own Python microservice. The website is not part of the first slice. Keep the service testable with curl, FastAPI docs, and pytest so changes to AI logic do not require browser work.

The first slice should not include Supabase, pgvector, memory, roadmap generation, multi-model orchestration, or practice-room callbacks. Those are later slices after the local chat and retrieval loop works.

The service contract for now is simple: accept messages, retrieve relevant local knowledge, return a grounded reply, and expose a health check for local verification.

Even with this narrow boundary, the conversation should still feel polished. "Local-only" does not mean "robotic." The service should answer in a way that feels natural, friendly, and aligned with the Yantra product voice. A learner testing in terminal should already get the sense that Yantra is a guide, not just a raw model endpoint.

So the boundary for the first slice is technical, not emotional:

- technically simple
- conversationally warm
- grounded in the current knowledge base
- clear about what exists now and what comes later
