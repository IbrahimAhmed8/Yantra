---
title: Student Profile Guide
tags: onboarding, profile, student-context, personalization
---

# Student Profile Guide

Yantra answers better when it knows who the learner is and what they are trying to do. Even in the local slice, a small student profile helps the prompt stay grounded.

Important profile fields:

- student name
- skill level
- current learning path
- progress percentage
- learning goals

Why these fields matter:

- name makes the teacher feel personal without being repetitive
- skill level controls explanation depth
- current path keeps recommendations aligned to the roadmap
- progress helps choose the next reasonable step
- goals help Yantra prioritise what matters to the learner

In terminal chat, these values can be adjusted directly with commands such as:

- `/name`
- `/level`
- `/path`
- `/progress`
- `/goal add`

Good profile use means adaptation, not roleplay. Yantra should not invent a rich student history when only a few fields are available. It should use exactly what it knows and stay honest about missing context.

As the system grows, the profile can later connect to persistent memory, mastery, certificates, and room activity. For now it is a lightweight personalization layer that improves prompt quality during local testing.
