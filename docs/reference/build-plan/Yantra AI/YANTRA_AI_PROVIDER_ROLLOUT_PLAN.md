# Yantra AI Provider Rollout Plan

Date: March 30, 2026

This plan replaces the earlier idea of deploying GitHub Copilot CLI for public traffic. It also updates the local embedding default from `nomic-ai/nomic-embed-text-v1.5` to `sentence-transformers/all-MiniLM-L6-v2`.

## Executive Decision

Use a bounded provider ring, not an unbounded infinite retry.

Requested target order:

1. Groq primary
2. Gemini primary
3. Groq secondary
4. Gemini secondary
5. GitHub Models
6. wrap back to Groq primary

Important interpretation:

- this is a credential-priority ring for resilience and routing control
- it must still stop after a bounded number of attempts
- it must not assume that duplicate keys in the same quota boundary create new real capacity
- GitHub Copilot CLI still stays out of production

## What The Official Docs Change

### Groq

Official Groq docs currently state:

- rate limits apply at the organization level, not individual users
- project limits cannot exceed the organization ceiling
- their acceptable use policy forbids going beyond published limits, including by registering multiple accounts or orchestrating usage between multiple organizations

Implication:

- two Groq API keys in the same organization do not create two independent free quotas
- separate projects are useful for isolation and monitoring, not for increasing the org ceiling
- using multiple organizations to evade limits is not a valid production plan

### Gemini

Official Gemini docs currently state:

- rate limits are applied per project, not per API key
- Google AI Studio creates and manages API keys against Google Cloud projects
- the public quota docs expose project-tier rate limits and point to model-specific limits for the current project tier
- the official Python guidance recommends the `google-genai` SDK

Implication:

- two Gemini API keys from the same Google project do not create extra quota
- if a second key exists, treat it as operational backup or secret rotation, not as the first-class scaling strategy
- do not plan capacity using old copied numbers; verify the active project tier and current per-model quota at deployment time

### GitHub Models

Official GitHub docs currently state:

- GitHub Models is a real inference API usable from scripts, apps, or GitHub Actions
- all GitHub accounts get free but rate-limited usage
- paid usage exists and is metered if billing is enabled

Implication:

- GitHub Models is valid as a tertiary or developer-focused fallback
- it should not be treated as unlimited free overflow capacity

### Render Free

Official Render docs currently state:

- free web services spin down after 15 minutes of inactivity
- the next spin-up can take up to a minute
- free web services are not recommended for production applications

Implication:

- free Render is acceptable for early beta validation
- it is not the final answer for a public student product with real usage expectations

## Recommended Provider Strategy

### Phase 1: Early Public Beta

Keep the architecture simple:

- Vercel for the website
- Supabase for auth, tables, and vector storage later
- Render for the Python AI service
- Groq primary lane
- Gemini primary lane
- Groq secondary lane
- Gemini secondary lane
- GitHub Models last lane before wrapping

The production router should treat the chain as a ring, not a static one-pass list.

### Why Groq First

For free-tier launch traffic, Groq's `llama-3.1-8b-instant` is a stronger primary candidate than larger Groq models because the current docs show much higher free-tier request volume than `llama-3.3-70b-versatile`.

Current Groq docs show:

- `llama-3.1-8b-instant`: 30 RPM, 14.4K RPD
- `llama-3.3-70b-versatile`: 30 RPM, 1K RPD

This matters more than raw benchmark quality for the first public launch. A fast, cheap, always-available model is more useful than a stronger model that exhausts free quota early.

### Why Gemini Second

Gemini gives a clean second provider with a different vendor, different quota pool, and an officially supported production SDK. It is the right second leg for resilience.

### Why GitHub Models Third

GitHub Models is a real API and can be used from apps, but its included free usage is rate-limited. It is a good tertiary lane or admin-only backup, not the core free-scale strategy.

## Revised Provider Ring

Use this order:

1. `groq_primary`
2. `gemini_primary`
3. `groq_secondary`
4. `gemini_secondary`
5. `github_models`
6. wrap to `groq_primary`

Model suggestions for the first pass:

1. `groq_primary -> llama-3.1-8b-instant`
2. `gemini_primary -> gemini-2.0-flash`
3. `groq_secondary -> llama-3.1-8b-instant`
4. `gemini_secondary -> gemini-2.0-flash`
5. `github_models -> openai/gpt-4.1`

