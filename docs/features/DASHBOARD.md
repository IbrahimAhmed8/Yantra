# Dashboard

## Route

- `/dashboard`
- Entry file: `app/dashboard/page.tsx`
- Main implementation: `src/features/dashboard/StudentDashboard.tsx`

## Purpose

The dashboard is the student-facing product concept layer.

It currently showcases:

- progress summary
- roadmap overview
- skill cards
- practice room entry points
- embedded Yantra AI actions

## Main Sections

- dashboard navigation
- hero section with progress card
- overview section
- skills section
- practice rooms section
- Yantra AI section
- footer

## Data Model Today

The dashboard is currently driven by hardcoded arrays inside the component:

- `overviewCards`
- `skills`
- `rooms`
- `aiPrompts`

This means the dashboard is visually complete enough for demos, but not yet connected to a backend or user profile.

## Current Strengths

- strong visual hierarchy
- section-based composition
- route exists as a real deployed page
- AI actions are wired into the shared chat widget

## Current Limitations

- no auth
- no dynamic student data
- no persistence
- no room engine behind the room cards
- no unlock logic or progression system

## Recommended Future Work

- move dashboard data into a typed server/client data contract
- back it with a student profile
- connect room status to real capability
- add room-specific deep links once rooms exist
- split static config from component rendering logic
