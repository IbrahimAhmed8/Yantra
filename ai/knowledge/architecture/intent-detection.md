---
title: Intent Detection Without Heavy Agents
tags: intent, routing, prompts, lightweight-agents
---

# Intent Detection Without Heavy Agents

The PDFs explicitly argue against starting with a complex agent framework. The intended first approach is lightweight intent detection that classifies the user's message into a small set of modes before the model call.

The main intent categories are:

- teach
- debug
- quiz
- guidance
- build
- general

Each intent changes the behavior of the response. For example:

- teach should explain simply first, then deepen
- debug should ask for code and error details, then guide step by step
- quiz should present questions one at a time
- guidance should recommend the next skill or room
- build should move in small implementation steps

This matters because Yantra is not supposed to answer every message in the same tone. A learner asking "what is gradient descent?" should get a different interaction than someone asking "my Python code throws an exception."

The local service already follows this pattern in a basic way. Intent detection feeds into the system prompt and response style. That means expanding the knowledge base with intent-specific docs will improve behavior even before more advanced orchestration is added.
