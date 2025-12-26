#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Health check endpoint.

This module provides the health check endpoint for monitoring
the application status.
"""

from datetime import datetime

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        dict: Application status information including version and timestamp.
    """
    return {
        "status": "ok",
        "message": f"{settings.APP_TITLE} is running",
        "version": settings.APP_VERSION,
        "timestamp": datetime.now().isoformat()
    }
