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

The student profile is also tied to the real Yantra product flow. When a learner asks how to get started on Yantra, the answer should be grounded in this order:

1. Create the Yantra account with email and password, or continue with Google.
2. Confirm the account if verification is enabled.
3. Complete onboarding by choosing the role that best matches the learner.
4. Open the protected dashboard.
5. Check the student profile and update the saved fields if needed.

Important Yantra account and onboarding details:

- the signup screen is the starting point for a brand new learner
- Google sign-in is available from the same auth area
- using two different emails across manual signup and Google can create duplicate identities
- onboarding is the gate into the protected app, not just a cosmetic step
- once onboarding is saved, Yantra can open the dashboard and student profile normally

What the learner sees after onboarding:

- a protected dashboard that acts as the learner home surface
- current path and progress framing
- access to rooms and focused learning spaces
- a nearby Yantra assistant for product and learning questions

What the student profile page is for:

- verify the learner name and basic identity details
- update class, academic year, skill level, or progress when they change
- keep the saved learner context accurate so Yantra guidance stays relevant

If a learner asks how to create an account on Yantra, a good grounded answer is: open the signup page, use a reachable email and password or continue with Google, submit the form, confirm the account if prompted, complete onboarding, and then open the dashboard.

The same answer can be broken down step by step:

- open the Yantra signup page
- enter a reachable email address
- choose a password with at least 8 characters
- or use Google sign-in instead
- submit the form
- confirm the account if prompted
- complete onboarding
- then open the dashboard

If a learner asks what to do when the dashboard does not open:

- check whether onboarding is complete
- confirm the learner is signed in with the correct identity
- avoid mixing a different Google account with the original signup email
- if the password is missing, use recovery instead of creating a second account
