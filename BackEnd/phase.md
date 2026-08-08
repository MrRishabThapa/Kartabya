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
companion nickname, and selected hobbies. Saving is idempotent: resubmitting
onboarding updates the profile and replaces the user's hobby links.

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
