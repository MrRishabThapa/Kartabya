"""Compatibility entrypoint for ``uvicorn main:server``."""

from app.main import app


server = app
