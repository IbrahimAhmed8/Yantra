---
title: Tool Suite And Invocation Logic
tags: tools, diagrams, intent, invocations
---

# Tool Suite And Invocation Logic

In the architecture plan, Yantra is not limited to plain chat text. It is eventually meant to invoke supporting tools when that helps teaching. The key design choice is that the student should not need to manually select tools. Yantra should decide when a tool would help.

Examples from the build plan include:

- diagrams or visuals for conceptual explanations
- stats or code inspection support
- room-specific helpers
- roadmap and skill update actions

The planned control mechanism is lightweight intent detection rather than a heavy agent framework. That keeps the system cheaper, simpler, and easier to reason about.

For the current repo, most of the tool suite is still conceptual. The local terminal and FastAPI chat loops do not yet invoke diagrams, room runners, or grading helpers. But this doc is important because it preserves the architecture rule:

- tools should support the teaching loop
- tool use should be contextual
- tool selection should be constrained and explainable
- the student should feel guided rather than burdened by system complexity

Future implementation should add tools only when the corresponding workflow is already clear in the product. Tooling should not outrun the actual learning experience.
