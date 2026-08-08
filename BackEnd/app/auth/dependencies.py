"""Authentication dependencies for protected API routes."""

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.service import find_active_session
from app.core.config import settings
from app.db.models import User
from app.db.session import get_db


async def get_current_user(
    request: Request, db: AsyncSession = Depends(get_db)
) -> User:
    """Require a valid server-side login session."""
    session = await find_active_session(
        db, request.cookies.get(settings.auth_session_cookie_name)
    )
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    return session.user
