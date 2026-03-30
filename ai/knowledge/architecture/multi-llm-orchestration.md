---
title: Multi Model Orchestration
tags: orchestration, models, routing, cost
---

# Multi Model Orchestration

The architecture PDF does not assume one model should do every task. It treats model selection as a routing problem: use the right model for the right job based on speed, complexity, and cost.

The intended task split looks like this:

- fast and cheap model for ordinary chat questions
- stronger reasoning model for deep explanations and complex planning
- low-latency model for practice-room feedback
- fallback model when the first choice fails

The benefit is not just lower cost. Different Yantra interactions have very different needs. A quick teaching hint inside a room should return fast. A difficult conceptual explanation can tolerate more latency if the answer quality is higher.

For the current repo, orchestration is deliberately deferred. The local service uses one chat provider and one embedding provider so the system stays debuggable. But the docs should already preserve the target architecture:

- a model router should inspect the incoming request
- complexity can be estimated cheaply before making a model call
- route choice should be visible in logs and responses
- fallback behavior should be explicit rather than silent

This doc exists so future work does not accidentally collapse Yantra back into a single-model design. Even if the first implementation is simple, the architecture should leave room for routing by task type.
