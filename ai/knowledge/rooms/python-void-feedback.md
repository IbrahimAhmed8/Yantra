---
title: Python Void Feedback Flow
tags: rooms, python, feedback, void, practice
---

# Python Void Feedback Flow

The Python Void is a practice-room concept from the architecture plan. Its purpose is not just to run code. It is to give immediate teaching feedback while the student is actively practicing.

The target interaction loop is:

1. student writes or edits code
2. code runs inside the room
3. Yantra inspects code, output, and any error
4. Yantra returns a short hint-oriented response
5. progress can unlock the next challenge

The intended feedback style is tightly constrained:

- keep it short
- say what worked
- identify the likely issue when there is an error
- give a hint, not the full answer
- keep the student moving

This is different from ordinary chat. Room feedback is higher frequency and should be more operational. The student is in the middle of doing something, so the AI should prioritize diagnosis and the next corrective action over long explanation.

The current local service does not implement the room route yet, but this document gives the AI product-specific understanding of what a Python Void is and how feedback inside it should behave.
