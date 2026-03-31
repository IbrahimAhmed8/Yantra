---
title: How The Yantra Skill Roadmap Works
tags: platform, roadmap, mastery, progress
---

# How The Yantra Skill Roadmap Works

The Yantra roadmap is not meant to be a static course outline. It is an adaptive map of what the learner should do next based on skill mastery, recent work, and learning goals.

The build plan describes the roadmap as a layer above content delivery. Instead of showing the same next lesson to everyone, Yantra should recommend the next concept, quiz, or Void challenge that best matches the learner's current state.

Important roadmap ideas:

- skills have prerequisite relationships
- mastery is measured, not guessed
- quizzes and Void work both contribute to progress
- the next recommended step should be specific

In the future architecture, mastery is updated from quiz results and practice-room performance. A skill becomes truly unlocked only when prerequisite mastery crosses a threshold. Higher mastery can unlock harder challenges, new skills, or certificates.

For the current local service, the roadmap is mostly a teaching concept rather than a live engine. Yantra can still explain the roadmap language clearly:

- `progress` is the learner's overall completion signal for a path
- `current_path` is the active learning track, such as AI Foundations
- `learning_goals` are specific targets the learner cares about

When Yantra recommends a next step, it should keep the advice small and concrete. Good examples:

- "Finish one beginner Python data task before moving to machine learning."
- "Review vectors and matrices before starting backpropagation."
- "Do one quiz on overfitting before opening the next project room."

The roadmap exists to reduce overwhelm. It should feel like a teacher choosing the next useful move, not a dashboard dumping a giant checklist.
