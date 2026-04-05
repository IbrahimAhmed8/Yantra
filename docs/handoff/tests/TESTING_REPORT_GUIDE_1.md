# API Testing Report & Sample Responses

This document provides the test procedures and sample responses for the Phase 1–5 backend implementations. These can be used as "proof of work" in deployment posts.

## 1. Profile & Mastery Integration
**Endpoint:** `GET /api/profile`  
**Purpose:** Verify that mastery data is correctly appended to the profile without breaking existing fields.

### Sample Response
```json
{
  "id": "user_uuid_here",
  "full_name": "Tobe",
  "skill_level": "Beginner",
  "onboarding_completed": true,
  "mastery": [
    {
      "skill_key": "python",
      "mastery_score": 85,
      "quizzes_passed": 2,
      "void_challenges_passed": 3,
      "updated_at": "2025-05-20T10:00:00Z"
    }
  ]
}
```

---

## 2. Quiz Grading Logic
**Endpoint:** `POST /api/quiz/grade`  
**Payload:**
```json
{
  "quiz_id": "valid_quiz_uuid",
  "answers": [
    { "question_index": 0, "selected_answer_index": 1 },
    { "question_index": 1, "selected_answer_index": 0 }
  ]
}
```

### Sample Response (Passing Result)
```json
{
  "score": 100,
  "passed": true,
  "explanations": []
}
```

---

## 3. Skill Mastery Calculation
**Endpoint:** `POST /api/skill/update`  
**Logic Check:** Weighted formula `(Q * 0.4 + V * 0.6)`

### Test Case
- Input: `quizzes_passed: 10`, `void_challenges_passed: 5`
- Calculation: `(10 * 0.4) + (5 * 0.6) = 4 + 3 = 7.0 (70%)`

### Sample Response
```json
{
  "success": true,
  "mastery": {
    "skill_key": "logic",
    "mastery_score": 7,
    "user_id": "user_uuid"
  }
}
```

---

## 4. Certificate PDF Generation
**Endpoint:** `GET /api/certificate/[id]/pdf`  

### Verification Proof
To prove this works in a report, you should verify the **Response Headers** and the **Integrity Hash**.

- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="yantra-mastery-python.pdf"`

**Integrity Hash Generation Rule Check:**
Running a manual SHA-256 on `user_id + skill_key + issued_at` should match the verification link text at the bottom of the generated PDF.

## How to perform these tests
1. **Browser Console:** While logged into Yantra, open the DevTools console and run:
   ```javascript
   fetch('/api/profile').then(res => res.json()).then(console.log);
   ```
2. **PDF Check:** Navigate directly to `/api/certificate/YOUR_CERT_ID/pdf` in your browser. The file should download automatically with the dark-themed Yantra aesthetic.
3. **Database Check:** Verify in the Supabase Dashboard that `student_quiz_results` has a new row after every test run of the grading route.
```
