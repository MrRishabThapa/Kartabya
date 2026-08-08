"""OpenAI-powered quiz generation with strict JSON validation."""

import json
import logging

from openai import AsyncOpenAI

from app.core.config import settings
from app.quiz.schemas import GeneratedQuiz

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are an expert quiz generator for school students. You create engaging "
    "multiple-choice quizzes about the student's current chapter or topic. "
    "Weave the student's personal interests and hobbies into the question "
    "scenarios so the quiz feels fun and personal, and match the difficulty "
    "to the student's grade level. Every question must have exactly 4 options "
    "and exactly one correct answer. Vary the position of the correct answer. "
    "Respond only with valid JSON."
)


def build_prompt(
    subject: str,
    topic: str,
    grade: str | None,
    hobbies: list[str],
    number_of_qns: int,
) -> str:
    """Compose the user prompt for the quiz generation request."""
    grade_text = grade or "an unspecified grade"
    hobbies_text = ", ".join(hobbies) if hobbies else "no specific interests"
    return (
        f"Create a {subject} quiz about \"{topic}\" for a student in {grade_text}. "
        f"The student's interests and hobbies: {hobbies_text}. "
        f"Generate exactly {number_of_qns} multiple-choice questions. "
        'Respond in this exact JSON format only: '
        '{"questions": [{"question": "...", '
        '"options": [{"text": "...", "explanation": "..."}, '
        '{"text": "...", "explanation": "..."}, '
        '{"text": "...", "explanation": "..."}, '
        '{"text": "...", "explanation": "..."}], '
        '"answer_index": 0}]} '
        "where answer_index is the 0-based index of the correct option."
    )


def parse_generated_quiz(content: str) -> GeneratedQuiz:
    """Parse and strictly validate the LLM's JSON output."""
    raw = json.loads(content)
    return GeneratedQuiz.model_validate(raw)


def _require_client() -> AsyncOpenAI:
    """Return the OpenAI client or raise a clear configuration error."""
    if not settings.openai_api_key:
        raise RuntimeError("OPEN_AI_KEY is not configured.")
    return AsyncOpenAI(api_key=settings.openai_api_key)


async def generate_quiz(
    subject: str,
    topic: str,
    grade: str | None,
    hobbies: list[str],
    number_of_qns: int,
) -> GeneratedQuiz:
    """Generate and validate a quiz, retrying once on malformed output."""
    client = _require_client()
    last_error: Exception | None = None
    for _ in range(2):
        try:
            response = await client.chat.completions.create(
                model=settings.openai_model,
                temperature=0.7,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": build_prompt(
                            subject, topic, grade, hobbies, number_of_qns
                        ),
                    },
                ],
            )
            content = response.choices[0].message.content or ""
            return parse_generated_quiz(content)
        except Exception as exc:  # noqa: BLE001 - retry on any generation failure
            last_error = exc
            logger.warning("Quiz generation attempt failed: %s", exc)
    raise last_error  # type: ignore[misc]
