"""AI analysis Pydantic schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    profile_id: UUID


class QuotaStatus(BaseModel):
    used: int
    limit: int
    remaining: int
    resets_at: datetime  # next-day boundary in configured timezone (returned in UTC)
