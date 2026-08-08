"""Request, response, and LLM output schemas for quiz generation."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.api.onboarding import clean_required_text


class QuizGenerateRequest(BaseModel):
    """Payload for generating a personalized quiz."""

    type: str = Field(default="Quiz", max_length=40)
    number_of_qns: int = Field(default=5, ge=1, le=20)
    user_interest: str | None = Field(default=None, max_length=500)
    subject: str | None = Field(default=None, max_length=120)
    content: str = Field(min_length=1, max_length=500)

    @field_validator("content", "user_interest", "subject")
    @classmethod
    def validate_text(cls, value: object, info) -> object:
        if value is None:
            return value
        if isinstance(value, str):
            return clean_required_text(value, info.field_name)
        return value


class QuizOptionOut(BaseModel):
    """One multiple-choice option matching the frontend contract."""

    option: str
    text: str
    description: str


class QuizQuestionOut(BaseModel):
    """One question matching the frontend ``BackendQuestion`` shape."""

    number: int
    question: str
    options: list[QuizOptionOut]
    answer: str


class QuizOut(BaseModel):
    """A generated quiz matching the frontend ``BackendQuiz`` shape."""

    id: UUID
    type: str
    number_of_qns: int
    questions: list[QuizQuestionOut]


class QuizListItem(BaseModel):
    """Compact quiz summary for history listings."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    type: str
    topic: str
    subject: str
    grade: str | None
    hobbies: list[str]
    number_of_qns: int
    created_at: datetime


class GeneratedOption(BaseModel):
    """Raw option text returned by the LLM."""

    text: str
    explanation: str


class GeneratedQuestion(BaseModel):
    """Raw question returned by the LLM before letter assignment."""

    question: str
    options: list[GeneratedOption] = Field(min_length=4, max_length=4)
    answer_index: int = Field(ge=0, le=3)


class GeneratedQuiz(BaseModel):
    """Strictly validated JSON output from the LLM."""

    questions: list[GeneratedQuestion] = Field(min_length=1)


class AttemptAnswer(BaseModel):
    """A user's answer to one question during an attempt."""

    number: int = Field(ge=1)
    selected: str | None = Field(default=None, max_length=1)


class AttemptSubmit(BaseModel):
    """Payload for grading a finished quiz attempt."""

    answers: list[AttemptAnswer] = Field(min_length=1)


class AttemptResult(BaseModel):
    """Graded result of a quiz attempt."""

    attempt_id: UUID
    score: int
    total: int
