from fastapi import APIRouter
from app.api.routes.health import router as health_router

# Root router for modular API endpoints
api_router = APIRouter()

# Include health routes at top level or under /api
api_router.include_router(health_router)

# Future feature routers (e.g., content, materials, accessibility) will be registered here:
# api_router.include_router(materials_router, prefix="/materials", tags=["Materials"])
