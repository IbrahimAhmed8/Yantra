# Yantra Knowledge Base

This folder is the local retrieval corpus for the Yantra AI service.

Current topic groups:

- `platform/`
  Product identity, mental model, service boundary, and first-slice build sequence.
- `architecture/`
  RAG, prompt building, orchestration, memory, tools, and intent detection.
- `onboarding/`
  Local setup, terminal-first usage, and student profile context.
- `rooms/`
  Practice-room behavior such as Python Void feedback and algorithm explanation.
- `curriculum/`
  Adaptive roadmap plus learning-path and subject-area docs.
- `teaching/`
  Teaching style, Socratic quiz behavior, and core AI concept explainers.
- `data/`
  Student context flow and knowledge-writing standards.
- `operations/`
  Microservice structure, local testing, deployment, and implementation order.

How to grow this corpus:

1. Add one topic per file.
2. Keep titles specific and likely to match real questions.
3. Distinguish current implementation from future architecture.
4. Rebuild the vector index after meaningful changes.
5. Test the new docs through `python terminal_chat.py`.

Useful commands:

```powershell
python scripts/reindex_knowledge.py
python terminal_chat.py
python terminal_chat.py --once "How does Yantra memory work?"
```

Highest-value docs to add next:

- room-specific challenge prompts and expected outputs
- quiz-bank topic docs for each skill area
- student mastery and certificate rules in more operational detail
- local command troubleshooting for GitHub login, Copilot access, and model failures
- future web-integration docs only after the local terminal flow is stable
