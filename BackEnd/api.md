# Kartabya Backend API

Reference for the FastAPI backend. Base URL is the dev server (NGINX/ngrok), e.g.
`https://<your-subdomain>.ngrok-free.app`. All state-changing endpoints are
authenticated via the session cookie unless noted.

The frontend uses a shared helper at `FrontEnd/lib/api.ts` (`api.get/post/patch`)
that sets `credentials: "include"` so the HttpOnly `kartabya_session` cookie is
sent automatically and transparently refreshes expired sessions.

---

## Authentication

Registration and login both create a server-side session. The browser stores an
**opaque HttpOnly cookie** (`kartabya_session`); only its **SHA-256 hash** is
stored in PostgreSQL (`auth_sessions.token_hash`), so a database leak does not
expose live session tokens. Passwords are hashed with **Argon2** (`pwdlib`).

### `POST /api/v1/auth/signup`

Create a local account, log the user in, and issue the session cookie.

- **Auth:** none (public)
- **Request body:**
  ```json
  {
    "email": "student@example.com",
    "password": "a-strong-password (8-128 chars)",
    "name": "Student"            // optional
  }
  ```
- **201 Created:**
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "name": "Student",
      "avatar_url": null,
      "email_verified": false,
      "is_onboarded": false
    }
  }
  ```
- Cookies: sets `kartabya_session`.
- Errors: `409 Conflict` — email already registered.

### `POST /api/v1/auth/login`

Verify credentials and start a session for an existing account.

- **Auth:** none (public)
- **Request body:**
  ```json
  { "email": "student@example.com", "password": "a-strong-password" }
  ```
- **200 OK:** same `AuthResponse` shape as signup; sets `kartabya_session`.
- Errors: `401 Unauthorized` — invalid email or password (no detail on which is wrong, to prevent enumeration). `422` on schema failure.

### `GET /api/v1/auth/me`

Return the current user.

- **Auth:** session cookie
- **200 OK:** `{ id, email, name, avatar_url, email_verified, is_onboarded }`
- Errors: `401` if the cookie is missing/expired/revoked.

### `POST /api/v1/auth/refresh`

Extend a valid session by the configured TTL (`AUTH_SESSION_TTL_SECONDS`, default 7 days).

- **Auth:** session cookie
- **200 OK:** same `UserResponse` as `/me`; resets the cookie age.
- Errors: `401`.

### `POST /api/v1/auth/logout`

Revoke the current session and clear the cookie.

- **Auth:** session cookie
- **200 OK:** `{ "ok": true }`
- Errors: `401` — no active session (cookie is cleared regardless).

---

## Onboarding

Onboarding choices are collected client-side in `sessionStorage` and submitted
as a draft after the session is created. Completion is tracked by
`users.is_onboarded` (set by the POST below), which the frontend reads from
`/me` to route between the dashboard and the onboarding screens.

The companion nickname field was **renamed from `pandaNickname` to
`foxNickname`**; drafts saved under the old key are discarded automatically so
users restart onboarding cleanly.

### `POST /api/v1/onboard`

Create or replace onboarding data for the authenticated user (idempotent).

- **Auth:** session cookie
- **Request body:**
  ```json
  {
    "userName": "Student",
    "foxNickname": "Spark",
    "hobbies": ["Coding", "Music"],     // 1-3 items
    "targetCourse": {
      "grade": "Class 11",
      "subject": "Physics"
    }
  }
  ```
- **200 OK:**
  ```json
  {
    "userName": "Student",
    "foxNickname": "Spark",
    "hobbies": ["Coding", "Music"],
    "targetCourse": { "grade": "Class 11", "subject": "Physics" },
    "completedAt": "2026-08-08T10:38:48.916956Z"
  }
  ```
- Errors: `422` — validation (blank fields, hobby count, duplicate hobbies), surfaced and discarded by the frontend draft handler.

### `GET /api/v1/onboard`

Fetch the authenticated user's onboarding data.

- **Auth:** session cookie
- **200 OK:** same shape as the POST response.
- Errors: `404 Not Found` — onboarding not yet completed (frontend redirects to `/onboarding`).

---

## Personalized quizzes

Quizzes are generated with OpenAI (`gpt-4o-mini` by default) around the chapter
or topic the student is reading, personalized with their onboarding hobbies
woven into the question scenarios. Generation is synchronous (a few seconds) and
all endpoints require the session cookie.

- Env: `OPEN_AI_KEY` (required), `OPENAI_MODEL` (optional).

### `POST /v1/quiz`

Generate and persist a quiz.

- **Auth:** session cookie
- **Request body:**
  ```json
  {
    "type": "Quiz",
    "number_of_qns": 5,              // 1..20, default 5
    "user_interest": "Football, Music", // optional; merged with profile hobbies
    "subject": "Mathematics",        // optional; defaults to profile subject
    "content": "linear equations"    // required — the chapter/topic
  }
  ```
  `subject`, grade, and hobbies come from the user's onboarding profile when
  omitted; `content` (the chapter/topic) is required.
- **201 Created:** matches the frontend `BackendQuiz` contract (`types/backendQuiz.ts`):
  ```json
  {
    "id": "uuid",
    "type": "Quiz",
    "number_of_qns": 2,
    "questions": [
      {
        "number": 1,
        "question": "...",
        "options": [
          { "option": "A", "text": "...", "description": "explanation" },
          { "option": "B", "text": "...", "description": "explanation" },
          { "option": "C", "text": "...", "description": "explanation" },
          { "option": "D", "text": "...", "description": "explanation" }
        ],
        "answer": "A"
      }
    ]
  }
  ```
- Errors: `400` if no subject is available (complete onboarding first). `502` if
  OpenAI generation/validation fails. `401` without a valid session.

### `GET /v1/quiz`

List the user's generated quizzes, newest first.

- **Auth:** session cookie
- **200 OK:**
  ```json
  [
    {
      "id": "uuid",
      "type": "Quiz",
      "topic": "linear equations",
      "subject": "Mathematics",
      "grade": "Class 11",
      "hobbies": ["Football", "Music"],
      "number_of_qns": 5,
      "created_at": "ISO 8601"
    }
  ]
  ```

### `GET /v1/quiz/{quiz_id}`

Fetch one quiz with all questions and options.

- **Auth:** session cookie (must own the quiz)
- **200 OK:** the quiz object (`POST /v1/quiz` response shape).
- Errors: `401`, or `404` if the quiz does not exist or is not owned.

### `POST /v1/quiz/{quiz_id}/attempt`

Grade and persist an attempt. `selected` may be `null` for skipped questions;
grading compares against the stored answer letter per question.

- **Auth:** session cookie (must own the quiz)
- **Request body:**
  ```json
  {
    "answers": [
      { "number": 1, "selected": "A" },
      { "number": 2, "selected": "C" }
    ]
  }
  ```
- **200 OK:**
  ```json
  { "attempt_id": "uuid", "score": 2, "total": 2 }
  ```
- Errors: `401`, or `404` if the quiz is missing/not owned.

---

## System

### `GET /`

Health check.

- **Auth:** none
- **200 OK:** `{ "status": "ok", "service": "kartabya-backend" }`

---

## Configuration (`.env`)

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@localhost:5432/kartabya
FRONTEND_URL=http://localhost:3001        # CORS origin for credentialed requests
SESSION_COOKIE_SECURE=false               # set true behind HTTPS in production
SESSION_COOKIE_SAMESITE=lax
AUTH_SESSION_COOKIE_NAME=kartabya_session
AUTH_SESSION_TTL_SECONDS=604800           # 7 days
OPEN_AI_KEY=sk-...                        # OpenAI key for quiz generation
OPENAI_MODEL=gpt-4o-mini                  # optional
```

> Tables (including `quizzes`, `quiz_questions`, `quiz_options`,
> `quiz_attempts`, `quiz_answers`) are created at startup from the SQLAlchemy
> ORM metadata; no migration step is needed in this MVP.
