---
title: Algorithm Void Step Explainer
tags: rooms, algorithm, explainer, visual, void
---

# Algorithm Void Step Explainer

The architecture plan includes an Algorithm Void where Yantra explains a process step by step instead of only talking abstractly about it. The point is to help a student see an algorithm unfold rather than memorizing a definition.

The core behavior is:

- show the current step of the algorithm
- explain what changed
- connect the step to the overall goal
- keep the explanation brief enough to follow in motion

This room type matters because some concepts are much easier to learn through a sequence than through plain chat. Sorting, graph traversal, dynamic programming, and recursion are good examples.

Compared with the Python Void:

- Python Void feedback is about code and errors
- Algorithm Void explanation is about state transitions and reasoning

The room should therefore guide attention differently. It should answer questions like:

- what happened in this step
- why the next move follows
- what invariant the algorithm is maintaining

Even before the room exists in code, the knowledge base should define this behavior so Yantra can accurately explain the product roadmap and intended teaching experience.
