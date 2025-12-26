#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Application configuration settings.

This module contains all configuration settings for the FastAPI application,
including CORS origins, API metadata, and environment variables.
"""

import os
from typing import List


class Settings:
    """Application settings loaded from environment variables."""

    # API Metadata
    APP_TITLE: str = "AI Bazi Backend (Python)"
    APP_DESCRIPTION: str = "Python FastAPI backend for Chinese Bazi (八字) calculation and analysis"
    APP_VERSION: str = "1.0.0"

    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))

    # CORS settings
    # CORS_ORIGINS supports comma-separated list (e.g., "http://localhost:3000,https://example.com")
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]


# Global settings instance
settings = Settings()
