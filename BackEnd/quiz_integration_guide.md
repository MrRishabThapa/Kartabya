# Quiz Integration Guide

Guide for integrating the personalized quiz feature into the Kartabya
frontend. The backend generates multiple-choice quizzes with OpenAI, tailored
to the student's hobbies (collected during onboarding) and the chapter or
topic they are currently reading.

## How it works

1. The student completes onboarding (hobbies, grade, subject).
2. The frontend calls `POST /v1/quiz` with the chapter/topic they are reading.
3. The backend loads the user's hobbies, grade, and subject from the profile,
   asks OpenAI to generate questions that weave the hobbies into scenarios,
   persists the quiz, and returns it.
4. After the student finishes, the frontend submits the answers to
   `POST /v1/quiz/{id}/attempt`, which grades them and stores the history.

All quiz endpoints require the authenticated session cookie
(`kartabya_session`). On the frontend, use the shared `api` helper from
`lib/api.ts` — it sends `credentials: "include"` and transparently refreshes
expired sessions.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/v1/quiz` | Generate and persist a personalized quiz |
| `GET` | `/v1/quiz` | List the user's quizzes, newest first |
| `GET` | `/v1/quiz/{quiz_id}` | Fetch one quiz with all questions |
| `POST` | `/v1/quiz/{quiz_id}/attempt` | Grade and persist an attempt |

## Generate a quiz

Request:

```json
POST /v1/quiz
{
  "type": "Quiz",
  "number_of_qns": 5,
  "user_interest": "Football, Music",
  "subject": "Mathematics",
  "content": "linear equations"
}
```

- `content` is required — the chapter/topic being studied.
- `subject`, `user_interest`, and the student's grade are taken from the
  onboarding profile when omitted; anything provided in the request is used
  on top of it. The backend always merges the profile's hobbies into the
  personalization.

Response (matches `types/backendQuiz.ts` exactly, plus `id`):

```json
{
  "id": "3f0c9b2e-...",
  "type": "Quiz",
  "number_of_qns": 2,
  "questions": [
    {
      "number": 1,
      "question": "A football team ... how many players ...?",
      "options": [
        { "option": "A", "text": "11", "description": "Explains the math." },
        { "option": "B", "text": "12", "description": "..." },
        { "option": "C", "text": "10", "description": "..." },
        { "option": "D", "text": "9", "description": "..." }
      ],
      "answer": "A"
    }
  ]
}
```

Generation takes a few seconds (LLM call, synchronous). Show a skeleton
loader while waiting, like `components/quiz/QuizSkeletonContent.tsx` does.

## Submit an attempt

Request:

```json
POST /v1/quiz/{quiz_id}/attempt
{
  "answers": [
    { "number": 1, "selected": "A" },
    { "number": 2, "selected": "C" }
  ]
}
```

`selected` may be `null` for skipped questions. Response:

```json
{ "attempt_id": "3f0c9b2e-...", "score": 1, "total": 2 }
```

## Frontend wiring example

```ts
import { api } from "@/lib/api";
import { getOnboarding } from "@/lib/auth-service";
import type { BackendQuiz } from "@/types/backendQuiz";

// Load the profile so the quiz is personalized (best-effort).
let interests = "";
let subject = "";
try {
  const onboarding = await getOnboarding();
  interests = onboarding.hobbies.join(", ");
  subject = onboarding.targetCourse.subject;
} catch {
  // Proceed without a profile; subject must then be provided below.
}

// topic comes from the lesson/chapter the student is reading,
// e.g. `useSearchParams().get("topic")`.
const quiz: BackendQuiz & { id: string } = await api.post("/v1/quiz", {
  type: "Quiz",
  number_of_qns: 5,
  user_interest: interests,
  subject,
  content: topic,
});

// ...render quiz.questions, collect the selected letter per question...

await api.post(`/v1/quiz/${quiz.id}/attempt`, {
  answers: [{ number: 1, selected: "A" }],
});
```

## Error handling

- `401` — session missing/expired; the `api` helper retries once after
  `POST /api/v1/auth/refresh`, then surfaces `ApiError`.
- `400` — no subject available (no profile and none provided).
- `502` — OpenAI call or output validation failed; surface `detail` and offer
  a retry button.
- `404` — quiz not found (wrong owner or deleted).

## Environment

The backend reads these from `.env`:

```env
OPEN_AI_KEY=sk-...            # OpenAI API key
OPENAI_MODEL=gpt-4o-mini      # optional, defaults to gpt-4o-mini
FRONTEND_URL=http://localhost:3001  # CORS origin for credentialed requests
```

Database tables (`quizzes`, `quiz_questions`, `quiz_options`,
`quiz_attempts`, `quiz_answers`) are created automatically at backend startup
via SQLAlchemy metadata; no migration step is required in this MVP.
