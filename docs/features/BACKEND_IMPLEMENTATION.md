# Backend & Database Implementation Report

This document summarizes the implementations completed by Tobe for the Yantra Backend Sprint. The focus was on establishing the learner progress system, grading logic, and secure credential generation.

## 1. Database Schema (`supabase/schema.sql`)

The following 7 tables were added to the public schema with full Row Level Security (RLS) and automated timestamp management:

- **`yantra_quiz_bank`**: Reference content for skill assessments.
- **`yantra_challenges`**: Reference content for Void practice rooms.
- **`student_skill_mastery`**: Primary progress tracker using composite keys `(user_id, skill_key)`.
- **`student_void_sessions`**: Session history for hands-on practice.
- **`student_quiz_results`**: Historical record of all quiz attempts.
- **`student_certificates`**: Issued credentials with unique integrity hashes.
- **`student_practice_rooms`**: Configuration for persisted dashboard room cards (resolving previous technical debt).

**Key Engineering Note:** All student data tables are isolated using RLS policies gated to `auth.uid()`, ensuring data privacy between learners.

## 2. Mastery Logic (`/api/skill/update`)

Implemented the weighted mastery formula to calculate student progression:

**Rule:** `(quizzes_passed × 0.4) + (void_challenges_passed × 0.6)`

- **Capping:** The final score is mathematically clamped at `100%`.
- **Persistence:** Uses an atomic `upsert` to update existing skill records or create new ones without duplication.

## 3. Quiz Grading (`/api/quiz/grade`)

A backend-only grading service that processes student submissions without exposing answers to the client bundle.

- **Validation:** Compares `selected_answer_index` against the ground truth in `yantra_quiz_bank`.
- **Feedback:** Generates specific explanations for wrong answers to support the "teacher-guide" persona.
- **Automation:** On a successful pass (score ≥ 70%), the route triggers an internal call to the Mastery Update service, maintaining session context via cookie forwarding.

## 4. Certificate Generation (`/api/certificate/[id]/pdf`)

A secure PDF generation route using `pdfkit`.

- **Integrity Rule:** Implements the `SHA-256(user_id + skill_key + issued_at)` verification hash.
- **Access Control:** Strictly enforces that only the owner or users viewing a "public" marked certificate can generate the file.
- **Theming:** Generated with a dark-mode aesthetic consistent with the Yantra UI.

## 5. Profile API Extension (`/api/profile`)

Updated the core profile endpoint to support the new portfolio and dashboard features.

- **Parallel Execution:** Uses `Promise.all` to fetch profile data and mastery rows simultaneously, minimizing TTFB (Time to First Byte).
- **Backward Compatibility:** The response structure uses the spread operator to keep existing top-level fields (e.g., `full_name`, `skill_level`) intact while appending the `mastery` array at the root level.

## 6. CI/CD Pipeline (`.github/workflows/deploy.yml`)

Configured a functioning GitHub Actions pipeline to automate the development lifecycle.

- **Validation:** Runs `lint` and `test` on every Pull Request to `main` or `develop`.
- **Environment Sync:** 
    - **Staging:** Pushes schema changes to the staging Supabase project on `develop` branch updates.
    - **Production:** Pushes schema changes to the production Supabase project on `main` branch updates.
- **Security:** Project references and database passwords are managed via GitHub Encrypted Secrets.

---
**Status:** Phase 1–5 Complete.
**Ready for:** Frontend integration by Rishi and Krish.
```


