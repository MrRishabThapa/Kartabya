"""General API and health-check routes."""

from fastapi import APIRouter


router = APIRouter(tags=["system"])


@router.get("/", summary="Health check")
async def home() -> dict[str, str]:
    """Confirm that the backend is running."""
    return {"status": "ok", "service": "kartabya-backend"}
