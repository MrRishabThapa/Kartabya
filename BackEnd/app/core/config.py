"""Application configuration loaded from environment variables."""

from typing import Literal

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Settings required to run the application and authentication system."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="",
        extra="ignore",
    )

    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/kartabya",
        validation_alias="DATABASE_URL",
    )
    frontend_url: str = Field(
        default="http://localhost:3000",
        validation_alias="FRONTEND_URL",
    )
    cors_origins: str | None = Field(
        default=None,
        validation_alias="CORS_ORIGINS",
    )
    session_cookie_secure: bool = Field(
        default=False,
        validation_alias="SESSION_COOKIE_SECURE",
    )
    session_cookie_samesite: Literal["lax", "strict", "none"] = Field(
        default="lax",
        validation_alias="SESSION_COOKIE_SAMESITE",
    )
    auth_session_cookie_name: str = Field(
        default="kartabya_session",
        validation_alias="AUTH_SESSION_COOKIE_NAME",
    )
    auth_session_ttl_seconds: int = Field(
        default=604800,
        validation_alias="AUTH_SESSION_TTL_SECONDS",
        ge=300,
    )
    openai_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("OPEN_AI_KEY", "OPENAI_API_KEY"),
    )
    openai_model: str = Field(
        default="gpt-4o-mini",
        validation_alias="OPENAI_MODEL",
    )

    @property
    def allowed_cors_origins(self) -> list[str]:
        """Return configured frontend origins plus the local dev defaults."""
        origins = [
            self.frontend_url,
            "http://localhost:3000",
            "http://localhost:3001",
        ]
        if self.cors_origins:
            origins.extend(self.cors_origins.split(","))
        return list(dict.fromkeys(origin.strip().rstrip("/") for origin in origins))


def get_settings() -> Settings:
    """Build application settings from environment variables."""
    return Settings()


settings = get_settings()
