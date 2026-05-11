"""Auth endpoints — Google OAuth + JWT (access in body, refresh in httpOnly cookie)."""

import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    TokenError,
    access_token_seconds,
    create_access_token,
    create_refresh_token,
    decode_token,
    refresh_token_seconds,
)
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.auth import AccessTokenResponse, GoogleLoginResponse
from app.schemas.user import UserRead
from app.services.auth_service import (
    OAuthError,
    build_google_authorize_url,
    exchange_code_and_upsert_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])

_OAUTH_STATE_KIND = "oauth_state"
_OAUTH_STATE_TTL = timedelta(minutes=10)


def _create_oauth_state() -> str:
    payload = {
        "typ": _OAUTH_STATE_KIND,
        "nonce": secrets.token_urlsafe(16),
        "exp": int((datetime.now(timezone.utc) + _OAUTH_STATE_TTL).timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def _verify_oauth_state(state: str) -> None:
    try:
        payload = jwt.decode(state, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as e:
        raise HTTPException(status_code=400, detail=f"invalid state: {e}")
    if payload.get("typ") != _OAUTH_STATE_KIND:
        raise HTTPException(status_code=400, detail="invalid state kind")


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=refresh_token_seconds(),
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/api/auth",  # cookie only sent to auth endpoints, narrows blast radius
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        path="/api/auth",
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )


@router.get("/google/login", response_model=GoogleLoginResponse)
def google_login() -> GoogleLoginResponse:
    """Return the Google authorization URL the frontend should navigate to."""
    try:
        state = _create_oauth_state()
        url = build_google_authorize_url(state)
    except OAuthError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return GoogleLoginResponse(auth_url=url)


@router.get("/google/callback")
def google_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
) -> RedirectResponse:
    """Google redirects here. Exchange code, set refresh cookie, redirect to frontend."""
    fallback = settings.FRONTEND_URL.rstrip("/")

    if error:
        params = urlencode({"error": error})
        return RedirectResponse(f"{fallback}/auth/callback?{params}", status_code=303)

    if not code or not state:
        raise HTTPException(status_code=400, detail="missing code or state")

    _verify_oauth_state(state)

    try:
        user = exchange_code_and_upsert_user(db, code)
    except OAuthError as e:
        params = urlencode({"error": str(e)})
        return RedirectResponse(f"{fallback}/auth/callback?{params}", status_code=303)

    refresh_token = create_refresh_token(user.id)
    redirect = RedirectResponse(f"{fallback}/auth/callback?ok=1", status_code=303)
    _set_refresh_cookie(redirect, refresh_token)
    return redirect


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh_access_token(
    response: Response,
    refresh: str | None = Cookie(default=None, alias=settings.REFRESH_COOKIE_NAME),
    db: Session = Depends(get_db),
) -> AccessTokenResponse:
    """Read refresh cookie, return new access token, rotate refresh cookie."""
    if not refresh:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="no refresh cookie")
    try:
        user_id = decode_token(refresh, expected_kind="refresh")
    except TokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="user not found")

    new_access = create_access_token(user.id)
    new_refresh = create_refresh_token(user.id)
    _set_refresh_cookie(response, new_refresh)
    return AccessTokenResponse(
        access_token=new_access,
        token_type="bearer",
        expires_in=access_token_seconds(),
    )


@router.post("/logout")
def logout(response: Response) -> dict:
    _clear_refresh_cookie(response)
    return {"ok": True}


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
