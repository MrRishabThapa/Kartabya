"""Shared user and server-side session operations."""

from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.security import create_session_token, hash_session_token
from app.core.config import settings
from app.db.models import AuthSession, User


def normalize_email(email: str) -> str:
    """Normalize email addresses consistently before lookup and storage."""
    return email.strip().lower()


async def find_user_by_email(db: AsyncSession, email: str) -> User | None:
    """Find a user by normalized email."""
    result = await db.execute(select(User).where(User.email == normalize_email(email)))
    return result.scalar_one_or_none()


async def create_login_session(db: AsyncSession, user: User) -> str:
    """Create a database-backed session and return its raw cookie token."""
    raw_token = create_session_token()
    db.add(
        AuthSession(
            user_id=user.id,
            token_hash=hash_session_token(raw_token),
            expires_at=datetime.now(UTC)
            + timedelta(seconds=settings.auth_session_ttl_seconds),
        )
    )
    await db.commit()
    return raw_token


async def find_active_session(
    db: AsyncSession, raw_token: str | None
) -> AuthSession | None:
    """Find a non-revoked, non-expired session and eagerly load its user."""
    if not raw_token:
        return None

    result = await db.execute(
        select(AuthSession)
        .options(selectinload(AuthSession.user))
        .where(
            AuthSession.token_hash == hash_session_token(raw_token),
            AuthSession.revoked_at.is_(None),
            AuthSession.expires_at > datetime.now(UTC),
        )
    )
    return result.scalar_one_or_none()
