"""Async SQLAlchemy engine, sessions, and ORM schema initialization."""

from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.db.base import Base
from app.db import models  # noqa: F401 - registers ORM models with Base.metadata


engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,
)
SessionFactory = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncIterator[AsyncSession]:
    """Yield one database session per request."""
    async with SessionFactory() as session:
        yield session


async def init_db() -> None:
    """Create missing tables through SQLAlchemy ORM metadata."""
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Dispose the async connection pool during application shutdown."""
    await engine.dispose()
