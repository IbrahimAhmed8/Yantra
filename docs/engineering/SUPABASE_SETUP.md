# Supabase Setup

Yantra uses Supabase for:

- email/password authentication
- Google and GitHub OAuth authentication
- SSR session handling
- protected learner access for `/dashboard`, `/dashboard/student-profile`, and `/dashboard/rooms/python`
- persisted learner profiles in `public.profiles`
- persisted public access requests in `public.access_requests`
- authenticated Yantra chat continuity in `public.chat_histories`
- seeded persisted dashboard starter data in dedicated dashboard tables

Supabase is not the whole runtime story. Full local testing also usually needs:

- a Python AI target for `/api/chat`, `/api/chat/health`, and `/api/rooms/python/feedback`
- a Gemini key for `/api/docs-support` and fallback paths
- a Sarvam key for room voice routes

## Required Environment Variables

Add these to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
YANTRA_AI_TARGET="local"
YANTRA_AI_LOCAL_URL="http://127.0.0.1:8000"
SARVAM_API_KEY="YOUR_SARVAM_API_KEY"
```

The Supabase vars are the strict requirement for auth and persistence. The AI and Sarvam vars are needed for realistic end-to-end local testing.

## SQL Setup

Run:

- `supabase/schema.sql`

That script creates or updates:

- `public.profiles`
- `public.access_requests`
- `public.chat_histories`
- `public.student_dashboard_paths`
- `public.student_skill_progress`
- `public.student_curriculum_nodes`
- `public.student_weekly_activity`
- the `set_profiles_updated_at()` trigger function and trigger
- the `set_chat_histories_updated_at()` trigger function and trigger
- row-level security policies so authenticated users can only view and update their own profile row
- row-level security policies so authenticated users can only read and update their own chat history
- row-level security policies so authenticated users can only read and update their own seeded dashboard rows
- row-level security policies so anonymous visitors can submit access requests

Dashboard room persistence note:

- `src/lib/supabase/dashboard.ts` reads and seeds `student_practice_rooms`
- `supabase/schema.sql` now creates `student_practice_rooms` with matching RLS policies
- if the Supabase project was initialized before this change, re-run `supabase/schema.sql` so room rows persist instead of falling back

## Current Profile Schema

`public.profiles` contains:

- `id uuid primary key references auth.users (id)`
- `email text`
- `full_name text`
- `class_designation text`
- `skill_level text`
- `progress integer`
- `academic_year text`
- `user_role text`
- `age_range text`
- `primary_learning_goals text[]`
- `learning_pace text`
- `onboarding_completed boolean`
- `onboarding_completed_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

The app maps that table to the `StudentProfile` type in `src/features/dashboard/student-profile-model.ts`.

## Dashboard Tables

`supabase/schema.sql` defines the starter dashboard persistence layer:

- `public.student_dashboard_paths`
- `public.student_skill_progress`
- `public.student_curriculum_nodes`
- `public.student_practice_rooms`
- `public.student_weekly_activity`

## App Integration Points

### Browser auth

- `src/lib/supabase/client.ts`
- used by `src/features/auth/AuthExperience.tsx` and reset and onboarding flows

### Server auth and persistence access

- `src/lib/supabase/server.ts`
- `src/lib/supabase/profiles.ts`
- `src/lib/supabase/dashboard.ts`
- `src/lib/supabase/chat-history.ts`
- `src/lib/supabase/access-requests.ts`

### Session refresh

- `proxy.ts`
- `src/lib/supabase/proxy.ts`

These files are all part of the active runtime. If auth or persistence stops behaving correctly, inspect them first.

## Auth URLs To Configure In Supabase

Inside Supabase Auth settings:

### Site URL

Use your production site URL once deployed:

- `https://YOUR-PRODUCTION-DOMAIN`

### Redirect URLs

Keep both local and production redirects:

- `http://localhost:3000/auth/confirm`
- `http://localhost:3000/auth/reset-password`
- `https://YOUR-PRODUCTION-DOMAIN/auth/confirm`
- `https://YOUR-PRODUCTION-DOMAIN/auth/reset-password`

## What The App Does With Supabase

### `/signup`

- creates a Supabase user with email and password
- stores `full_name` in user metadata
- sends users through `/auth/confirm?next=/onboarding` when email verification is enabled
- opens `/onboarding` immediately when Supabase returns a session for the new account

