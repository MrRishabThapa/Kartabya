# Phase 2 — Local Authentication

## Implemented

- Async PostgreSQL connection through SQLAlchemy and `asyncpg`.
- Local users with normalized, unique email addresses.
- Argon2 password hashing; plaintext passwords are never stored.
- Opaque session tokens with only SHA-256 hashes stored in PostgreSQL.
- HttpOnly, configurable session cookie with refresh and logout support.
- Authenticated onboarding persistence.
- Dashboard identity loaded from the authenticated account and onboarding data.
- CORS configured for credentialed requests from the frontend origin.
- Frontend signup and login forms with no external identity provider.

## Email/password flow

1. `POST /api/v1/auth/signup` creates a local account and session.
2. `POST /api/v1/auth/login` verifies the Argon2 password hash and creates a session.
3. The backend sets the HttpOnly `kartabya_session` cookie.
4. The frontend submits any temporary onboarding draft to `POST /api/v1/onboard`.
5. `GET /api/v1/auth/me` returns the authenticated user.
6. `/refresh` extends a valid session and `/logout` revokes it.

## Onboarding persistence

Onboarding starts before authentication and is kept temporarily in the
frontend's `sessionStorage`. Once local authentication creates a session, the
draft is submitted to the authenticated onboarding endpoint.

The backend stores a preferred name, grade, subject, completion timestamp,
companion nickname, and selected hobbies. The API contract uses `userName`,
`foxNickname`, `hobbies`, and `targetCourse` (`grade`/`subject`); saving is
idempotent: resubmitting onboarding updates the profile and replaces the
user's hobby links.

Onboarding completion is tracked explicitly on the user account through
`users.is_onboarded`. The flag is set when `POST /api/v1/onboard` succeeds and
is exposed through `GET /api/v1/auth/me`, so the frontend can route users to
onboarding without probing the onboarding endpoint for a 404.

Signup and login are resilient to stale onboarding drafts: a draft that fails
to submit (for example a legacy `pandaNickname` draft after the rename to
`foxNickname`) never blocks a successful account session, and drafts rejected
with 422 are discarded so onboarding can start fresh.

## Local configuration

Keep `.env` out of version control:

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@localhost:5432/kartabya
FRONTEND_URL=http://localhost:3000
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_SAMESITE=lax
AUTH_SESSION_COOKIE_NAME=kartabya_session
AUTH_SESSION_TTL_SECONDS=604800
```

## Security reminders

- Use HTTPS and set `SESSION_COOKIE_SECURE=true` in production.
- Add email verification, password reset, rate limiting, and account lockout
  protections before production use.
- Use versioned database migrations before production deployment.

# Phase 3 — Personalized Quiz Generation

## Implemented

- OpenAI-powered quiz generation (`gpt-4o-mini`, configurable) around the
  chapter or topic the student is reading.
- Quizzes personalized with the hobbies collected during onboarding; the LLM
  weaves the hobbies into question scenarios and matches grade level.
- Synchronous generation: `POST /v1/quiz` returns the full quiz when ready.
- Persistence of quizzes, questions, and options, with grade/subject/hobbies
  snapshotted at generation time.
- Attempt grading and history: `POST /v1/quiz/{id}/attempt` persists
  per-question answers and the score.
- Strict LLM output validation with one retry on malformed responses.
- All quiz endpoints behind the authenticated session cookie.

## Quiz flow

1. `POST /v1/quiz` with `content` (the chapter/topic) generates and persists
   a quiz; `subject`, grade, and hobbies come from the user's profile unless
   provided in the request.
2. The response matches the frontend `BackendQuiz` contract (`type`,
   `number_of_qns`, `questions` with lettered options and explanations).
3. `GET /v1/quiz` lists the user's quizzes and `GET /v1/quiz/{id}` returns
   one with all questions.
4. The frontend submits the selected answers to
   `POST /v1/quiz/{id}/attempt`; the backend grades them and stores the
   attempt and answers.

## Data model

- `quizzes` — one per generation, with `topic`, `subject`, `grade`, and a
  JSON snapshot of `hobbies`.
- `quiz_questions` — ordered questions with the correct answer letter.
- `quiz_options` — the four options per question with explanations.
- `quiz_attempts` — one row per graded attempt (`score`, `total`).
- `quiz_answers` — the option selected for each question in an attempt.

## Local configuration

```env
OPEN_AI_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Keep the OpenAI key in `.env` out of version control; generation fails with a
clear error when it is missing.
