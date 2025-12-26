#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI Bazi Backend Application.

This is the main entry point for the FastAPI application.
It creates the app instance and configures middleware and routes.
"""

import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import http_exception_handler, general_exception_handler
from app.api.routes import api_router


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        FastAPI: Configured application instance.
    """
    application = FastAPI(
        title=settings.APP_TITLE,
        description=settings.APP_DESCRIPTION,
        version=settings.APP_VERSION
    )

    # Configure CORS middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=settings.CORS_ALLOW_METHODS,
        allow_headers=settings.CORS_ALLOW_HEADERS,
    )

    # Register exception handlers
    application.add_exception_handler(HTTPException, http_exception_handler)
    application.add_exception_handler(Exception, general_exception_handler)

    # Include API routes
    application.include_router(api_router)

    return application


# Create the application instance
app = create_app()


if __name__ == "__main__":
    print(f"🚀 {settings.APP_TITLE} starting on {settings.HOST}:{settings.PORT}")
    print(f"🌐 CORS enabled for frontend origins")
    print(f"🔗 Health check: http://localhost:{settings.PORT}/health")
    print(f"📊 Bazi API: http://localhost:{settings.PORT}/api/bazi")
    print(f"🤖 Analysis API: http://localhost:{settings.PORT}/api/analyze")

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level="info"
    )
