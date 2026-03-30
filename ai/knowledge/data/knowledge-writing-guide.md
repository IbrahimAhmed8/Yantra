---
title: Knowledge Base Writing Guide
tags: docs, knowledge-base, authoring, retrieval
---

# Knowledge Base Writing Guide

The quality of Yantra's retrieval depends directly on how the markdown corpus is written. A strong model cannot compensate for a weak or chaotic knowledge base.

Good Yantra knowledge docs should follow a few rules:

- one clear topic per file
- specific titles that match likely user questions
- short sections rather than huge walls of text
- product-specific language such as Void, roadmap, mastery, path, profile, and room
- explicit statements about what exists now versus what is planned later

A useful file usually covers:

- what the feature or concept is
- why it matters
- how it should behave
- what data it needs
- what the current implementation status is

This structure helps retrieval because a query can match the right section cleanly. It also helps the chat provider stay honest. If the knowledge base clearly distinguishes current behavior from future architecture, Yantra is less likely to answer as though unfinished systems already exist.

For this repo, the practical authoring strategy is:

- keep adding focused markdown docs under `ai/knowledge/`
- rebuild the local vector index after meaningful changes
- test retrieval with real questions in terminal chat
- add missing docs whenever Yantra gives a vague or generic answer

The knowledge base is not static documentation. It is part of the AI runtime.
