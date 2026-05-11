"""User-facing Pydantic schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserRead(BaseModel):
    """Plain `str` for email — Google sends a validated address; saving the
    extra `email-validator` dep just to assert what we already trust."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    name: str | None = None
    picture: str | None = None
    created_at: datetime
