"""User ORM model — populated on first Google OAuth login."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    google_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    name: Mapped[str | None] = mapped_column(String(255))
    picture: Mapped[str | None] = mapped_column(String(2048))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
