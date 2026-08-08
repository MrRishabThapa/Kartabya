"""Authenticated onboarding persistence endpoints."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.models import Companion, Hobby, User, UserHobby, UserProfile, utc_now
from app.db.session import get_db

router = APIRouter(prefix="/api/v1", tags=["onboarding"])


def clean_required_text(value: str, field_name: str) -> str:
    """Trim required text and reject whitespace-only values."""
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"{field_name} must not be blank.")
    return cleaned


class TargetCourse(BaseModel):
    """The grade and primary subject selected by the user."""

    grade: str = Field(min_length=1, max_length=80)
    subject: str = Field(min_length=1, max_length=120)

    @field_validator("grade", "subject")
    @classmethod
    def validate_text(cls, value: str, info) -> str:
        return clean_required_text(value, info.field_name)


class OnboardingRequest(BaseModel):
    """Validated onboarding payload submitted after authentication."""

    userName: str = Field(min_length=1, max_length=160)
    foxNickname: str = Field(min_length=1, max_length=80)
    hobbies: list[str] = Field(min_length=1, max_length=3)
    targetCourse: TargetCourse

    @field_validator("userName", "foxNickname")
    @classmethod
    def validate_text(cls, value: str, info) -> str:
        return clean_required_text(value, info.field_name)

    @field_validator("hobbies")
    @classmethod
    def validate_hobbies(cls, values: list[str]) -> list[str]:
        cleaned: list[str] = []
        seen: set[str] = set()
        for value in values:
            hobby = clean_required_text(value, "hobby")
            if len(hobby) > 80:
                raise ValueError("Each hobby must be 80 characters or fewer.")
            key = hobby.casefold()
            if key in seen:
                raise ValueError("Hobbies must be unique.")
            seen.add(key)
            cleaned.append(hobby)
        return cleaned


class OnboardingResponse(BaseModel):
    """The persisted onboarding data returned to the frontend."""

    userName: str
    foxNickname: str
    hobbies: list[str]
    targetCourse: TargetCourse
    completedAt: datetime


def hobby_slug(name: str) -> str:
    """Create a stable case-insensitive key for a hobby."""
    return "-".join(name.casefold().split())


async def load_onboarding(
    db: AsyncSession, user_id
) -> OnboardingResponse | None:
    """Load one user's profile, companion, and hobby selections."""
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = profile_result.scalar_one_or_none()
    companion_result = await db.execute(
        select(Companion).where(Companion.user_id == user_id)
    )
    companion = companion_result.scalar_one_or_none()
    if profile is None or companion is None:
        return None

    hobby_result = await db.execute(
        select(Hobby.name)
        .join(UserHobby, UserHobby.hobby_id == Hobby.id)
        .where(UserHobby.user_id == user_id)
        .order_by(Hobby.name)
    )
    return OnboardingResponse(
        userName=profile.preferred_name,
        foxNickname=companion.nickname,
        hobbies=list(hobby_result.scalars().all()),
        targetCourse=TargetCourse(
            grade=profile.grade,
            subject=profile.primary_subject,
        ),
        completedAt=profile.onboarding_completed_at,
    )


@router.post(
    "/onboard",
    response_model=OnboardingResponse,
    status_code=status.HTTP_200_OK,
)
async def save_onboarding(
    payload: OnboardingRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OnboardingResponse:
    """Create or replace onboarding data for the authenticated user."""
    user.is_onboarded = True
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if profile is None:
        profile = UserProfile(user_id=user.id)
        db.add(profile)

    profile.preferred_name = payload.userName
    profile.grade = payload.targetCourse.grade
    profile.primary_subject = payload.targetCourse.subject
    profile.onboarding_completed_at = utc_now()

    companion_result = await db.execute(
        select(Companion).where(Companion.user_id == user.id)
    )
    companion = companion_result.scalar_one_or_none()
    if companion is None:
        companion = Companion(user_id=user.id, nickname=payload.foxNickname)
        db.add(companion)
    else:
        companion.nickname = payload.foxNickname

    await db.execute(delete(UserHobby).where(UserHobby.user_id == user.id))
    hobby_result = await db.execute(
        select(Hobby).where(
            Hobby.slug.in_([hobby_slug(name) for name in payload.hobbies])
        )
    )
    hobbies_by_slug = {hobby.slug: hobby for hobby in hobby_result.scalars()}
    for name in payload.hobbies:
        slug = hobby_slug(name)
        hobby = hobbies_by_slug.get(slug)
        if hobby is None:
            hobby = Hobby(name=name, slug=slug)
            db.add(hobby)
            await db.flush()
            hobbies_by_slug[slug] = hobby
        db.add(UserHobby(user_id=user.id, hobby_id=hobby.id))

    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Onboarding data could not be saved.",
        ) from exc

    saved = await load_onboarding(db, user.id)
    if saved is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Onboarding data was saved but could not be loaded.",
        )
    return saved


@router.get("/onboard", response_model=OnboardingResponse)
async def get_onboarding(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OnboardingResponse:
    """Return onboarding data for the authenticated user."""
    onboarding = await load_onboarding(db, user.id)
    if onboarding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Onboarding has not been completed.",
        )
    return onboarding
