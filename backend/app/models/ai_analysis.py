"""AIAnalysis ORM model — one row per AI analysis call (success or failure)."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    profile_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="SET NULL"),
        nullable=True,
    )

    model: Mapped[str] = mapped_column(String(128), nullable=False)
    request_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    response_text: Mapped[str | None] = mapped_column(Text)
    reasoning_text: Mapped[str | None] = mapped_column(Text)

    prompt_tokens: Mapped[int | None] = mapped_column(Integer)
    completion_tokens: Mapped[int | None] = mapped_column(Integer)
    latency_ms: Mapped[int | None] = mapped_column(Integer)
    finish_reason: Mapped[str | None] = mapped_column(String(32))

    # 'streaming' | 'completed' | 'failed'
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="streaming")
    error_message: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
