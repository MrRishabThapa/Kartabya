# Kartabya Backend

FastAPI backend with Google OAuth sign-in.

## Current authentication behavior

Google sign-in is intentionally non-persistent for now. After Google returns a
verified identity, the backend prints the user profile to the server console and
redirects to the frontend. It does not create a database, save a user record, or
issue an application session token.

The `kartabya_oauth_state` cookie is temporary OAuth state used by Authlib to
protect the sign-in flow. It is not a user database or a logged-in user session.

## Project structure

```text
app/
├── api/routes.py       # Health and general API routes
├── auth/google.py      # Google OAuth client and console output
├── auth/routes.py      # Google login and callback endpoints
├── core/config.py      # Environment-backed settings
└── main.py             # FastAPI app factory
main.py                 # Compatibility entrypoint
```

## Setup

Copy `.env.example` to `.env` and set:

- `GOOGLE_CLIENT_ID`: Google OAuth 2.0 web client ID
- `GOOGLE_CLIENT_SECRET`: matching client secret
- `SESSION_SECRET_KEY`: long, random secret for the temporary OAuth cookie

In Google Cloud Console, add this authorized redirect URI:

`http://localhost:8000/auth/google/callback`

Run the backend with:

```bash
uv run uvicorn app.main:app --reload
```

Start Google sign-in at `http://localhost:8000/auth/google`.
