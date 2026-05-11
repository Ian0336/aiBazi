"""Google OAuth service.

We use authlib's lower-level OAuth2 client (no Starlette session needed) so the
backend can issue OAuth state via stateless signed JWTs and avoid pulling in
SessionMiddleware just for one endpoint.
"""

from datetime import datetime, timezone
from uuid import UUID, uuid4

import httpx
from authlib.integrations.httpx_client import OAuth2Client
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"
GOOGLE_SCOPES = ["openid", "email", "profile"]


class OAuthError(Exception):
    pass


def build_google_authorize_url(state: str) -> str:
    """Return the URL the user should be redirected to start OAuth."""
    if not settings.GOOGLE_CLIENT_ID:
        raise OAuthError("GOOGLE_CLIENT_ID not configured")
    client = OAuth2Client(
        client_id=settings.GOOGLE_CLIENT_ID,
        scope=" ".join(GOOGLE_SCOPES),
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )
    url, _ = client.create_authorization_url(GOOGLE_AUTH_URL, state=state)
    return url


def _exchange_code_for_userinfo(code: str) -> dict:
    """Trade an authorization code for the user's profile info."""
    client = OAuth2Client(
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )
    try:
        token = client.fetch_token(
            GOOGLE_TOKEN_URL,
            code=code,
            grant_type="authorization_code",
        )
    except Exception as e:  # authlib wraps several different exceptions
        raise OAuthError(f"token exchange failed: {e}") from e

    access = token.get("access_token")
    if not access:
        raise OAuthError("Google did not return an access_token")

    resp = httpx.get(
        GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {access}"},
        timeout=15,
    )
    if resp.status_code != 200:
        raise OAuthError(f"userinfo fetch failed: {resp.status_code} {resp.text}")
    return resp.json()


def exchange_code_and_upsert_user(db: Session, code: str) -> User:
    info = _exchange_code_for_userinfo(code)
    sub = info.get("sub")
    email = info.get("email")
    if not sub or not email:
        raise OAuthError("Google userinfo missing sub or email")

    user = db.query(User).filter(User.google_id == sub).one_or_none()
    now = datetime.now(timezone.utc)
    if user is None:
        user = User(
            id=uuid4(),
            google_id=sub,
            email=email,
            name=info.get("name"),
            picture=info.get("picture"),
            last_login_at=now,
        )
        db.add(user)
    else:
        user.email = email
        user.name = info.get("name") or user.name
        user.picture = info.get("picture") or user.picture
        user.last_login_at = now
    db.commit()
    db.refresh(user)
    return user


def get_user(db: Session, user_id: UUID) -> User | None:
    return db.get(User, user_id)
