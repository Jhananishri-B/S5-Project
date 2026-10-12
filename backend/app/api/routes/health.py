from fastapi import APIRouter, Response, status
from app.config import settings
from app.database.connection import verify_connection

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    summary="Application Health Check",
    description="Returns the current operational status of the FastAPI backend application.",
)
async def health_check():
    """Application health check endpoint."""
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.APP_ENV,
    }


@router.get(
    "/health/db",
    summary="Database Health Check",
    description="Tests the actual connection to MongoDB Atlas using the admin ping command.",
)
async def db_health_check(response: Response):
    """
    MongoDB database connection health check endpoint.
    Returns 200 OK if ping succeeds, or 503 Service Unavailable if unconfigured or unreachable.
    """
    result = verify_connection()
    if not result.get("connected", False):
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return result
