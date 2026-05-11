"""Profile Pydantic schemas."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


Gender = Literal["male", "female"]


class ProfileBase(BaseModel):
    label: str = Field(..., min_length=1, max_length=80)
    gender: Gender
    birth_year: int = Field(..., ge=1900, le=2100)
    birth_month: int = Field(..., ge=1, le=12)
    birth_day: int = Field(..., ge=1, le=31)
    birth_hour: int = Field(..., ge=0, le=23)
    is_lunar: bool = False
    is_leap_month: bool = False
    birth_timezone: str = "Asia/Taipei"
    location: str | None = None
    notes: str | None = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    label: str | None = Field(None, min_length=1, max_length=80)
    gender: Gender | None = None
    birth_year: int | None = Field(None, ge=1900, le=2100)
    birth_month: int | None = Field(None, ge=1, le=12)
    birth_day: int | None = Field(None, ge=1, le=31)
    birth_hour: int | None = Field(None, ge=0, le=23)
    is_lunar: bool | None = None
    is_leap_month: bool | None = None
    birth_timezone: str | None = None
    location: str | None = None
    notes: str | None = None


class ProfileRead(ProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
