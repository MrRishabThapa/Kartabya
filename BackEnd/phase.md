# Phase 1 — Google OAuth MVP

## Status

Google OAuth is implemented for local development.

Flow:

1. `GET /auth/google` redirects the user to Google.
2. `GET /auth/google/callback` exchanges the authorization code.
3. Authlib validates OAuth state, PKCE, and the OIDC nonce.
4. The backend verifies the Google subject, email, and `email_verified` claim.
5. The profile is printed in the backend terminal, then discarded.

## Important reminder

For now, **do not save user data**. There is no user table, database record, or
application session token. The Google profile is printed only for development
verification. Do not use this logging behavior in production because it can
expose personal data in server logs.

The `kartabya_oauth_state` cookie contains temporary OAuth flow data only; it is
not a stored user account or login session.

## Local configuration

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `SESSION_SECRET_KEY` in
`.env`, and register:

`http://localhost:8000/auth/google/callback`

Next phase: add deliberate persistence and an application session/JWT only when
the team is ready to define the user model and session rules.
