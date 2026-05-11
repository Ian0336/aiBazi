"""API routes module."""

from fastapi import APIRouter

from app.api.routes import ai, auth, bazi, health, profiles

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(bazi.router, prefix="/api", tags=["Bazi"])
api_router.include_router(auth.router, prefix="/api", tags=["Auth"])
api_router.include_router(profiles.router, prefix="/api", tags=["Profiles"])
api_router.include_router(ai.router, prefix="/api", tags=["AI"])
