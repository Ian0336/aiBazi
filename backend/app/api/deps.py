"""API Dependencies — DB session, current user, Bazi calculator singleton."""

import os
import sys
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import TokenError, decode_token
from app.db.session import get_db
from app.models.user import User
from app.services.auth_service import get_user

# Two sys.path entries needed for the legacy bazi library to load cleanly:
#
#   1. `app/external/bazi/` — so the legacy modules can resolve their internal
#      bare imports (`from ganzhi import *`, `from datas import *`, ...).
#   2. `app/` (inserted AFTER, ending up at sys.path[0]) — so the bare name
#      `bazi` in `from bazi.bazi_calculator import BaziCalculator` resolves to
#      the `app/bazi/` package, NOT to `app/external/bazi/bazi.py` (a script
#      that runs argparse on import and would crash uvicorn / alembic).
_HERE = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(_HERE, "..", "external", "bazi"))
sys.path.insert(0, os.path.join(_HERE, ".."))

from bazi.bazi_calculator import BaziCalculator  # noqa: E402

from app.ziwei import ZiweiCalculator  # noqa: E402

# Singleton instance of the Bazi calculator.
_calculator_instance: BaziCalculator | None = None

# Singleton instance of the Ziwei calculator.
_ziwei_calculator_instance: ZiweiCalculator | None = None


def get_calculator() -> BaziCalculator:
    """Return the shared BaziCalculator singleton."""
    global _calculator_instance
    if _calculator_instance is None:
        _calculator_instance = BaziCalculator()
    return _calculator_instance


def get_ziwei_calculator() -> ZiweiCalculator:
    """Return the shared ZiweiCalculator singleton."""
    global _ziwei_calculator_instance
    if _ziwei_calculator_instance is None:
        _ziwei_calculator_instance = ZiweiCalculator()
    return _ziwei_calculator_instance


_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """FastAPI dependency that returns the authenticated User or raises 401."""
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user_id: UUID = decode_token(creds.credentials, expected_kind="access")
    except TokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="user not found")
    return user
