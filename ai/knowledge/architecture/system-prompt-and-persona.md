---
title: System Prompt And Persona
tags: prompt, persona, teaching, system
---

# System Prompt And Persona

The architecture plan treats the system prompt as a dynamic briefing, not a static identity paragraph. Every call should include enough product and learner context that Yantra can answer like a teacher embedded in the platform.

The system prompt needs at least these ingredients:

- Yantra's role and teaching personality
- student profile information such as name, level, path, and goals
- retrieved knowledge from the knowledge base
- current page or room context when available
- an intent-specific instruction block

The persona rules are especially important because they affect answer style across every feature:

- be patient and specific
- explain simply before going deeper
- use concrete examples
- give hints instead of full solutions when the student is stuck
- avoid "as an AI" framing
- tie advice back to the student's current path

This repo already implements a smaller version of that idea. The local service builds a system prompt from student data, detected intent, and retrieved docs before handing the request to the chat provider.

The reason this doc matters is that future changes should not reduce Yantra to a generic assistant prompt. The persona is not cosmetic. It is part of the product behavior and should remain consistent across chat, rooms, quizzes, and guidance.
