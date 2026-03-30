# Setup And Deployment

## Requirements

- Node.js 20+
- npm
- a Supabase project
- a Gemini API key

## Install

```bash
npm install
```

## Environment Variables

Create `.env.local` and set:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### Notes

- `GEMINI_API_KEY` is required by `POST /api/chat` and `POST /api/docs-support`.
- `GOOGLE_API_KEY` is also accepted by the Gemini routes as a fallback, but `GEMINI_API_KEY` is the documented default.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required for auth, onboarding, protected routes, profile persistence, dashboard persistence, and chat-history persistence.
- Google sign-in does not need extra app env vars here; it is configured inside Supabase Auth.

## Required Supabase Step

Run the SQL in `supabase/schema.sql` against your Supabase project before using the protected product surfaces.

That script creates:

- `public.profiles`
- `public.access_requests`
- `public.chat_histories`
- `public.student_dashboard_paths`
- `public.student_skill_progress`
- `public.student_curriculum_nodes`
- `public.student_weekly_activity`
- the `updated_at` trigger functions and triggers
- row-level security policies for authenticated users and anonymous access requests

## Local Development

### Start the app

```bash
npm run dev
```

### Start the local AI microservice

This is separate from the web app and is not wired into the website yet.

```bash
cd ai
python -m venv .venv
pip install -e .[dev]
python scripts/reindex_knowledge.py
uvicorn main:app --reload --port 8000
```

On Windows PowerShell, activate the virtual environment with `.venv\\Scripts\\Activate.ps1`.

For Copilot-backed chat generation, make sure GitHub CLI is authenticated:

```bash
gh auth status
```

The service can reuse the `gh` login token automatically for Copilot CLI requests.

If you want local terminal-only testing without the website and without FastAPI, run:

```bash
cd ai
python terminal_chat.py
```

### Validate TypeScript

```bash
npm run lint
```

Current `lint` behavior is:

```bash
next typegen && npx tsc --noEmit
```

### Production build

```bash
npm run build
```

## Main Routes To Test Locally

### Public

- `/`
- `/login`
- `/signup`
- `/onboarding`
- `/auth/reset-password`
- `/docs`
- `/docs/welcome`

### Protected

- `/dashboard`
- `/dashboard/student-profile`

### APIs

- `POST /api/chat`
- `GET /api/chat/history`
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/access-requests`
- `POST /api/docs-support`
- `GET http://localhost:8000/health`
- `POST http://localhost:8000/chat`

## Recommended Local Smoke Test

1. Start the app with `npm run dev`.
2. Open `/signup` and create an account.
3. If email confirmation is enabled, follow the email link back to `/auth/confirm` and confirm the new account lands on `/onboarding`.
4. Complete onboarding and confirm it forwards to `/dashboard`.
5. Open `/dashboard/student-profile`, edit the record, and save it.
6. Reload the page to confirm the profile persisted.
7. Refresh `/dashboard` and confirm the seeded dashboard still renders.
8. Open the Yantra chat widget as the authenticated user, send a prompt, reload, and confirm the conversation resumes.
9. Open `/docs`, use Support Desk once, and confirm the docs support route responds.
10. Submit the landing-page access form and confirm the success state appears.
11. Sign out, log back in from `/login`, and confirm the same account goes straight to `/dashboard`.
12. Enable the Google provider in Supabase Auth and test Google sign-in from `/login` or `/signup`.

## Deployment

### Platform

- Vercel

### Expected settings

- Framework preset: `Next.js`
- Install command: default `npm install`
- Build command: default Next.js build or `next build`
- Output directory: default Next.js output
- Production branch: typically `main`

### Required environment variables in Vercel

- `GEMINI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Supabase Auth URL Configuration

Configure these in Supabase Auth settings:

### Site URL

Use your production domain here once the app is deployed, for example:

- `https://YOUR-PRODUCTION-DOMAIN`

### Redirect URLs

Keep both local and production routes in Redirect URLs:

- `http://localhost:3000/auth/confirm`
- `http://localhost:3000/auth/reset-password`
- `https://YOUR-PRODUCTION-DOMAIN/auth/confirm`
- `https://YOUR-PRODUCTION-DOMAIN/auth/reset-password`

## Google OAuth Provider Setup

Configure these in Supabase Auth -> Providers -> Google:

- enable the Google provider
- paste your Google OAuth client ID
- paste your Google OAuth client secret

In Google Cloud:

- create a Web application OAuth client
- add your local and production app URLs as authorized JavaScript origins
- add the exact Supabase Google callback URL shown inside the Supabase Google provider screen as an authorized redirect URI

Yantra routes auth confirmations and Google sign-in back through `/auth/confirm`, which exchanges the code for the session cookie and then redirects by flow:

- new-account signup -> `/onboarding`
- returning login -> `/dashboard`

## Deployment Reality

### What depends on Supabase being configured

- login/signup becoming usable
- Google sign-in becoming usable
- onboarding becoming usable
- protected dashboard access
- `/api/profile`
- dashboard starter-data persistence
- student-profile persistence
- authenticated chat continuity
- access-request persistence

### What still works without Supabase

- the marketing page
- the docs pages
- the docs support route, as long as a Gemini key is present
- the main chat route, as long as a Gemini key is present

Without Supabase env vars, auth pages stay visible but display configuration guidance, and protected dashboard routes redirect back to `/login`.

## Troubleshooting

### Chat or docs support fails with a server error

Check:

- `GEMINI_API_KEY` or `GOOGLE_API_KEY` is set
- the deployment has restarted after env changes
- the request body contains at least one valid user/assistant message

### Dashboard redirects back to login unexpectedly

Check:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- `supabase/schema.sql` has been applied
- Supabase Site URL and Redirect URLs are configured correctly
- cookies are being set and not blocked in the current environment

### Profile page loads but save fails

Check:

- the authenticated user exists
- the `public.profiles` table and RLS policies were created from `supabase/schema.sql`
- the request payload still matches `StudentProfile`

### Dashboard renders fallback content instead of the seeded dashboard rows

Check:

- `supabase/schema.sql` has been applied after the dashboard tables were added
- the authenticated user can access `student_dashboard_paths`, `student_skill_progress`, `student_curriculum_nodes`, and `student_weekly_activity`
- the RLS policies exist for those tables

### Access request succeeds but nothing is stored

Check:

- `supabase/schema.sql` has been applied after the `public.access_requests` table was added
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- the anonymous insert policy for access requests exists in Supabase
