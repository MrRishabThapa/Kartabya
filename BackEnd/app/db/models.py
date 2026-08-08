"""ORM models for local users and login sessions."""

from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import JSON, DateTime, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utc_now() -> datetime:
    """Return a timezone-aware UTC timestamp for ORM defaults."""
    return datetime.now(UTC)


class User(Base):
    """Application user authenticated by email and password."""

    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str | None] = mapped_column(String(512), nullable=True)
    full_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    email_verified: Mapped[bool] = mapped_column(default=False)
    is_onboarded: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    sessions: Mapped[list["AuthSession"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    profile: Mapped["UserProfile | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    companion: Mapped["Companion | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    hobby_links: Mapped[list["UserHobby"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    quizzes: Mapped[list["Quiz"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def name(self) -> str | None:
        """Expose the public display name expected by API schemas."""
        return self.full_name


class AuthSession(Base):
    """Server-side login session; only its hash is stored in PostgreSQL."""

    __tablename__ = "auth_sessions"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user: Mapped[User] = relationship(back_populates="sessions")


class UserProfile(Base):
    """Personal learning choices collected during onboarding."""

    __tablename__ = "user_profiles"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    preferred_name: Mapped[str] = mapped_column(String(160))
    grade: Mapped[str] = mapped_column(String(80))
    primary_subject: Mapped[str] = mapped_column(String(120))
    onboarding_completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    user: Mapped[User] = relationship(back_populates="profile")


class Companion(Base):
    """The companion nickname chosen by a user during onboarding."""

    __tablename__ = "companions"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )
    nickname: Mapped[str] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    user: Mapped[User] = relationship(back_populates="companion")


class Hobby(Base):
    """Normalized hobby choices that users can select during onboarding."""

    __tablename__ = "hobbies"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(80))
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    user_links: Mapped[list["UserHobby"]] = relationship(
        back_populates="hobby", cascade="all, delete-orphan"
    )


class UserHobby(Base):
    """Many-to-many link between a user and a selected hobby."""

    __tablename__ = "user_hobbies"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    hobby_id: Mapped[UUID] = mapped_column(
        ForeignKey("hobbies.id", ondelete="CASCADE"), primary_key=True
    )
    selected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

    user: Mapped[User] = relationship(back_populates="hobby_links")
    hobby: Mapped[Hobby] = relationship(back_populates="user_links")


class Quiz(Base):
    """A personalized quiz generated for a user around a chapter or topic."""

    __tablename__ = "quizzes"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    type: Mapped[str] = mapped_column(String(40), default="Quiz")
    topic: Mapped[str] = mapped_column(String(500))
    subject: Mapped[str] = mapped_column(String(120))
    grade: Mapped[str | None] = mapped_column(String(80), nullable=True)
    hobbies: Mapped[list[str]] = mapped_column(JSON, default=list)
    number_of_qns: Mapped[int] = mapped_column(default=5)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    user: Mapped[User] = relationship(back_populates="quizzes")
    questions: Mapped[list["QuizQuestion"]] = relationship(
        back_populates="quiz",
        cascade="all, delete-orphan",
        order_by="QuizQuestion.number",
    )
    attempts: Mapped[list["QuizAttempt"]] = relationship(
        back_populates="quiz", cascade="all, delete-orphan"
    )


class QuizQuestion(Base):
    """One multiple-choice question belonging to a generated quiz."""

    __tablename__ = "quiz_questions"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    quiz_id: Mapped[UUID] = mapped_column(
        ForeignKey("quizzes.id", ondelete="CASCADE"), index=True
    )
    number: Mapped[int]
    question: Mapped[str] = mapped_column(String(2000))
    answer: Mapped[str] = mapped_column(String(1))

    quiz: Mapped[Quiz] = relationship(back_populates="questions")
    options: Mapped[list["QuizOption"]] = relationship(
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuizOption.position",
    )


class QuizOption(Base):
    """One multiple-choice option, with its explanation, for a question."""

    __tablename__ = "quiz_options"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    question_id: Mapped[UUID] = mapped_column(
        ForeignKey("quiz_questions.id", ondelete="CASCADE"), index=True
    )
    position: Mapped[int]
    option: Mapped[str] = mapped_column(String(1))
    text: Mapped[str] = mapped_column(String(2000))
    description: Mapped[str] = mapped_column(String(2000))

    question: Mapped[QuizQuestion] = relationship(back_populates="options")


class QuizAttempt(Base):
    """One graded attempt of a quiz by its owner."""

    __tablename__ = "quiz_attempts"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    quiz_id: Mapped[UUID] = mapped_column(
        ForeignKey("quizzes.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    score: Mapped[int] = mapped_column(default=0)
    total: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    quiz: Mapped[Quiz] = relationship(back_populates="attempts")
    answers: Mapped[list["QuizAnswer"]] = relationship(
        back_populates="attempt", cascade="all, delete-orphan"
    )


class QuizAnswer(Base):
    """The option a user selected for one question during an attempt."""

    __tablename__ = "quiz_answers"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    attempt_id: Mapped[UUID] = mapped_column(
        ForeignKey("quiz_attempts.id", ondelete="CASCADE"), index=True
    )
    question_id: Mapped[UUID] = mapped_column(
        ForeignKey("quiz_questions.id", ondelete="CASCADE")
    )
    selected: Mapped[str | None] = mapped_column(String(1), nullable=True)
    is_correct: Mapped[bool] = mapped_column(default=False)

    attempt: Mapped[QuizAttempt] = relationship(back_populates="answers")
