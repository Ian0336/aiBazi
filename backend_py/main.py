#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
import time
from datetime import datetime
from typing import Optional, Dict, Any

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Add the external bazi directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'external', 'bazi'))

from bazi_calculator import BaziCalculator

app = FastAPI(
    title="AI Bazi Backend (Python)",
    description="Python FastAPI backend for Chinese Bazi (八字) calculation and analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-frontend-domain.com"  # Replace with actual domain in production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Request/Response models
class BaziRequest(BaseModel):
    year: int = Field(..., ge=1900, le=2100, description="Year (1900-2100)")
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    day: int = Field(..., ge=1, le=31, description="Day (1-31)")
    hour: int = Field(..., ge=0, le=23, description="Hour (0-23)")
    is_lunar: bool = Field(False, description="Whether the date is lunar calendar")
    is_leap_month: bool = Field(False, description="Whether it's a leap month (lunar only)")
    gender: str = Field("male", description="Gender: 'male' or 'female'")

class BaziResponse(BaseModel):
    year_ganzhi: str
    month_ganzhi: str
    day_ganzhi: str
    hour_ganzhi: str
    year_pillar: Dict[str, Any]
    month_pillar: Dict[str, Any]
    day_pillar: Dict[str, Any]
    hour_pillar: Dict[str, Any]
    lunar_date: str
    solar_date: str
    nayin: Dict[str, str]
    empty_positions: Dict[str, Any]
    analysis: Dict[str, Any]

class AnalysisRequest(BaseModel):
    year_ganzhi: str = Field(..., description="Year pillar (干支)")
    month_ganzhi: str = Field(..., description="Month pillar (干支)")
    day_ganzhi: str = Field(..., description="Day pillar (干支)")
    hour_ganzhi: str = Field(..., description="Hour pillar (干支)")

class AnalysisResponse(BaseModel):
    analysis: str

class ErrorResponse(BaseModel):
    error: str
    message: Optional[str] = None

# Initialize the calculator
calculator = BaziCalculator()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "AI Bazi Backend (Python) is running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/bazi", response_model=BaziResponse)
async def calculate_bazi(request: BaziRequest):
    """
    Calculate Bazi (八字) for given date and time
    """
    try:
        # Validate date
        if not _is_valid_date(request.year, request.month, request.day):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invalid date",
                    "message": f"Date {request.year}-{request.month}-{request.day} is not valid"
                }
            )

        # Calculate bazi
        result = calculator.calculate_bazi(
            year=request.year,
            month=request.month,
            day=request.day,
            hour=request.hour,
            is_lunar=request.is_lunar,
            is_leap_month=request.is_leap_month,
            gender=request.gender
        )

        return BaziResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Invalid input",
                "message": str(e)
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Calculation failed",
                "message": str(e)
            }
        )

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_bazi(request: AnalysisRequest):
    """
    Generate AI analysis for given Bazi chart
    """
    try:
        # Basic validation
        if not all([request.year_ganzhi, request.month_ganzhi, 
                   request.day_ganzhi, request.hour_ganzhi]):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invalid input",
                    "message": "All ganzhi fields must be provided"
                }
            )

        # Generate analysis
        analysis = calculator.analyze_bazi(
            request.year_ganzhi,
            request.month_ganzhi,
            request.day_ganzhi,
            request.hour_ganzhi
        )

        return AnalysisResponse(analysis=analysis)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Analysis failed",
                "message": str(e)
            }
        )

def _is_valid_date(year: int, month: int, day: int) -> bool:
    """Validate if the given date is valid"""
    try:
        datetime(year, month, day)
        return True
    except ValueError:
        return False

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail if isinstance(exc.detail, dict) else {"error": str(exc.detail)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc)
        }
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"🚀 AI Bazi Backend (Python) starting on {host}:{port}")
    print(f"🌐 CORS enabled for frontend origins")
    print(f"🔗 Health check: http://localhost:{port}/health")
    print(f"📊 Bazi API: http://localhost:{port}/api/bazi")
    print(f"🤖 Analysis API: http://localhost:{port}/api/analyze")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    ) 