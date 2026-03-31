---
title: Implementation Order And Cost Strategy
tags: implementation-order, cost, priorities, roadmap
---

# Implementation Order And Cost Strategy

The architecture plan includes a practical build order that keeps the path to a richer AI system manageable. The pattern is important:

1. establish retrieval and knowledge
2. improve the main chat loop
3. add routing and room-specific behavior
4. add skill tracking and quizzes
5. add broader product systems later

The reason this order works is that each later feature depends on the previous layer being trustworthy. There is little value in building quizzes, roadmap generation, or memory if the core answer loop is still vague and under-documented.

The plan also emphasizes low-cost architecture choices at early scale. That philosophy should survive even when implementation details change. The system should prefer:

- cheap retrieval over needless complexity
- simple routing before heavy agent frameworks
- focused room support instead of premature platform sprawl

For this repo, the current stage is still early in that sequence. The right next move is to enlarge the knowledge base and improve grounded terminal behavior, not to jump straight to every advanced subsystem in the final architecture.
