"""Auth-related response schemas."""

from pydantic import BaseModel


class GoogleLoginResponse(BaseModel):
    auth_url: str


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
