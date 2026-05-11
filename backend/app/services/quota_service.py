"""Daily AI quota — counted from successful ai_analyses rows.

Failed analyses (status='failed') do NOT count toward quota; we don't punish
users for NV NIM 5xx. There's a benign race when two requests start
simultaneously (both pass the quota check before either commits) — acceptable
for v1 single-tenant traffic, fix with a DB advisory lock if it becomes an issue.
"""

from datetime import date, datetime, time, timedelta, timezone
from uuid import UUID
from zoneinfo import ZoneInfo

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.ai_analysis import AIAnalysis


def _quota_tz() -> ZoneInfo:
    return ZoneInfo(settings.AI_QUOTA_TIMEZONE)


def _today_start_utc(now: datetime | None = None) -> datetime:
    """UTC instant matching today's 00:00 in the quota timezone."""
    tz = _quota_tz()
    now_local = (now or datetime.now(timezone.utc)).astimezone(tz)
    start_local = datetime.combine(now_local.date(), time.min, tzinfo=tz)
    return start_local.astimezone(timezone.utc)


def _next_reset_utc(now: datetime | None = None) -> datetime:
    """UTC instant matching tomorrow's 00:00 in the quota timezone."""
    tz = _quota_tz()
    now_local = (now or datetime.now(timezone.utc)).astimezone(tz)
    tomorrow_local = datetime.combine(now_local.date() + timedelta(days=1), time.min, tzinfo=tz)
    return tomorrow_local.astimezone(timezone.utc)


def get_today_count(db: Session, user_id: UUID) -> int:
    """How many successful AI analyses this user has made since today's local midnight."""
    stmt = (
        select(func.count(AIAnalysis.id))
        .where(AIAnalysis.user_id == user_id)
        .where(AIAnalysis.status == "completed")
        .where(AIAnalysis.created_at >= _today_start_utc())
    )
    return int(db.scalar(stmt) or 0)


def get_status(db: Session, user_id: UUID) -> dict:
    used = get_today_count(db, user_id)
    return {
        "used": used,
        "limit": settings.AI_DAILY_QUOTA,
        "remaining": max(0, settings.AI_DAILY_QUOTA - used),
        "resets_at": _next_reset_utc(),
    }


def assert_quota_available(db: Session, user_id: UUID) -> None:
    """Raise 429 if the user has hit today's limit."""
    used = get_today_count(db, user_id)
    if used >= settings.AI_DAILY_QUOTA:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "quota_exceeded",
                "message": f"daily limit of {settings.AI_DAILY_QUOTA} reached",
                "resets_at": _next_reset_utc().isoformat(),
            },
        )
