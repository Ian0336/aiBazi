"""JWT helpers for access + refresh tokens.

Tokens are HS256 with the same secret. Token kind is encoded in the ``typ`` claim
so an access token can never be silently used as a refresh token (or vice versa).
"""

from datetime import datetime, timedelta, timezone
from typing import Literal
from uuid import UUID, uuid4

from jose import JWTError, jwt

from app.core.config import settings

TokenKind = Literal["access", "refresh"]


class TokenError(Exception):
    """Raised when a token is invalid, expired, or of the wrong kind."""


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _create_token(subject: UUID, kind: TokenKind, expires_delta: timedelta) -> str:
    now = _now()
    payload = {
        "sub": str(subject),
        "typ": kind,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
        "jti": uuid4().hex,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: UUID) -> str:
    return _create_token(
        user_id, "access", timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )


def create_refresh_token(user_id: UUID) -> str:
    return _create_token(
        user_id, "refresh", timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )


def decode_token(token: str, expected_kind: TokenKind) -> UUID:
    """Validate signature, expiry, and kind. Returns the user id (sub)."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as e:
        raise TokenError(f"invalid token: {e}") from e

    if payload.get("typ") != expected_kind:
        raise TokenError(f"wrong token kind: expected {expected_kind}")

    sub = payload.get("sub")
    if not sub:
        raise TokenError("missing sub")
    try:
        return UUID(sub)
    except ValueError as e:
        raise TokenError("invalid sub") from e


def access_token_seconds() -> int:
    return settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60


def refresh_token_seconds() -> int:
    return settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
