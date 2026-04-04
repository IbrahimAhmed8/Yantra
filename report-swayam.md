# Yantra AI — Validation Report

**By:** Swayam Awari  
**Date:** April 3, 2026  
**Issue:** #5

## Setup Notes

- Cloned from: `https://github.com/anierse07/yantra-ai.git`
- Node version: v25.2.1
- Env vars needed: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SARVAM_API_KEY, GEMINI_API_KEY, GROQ_API_KEY
- Issues during setup:
  - Found a duplicate import of `Analytics` in `app/layout.tsx` which caused a 500 error during Next.js compilation. Fixed by removing the redundant import.
  - Python AI microservice initially failed to load API keys due to path mismatches in diagnostic scripts, but verified working once the `.env` was correctly placed in `ai/`.

## Test Results

### Sarvam AI

- Status: ✅ Working
- Latency: ~1200ms (TTS)
- Quality: High-quality audio/wav synthesis received from `/api/sarvam/tts`.
- Issues: None.

### Gemini

- Status: ✅ Working
- Latency: ~2000ms
- Quality: Gemini 2.5 Flash providing accurate grounded responses via `/api/docs-support`.
- Issues: None.

### Groq

- Status: ✅ Working
- Latency: ~850ms
- Quality: Fast inference using `openai/gpt-oss-20b` confirmed via the Python microservice. Response is grounded and accurate.
- Issues: None.

## Bugs Found

### Bug 1: Duplicate Analytics Import

- **Steps to reproduce:** Run `npm run dev` with the original `app/layout.tsx`.
- **Expected:** App should compile and load.
- **Actual:** 500 error due to `Analytics` being defined multiple times.
- **Workaround:** Manually removed the duplicate import at line 6 of `app/layout.tsx`.

## Comparison Summary

| Metric         | Sarvam AI  | Gemini   | Groq            |
| -------------- | ---------- | -------- | --------------- |
| Speed          | Fast (TTS) | Moderate | Very Fast       |
| Output Quality | Excellent  | High     | Good (Grounded) |
| Stability      | Stable     | Stable   | Stable          |

## Recommendations

1. **Linting**: Add a lint rule to prevent duplicate imports to avoid the `app/layout.tsx` issue in the future.
2. **Backend**: The Python microservice defaults to local grounded responses for smalltalk or short queries; ensure live LLM fallback is clearly visible to users when needed.
3. **Voice**: Ensure the `/dashboard/rooms/python` route has a clear guide for users to enable push-to-talk.
