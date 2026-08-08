# Local Email/Password Authentication Integration

Kartabya uses local email/password accounts with database-backed sessions.
Passwords are stored as Argon2 hashes. The browser receives an opaque,
HttpOnly session cookie; only its SHA-256 hash is stored in PostgreSQL.

## 1. Start the backend

Create the PostgreSQL database if it does not already exist, then configure
`BackEnd/.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/Kartabya
FRONTEND_URL=http://localhost:3000
# Optional additional browser origins, comma-separated.
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_SAMESITE=lax
AUTH_SESSION_COOKIE_NAME=kartabya_session
AUTH_SESSION_TTL_SECONDS=604800
```

Run the API:

```bash
uv run uvicorn app.main:app --reload --port 8000
```

For HTTPS deployments, set `SESSION_COOKIE_SECURE=true`. If the frontend and
API are on different sites, use `SESSION_COOKIE_SAMESITE=none` and HTTPS for
both origins.

## 2. Configure the frontend

Set the Next.js API base URL in `FrontEnd/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Restart the Next.js server after changing this file. Every browser request must
use `credentials: "include"` so the HttpOnly session cookie is sent.

```ts
await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
  credentials: "include",
});
```

## 3. API contract

### Sign up

`POST /api/v1/auth/signup`

```json
{
  "email": "student@example.com",
  "password": "at-least-8-characters",
  "name": "Student"
}
```

Requirements:

- Email must be valid; surrounding whitespace is trimmed.
- Password must contain 8–128 characters.
- Email addresses are case-insensitive and unique.

Success returns `201 Created` and sets the session cookie:

```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "Student",
    "avatar_url": null,
    "email_verified": false
  }
}
```

An existing email returns `409 Conflict`.

### Log in

`POST /api/v1/auth/login`

```json
{
  "email": "student@example.com",
  "password": "at-least-8-characters"
}
```

Success returns `200 OK` and refreshes the session cookie. Invalid credentials
return `401 Unauthorized`.

### Current user

`GET /api/v1/auth/me`

Returns the authenticated user. A missing, expired, or revoked cookie returns
`401 Unauthorized`.

### Session maintenance

- `POST /api/v1/auth/refresh` extends a valid session.
- `POST /api/v1/auth/logout` revokes the current session and clears the cookie.

## 4. Redirect after login

Only redirect after the login request succeeds:

```ts
await login(email.trim(), password);
router.replace("/dashboard");
```

On page load, protect authenticated pages by calling `/api/v1/auth/me`. If it
returns `401`, redirect to `/auth/login`; otherwise render the dashboard.

## 5. CORS troubleshooting

If login succeeds but the dashboard immediately returns to `/auth/login`, open
the browser Network tab. A CORS error on `/api/v1/auth/me` or
`/api/v1/onboard` means the frontend's exact origin is absent from
`FRONTEND_URL` or `CORS_ORIGINS`. For ngrok, configure the frontend URL (not
the backend URL), or use a restricted `CORS_ORIGIN_REGEX`.

Do not use `Access-Control-Allow-Origin: *` with credentialed cookies. Add the
specific frontend origin instead, then restart the backend.
