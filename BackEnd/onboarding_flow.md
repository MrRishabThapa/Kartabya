# Onboarding and Local Authentication Flow

The frontend collects onboarding choices before account creation and stores
them temporarily in `sessionStorage` under `arcademia-onboarding-draft`.

## Flow

1. The user completes `/onboarding`.
2. The draft is saved locally and the user goes to `/auth/signup`.
3. Signup calls `POST /api/v1/auth/signup` with email, password, and name.
4. The backend hashes the password, creates the user, and sets the session cookie.
5. The frontend sends the draft to `POST /api/v1/onboard` with credentials.
6. The user is redirected to `/dashboard`.

Returning users use the same sequence from `/auth/login`; after login, any
remaining onboarding draft is submitted before the dashboard opens.

## Request examples

```json
POST /api/v1/auth/signup
{
  "email": "student@example.com",
  "password": "a-password-with-8-chars",
  "name": "Student"
}
```

```json
POST /api/v1/onboard
{
  "userName": "Student",
  "foxNickname": "Panda",
  "hobbies": ["Reading", "Music"],
  "targetCourse": {
    "grade": "Grade 8",
    "subject": "Mathematics"
  }
}
```

Both authenticated endpoints use the HttpOnly `kartabya_session` cookie. A
missing, expired, or revoked cookie returns `401 Unauthorized`.
