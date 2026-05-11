"""AI analysis endpoints — SSE streaming + quota status."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_calculator, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.ai import AnalyzeRequest, QuotaStatus
from app.services import ai_service, profile_service, quota_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/quota", response_model=QuotaStatus)
def get_quota(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuotaStatus:
    return QuotaStatus(**quota_service.get_status(db, current_user.id))


@router.post("/analyze")
def analyze(
    payload: AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    calculator=Depends(get_calculator),
):
    """SSE streaming AI analysis for a profile owned by the current user."""
    quota_service.assert_quota_available(db, current_user.id)

    profile = profile_service.get_for_user(db, current_user.id, payload.profile_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="profile not found")

    chart = calculator.calculate_bazi(
        year=profile.birth_year,
        month=profile.birth_month,
        day=profile.birth_day,
        hour=profile.birth_hour,
        is_lunar=profile.is_lunar,
        is_leap_month=profile.is_leap_month,
        gender=profile.gender,
    )

    generator = ai_service.stream_analysis(
        db=db,
        user_id=current_user.id,
        profile=profile,
        chart=chart,
    )
    # text/event-stream + X-Accel-Buffering off so reverse proxies don't buffer the chunks.
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
