# Kartabya Backend

FastAPI backend with local email/password authentication.

## Authentication

Users register and log in with an email address and password. Passwords are
hashed with Argon2. Successful signup and login create a server-side session;
the browser receives only an opaque HttpOnly `kartabya_session` cookie, while
the database stores its SHA-256 hash.

Authentication endpoints:

- `POST /api/v1/auth/signup` — create an account and start a session
- `POST /api/v1/auth/login` — authenticate and start a session
- `GET /api/v1/auth/me` — return the current user
- `POST /api/v1/auth/refresh` — extend a valid session
- `POST /api/v1/auth/logout` — revoke the current session

## Personalized quizzes

Quizzes are generated with OpenAI around the chapter or topic the student is
reading, personalized with the hobbies collected during onboarding. All quiz
endpoints require the session cookie.

- `POST /v1/quiz` — generate and persist a quiz; the topic is required
  (`content`), while subject and hobbies are taken from the user's profile
  when not provided
- `GET /v1/quiz` — list the user's generated quizzes, newest first
- `GET /v1/quiz/{id}` — fetch one quiz with all questions
- `POST /v1/quiz/{id}/attempt` — grade and persist an attempt (`{score, total}`)

The response matches the frontend `BackendQuiz` contract
(`type`, `number_of_qns`, `questions` with lettered options and explanations).
Set `OPEN_AI_KEY` (and optionally `OPENAI_MODEL`) to enable generation.

## Project structure

```text
app/
├── api/routes.py       # Health and general API routes
├── api/onboarding.py   # Authenticated onboarding persistence
├── quiz/               # Personalized quiz generation and grading
├── auth/local.py       # Email/password and session endpoints
├── auth/security.py    # Argon2 and session-token helpers
├── auth/service.py     # User and session database operations
├── core/config.py      # Environment-backed settings
├── db/models.py        # SQLAlchemy ORM models
├── db/session.py       # Async PostgreSQL session and schema setup
└── main.py             # FastAPI app factory
main.py                 # Compatibility entrypoint
```

## Setup

Copy `.env.example` to `.env` and adjust `DATABASE_URL` if needed. The
database must exist before startup; create it once with PostgreSQL's
`createdb kartabya` command or a PostgreSQL GUI. Missing tables are created
from the SQLAlchemy ORM metadata at startup.

Run the backend with:

```bash
uv run uvicorn app.main:app --reload
```

The Next.js frontend should use this public environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Credentialed requests are enabled for the configured `FRONTEND_URL` so the
session cookie works across the local frontend/backend origins.
For a frontend running on a different port or domain, add it to the
comma-separated `CORS_ORIGINS` setting.
