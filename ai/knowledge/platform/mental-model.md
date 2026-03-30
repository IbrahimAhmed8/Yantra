---
title: Yantra Mental Model
tags: mental-model, architecture, briefing, context
---

# Yantra Mental Model

The build plan frames Yantra around a simple idea: every reply depends on how well the AI is briefed before it answers. A weakly briefed system behaves like a generic chatbot. A richly briefed system behaves like a teacher that already understands the platform and the learner.

The "briefing" for Yantra has several layers:

- current conversation messages
- retrieved knowledge chunks from the Yantra knowledge base
- student profile data such as name, level, goals, and progress
- intent detection that changes the mode of the answer
- later, memory from previous sessions and mastery data

This is the reason the architecture spends so much attention on RAG, prompt building, and memory. The model itself is only one part of the system. The quality of the answer depends on the quality of the surrounding context.

For the local-only version in this repo, the mental model should stay disciplined:

- the knowledge base is the source of truth for Yantra-specific behavior
- retrieval selects only the most relevant chunks
- the chat provider should answer from that context rather than freelancing
- if the docs do not cover something important, the right fix is to add docs, not just tweak prompting

This matters for future scaling too. When rooms, quizzes, skill graphs, and guidance engines are added, they should all feed more useful context into the same teaching loop rather than becoming disconnected mini-systems.
