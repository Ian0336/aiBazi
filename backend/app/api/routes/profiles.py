"""Profile CRUD endpoints. All require an authenticated user."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileRead, ProfileUpdate
from app.services import profile_service

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("", response_model=list[ProfileRead])
def list_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ProfileRead]:
    return profile_service.list_for_user(db, current_user.id)


@router.post("", response_model=ProfileRead, status_code=status.HTTP_201_CREATED)
def create_profile(
    payload: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileRead:
    return profile_service.create_for_user(db, current_user.id, payload)


@router.get("/{profile_id}", response_model=ProfileRead)
def get_profile(
    profile_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileRead:
    profile = profile_service.get_for_user(db, current_user.id, profile_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="profile not found")
    return profile


@router.put("/{profile_id}", response_model=ProfileRead)
def update_profile(
    profile_id: UUID,
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileRead:
    profile = profile_service.update_for_user(db, current_user.id, profile_id, payload)
    if profile is None:
        raise HTTPException(status_code=404, detail="profile not found")
    return profile


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(
    profile_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    if not profile_service.delete_for_user(db, current_user.id, profile_id):
        raise HTTPException(status_code=404, detail="profile not found")
