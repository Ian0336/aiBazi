"""Profile CRUD service. Every read/write enforces user_id ownership."""

from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.schemas.profile import ProfileCreate, ProfileUpdate


def list_for_user(db: Session, user_id: UUID) -> list[Profile]:
    stmt = select(Profile).where(Profile.user_id == user_id).order_by(Profile.created_at.desc())
    return list(db.scalars(stmt).all())


def get_for_user(db: Session, user_id: UUID, profile_id: UUID) -> Profile | None:
    stmt = select(Profile).where(Profile.id == profile_id, Profile.user_id == user_id)
    return db.scalars(stmt).one_or_none()


def create_for_user(db: Session, user_id: UUID, data: ProfileCreate) -> Profile:
    profile = Profile(user_id=user_id, **data.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def update_for_user(
    db: Session, user_id: UUID, profile_id: UUID, data: ProfileUpdate
) -> Profile | None:
    profile = get_for_user(db, user_id, profile_id)
    if profile is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    return profile


def delete_for_user(db: Session, user_id: UUID, profile_id: UUID) -> bool:
    profile = get_for_user(db, user_id, profile_id)
    if profile is None:
        return False
    db.delete(profile)
    db.commit()
    return True
