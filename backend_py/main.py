#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
import time
from datetime import datetime
from typing import Optional, Dict, Any, List

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

class HiddenStem(BaseModel):
    """Hidden stem information within earthly branches"""
    gan: str = Field(..., description="Heavenly stem")
    wuxing: Optional[str] = Field(None, description="Five element")
    ten_deity: str = Field(..., description="Ten deity relationship")
    strength: Optional[int] = Field(None, description="Strength of the hidden stem")

class Pillar(BaseModel):
    """Structure for year, month, day, and hour pillars"""
    ganzhi: str = Field(..., description="Combined heavenly stem and earthly branch")
    gan: str = Field(..., description="Heavenly stem")
    zhi: str = Field(..., description="Earthly branch")
    gan_wuxing: str = Field(..., description="Five element of heavenly stem")
    zhi_wuxing: str = Field(..., description="Five element of earthly branch")
    ten_deity: str = Field(..., description="Ten deity of heavenly stem")
    zhi_ten_deity: str = Field(..., description="Twelve lifecycle stage")
    hidden_stems: List[HiddenStem] = Field(..., description="Hidden stems in earthly branch")
    nayin: str = Field(..., description="Nayin (sound) element")
    harmony: str = Field(..., description="Harmony relationships")
    is_treasury: bool = Field(..., description="Whether the branch is a treasury")

class LiunianEntry(BaseModel):
    """Annual fortune entry within a major period"""
    year: int = Field(..., description="Calendar year")
    age: int = Field(..., description="Age during this year")
    ganzhi: str = Field(..., description="Ganzhi for this year")
    gan: str = Field(..., description="Heavenly stem")
    zhi: str = Field(..., description="Earthly branch")
    gan_ten_deity: str = Field(..., description="Ten deity of heavenly stem")
    zhi_ten_deity: str = Field(..., description="Twelve lifecycle stage")
    hidden_stems: List[HiddenStem] = Field(..., description="Hidden stems")
    zhi_relationships: List[str] = Field(..., description="Branch relationships")
    is_empty: bool = Field(..., description="Whether in empty position")
    is_repeated: bool = Field(..., description="Whether there's repetition")
    nayin: str = Field(..., description="Nayin element")
    special_combinations: List[str] = Field(..., description="Special combinations")
    special_patterns: List[str] = Field(..., description="Special patterns")

class DayunEntry(BaseModel):
    """Major fortune period entry"""
    start_age: int = Field(..., description="Starting age for this period")
    ganzhi: str = Field(..., description="Ganzhi for this period")
    gan: str = Field(..., description="Heavenly stem")
    zhi: str = Field(..., description="Earthly branch")
    gan_ten_deity: str = Field(..., description="Ten deity of heavenly stem")
    zhi_ten_deity: str = Field(..., description="Twelve lifecycle stage")
    gan_yinyang: str = Field(..., description="Yin/Yang of heavenly stem")
    zhi_yinyang: str = Field(..., description="Yin/Yang of earthly branch")
    hidden_stems: List[HiddenStem] = Field(..., description="Hidden stems")
    zhi_relationships: List[str] = Field(..., description="Branch relationships")
    is_empty: bool = Field(..., description="Whether in empty position")
    is_repeated: bool = Field(..., description="Whether there's repetition")
    nayin: str = Field(..., description="Nayin element")
    special_combinations: List[str] = Field(..., description="Special combinations")
    liunian: List[LiunianEntry] = Field(..., description="Annual fortune within this period")

class BaziResponse(BaseModel):
    """Complete Bazi calculation response"""
    year_pillar: Pillar = Field(..., description="Year pillar information")
    month_pillar: Pillar = Field(..., description="Month pillar information")
    day_pillar: Pillar = Field(..., description="Day pillar information")
    hour_pillar: Pillar = Field(..., description="Hour pillar information")
    dayun: List[DayunEntry] = Field(..., description="Major fortune periods")
    lunar_date: str = Field(..., description="Corresponding lunar date")
    solar_date: str = Field(..., description="Solar calendar date")
    nayin: Dict[str, str] = Field(..., description="Nayin elements for each pillar")
    empty_positions: Dict[str, Any] = Field(..., description="Empty position analysis")
    analysis: Dict[str, Any] = Field(..., description="Detailed Bazi analysis")

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