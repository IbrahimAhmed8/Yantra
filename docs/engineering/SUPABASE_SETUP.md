# Supabase Setup

Yantra uses Supabase for:

- email/password authentication
- Google OAuth authentication
- SSR session handling
- protected dashboard access
- persisted learner profiles in `public.profiles`
- persisted public access requests in `public.access_requests`
- authenticated chat continuity in `public.chat_histories`

- user sign up
- user sign in
- auth session cookies
- protected dashboard routes
- persisted student profile records
- onboarding role selection before dashboard access
## Required Environment Variables

Add these to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

`GEMINI_API_KEY` is not part of Supabase itself, but most local testing will need it because chat is one of the active runtime features.

## SQL Setup

Run:

- `supabase/schema.sql`

That script creates:

- `public.profiles`
- `public.access_requests`
- `public.chat_histories`
- the `set_profiles_updated_at()` trigger function
- the `set_profiles_updated_at` trigger
- the `set_chat_histories_updated_at()` trigger function
- the `set_chat_histories_updated_at` trigger
- row-level security policies so authenticated users can only view and update their own profile row
- row-level security policies so authenticated users can only read and update their own chat history
- row-level security policies so anonymous visitors can submit access requests

## Current Profile Schema

`public.profiles` contains:

- `id uuid primary key references auth.users (id)`
- `email text`
- `full_name text`
- `class_designation text`
- `skill_level text`
- `progress integer`
- `academic_year text`
- `created_at timestamptz`
- `updated_at timestamptz`

The app maps that table to the `StudentProfile` type in `src/features/dashboard/student-profile-model.ts`.

## App Integration Points

### Browser auth

- `src/lib/supabase/client.ts`
- used by `src/features/auth/AuthExperience.tsx`

### Server auth and profile access

- `src/lib/supabase/server.ts`
- `src/lib/supabase/profiles.ts`

### Session refresh

- `proxy.ts`
- `src/lib/supabase/proxy.ts`

These files are all part of the active runtime. If auth stops behaving correctly, inspect them first.

## Auth URLs To Configure In Supabase

Inside Supabase Auth settings:

### Site URL

- local: `http://localhost:3000`
- production: your Vercel or custom domain

- `/signup` creates a Supabase account
- `/onboarding` collects the user's Yantra role before the main dashboard opens
- `/login` signs the user in
- `/dashboard` redirects to `/login` if no valid session exists
- `/dashboard` redirects to `/onboarding` until the signed-in user has completed role selection
- `/dashboard/student-profile` reads and saves the current learner profile from Supabase instead of local browser storage
### Redirect URLs

- `http://localhost:3000/auth/confirm`
- `http://localhost:3000/auth/reset-password`
- `https://YOUR-PRODUCTION-DOMAIN/auth/confirm`
- `https://YOUR-PRODUCTION-DOMAIN/auth/reset-password`

## What The App Does With Supabase

### `/signup`

- creates a Supabase user with email and password
- stores `full_name` in user metadata
- sends users through `/auth/confirm?next=/dashboard` when email verification is enabled

### `/login`

- signs in with `signInWithPassword()`
- starts Google OAuth through `signInWithOAuth({ provider: 'google' })`
- redirects authenticated users to `/dashboard`
- triggers `resetPasswordForEmail()` from the forgot-password action

### `/auth/reset-password`

- completes the password-recovery flow
- updates the current user password through `updateUser({ password })`
- signs the recovery session out and redirects back to `/login`

### `/dashboard`

- requires a valid authenticated user
- redirects to `/login` when no session exists
- loads the current profile through `getAuthenticatedProfile()`

### `/auth/confirm`

- verifies email confirmation links from Supabase when `token_hash` and `type` are present
- completes Google OAuth sign-in by exchanging the provider `code` for a session cookie
- redirects to `/dashboard` by default after either flow succeeds

### `/dashboard/student-profile`

- loads the same authenticated profile
- allows updates through `PUT /api/profile`

### `/api/profile`

- `GET` returns the authenticated learner profile plus a default profile shape
- `PUT` validates and upserts the learner profile row

### `/api/access-requests`

- validates name, email, and message
- inserts a row into `public.access_requests`

### `/api/chat/history`

- returns the authenticated learner's persisted conversation history
- falls back to empty history when no row exists yet

## First-Time Profile Behavior

The app seeds a profile automatically the first time an authenticated learner loads a protected route that calls `getAuthenticatedProfile()`.

The seeded values come from:

- `full_name` or `name` in user metadata when available
- otherwise the email prefix
- otherwise `defaultStudentProfile`

The row is sanitized before insert and update.

## First Live Test Flow

1. Create a Supabase project.
2. Copy the project URL and anon key into `.env.local`.
3. Run the SQL from `supabase/schema.sql`.
4. Configure Site URL and Redirect URLs in Supabase Auth.
5. Start the app with `npm run dev`.
6. Open `/signup` and create an account.
7. Confirm the email if email confirmation is enabled.
8. Complete the `/onboarding` role selection screen if the account is new.
9. Open `/dashboard`.
10. Open `/dashboard/student-profile`, edit the record, and save it.
11. Reload and confirm the updated profile persisted.
12. Open `/login`, request a password reset, and verify the recovery page lets you set a new password.
13. Test Google sign-in from `/login` or `/signup` after the Google provider is enabled in Supabase.
14. Open the chat as an authenticated learner, send a message, reload, and confirm the conversation resumes.

## Known Gaps

- dashboard metrics and most learning-state models are still demo content

## Onboarding Columns

The `profiles` table now also stores:

- `user_role`
- `onboarding_completed`
- `onboarding_completed_at`

Re-run `supabase/schema.sql` against an existing project to add these columns if your table was created before onboarding was introduced.

## Production Checklist

1. Add `NEXT_PUBLIC_SUPABASE_URL` in Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
3. Add `GEMINI_API_KEY` in Vercel.
4. Apply `supabase/schema.sql` to the production Supabase project.
5. Update Supabase Site URL to the production domain.
6. Add the production `/auth/confirm` and `/auth/reset-password` URLs to Redirect URLs.
7. In Supabase Auth, enable the Google provider and add the Google OAuth client ID and secret.
8. In Google Cloud, add your Supabase project callback URL from the Google provider setup screen as an authorized redirect URI.
