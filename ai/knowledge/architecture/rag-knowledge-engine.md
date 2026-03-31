---
title: RAG Knowledge Engine
tags: rag, embeddings, retrieval, knowledge-base
---

# RAG Knowledge Engine

RAG is how Yantra knows the product, the curriculum, and the teaching approach without hallucinating those details. The PDFs make it clear that the knowledge base is not optional decoration. It is the core mechanism that turns a generic model into a Yantra-specific AI teacher.

The intended long-term flow is:

1. write structured markdown documents about Yantra and the curriculum
2. split those documents into retrieval-friendly chunks
3. embed each chunk into a vector representation
4. store and search those embeddings
5. inject the top matching chunks into the system prompt

In the current local implementation, the same idea already exists in simplified form:

- markdown files live under `ai/knowledge/`
- local embeddings are built with a retrieval-focused model
- a local vector index is generated for the chunks
- top results are returned with source references

The most important design rule is that the docs should be split by topic, not dumped into a single massive file. Retrieval works better when each file has a clear subject such as memory, quiz flow, student profile data, or Python room feedback.

Good knowledge docs for Yantra should usually include:

- what the feature is
- why it exists
- how it should behave
- what data it needs
- what is intentionally deferred

If retrieval quality is poor, the first place to improve is the document set and chunk quality, not the model prompt alone.
