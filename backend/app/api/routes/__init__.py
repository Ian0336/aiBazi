#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""API routes module."""

from fastapi import APIRouter

from app.api.routes import health, bazi

# Main API router that includes all sub-routers
api_router = APIRouter()

# Include route modules
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(bazi.router, prefix="/api", tags=["Bazi"])
