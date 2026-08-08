"""Request and response schemas for application authentication."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class EmailAuthRequest(BaseModel):
    """Shared request validation for local email authentication."""

    email: EmailStr

    @field_validator("email", mode="before")
    @classmethod
    def trim_email(cls, value: object) -> object:
        """Accept copied email addresses with accidental surrounding spaces."""
        return value.strip() if isinstance(value, str) else value


class SignupRequest(EmailAuthRequest):
    """Payload for local email/password registration."""

    password: str = Field(min_length=8, max_length=128)
    name: str | None = Field(default=None, max_length=160)


class LoginRequest(EmailAuthRequest):
    """Payload for local email/password login."""

    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    """Safe user representation returned to the frontend."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    name: str | None
    avatar_url: str | None
    email_verified: bool
    is_onboarded: bool


class AuthResponse(BaseModel):
    """Successful authentication response."""

    user: UserResponse
