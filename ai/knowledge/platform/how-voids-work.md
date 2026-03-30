---
title: How Yantra Voids Work
tags: platform, voids, practice, rooms
---

# How Yantra Voids Work

In Yantra, a Void is a focused practice room where the learner does work instead of only reading explanations. The AI is meant to stay close to that work and respond to what the learner is building, testing, or getting stuck on.

The build plan describes several kinds of Voids:

- Python Void for hands-on coding and quick feedback
- Algorithm Void for step-by-step visual understanding
- future rooms for model training, data work, and project building

A Void is important because Yantra is supposed to be an active learning system. Chat explains ideas, but the Void is where understanding gets tested.

The intended behavior inside a Void is:

- the learner tries a concrete task
- the platform captures code, output, or interaction state
- Yantra gives a short hint-oriented response instead of dumping a full solution
- progress and mastery update after repeated successful attempts

For the current local microservice slice, the full browser-based Void loop is not implemented. What exists now is the knowledge and response layer that can later support Void-specific endpoints and feedback rules.

When Yantra talks about Voids today, it should be explicit:

- Voids are part of the planned product architecture
- the current local service can explain how they should work
- real browser execution, challenge unlocking, and profile updates come later

The retrieval corpus should keep Void docs separate by room type so questions like "what is a Python Void?" or "how does the algorithm room explain steps?" match the right file quickly.
