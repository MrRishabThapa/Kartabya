"""FastAPI application factory and application entrypoint."""

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.api.routes import router as api_router
from app.auth.routes import router as auth_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Manage application startup and shutdown hooks."""
    yield


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    application = FastAPI(
        title="Kartabya Backend",
        description="Backend services for Kartabya.",
        version="0.1.0",
        lifespan=lifespan,
    )

    # Authlib uses this signed, temporary cookie for OAuth state and PKCE data.
    # No Google user profile is stored in this session or anywhere else yet.
    application.add_middleware(
        SessionMiddleware,
        secret_key=settings.session_secret_key,
        session_cookie="kartabya_oauth_state",
        same_site="lax",
        https_only=settings.session_cookie_secure,
    )

    # The Next.js frontend runs on localhost:3000 during development. Keep the
    # origin explicit because OAuth state is stored in a credentialed cookie.
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_url.rstrip("/")],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(api_router)
    application.include_router(auth_router)
    return application


app = create_app()