### Why This Must Be A Bounded Ring

If Groq, Gemini, and GitHub Models are all degraded, an infinite loop would never return. The router must wrap, but only inside a strict retry budget.

Required guardrails:

- `max_provider_attempts` per request
- `max_request_time_ms` per request
- per-lane cooldown after repeated 429 or 5xx responses
- clear final error when all attempts are exhausted

Recommended first settings:

- `provider_chain_length = 5`
- `max_provider_attempts = 7`
- `max_request_time_ms = 12000`
- `lane_cooldown_seconds = 30` for 429-heavy lanes

That gives you:

- one full pass across all providers
- one extra wrap to the stage-1 Groq lane
- a predictable upper bound on latency

### Credential Meaning

`groq_primary` and `groq_secondary` should be treated as separate credential groups. Same for `gemini_primary` and `gemini_secondary`.

The router should not care whether those credentials came from:

- different projects
- different environments
- different billing contexts
- different legitimate organizations

The router only knows lane order, lane health, and retry policy.

It is still your responsibility to ensure the credential topology is valid under each provider's policy.

## Embedding Strategy

### Immediate Decision

Change the default local embedding model to `sentence-transformers/all-MiniLM-L6-v2`.

Why:

- lighter operational footprint
- no remote code requirement
- enough quality for early semantic search
- safer for low-memory deployment experiments

### Production Direction

Do not stop at local JSON vectors for public traffic.

Target direction after the current slice:

1. keep local MiniLM for local development
2. move shared retrieval storage into Supabase `pgvector`
3. keep the embedding pipeline swappable

That gives you:

- one shared knowledge index for all deployed instances
- no per-instance local vector drift
- simpler content updates

## Architecture To Build Toward

```text
Student Browser on Vercel
    -> Yantra Web App
    -> server-side call to Python AI service

Python AI service on Render
    -> load student context
    -> retrieve knowledge
    -> call provider chain
    -> persist chat/memory state

Supabase
    -> auth
    -> profiles
    -> chat history
    -> future memory tables
    -> future pgvector knowledge store
```

## Non-Negotiable Production Rules

1. Never call providers directly from the browser.
2. Never expose provider secrets or Supabase service-role secrets to the client.
3. Verify Supabase-authenticated user context server-side before reading or writing per-user records.
4. Keep provider timeouts and circuit breakers explicit.
5. Log which provider served each response.
6. Keep the provider ring bounded so failure does not turn into infinite hanging requests.

## Ring Router Behavior

Each request should:

1. start at `groq_primary`
2. move to the next lane on retryable failure, timeout, or 429
3. continue until the end of the chain
4. wrap back to `groq_primary`
5. stop once retry budget or time budget is exhausted

Suggested retryable failures:

- timeout
- 429
- 500
- 502
- 503
- 504

Suggested non-retryable failures:

- malformed request
- invalid credentials
- unsupported model
- policy rejection tied to prompt content

### Pseudocode

```text
chain = [groq_primary, gemini_primary, groq_secondary, gemini_secondary, github_models]
index = 0
attempts = 0

while attempts < max_provider_attempts and elapsed_ms < max_request_time_ms:
    lane = next_healthy_lane(chain, index)
    result = call(lane)
    if result.ok:
        return result
    if not result.retryable:
        mark_failure(lane, result)
        break
    mark_failure(lane, result)
    index = (index + 1) % len(chain)
    attempts += 1

return final_upstream_failure
```

## Implementation Order

### Step 1

Switch the default local embedding model to `all-MiniLM-L6-v2`.

Exit criteria:

- reindex completes locally
- retrieval tests still pass

### Step 2

Add a provider abstraction layer that supports:

- lane name
- provider name
- model name
- credential source
- timeout
- retryable vs non-retryable errors
- cooldown state

Exit criteria:

- `service.py` no longer knows Groq or Gemini details directly

### Step 3

Implement Groq client.

Exit criteria:

- single prompt can complete through Groq
- 429 and timeout handling are explicit

### Step 4

Implement Gemini client using the current Google GenAI SDK.

Exit criteria:

