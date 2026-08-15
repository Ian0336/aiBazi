#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Zi Wei Dou Shu (紫微斗數) chart endpoint.
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_ziwei_calculator
from app.schemas import ZiweiRequest, ZiweiResponse
from app.ziwei import ZiweiCalculator

router = APIRouter()


def _is_valid_date(year: int, month: int, day: int) -> bool:
    """Return True if the given year/month/day is a real calendar date."""
    try:
        datetime(year, month, day)
        return True
    except ValueError:
        return False


@router.post("/ziwei", response_model=ZiweiResponse)
async def calculate_ziwei(
    request: ZiweiRequest,
    calculator: ZiweiCalculator = Depends(get_ziwei_calculator),
):
    """
    Calculate a 紫微斗數 chart for the given birth data.

    Returns the twelve palaces with their stars, 四化, 大限 and 小限 anchors,
    plus 運限 for `horoscope_date` when one is supplied.

    Note that `chinese_date` follows iztro's default 正月初一 year boundary,
    which differs from /api/bazi's 立春 boundary — see `year_divide`.
    """
    try:
        # A lunar day-30 in a 29-day month is only detectable downstream, so
        # this guard is for solar input; iztro-py raises ValueError otherwise.
        if not request.is_lunar and not _is_valid_date(
            request.year, request.month, request.day
        ):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invalid date",
                    "message": f"Date {request.year}-{request.month}-{request.day} is not valid",
                },
            )

        result = calculator.calculate(
            year=request.year,
            month=request.month,
            day=request.day,
            hour=request.hour,
            is_lunar=request.is_lunar,
            is_leap_month=request.is_leap_month,
            gender=request.gender,
            language=request.language,
            fix_leap=request.fix_leap,
            horoscope_date=(
                request.horoscope_date.isoformat() if request.horoscope_date else None
            ),
        )

        return ZiweiResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={"error": "Invalid input", "message": str(e)},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Calculation failed", "message": str(e)},
        )
