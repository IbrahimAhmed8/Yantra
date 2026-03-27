# Supabase Setup

This project now supports Supabase-based email/password authentication and a persisted `profiles` table for the student profile experience.

## What Supabase Is Handling

- user sign up
- user sign in
- auth session cookies
- protected dashboard routes
- persisted student profile records

## Environment Variables

Add these to your local `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

## SQL Setup

Run the SQL in:

- `supabase/schema.sql`

That file creates:

- `public.profiles`
- row-level security policies
- an `updated_at` trigger

## Auth URLs To Configure In Supabase

Inside Supabase Auth settings, add:

- Site URL:
  - local: `http://localhost:3000`
  - production: your Vercel URL or custom domain
- Redirect URLs:
  - `http://localhost:3000/auth/confirm`
  - `https://YOUR-PRODUCTION-DOMAIN/auth/confirm`

## What The App Does

- `/signup` creates a Supabase account
- `/login` signs the user in
- `/dashboard` redirects to `/login` if no valid session exists
- `/dashboard/student-profile` reads and saves the current learner profile from Supabase instead of local browser storage

## First Live Test Flow

1. Create a Supabase project.
2. Copy the project URL and anon key into `.env.local`.
3. Run the SQL from `supabase/schema.sql`.
4. In Supabase Auth settings, set your Site URL and Redirect URLs.
5. Start the app with `npm run dev`.
6. Open `/signup` and create a user.
7. If email confirmation is enabled, confirm the email from your inbox.
8. Log in at `/login`.
9. Open `/dashboard`.
10. Open `/dashboard/student-profile`, edit the record, and save it.

## Production Checklist

Before going live in Vercel:

1. Add `NEXT_PUBLIC_SUPABASE_URL`.
2. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Add `GEMINI_API_KEY`.
4. Update Supabase Site URL to the production domain.
5. Add the production `/auth/confirm` URL to Redirect URLs.

## Official References

- Supabase Next.js server-side auth guide:
  - https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase Next.js tutorial:
  - https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs
