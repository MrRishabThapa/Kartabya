"""FastAPI application factory and application entrypoint."""

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.api.onboarding import router as onboarding_router
from app.auth.local import router as local_auth_router
from app.core.config import settings
from app.db.session import close_db, init_db


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Manage application startup and shutdown hooks."""
    await init_db()
    try:
        yield
    finally:
        await close_db()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    application = FastAPI(
        title="Kartabya Backend",
        description="Backend services for Kartabya.",
        version="0.1.0",
        lifespan=lifespan,
    )

    # Credentialed browser sessions require an explicit origin allowlist.
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(api_router)
    application.include_router(onboarding_router)
    application.include_router(local_auth_router)
    return application


app = create_app()
