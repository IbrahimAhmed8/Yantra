---
title: Student Context Data Flow
tags: data, student-profile, context, prompts
---

# Student Context Data Flow

Yantra is meant to answer with awareness of the learner, not as an anonymous assistant. That means student context should flow into the AI layer as structured data rather than being inferred from a single chat message.

The build plans call out a few especially important fields:

- student name
- skill level
- current path
- progress percentage
- learning goals
- current page or room

That data affects both tone and content. A beginner on the AI Foundations path should get different wording and next steps than an advanced learner deep into model-building topics.

In the local terminal and FastAPI versions, student context is already part of the request shape. That means knowledge docs and prompts can refer to it explicitly even before persistent profile storage is added to the Python service.

This document exists to reinforce a design rule: if a future answer should depend on learner state, that state should be passed in clearly rather than hidden in loose text. Structured student context keeps Yantra easier to test, easier to debug, and more faithful to the product vision.
