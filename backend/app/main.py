import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.connection import close_db_connection
from app.api.routes import api_router

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for graceful startup and shutdown."""
    # Startup actions
    logger.info(f"Starting {settings.PROJECT_NAME} (env: {settings.APP_ENV})")
    logger.info(f"Allowed CORS origins: {settings.allowed_origins}")
    yield
    # Shutdown actions
    logger.info("Application shutting down...")
    close_db_connection()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/",
    tags=["Root"],
    summary="Root Service Status",
    description="Returns project identity, server status, and navigation links to documentation and health endpoints.",
)
async def root():
    """Root endpoint confirming service identity and status."""
    return {
        "project": settings.PROJECT_NAME,
        "description": settings.PROJECT_DESCRIPTION,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
        "health_check": "/health",
        "db_health_check": "/health/db",
    }


# Include modular route registry
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
