"""Password and server-side session security helpers."""

import hashlib
import secrets

from pwdlib import PasswordHash

from app.core.config import settings


password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Hash a password with the recommended Argon2 configuration."""
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    """Verify a password without revealing whether an account exists."""
    if not password_hash:
        return False
    return password_hasher.verify(password, password_hash)


def create_session_token() -> str:
    """Create the raw opaque token sent only in the HttpOnly cookie."""
    return secrets.token_urlsafe(32)


def hash_session_token(token: str) -> str:
    """Hash a session token before storing it in the database."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def set_session_cookie(response, token: str) -> None:
    """Set the secure application login cookie on a response."""
    response.set_cookie(
        key=settings.auth_session_cookie_name,
        value=token,
        max_age=settings.auth_session_ttl_seconds,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite=settings.session_cookie_samesite,
        path="/",
    )


def clear_session_cookie(response) -> None:
    """Remove the application login cookie from a response."""
    response.delete_cookie(
        key=settings.auth_session_cookie_name,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite=settings.session_cookie_samesite,
        path="/",
    )
