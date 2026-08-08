"""Authenticated quiz generation, retrieval, and grading endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_user
from app.db.models import (
    Hobby,
    Quiz,
    QuizAnswer,
    QuizAttempt,
    QuizOption,
    QuizQuestion,
    User,
    UserHobby,
    UserProfile,
)
from app.db.session import get_db
from app.quiz.generator import generate_quiz
from app.quiz.schemas import (
    AttemptResult,
    AttemptSubmit,
    QuizGenerateRequest,
    QuizListItem,
    QuizOptionOut,
    QuizOut,
    QuizQuestionOut,
)

router = APIRouter(prefix="/v1", tags=["quiz"])

LETTERS = ["A", "B", "C", "D"]


async def load_user_hobbies(db: AsyncSession, user_id: UUID) -> list[str]:
    """Return the user's hobby names from their onboarding selections."""
    result = await db.execute(
        select(Hobby.name)
        .join(UserHobby, UserHobby.hobby_id == Hobby.id)
        .where(UserHobby.user_id == user_id)
        .order_by(Hobby.name)
    )
    return list(result.scalars().all())


async def load_user_profile(
    db: AsyncSession, user_id: UUID
) -> UserProfile | None:
    """Fetch the user's onboarding profile without lazy-loading."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_owned_quiz(
    db: AsyncSession, quiz_id: UUID, user_id: UUID
) -> Quiz:
    """Fetch a quiz eagerly with questions and options, enforcing ownership."""
    result = await db.execute(
        select(Quiz)
        .options(
            selectinload(Quiz.questions).selectinload(QuizQuestion.options),
        )
        .where(Quiz.id == quiz_id, Quiz.user_id == user_id)
    )
    quiz = result.scalar_one_or_none()
    if quiz is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found.",
        )
    return quiz


def quiz_to_out(quiz: Quiz) -> QuizOut:
    """Convert an ORM quiz into the frontend contract shape."""
    return QuizOut(
        id=quiz.id,
        type=quiz.type,
        number_of_qns=quiz.number_of_qns,
        questions=[
            QuizQuestionOut(
                number=question.number,
                question=question.question,
                options=[
                    QuizOptionOut(
                        option=option.option,
                        text=option.text,
                        description=option.description,
                    )
                    for option in question.options
                ],
                answer=question.answer,
            )
            for question in quiz.questions
        ],
    )


@router.post("/quiz", response_model=QuizOut, status_code=status.HTTP_201_CREATED)
async def create_quiz(
    payload: QuizGenerateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> QuizOut:
    """Generate a personalized quiz around a chapter and persist it."""
    profile = await load_user_profile(db, user.id)
    hobbies = await load_user_hobbies(db, user.id)
    if payload.user_interest:
        hobbies.append(payload.user_interest)
    subject = payload.subject or (profile.primary_subject if profile else None)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A subject is required; provide one or complete onboarding.",
        )

    try:
        generated = await generate_quiz(
            subject=subject,
            topic=payload.content,
            grade=profile.grade if profile else None,
            hobbies=hobbies,
            number_of_qns=payload.number_of_qns,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Quiz generation failed: {exc}",
        ) from exc

    quiz = Quiz(
        user_id=user.id,
        type=payload.type,
        topic=payload.content,
        subject=subject,
        grade=profile.grade if profile else None,
        hobbies=hobbies,
        number_of_qns=len(generated.questions),
    )
    db.add(quiz)
    await db.flush()
    for number, question in enumerate(generated.questions, start=1):
        stored = QuizQuestion(
            quiz_id=quiz.id,
            number=number,
            question=question.question,
            answer=LETTERS[question.answer_index],
        )
        db.add(stored)
        await db.flush()
        for index, option in enumerate(question.options):
            db.add(
                QuizOption(
                    question_id=stored.id,
                    position=index,
                    option=LETTERS[index],
                    text=option.text,
                    description=option.explanation,
                )
            )
    await db.commit()

    saved = await get_owned_quiz(db, quiz.id, user.id)
    return quiz_to_out(saved)


@router.get("/quiz", response_model=list[QuizListItem])
async def list_quizzes(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[QuizListItem]:
    """Return the user's generated quizzes, newest first."""
    result = await db.execute(
        select(Quiz)
        .where(Quiz.user_id == user.id)
        .order_by(Quiz.created_at.desc())
    )
    return [QuizListItem.model_validate(quiz) for quiz in result.scalars().all()]


@router.get("/quiz/{quiz_id}", response_model=QuizOut)
async def get_quiz(
    quiz_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> QuizOut:
    """Return one quiz with all questions and options."""
    quiz = await get_owned_quiz(db, quiz_id, user.id)
    return quiz_to_out(quiz)


@router.post("/quiz/{quiz_id}/attempt", response_model=AttemptResult)
async def submit_attempt(
    quiz_id: UUID,
    payload: AttemptSubmit,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AttemptResult:
    """Grade a submitted attempt and persist it for history."""
    quiz = await get_owned_quiz(db, quiz_id, user.id)
    questions = {question.number: question for question in quiz.questions}

    attempt = QuizAttempt(quiz_id=quiz.id, user_id=user.id, total=len(questions))
    db.add(attempt)
    await db.flush()
    score = 0
    for answer in payload.answers:
        question = questions.get(answer.number)
        if question is None:
            continue
        is_correct = answer.selected == question.answer
        if is_correct:
            score += 1
        db.add(
            QuizAnswer(
                attempt_id=attempt.id,
                question_id=question.id,
                selected=answer.selected,
                is_correct=is_correct,
            )
        )
    attempt.score = score
    await db.commit()
    return AttemptResult(attempt_id=attempt.id, score=score, total=attempt.total)
