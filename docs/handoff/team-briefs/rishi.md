# Rishi Brief

## What this job is

You are doing the frontend part.

Repo note:

- repo: `akyourowngames/Yantra`
- default branch: `main`
- open PRs found during check: none
- open issues found during check: none

Your job is to:

1. run Lighthouse checks
2. fix mobile and screen-size problems
3. build the Algorithm Void page
4. build the public certificate page
5. build the portfolio page

This is UI work.

You are not wiring the AI backend.

## Why this matters

Your work makes the product feel real for students.

Right now the repo already has:

- landing page
- onboarding
- dashboard
- student profile
- Python room

Your job is to make key pages:

- faster
- cleaner on phones
- easier to use
- ready for new certificate and portfolio flows

## What already exists in the repo

These routes already exist:

- `/`
- `/dashboard`
- `/onboarding`
- `/dashboard/student-profile`
- `/dashboard/rooms/python`

These frontend files already exist:

- `src/features/dashboard/StudentDashboard.tsx`
- `src/features/dashboard/StudentProfilePage.tsx`
- `src/features/onboarding/RoleOnboardingExperience.tsx`
- `src/features/chat/ChatWidget.tsx`
- `app/dashboard/rooms/python/page.tsx`

This means you should copy patterns from the live app.

Do not invent a new style system.

Follow the current Yantra look.

## Do this first

Do the work in this exact order:

1. Lighthouse audit
2. responsive sweep and fixes
3. Algorithm Void page
4. certificate public page
5. portfolio page

Do not start from the certificate page.

Start with speed and layout issues first.

## Step-by-step work

### Step 1: Lighthouse audit

Run Lighthouse on:

- `/`
- `/dashboard`
- `/onboarding`

Plain meaning:

Lighthouse is a tool that checks page speed and basic quality.

Look for the big problems first.

Focus on:

- LCP over 3 seconds
- big bundles over 200KB gzipped

If you see a P0 issue, fix it before moving on.

Post the starting scores in `#deployments`.

### Step 2: Responsive sweep

Test these screen sizes:

- `320px`
- `375px`
- `768px`
- `1024px`
- `1440px`

Plain meaning:

A responsive sweep means checking how the app looks on small phones, big phones, tablets, laptops, and big screens.

Known things to fix:

- student profile side nav breaks between `1024px` and `1280px`
- onboarding footer CTA overflows at `320px`
- dashboard hero big text clips on small Android screens
- ChatWidget desktop close hint shows on mobile when it should not
- touch targets must be at least `44px`

Likely files:

- `src/features/dashboard/StudentDashboard.tsx`
- `src/features/dashboard/StudentProfilePage.tsx`
- `src/features/onboarding/RoleOnboardingExperience.tsx`
- `src/features/chat/ChatWidget.tsx`

Important note:

`src/features/chat/` is a protected area.

If you need to edit `src/features/chat/ChatWidget.tsx` for the mobile fix, check with Krish first.

### Step 3: Build the Algorithm Void page

Create a new page:

- `app/dashboard/rooms/algorithm/page.tsx`

This page is frontend-only for your part.

Do not build the AI backend.

Use React state to drive the animation.

The page should show:

- bubble sort
- merge sort
- binary search

It should also have:

- speed slider
- play button
- pause button
- step-forward button

Use SVG for the visual part.

Do not add big outside libraries.

The page should load fast.

Use the Python room as a pattern for:

- page shape
- room feeling
- dashboard route style

Good file to study:

- `app/dashboard/rooms/python/page.tsx`

When the user pauses, make one fetch call to:

- `/api/void/feedback`

Your part is only:

- send the request
- show the returned text below the visualizer

Krish will wire the AI side later.

### Step 4: Build the public certificate page

Create a new page:

- `app/certificate/[id]/page.tsx`

This page should show:

- learner name
- skill
- date
- QR code
- download PDF button

The QR code should point to:

- `/verify/[hash]`

The PDF button should hit:

- `/api/certificate/:id/pdf`

This page depends on Tobe’s database work.

So do not expect it to fully work until Tobe’s tables and route are ready.

### Step 5: Build the portfolio page

Create a new protected page:

- `app/dashboard/portfolio/page.tsx`

This page should:

- read `student_certificates` for the current user
- list the certificates
- include a share-to-LinkedIn link

Keep the page simple.

This is a dashboard page, not a full redesign.

## Files you will probably touch

- `src/features/dashboard/StudentDashboard.tsx`
- `src/features/dashboard/StudentProfilePage.tsx`
- `src/features/onboarding/RoleOnboardingExperience.tsx`
- `src/features/chat/ChatWidget.tsx` only if Krish approves
- `app/dashboard/rooms/python/page.tsx` as a reference
- `app/dashboard/rooms/algorithm/page.tsx` new
- `app/certificate/[id]/page.tsx` new
- `app/dashboard/portfolio/page.tsx` new

## Files you must not touch

Do not touch these unless Krish says yes:

- `app/api/chat/route.ts`
- anything in `src/features/chat/` without checking first
- `src/lib/supabase/profiles.ts`

Also do not build the AI logic for Algorithm Void.

Your job is UI and state flow only.

## How to know you are done

You are done when:

- Lighthouse was run on all 3 pages
- the starting scores were posted
- the known responsive bugs are fixed
- touch targets are big enough
- the Algorithm Void page exists and animates in the browser
- pause triggers one fetch and shows the reply text area
- the certificate page exists
- the portfolio page exists

## What to post in #deployments

Post these things:

- Lighthouse baseline scores
- what responsive bugs you fixed
- screenshots for key layouts if needed
- the preview URL

If Algorithm Void is working visually, say that clearly.

If certificate or portfolio pages are blocked by backend data, say that clearly too.

## Good branch name examples

- `perf/lighthouse-audit`
- `fix/mobile-nav`
- `feature/algo-void`
- `feat/certificate-page`
- `feat/portfolio-page`

## Shared rules

- Tobe’s database work lands first.
- All PRs go to Krish for review.
- Do not touch protected AI-core files without asking.
- Use clean branch names.
- Post your preview URL in `#deployments`.
