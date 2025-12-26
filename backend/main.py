#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Main entry point for running the AI Bazi Backend.

Usage:
    python main.py
    # or
    uvicorn app.main:app --reload
"""

import uvicorn
from app.core.config import settings


def main():
    """Run the FastAPI application."""
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


if __name__ == "__main__":
    main()
