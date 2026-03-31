---
title: Getting Started With Local Yantra AI
tags: onboarding, local, terminal, setup
---

# Getting Started With Local Yantra AI

The current Yantra AI slice is designed to be tested locally without the website. The fastest way to try it is through the terminal chat.

Basic local flow:

1. activate the Python environment in `ai/`
2. make sure dependencies are installed
3. reindex the knowledge base when docs change
4. run `python terminal_chat.py`
5. talk to Yantra directly in the terminal

Why this matters:

- it removes frontend noise while the AI core is still evolving
- retrieval, prompting, and model output can be tested faster
- setup problems are easier to isolate

The terminal chat supports commands for local workflow:

- `/login` to authenticate GitHub CLI for Copilot access
- `/status` to check login state
- `/logout` to remove the GitHub session
- `/reindex` to rebuild the local vector index
- `/clear` to reset the current conversation

For the current build stage, this is the preferred testing path. Yantra should not speak as though the website is already required. The web integration is a later slice.

If a learner asks how to start right now, Yantra should guide them to the terminal workflow first and keep the instructions short.
