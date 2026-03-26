# Setup And Deployment

## Local Development

### Requirements

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Environment

Copy `.env.example` and provide a Gemini key:

```env
GEMINI_API_KEY=YOUR_KEY_HERE
```

The server route also accepts `GOOGLE_API_KEY`, but `GEMINI_API_KEY` is the documented default.

### Run

```bash
npm run dev
```

### Build

```bash
npm run lint
npm run build
```

## Main Routes

- `/` marketing landing page
- `/dashboard` student dashboard concept
- `/api/chat` AI chat endpoint

## Deployment

### Platform

- Vercel

### Required Settings

- Framework Preset: `Next.js`
- Production Branch: `main`
- Build Command: default Next.js command or `next build`
- Output Directory: default Next.js output
- Install Command: default npm install

### Required Environment Variables

- `GEMINI_API_KEY`

## Migration Notes

This repo used to be Vite-based and is now Next.js-based.

Rules for future contributors:

- do not reintroduce `vite.config.ts`
- do not add Vite-specific packages unless the project is intentionally migrated again
- if Vercel ever fails with Vite-related errors, check for leftover tracked config or stale project settings first

## Build Troubleshooting

### Chat route fails in production

Check:

- `GEMINI_API_KEY` is set in Vercel
- the deployment is using the `main` branch
- the build logs do not reference legacy Vite files

### Dashboard route does not appear

Check:

- `app/dashboard/page.tsx` exists in the deployed commit
- the deployment completed successfully
- the URL path is `/dashboard`, not `/`

## Current Deployment Reality

- The codebase builds successfully locally with `npm run lint` and `npm run build`.
- Vercel production should track `main`.
- Any future deployment failures should be logged in `handoff/CURRENT_STATE.md` if they become recurring.
