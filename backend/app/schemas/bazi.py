#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pydantic models for Bazi API requests and responses.

This module defines all data models used for validating API inputs
and structuring API outputs.
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


# =============================================================================
# Request Models
# =============================================================================

class BaziRequest(BaseModel):
    """Request model for Bazi calculation."""
    year: int = Field(..., ge=1900, le=2100, description="Year (1900-2100)")
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    day: int = Field(..., ge=1, le=31, description="Day (1-31)")
    hour: int = Field(..., ge=0, le=23, description="Hour (0-23)")
    is_lunar: bool = Field(False, description="Whether the date is lunar calendar")
    is_leap_month: bool = Field(False, description="Whether it's a leap month (lunar only)")
    gender: str = Field("male", description="Gender: 'male' or 'female'")


class AnalysisRequest(BaseModel):
    """Request model for Bazi analysis."""
    year_ganzhi: str = Field(..., description="Year pillar (干支)")
    month_ganzhi: str = Field(..., description="Month pillar (干支)")
    day_ganzhi: str = Field(..., description="Day pillar (干支)")
    hour_ganzhi: str = Field(..., description="Hour pillar (干支)")


# =============================================================================
# Component Models
# =============================================================================

class HiddenStem(BaseModel):
    """Hidden stem information within earthly branches."""
    gan: str = Field(..., description="Heavenly stem")
    wuxing: Optional[str] = Field(None, description="Five element")
    ten_deity: str = Field(..., description="Ten deity relationship")
    strength: Optional[int] = Field(None, description="Strength of the hidden stem")


class Pillar(BaseModel):
    """Structure for year, month, day, and hour pillars."""
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
    shensha: List[str] = Field(..., description="List of shensha (神煞) influences")


class DayunPillar(BaseModel):
    """Simplified pillar structure for current Dayun (大運) with shensha."""
    ganzhi: str = Field(..., description="Combined heavenly stem and earthly branch")
    gan: str = Field(..., description="Heavenly stem")
    zhi: str = Field(..., description="Earthly branch")
    gan_ten_deity: str = Field(..., description="Ten deity of heavenly stem")
    zhi_ten_deity: str = Field(..., description="Twelve lifecycle stage")
    hidden_stems: List[HiddenStem] = Field(..., description="Hidden stems in earthly branch")
    nayin: str = Field(..., description="Nayin (sound) element")
    shensha: List[str] = Field(..., description="List of shensha (神煞) influences")


class LiunianPillar(BaseModel):
    """Simplified pillar structure for current Liunian (流年) with shensha."""
    year: int = Field(..., description="Calendar year")
    age: int = Field(..., description="Age during the year")
    ganzhi: str = Field(..., description="Combined heavenly stem and earthly branch")
    gan: str = Field(..., description="Heavenly stem")
    zhi: str = Field(..., description="Earthly branch")
    gan_ten_deity: str = Field(..., description="Ten deity of heavenly stem")
    zhi_ten_deity: str = Field(..., description="Twelve lifecycle stage")
    hidden_stems: List[HiddenStem] = Field(..., description="Hidden stems in earthly branch")
    nayin: str = Field(..., description="Nayin (sound) element")
    shensha: List[str] = Field(..., description="List of shensha (神煞) influences")


class LiunianEntry(BaseModel):
    """Annual fortune entry within a major period."""
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
    """Major fortune period entry."""
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


# =============================================================================
# Response Models
# =============================================================================

class BaziResponse(BaseModel):
    """Complete Bazi calculation response."""
    year_pillar: Pillar = Field(..., description="Year pillar information")
    month_pillar: Pillar = Field(..., description="Month pillar information")
    day_pillar: Pillar = Field(..., description="Day pillar information")
    hour_pillar: Pillar = Field(..., description="Hour pillar information")
    dayun: List[DayunEntry] = Field(..., description="Major fortune periods")
    dayun_pillar: Optional[DayunPillar] = Field(None, description="Current dayun pillar with shensha")
    liunian_pillar: Optional[LiunianPillar] = Field(None, description="Current liunian pillar with shensha")
    lunar_date: str = Field(..., description="Corresponding lunar date")
    solar_date: str = Field(..., description="Solar calendar date")
    nayin: Dict[str, str] = Field(..., description="Nayin elements for each pillar")
    empty_positions: Dict[str, Any] = Field(..., description="Empty position analysis")
    analysis: Dict[str, Any] = Field(..., description="Detailed Bazi analysis")


class AnalysisResponse(BaseModel):
    """Response model for Bazi analysis."""
    analysis: str


class ErrorResponse(BaseModel):
    """Standard error response model."""
    error: str
    message: Optional[str] = None
