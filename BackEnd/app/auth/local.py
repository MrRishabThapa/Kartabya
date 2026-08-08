"""Email/password registration and server-side session endpoints."""

from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.schemas import AuthResponse, LoginRequest, SignupRequest, UserResponse
from app.auth.security import (
    clear_session_cookie,
    hash_password,
    set_session_cookie,
    verify_password,
)
from app.auth.service import (
    create_login_session,
    find_active_session,
    find_user_by_email,
    normalize_email,
)
from app.core.config import settings
from app.db.models import User
from app.db.session import get_db


router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    payload: SignupRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    """Create a local account and issue its login session."""
    email = normalize_email(str(payload.email))
    if await find_user_by_email(db, email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered.",
        )

    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        full_name=payload.name.strip() if payload.name else None,
        email_verified=False,
    )
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered.",
        ) from exc

    token = await create_login_session(db, user)
    set_session_cookie(response, token)
    return AuthResponse(user=UserResponse.model_validate(user))


@router.post("/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    """Verify a local password and issue an HttpOnly database-backed session."""
    user = await find_user_by_email(db, str(payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    user.last_login_at = datetime.now(UTC)
    token = await create_login_session(db, user)
    set_session_cookie(response, token)
    return AuthResponse(user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)) -> UserResponse:
    """Return the user associated with the current login session."""
    return UserResponse.model_validate(user)


@router.post("/refresh", response_model=UserResponse)
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Extend a valid session for the frontend's refresh flow."""
    session = await find_active_session(
        db, request.cookies.get(settings.auth_session_cookie_name)
    )
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    session.expires_at = datetime.now(UTC) + timedelta(
        seconds=settings.auth_session_ttl_seconds
    )
    await db.commit()
    set_session_cookie(response, request.cookies[settings.auth_session_cookie_name])
    return UserResponse.model_validate(session.user)


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> dict[str, bool]:
    """Revoke the current session and remove its cookie."""
    session = await find_active_session(
        db, request.cookies.get(settings.auth_session_cookie_name)
    )
    if session is not None:
        session.revoked_at = datetime.now(UTC)
        await db.commit()
    clear_session_cookie(response)
    return {"ok": True}
