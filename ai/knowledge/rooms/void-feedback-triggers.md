---
title: Void Feedback Triggers
tags: rooms, void, feedback, triggers
---

# Void Feedback Triggers

The build plan describes Void feedback as event-driven. The AI should not wait for a long essay request every time. It should respond to the learner's actual state in the room.

Important triggers for future Void behavior:

- a code run produces an error
- a code run produces the correct output
- the learner appears stuck for a while
- a useful pattern appears in the learner's work
- a challenge is completed

Expected response style by trigger:

- error: diagnose the likely cause and give one fix hint
- success: explain what worked and suggest one improvement
- stuck: offer a nudge rather than a full solution
- pattern recognised: reinforce the useful technique
- challenge completed: celebrate and point to the next step

The design principle is short, high-signal feedback. Void responses should usually be much shorter than teaching chat responses because the learner is in the middle of doing something.

For the current local microservice, these triggers are still planned behavior, not a fully live room system. The knowledge doc exists so Yantra can explain how the room loop should behave and so future endpoints have a clear teaching contract.
