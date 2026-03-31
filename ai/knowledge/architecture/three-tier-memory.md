---
title: Three Tier Memory System
tags: memory, working-memory, episodic-memory, semantic-memory
---

# Three Tier Memory System

The build plan describes three distinct kinds of memory for Yantra. They solve different problems and should not be mixed together.

## Working Memory

Working memory is the recent chat window. It keeps the current conversation coherent so Yantra can refer to what was just said. In an early implementation, this can be a rolling message window.

## Episodic Memory

Episodic memory stores a short summary of what happened in a session: topics covered, mistakes made, and progress achieved. The goal is not full transcript replay. The goal is to let Yantra remember the story of the student's learning journey.

## Semantic Memory

Semantic memory stores what the student appears to know or not know. In the plan, this becomes a skill graph or mastery table that updates after quizzes and room activity.

These memory tiers matter because they support different teaching behaviors:

- working memory supports conversational continuity
- episodic memory supports long-term relationship and recap
- semantic memory supports adaptive roadmap and next-step suggestions

The current local-only service does not implement memory yet. That is deliberate. But the knowledge base needs this doc now so the AI can still explain the intended system architecture accurately when asked.
