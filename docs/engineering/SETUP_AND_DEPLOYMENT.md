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

- `GEMINI_API_KEY` is required by `POST /api/chat`.
- `GOOGLE_API_KEY` is also accepted by the chat route as a fallback, but `GEMINI_API_KEY` is the documented default.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required for login, signup, protected routes, and profile persistence.
- Google sign-in does not need extra app env vars here, but the Google provider must be enabled in Supabase Auth.
- Google sign-in uses the Google provider configured inside Supabase Auth. No extra app env var is required in this repo for Google OAuth.

## Required Supabase Step

Run the SQL in `supabase/schema.sql` against your Supabase project before using the dashboard profile flow.

That script creates:

- `public.profiles`
- the `updated_at` trigger
- row-level security policies for authenticated users

## Local Development

### Start the app

```bash
npm run dev
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

### Protected

- `/dashboard`
- `/dashboard/student-profile`

### APIs

- `/api/chat`
- `/api/profile`
- `/api/access-requests`

## Recommended Local Smoke Test

1. Start the app with `npm run dev`.
2. Open `/signup` and create an account.
3. If email confirmation is enabled, follow the email link back to `/auth/confirm`.
4. Enable the Google provider in Supabase Auth and test Google sign-in from `/login` or `/signup`.
5. Open `/dashboard` and confirm the route is accessible after sign-in.
6. Open `/dashboard/student-profile`, edit the record, and save it.
7. Reload the page to confirm the profile data persisted.
8. Open the chat widget and send a prompt.
9. Submit the landing-page access form and confirm the success state appears.

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

- Site URL:
  - local: `http://localhost:3000`
  - production: your deployed domain
- Redirect URLs:
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
- add the Supabase Google callback URL shown inside the Supabase Google provider screen as an authorized redirect URI

Yantra routes the Google sign-in back through `/auth/confirm`, which exchanges the Supabase OAuth code for the session cookie and then redirects to `/dashboard`.

## Deployment Reality

### What depends on Supabase being configured

- login/signup becoming usable
- Google sign-in becoming usable
- protected dashboard access
- `/api/profile`
- student-profile persistence

### What still works without Supabase

- the marketing page
- the access-request form
- the chat route, as long as a Gemini key is present

Without Supabase env vars, auth pages stay visible but display configuration guidance, and protected dashboard routes redirect back to `/login`.

## Troubleshooting

### Chat fails with a server error

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

### Access request succeeds but nothing is stored

Check:

- `supabase/schema.sql` has been applied after the `public.access_requests` table was added
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- the insert policy for anonymous access requests exists in Supabase
