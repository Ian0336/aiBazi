#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bazi calculation and analysis endpoints.

This module provides the main API endpoints for Bazi calculation
and AI-powered analysis.
"""

from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends

from app.schemas import BaziRequest, BaziResponse, AnalysisRequest, AnalysisResponse
from app.api.deps import get_calculator
from bazi.bazi_calculator import BaziCalculator

router = APIRouter()


def _is_valid_date(year: int, month: int, day: int) -> bool:
    """
    Validate if the given date is valid.
    
    Args:
        year: Year value
        month: Month value (1-12)
        day: Day value (1-31)
        
    Returns:
        bool: True if the date is valid, False otherwise.
    """
    try:
        datetime(year, month, day)
        return True
    except ValueError:
        return False


@router.post("/bazi", response_model=BaziResponse)
async def calculate_bazi(
    request: BaziRequest,
    calculator: BaziCalculator = Depends(get_calculator)
):
    """
    Calculate Bazi (八字) for given date and time.
    
    Args:
        request: Bazi calculation request with date/time parameters
        calculator: Bazi calculator instance (injected)
        
    Returns:
        BaziResponse: Complete Bazi calculation result
        
    Raises:
        HTTPException: If date is invalid or calculation fails
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Calculation failed",
                "message": str(e)
            }
        )


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_bazi(
    request: AnalysisRequest,
    calculator: BaziCalculator = Depends(get_calculator)
):
    """
    Generate AI analysis for given Bazi chart.
    
    Args:
        request: Analysis request with four pillars
        calculator: Bazi calculator instance (injected)
        
    Returns:
        AnalysisResponse: AI-generated analysis text
        
    Raises:
        HTTPException: If input is invalid or analysis fails
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

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Analysis failed",
                "message": str(e)
            }
        )
