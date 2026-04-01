# Yantra Current Project Status

## Where We Are Right Now

Yantra is not just a mock UI anymore.

We already have a real working base:

- landing page
- login / signup
- onboarding
- protected dashboard
- editable student profile
- docs/help center
- Supabase auth + saved profile data
- main chat route
- Python Room with real in-browser Python run
- Python Room error feedback flow

So the project foundation is real.

What is still missing is the deeper product layer.

---

## Visual Status Board

### Core app

- [x] Auth system
- [x] Onboarding flow
- [x] Student profile save/load
- [x] Dashboard route
- [ ] Dashboard content is still mostly starter data
- [x] Docs pages
- [x] Chat surface
- [ ] Chat is live, but deeper AI orchestration is still not done

### Rooms

- [x] Python Room shell
- [x] Python runs in browser with Pyodide
- [x] Python error feedback route exists
- [ ] Only Python Room is real right now
- [ ] Algorithm Void not built yet
- [ ] Other room types not built yet

### Data / backend

- [x] Supabase profiles table
- [x] Dashboard starter-data tables
- [x] Chat history persistence
- [ ] mastery tables not added yet
- [ ] certificate tables not added yet
- [ ] quiz bank tables not added yet

### Product layers not built yet

- [ ] certificates
- [ ] portfolio page
- [ ] classroom mode
- [ ] teacher dashboard
- [ ] analytics / observability
- [ ] bundle analyzer setup
- [ ] public verify flow

---

## Simple Project Picture

### Foundation

Auth + Onboarding + Profile + Dashboard + Docs + Chat = DONE

### Hands-on learning

Python Room = LIVE

Algorithm Void = NOT BUILT YET

### Progress system

Mastery + Quizzes + Certificates + Portfolio = NOT BUILT YET

### School layer

Classroom + Teacher mode + Analytics = NOT BUILT YET

---

## What The Team Is Doing Now

### Tobe

Backend / Supabase first.

He is adding:

- mastery tables
- void session tables
- quiz result tables
- certificate tables
- skill update route
- quiz grading route
- certificate PDF route
- profile API mastery extension

This is the first blocker.

Other work depends on this.

### Rishi

Frontend polish + new pages.

He is doing:

- Lighthouse audit
- responsive fixes
- Algorithm Void page
- certificate public page
- portfolio page

### DMonkey

Project plumbing / setup.

He is doing:

- bundle analyzer setup
- orchestrator shell
- env var updates
- classroom placeholder routes
- Vercel Analytics

---

## Important Truth

Right now Yantra is strongest in:

- app foundation
- auth
- profile
- dashboard shell
- Python Room base

Right now Yantra is weakest in:

- real learner progress system
- certificates
- portfolio
- classroom mode
- analytics

So we are in this stage:

**foundation is real, expansion layer is next**

---

## Rules For Current Work

- Tobe's database work goes first
- All PRs go through Krish
- Nobody touches protected AI-core files without checking first
- Post preview URLs in `#deployments`

---

## Current Goal

Turn Yantra from:

**real foundation + one real room**

into:

**real foundation + progress system + more product surfaces**
