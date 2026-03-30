---
title: Deployment And Future Web Integration
tags: deployment, integration, web, future
---

# Deployment And Future Web Integration

The Python service PDF assumes a future where the web app and the AI service are deployed separately and talk over HTTP. That separation is useful even if everything lives in one repo.

The intended split is:

- web app for UI, sessions, and page context
- Python AI service for retrieval, prompt building, and model calls

This separation creates a few benefits:

- easier local testing
- cleaner AI-focused code organization
- the ability to serve future clients beyond the website

The current repo is not at the integration step yet. The Python AI service is still a local development surface. But the docs should preserve the future contract:

- the web app sends messages and student context
- the AI service retrieves Yantra docs and generates the response
- the web app renders the reply and room-specific actions

This document matters because the knowledge base should help Yantra explain what is live today versus what is planned for the next integration phase.
