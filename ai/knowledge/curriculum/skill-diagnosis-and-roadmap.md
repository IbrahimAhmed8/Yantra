---
title: Skill Diagnosis And Adaptive Roadmap
tags: curriculum, skills, roadmap, mastery, adaptation
---

# Skill Diagnosis And Adaptive Roadmap

The build plan treats skill diagnosis as the personalization layer of Yantra. Chat alone is not enough. The system should eventually estimate what the student knows, what they struggle with, and what they should do next.

The intended ingredients are:

- quiz outcomes
- room performance
- skill mastery values
- prerequisite relationships between topics

That data should feed roadmap behavior such as:

- recommending the next room or topic
- unlocking later concepts only after enough mastery
- tailoring guidance to the learner's current path

The architecture also suggests a simple initial mastery formula that combines quiz performance and room challenge success. The precise numbers can change later, but the important idea is that roadmap decisions should be tied to evidence, not guesswork.

In the local-only implementation, this is still a future subsystem. However, the AI should already know that Yantra's roadmap is supposed to be adaptive rather than static. That is why this document belongs in the retrieval corpus now.
