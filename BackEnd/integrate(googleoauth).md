# Integrating Google OAuth with a Next.js Frontend

This guide explains how to connect a Next.js frontend to the existing Kartabya
backend Google OAuth flow.

## Current backend behavior

The backend currently:

1. Redirects the browser to Google from `GET /auth/google`.
2. Handles Google’s callback at `GET /auth/google/callback`.
3. Validates the OAuth state, PKCE verifier, OIDC nonce, Google subject, and
   verified email.
4. Prints the Google profile in the backend terminal.
5. Discards the profile and redirects to the configured frontend URL.

There is currently no database user record, JWT, application session, or
frontend-readable user object. This integration proves the Google sign-in flow;
it is not yet persistent application authentication.

## 1. Configure Google Cloud

In Google Cloud Console:

1. Create or select a Google Cloud project.
2. Configure the OAuth consent screen.
3. Create an OAuth client with application type **Web application**.
4. Add this authorized redirect URI for local development:

   `http://localhost:8000/auth/google/callback`

The redirect URI must match the backend value exactly, including scheme, host,
port, path, and trailing slash behavior.

Never put the Google client secret in the Next.js app or expose it through a
`NEXT_PUBLIC_` variable.

## 2. Configure the backend

In the backend `.env` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET_KEY=use-a-long-random-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
FRONTEND_URL=http://localhost:3000
SESSION_COOKIE_SECURE=false
```

Start the backend from the backend directory:

```bash
uv run uvicorn app.main:app --reload --port 8000
```

The backend must be running before the frontend starts the sign-in flow.

## 3. Configure the Next.js frontend

Create a frontend environment file such as `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Only the backend base URL belongs in a public frontend variable. The Google
client secret and `SESSION_SECRET_KEY` belong only in the backend environment.

The backend CORS policy allows the origin configured by `FRONTEND_URL`. With
the local settings above, browser requests from `http://localhost:3000` are
allowed and credentials are enabled for the temporary OAuth cookie. Do not use
`Access-Control-Allow-Origin: *` with credentials.

If the frontend is opened from another device on the same network, replace
`localhost` with the development machine’s LAN IP in both frontend and backend
configuration. For example:

```env
# Backend .env
FRONTEND_URL=http://192.168.1.20:3000

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://192.168.1.20:8000
```

The LAN IP must also be reachable from the device, and the backend’s Google
redirect URI must use a host that Google accepts and that the browser can reach.

## 4. Add a sign-in button

For a Next.js App Router page or component, use a normal browser link:

```tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function SignInButton() {
  return (
    <a href={`${apiUrl}/auth/google`}>
      Continue with Google
    </a>
  );
}
```

For a client component, the same URL can be opened with `window.location.href`:

```tsx
"use client";

export function GoogleSignInButton() {
  function signIn() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  }

  return <button onClick={signIn}>Continue with Google</button>;
}
```

Do not call the OAuth start endpoint with `fetch`. OAuth requires a full browser
navigation so that Google can display its consent screen and return to the
backend callback.

## 5. Configure the frontend return page

The backend redirects to `FRONTEND_URL` after a successful callback. With the
local configuration above, this is:

`http://localhost:3000`

The frontend can show a generic success message, for example:

```tsx
export default function HomePage() {
  return (
    <main>
      <h1>Kartabya</h1>
      <p>Google sign-in completed. Check the backend terminal for the profile.</p>
    </main>
  );
}
```

Because the current backend does not return a user object or session token, the
frontend cannot yet display the signed-in user or protect authenticated pages.

## 6. Test the complete flow

Run both applications:

```bash
# Terminal 1: backend
uv run uvicorn app.main:app --reload --port 8000

# Terminal 2: Next.js frontend
npm run dev
```

Then open the frontend and click **Continue with Google**. The expected flow is:

```text
Next.js button
    -> backend /auth/google
    -> Google consent screen
    -> backend /auth/google/callback
    -> profile printed in backend terminal
    -> frontend at http://localhost:3000
```

## Troubleshooting

### `redirect_uri_mismatch`

The URI in Google Cloud Console does not exactly match
`GOOGLE_REDIRECT_URI`. Check the port, protocol, path, and trailing slash.

### The frontend link goes to the wrong address

Check `NEXT_PUBLIC_API_URL`, restart the Next.js dev server after changing
`.env.local`, and confirm that the backend is running on that address.

### The backend cannot complete the callback

Confirm that `SESSION_SECRET_KEY` is set, the OAuth cookie is enabled, and the
browser is completing the flow from the same host. For local HTTP development,
keep `SESSION_COOKIE_SECURE=false`; use `true` only when serving over HTTPS.

### Sign-in succeeds but the frontend has no user information

This is expected in the current phase. The backend only prints and discards the
profile. A later phase must add a deliberate user model and an application
session or token contract before the frontend can use authenticated state.

## Production checklist

- Use HTTPS for the frontend and backend.
- Set `SESSION_COOKIE_SECURE=true`.
- Register the production callback URI in Google Cloud Console.
- Set `GOOGLE_REDIRECT_URI` and `FRONTEND_URL` to production URLs.
- Keep Google secrets server-side and rotate exposed credentials.
- Stop printing complete Google profiles to logs.
- Add a backend-owned session or token before treating users as authenticated.