- single prompt can complete through Gemini
- code uses `google-genai`, not the older deprecated Python package

### Step 5

Implement GitHub Models client.

Exit criteria:

- service can call `https://models.github.ai/inference/chat/completions`
- PAT scope and endpoint are documented clearly

### Step 6

Implement provider ring router with failure policy:

- try `groq_primary`
- on retryable failure or 429, try `gemini_primary`
- then `groq_secondary`
- then `gemini_secondary`
- then `github_models`
- then wrap to `groq_primary`
- stop when retry budget or time budget is exhausted

Exit criteria:

- every response includes the provider used
- logs capture provider failure reason
- logs capture lane name and attempt number
- wrapped retries are visible in logs

### Step 7

Move deployment from local-only assumptions to Render-safe settings.

Exit criteria:

- health route
- startup command
- environment variables
- timeouts
- CORS only for the web origin

### Step 8

Only after provider failover is stable, move knowledge storage from local JSON to Supabase-backed vectors.

Exit criteria:

- shared deployed knowledge index
- content updates do not require full service rebuilds

## Env Plan

Planned environment variables:

```env
YANTRA_CHAT_PROVIDER=ring
YANTRA_PROVIDER_CHAIN=groq_primary,gemini_primary,groq_secondary,gemini_secondary,github_models
YANTRA_PROVIDER_MAX_ATTEMPTS=7
YANTRA_PROVIDER_MAX_REQUEST_TIME_MS=12000
YANTRA_PROVIDER_LANE_COOLDOWN_S=30

YANTRA_GROQ_PRIMARY_MODEL=llama-3.1-8b-instant
YANTRA_GROQ_PRIMARY_API_KEY=...

YANTRA_GEMINI_PRIMARY_MODEL=gemini-2.0-flash
YANTRA_GEMINI_PRIMARY_API_KEY=...

YANTRA_GROQ_SECONDARY_MODEL=llama-3.1-8b-instant
YANTRA_GROQ_SECONDARY_API_KEY=...

YANTRA_GEMINI_SECONDARY_MODEL=gemini-2.0-flash
YANTRA_GEMINI_SECONDARY_API_KEY=...

YANTRA_GITHUB_MODELS_MODEL=openai/gpt-4.1
YANTRA_GITHUB_MODELS_TOKEN=...

YANTRA_EMBEDDING_BACKEND=local
YANTRA_LOCAL_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
YANTRA_LOCAL_EMBEDDING_TRUST_REMOTE_CODE=false
```

## Risks To Watch

### Free-Tier Quota Reality

As of March 30, 2026, the earlier copied quota assumptions are not safe to use for planning. Groq's official public tables already show materially different limits by model, and Gemini's public docs make quota a project-tier concern rather than a simple single free-tier number copied from an old screenshot.

That means:

- you should optimize prompt length now
- you should keep the fast local path
- you should avoid burning quota on greetings or trivial prompts

### Render Free Reality

Render Free is a validation tier, not a production SLA. First-request latency after idle is a real product risk.

### Key Multiplication Illusion

Multiple keys do not equal multiple real capacity tiers if the vendor applies rate limits above the key level.

The ring is still useful because it gives:

- lane isolation
- independent credential rotation
- explicit failover order
- controlled experiments across provider/model lanes

but it should not be sold internally as magic quota multiplication.

## Source Links

Official docs used for this plan:

- Groq rate limits: https://console.groq.com/docs/rate-limits
- Groq projects: https://console.groq.com/docs/projects
- Groq acceptable use policy: https://console.groq.com/docs/legal/ai-policy
- Groq supported models: https://console.groq.com/docs/models
- Gemini rate limits: https://ai.google.dev/gemini-api/docs/quota
- Gemini models: https://ai.google.dev/gemini-api/docs/models/gemini-v2
- Gemini Python SDK guidance: https://ai.google.dev/gemini-api/docs/libraries
- GitHub Models overview: https://docs.github.com/en/github-models/about-github-models
- GitHub Models quickstart: https://docs.github.com/en/enterprise-cloud@latest/github-models/quickstart
- GitHub Models billing: https://docs.github.com/en/billing/concepts/product-billing/github-models
- Render free services: https://render.com/free
- Render web services: https://render.com/docs/web-services
