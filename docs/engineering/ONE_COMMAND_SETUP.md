# One-Command Setup

If you are onboarding to Yantra on a local machine, use this command from the repo root:

```powershell
npm run setup
```

That command runs [`scripts/setup.mjs`](/c:/Users/pavan/Contribute/Yantra/scripts/setup.mjs) and will:

- verify Node.js, npm, and Python are available
- create `.env.local` from `.env.example` if it does not exist yet
- create `ai/.env` from `ai/.env.example` if it does not exist yet
- run `npm install`
- create `ai/.venv` if needed
- bootstrap `pip` inside `ai/.venv` when Windows leaves the venv without it
- install the AI service dependencies with `pip install -e .[dev]`
- run `npm run lint`
- run the targeted TypeScript room tests
- run the Python service test suite

## Optional Flags

Reindex the local AI knowledge base during setup:

```powershell
npm run setup -- --reindex
```

Skip validation if you only want installation and env scaffolding:

```powershell
npm run setup -- --skip-validation
```

## What This Command Does Not Automate

Some setup is still project-specific and cannot be safely guessed by a script:

- filling real secrets into `.env.local`
- filling provider keys into `ai/.env`
- applying [`supabase/schema.sql`](/c:/Users/pavan/Contribute/Yantra/supabase/schema.sql) to your Supabase project

## After Setup

Start the web app:

```powershell
npm run dev
```

Start the AI service:

```powershell
cd ai
.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

If you are brand new to the repo, read these next:

1. [`docs/handoff/CURRENT_STATE.md`](/c:/Users/pavan/Contribute/Yantra/docs/handoff/CURRENT_STATE.md)
2. [`docs/engineering/SETUP_AND_DEPLOYMENT.md`](/c:/Users/pavan/Contribute/Yantra/docs/engineering/SETUP_AND_DEPLOYMENT.md)
3. [`docs/engineering/CODEBASE_MAP.md`](/c:/Users/pavan/Contribute/Yantra/docs/engineering/CODEBASE_MAP.md)
