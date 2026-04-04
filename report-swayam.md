# Yantra AI — Validation Report

**By:** Swayam Awari
**Date:** April 2026
**Issue:** #5

## Setup Notes

- Node version: v25.2.1
- Python version: Python 3.12.6
- Issues during setup: Next.js dev server exited immediately on initial start. Resolved by re-running the test script alongside the Dev server. Python standard library `urllib` used instead of `requests` for robust web API checks.

## Test Results

### Groq

- Status: ✅ Working
- Model: openai/gpt-oss-20b
- Latency: ~2006ms
- Response quality: Grounded, formatted properly, fully answered the list comprehension question concisely without excessive jargon.
- Issues: None observed.

### Gemini

- Status: ✅ Working
- Model: gemini-2.5-flash
- Latency: ~1780ms
- Response quality: Detailed, grounded, accurately explained list comprehension with code examples.
- Issues: None observed.

### Sarvam AI (TTS)

- Status: ✅ Working
- Latency: ~2800ms
- Output: audio/wav confirmed
- Issues: Initial Localhost resolution quirks. Required explicit Dev server uptime during background API checking.

## Provider Ring Failover

- Groq → Gemini failover: ✅ Confirmed
- Attempts taken: 2
- Notes: Passed invalid key to Groq lane, forced switch to Gemini lane which successfully responded to the decorator prompt.

## Python Test Suite

- Total tests: 17
- Passed: 17
- Failed: 0
- Time: ~1.5s

## Bugs Found

### Bug 1: N/A

- Steps to reproduce: N/A
- Expected: N/A
- Actual: All tests pass natively.
- Workaround: N/A

## Comparison Summary

| Metric         | Groq      | Gemini    | Sarvam AI   |
| -------------- | --------- | --------- | ----------- |
| Speed          | Very Fast | Fast      | Moderate    |
| Output Quality | High      | Very High | N/A (Audio) |
| Stability      | Stable    | Stable    | Stable      |
| Free Tier      | Generous  | Generous  | Generous    |

## Recommendations

1. The Groq model is set to "openai/gpt-oss-20b" — verify this is an intentional alias and not a misconfiguration. Standard Groq models are llama3-70b-8192, mixtral-8x7b, etc.

## CLI Proof (paste actual terminal outputs here)

[Pytest Output]
========================================= test session starts =========================================
platform win32 -- Python 3.12.6, pytest-8.4.2, pluggy-1.6.0 -- D:\Yantra\ai\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: D:\Yantra\ai
plugins: anyio-4.13.0
collected 17 items

tests/test_chat.py::test_chat_returns_grounded_reply PASSED [ 5%]
...
st_terminal_chat.py::test_sanitize_for_console_replaces_unprintable_characters PASSED [100%]

[Groq Output]
--- GROQ TEST ---
Provider: groq
Lane: groq_primary
Model: openai/gpt-oss-20b
Latency: 2006ms
Response preview: ### What is a List Comprehension?
A **list comprehension** is a concise, expressive way to create a new list...

[Gemini Output]
--- GEMINI TEST ---
Provider: gemini
Lane: gemini_primary
Model: gemini-2.5-flash
Latency: 1780ms
Response preview: A list comprehension is...

[Sarvam Output]
--- SARVAM TTS TEST ---
Status: 200
Content-Type: audio/wav
Audio bytes received: 154245
Latency: 2854ms
