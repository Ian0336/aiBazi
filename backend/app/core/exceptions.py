#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Exception handlers for the FastAPI application.

This module defines custom exception handlers for consistent
error response formatting.
"""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse


async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Custom HTTP exception handler.
    
    Args:
        request: The incoming request
        exc: The HTTP exception that was raised
        
    Returns:
        JSONResponse: Formatted error response
    """
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail if isinstance(exc.detail, dict) else {"error": str(exc.detail)}
    )


async def general_exception_handler(request: Request, exc: Exception):
    """
    General exception handler for unhandled exceptions.
    
    Args:
        request: The incoming request
        exc: The exception that was raised
        
    Returns:
        JSONResponse: Formatted error response with 500 status
    """
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc)
        }
    )
