"""Application configuration loaded from environment variables."""

from typing import Any

from pydantic import Field, ValidationInfo, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Settings required to run the Google OAuth integration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="",
        extra="ignore",
    )

    google_client_id: str = Field(validation_alias="GOOGLE_CLIENT_ID")
    google_client_secret: str = Field(validation_alias="GOOGLE_CLIENT_SECRET")
    session_secret_key: str = Field(validation_alias="SESSION_SECRET_KEY")
    google_redirect_uri: str = Field(
        default="http://localhost:8000/auth/google/callback",
        validation_alias="GOOGLE_REDIRECT_URI",
    )
    frontend_url: str = Field(
        default="http://localhost:3000",
        validation_alias="FRONTEND_URL",
    )
    session_cookie_secure: bool = Field(
        default=False,
        validation_alias="SESSION_COOKIE_SECURE",
    )

    @field_validator(
        "google_client_id",
        "google_client_secret",
        "session_secret_key",
        mode="before",
    )
    @classmethod
    def reject_blank_required_value(cls, value: Any, info: ValidationInfo) -> str:
        """Reject empty secrets that would otherwise pass string validation."""
        if value is None or not str(value).strip():
            raise ValueError(f"{info.field_name} must not be empty.")
        return str(value).strip()


def get_settings() -> Settings:
    """Build settings and expose a useful startup error for missing configuration."""
    try:
        return Settings()
    except ValueError as exc:
        raise RuntimeError(
            "Invalid OAuth configuration. Set GOOGLE_CLIENT_ID, "
            "GOOGLE_CLIENT_SECRET, and SESSION_SECRET_KEY in .env."
        ) from exc


settings = get_settings()
