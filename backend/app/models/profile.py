"""Profile ORM model — a saved bazi chart belonging to a user."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    label: Mapped[str] = mapped_column(String(80), nullable=False)
    gender: Mapped[str] = mapped_column(String(8), nullable=False)  # 'male' | 'female'

    birth_year: Mapped[int] = mapped_column(Integer, nullable=False)
    birth_month: Mapped[int] = mapped_column(Integer, nullable=False)
    birth_day: Mapped[int] = mapped_column(Integer, nullable=False)
    birth_hour: Mapped[int] = mapped_column(Integer, nullable=False)  # 0-23

    is_lunar: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_leap_month: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    birth_timezone: Mapped[str] = mapped_column(String(64), nullable=False, default="Asia/Taipei")
    location: Mapped[str | None] = mapped_column(String(255))
    notes: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