### `/login`

- signs in with `signInWithPassword()`
- starts Google OAuth through `signInWithOAuth({ provider: 'google' })`
- starts GitHub OAuth through `signInWithOAuth({ provider: 'github' })`
- redirects authenticated users to `/dashboard`
- triggers `resetPasswordForEmail()` from the forgot-password action

### `/onboarding`

- requires an authenticated user
- reads the current profile
- stores role, age range, learning goals, learning pace, and onboarding completion in `public.profiles`

### `/auth/reset-password`

- completes the password-recovery flow
- updates the current user password through `updateUser({ password })`
- signs the recovery session out and redirects back to `/login`

### `/auth/confirm`

- verifies email confirmation links from Supabase when `token_hash` and `type` are present
- completes Google or GitHub OAuth sign-in by exchanging the provider `code` for a session cookie
- redirects to the `next` path from the auth URL
- routes new-account confirmations to `/onboarding`
- routes login and returning auth flows to `/dashboard`

### `/dashboard`

- requires a valid authenticated user
- redirects to `/login` when no session exists
- loads the current profile through `getAuthenticatedProfile()`
- loads or seeds starter dashboard rows through `getAuthenticatedDashboardData()`

### `/dashboard/student-profile`

- loads the same authenticated profile
- allows updates through `PUT /api/profile`

### `/dashboard/rooms/python`

- requires a valid authenticated user
- does not currently enforce onboarding completion
- opens the live Python Room shell

### `/api/profile`

- `GET` returns the authenticated learner profile plus a default profile shape
- `PUT` validates and upserts the learner profile row

### `/api/access-requests`

- validates name, email, and message
- inserts a row into `public.access_requests`

### `/api/chat/history`

- returns the authenticated learner's persisted Yantra conversation history
- falls back to empty history when no row exists yet

## First-Time Profile And Dashboard Behavior

The app seeds a profile automatically the first time an authenticated learner loads a protected route that calls `getAuthenticatedProfile()`.

The seeded values come from:

- `full_name` or `name` in user metadata when available
- otherwise the email prefix
- otherwise `defaultStudentProfile`

`/dashboard` then loads the dashboard starter-data tables. If rows are missing, the app inserts starter content and reloads it.

If `student_practice_rooms` is missing in an older Supabase project, the dashboard still renders by falling back to starter room data until the updated schema is applied.

## First Live Test Flow

1. Create a Supabase project.
2. Copy the project URL and anon key into `.env.local`.
3. Run the SQL from `supabase/schema.sql`.
4. Configure Site URL and Redirect URLs in Supabase Auth.
5. Start the app with `npm run dev`.
6. Open `/signup` and create an account.
7. Confirm the email if email confirmation is enabled.
8. Confirm you land on `/onboarding` for the new account.
9. Complete the `/onboarding` flow.
10. Open `/dashboard`.
11. Reload `/dashboard` and confirm the starter dashboard still renders.
12. Open `/dashboard/student-profile`, edit the record, and save it.
13. Reload and confirm the updated profile persisted.
14. Open `/dashboard/rooms/python` and confirm the protected room opens after auth.
15. Open `/login`, request a password reset, and verify the recovery page lets you set a new password.
16. Enable the Google and GitHub providers in Supabase and test both OAuth sign-in paths from `/login` or `/signup`.
17. Open the chat as an authenticated learner, send a message, reload, and confirm the conversation resumes.
18. Submit the landing-page access form and confirm the record lands in `public.access_requests`.

## Known Gaps

- the dashboard tables currently hold starter data, not a true adaptive engine
- access requests persist but have no internal review UI
- Support Desk uses local docs content and Gemini, not Supabase

## Production Checklist

1. Add `NEXT_PUBLIC_SUPABASE_URL` in Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
3. Apply `supabase/schema.sql` to the production Supabase project.
4. Update Supabase Site URL to the production domain.
5. Add the production `/auth/confirm` and `/auth/reset-password` URLs to Redirect URLs.
6. In Supabase Auth, enable the Google provider and add the Google OAuth client ID and secret.
7. In Google Cloud, add the exact Supabase Google callback URL from the provider setup screen as an authorized redirect URI.
8. In Supabase Auth, enable the GitHub provider and add the GitHub OAuth client ID and secret.
8. Separately configure the web app AI and Sarvam env vars so protected chat and room features work after deploy.
