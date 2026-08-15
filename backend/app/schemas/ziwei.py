#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pydantic models for the Zi Wei Dou Shu (紫微斗數) API.

Field naming follows the rest of the backend (snake_case), not iztro's
camelCase, so the frontend consumes it the same way it consumes /api/bazi.
"""

from datetime import date
from typing import Any, List, Literal, Optional

from pydantic import BaseModel, Field

Language = Literal["zh-TW", "zh-CN", "en-US", "ja-JP", "ko-KR", "vi-VN"]


# =============================================================================
# Request Models
# =============================================================================

class ZiweiRequest(BaseModel):
    """Request model for a 紫微斗數 chart. Mirrors BaziRequest so a single
    birth-data form can drive both endpoints."""

    year: int = Field(..., ge=1900, le=2100, description="Year (1900-2100)")
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    day: int = Field(..., ge=1, le=31, description="Day (1-31)")
    hour: int = Field(..., ge=0, le=23, description="Hour (0-23)")
    is_lunar: bool = Field(False, description="Whether the date is lunar calendar")
    is_leap_month: bool = Field(False, description="Whether it's a leap month (lunar only)")
    gender: Literal["male", "female"] = Field("male", description="Gender")
    language: Language = Field("zh-TW", description="Output language")
    fix_leap: bool = Field(
        True, description="Split a leap month at the 15th (iztro's fixLeap)"
    )
    horoscope_date: Optional[date] = Field(
        None,
        description="Solar date to resolve 運限 (大限/流年/流月/流日/流時/小限) for. Omit to skip.",
        examples=["2026-08-15"],
    )


# =============================================================================
# Component Models
# =============================================================================

class ZiweiStar(BaseModel):
    """A single star sitting in a palace."""

    name: str = Field(..., description="Star name, e.g. 紫微")
    type: Optional[str] = Field(None, description="Star category, e.g. major/soft/tough/flower")
    scope: Optional[str] = Field(None, description="Scope the star belongs to, e.g. origin")
    brightness: Optional[str] = Field(None, description="廟旺利陷 brightness, major/minor stars only")
    mutagen: Optional[str] = Field(None, description="四化: 祿/權/科/忌, if any")


class ZiweiDecadal(BaseModel):
    """大限 anchor for a palace."""

    range: List[int] = Field(..., description="Age range [start, end] this palace governs")
    heavenly_stem: Optional[str] = Field(None, description="Heavenly stem of the 大限")
    earthly_branch: Optional[str] = Field(None, description="Earthly branch of the 大限")


class ZiweiPalace(BaseModel):
    """One of the twelve palaces."""

    index: int = Field(..., description="Palace index 0-11, fixed to the earthly branch order")
    name: str = Field(..., description="Palace name, e.g. 命宮")
    is_body_palace: bool = Field(..., description="Whether this palace is also 身宮")
    is_original_palace: bool = Field(..., description="Whether this is 來因宮")
    heavenly_stem: str = Field(..., description="Heavenly stem of the palace")
    earthly_branch: str = Field(..., description="Earthly branch of the palace")
    major_stars: List[ZiweiStar] = Field(..., description="主星")
    minor_stars: List[ZiweiStar] = Field(..., description="輔星")
    adjective_stars: List[ZiweiStar] = Field(..., description="雜曜")
    changsheng12: str = Field(..., description="長生十二神")
    boshi12: str = Field(..., description="博士十二神")
    jiangqian12: str = Field(..., description="將前十二神")
    suiqian12: str = Field(..., description="歲前十二神")
    decadal: Optional[ZiweiDecadal] = Field(None, description="大限 anchor")
    ages: List[int] = Field(..., description="小限 ages that land on this palace")


class ZiweiHoroscopeScope(BaseModel):
    """One layer of 運限 — 大限, 流年, 流月, 流日, 流時 or 小限."""

    index: Optional[int] = Field(None, description="Palace index this layer starts from")
    name: Optional[str] = Field(None, description="Layer name, e.g. 大限")
    heavenly_stem: Optional[str] = Field(None, description="Heavenly stem of the layer")
    earthly_branch: Optional[str] = Field(None, description="Earthly branch of the layer")
    palace_names: List[str] = Field(
        default_factory=list, description="Palace names re-anchored to this layer, by palace index"
    )
    mutagen: List[str] = Field(
        default_factory=list, description="四化 stars of this layer, in 祿權科忌 order"
    )
    stars: Optional[Any] = Field(None, description="Layer-specific stars, when iztro provides them")


class ZiweiHoroscope(BaseModel):
    """運限 resolved for a given date."""

    solar_date: str = Field(..., description="The date this horoscope was resolved for")
    lunar_date: str = Field(..., description="Corresponding lunar date")
    nominal_age: Optional[int] = Field(None, description="虛歲 on that date")
    decadal: Optional[ZiweiHoroscopeScope] = Field(None, description="大限")
    yearly: Optional[ZiweiHoroscopeScope] = Field(None, description="流年")
    monthly: Optional[ZiweiHoroscopeScope] = Field(None, description="流月")
    daily: Optional[ZiweiHoroscopeScope] = Field(None, description="流日")
    hourly: Optional[ZiweiHoroscopeScope] = Field(None, description="流時")
    age_scope: Optional[ZiweiHoroscopeScope] = Field(None, description="小限 (iztro's horoscope.age)")


# =============================================================================
# Response Models
# =============================================================================

class ZiweiResponse(BaseModel):
    """Complete 紫微斗數 chart."""

    solar_date: str = Field(..., description="Solar calendar date")
    lunar_date: str = Field(..., description="Lunar date in Chinese numerals")
    chinese_date: str = Field(..., description="四柱 (year/month/day/hour ganzhi)")
    year_divide: str = Field(
        ...,
        description=(
            "Year-boundary convention behind chinese_date. 'normal' means the year "
            "stem/branch rolls over on 農曆正月初一 (iztro's default), which differs "
            "from /api/bazi — that endpoint divides on 立春. For roughly 7 days a "
            "year the two will report a different 年柱, and hence different 四化."
        ),
    )
    time: str = Field(..., description="時辰 name, e.g. 巳時")
    time_range: str = Field(..., description="Clock range of the 時辰")
    time_index: int = Field(..., description="iztro 時辰 index 0-12 (0 早子時, 12 晚子時)")
    gender: str = Field(..., description="Gender as rendered in the chart language")
    zodiac: str = Field(..., description="生肖")
    sign: str = Field(..., description="星座")
    five_elements_class: str = Field(..., description="五行局, e.g. 火六局")
    soul: str = Field(..., description="命主")
    body: str = Field(..., description="身主")
    soul_palace_branch: str = Field(..., description="Earthly branch of 命宮")
    body_palace_branch: str = Field(..., description="Earthly branch of 身宮")
    language: str = Field(..., description="Language the chart was rendered in")
    palaces: List[ZiweiPalace] = Field(..., description="Twelve palaces, by palace index")
    horoscope: Optional[ZiweiHoroscope] = Field(
        None, description="運限, present only when horoscope_date was supplied"
    )
