"""Application configuration loaded from environment via pydantic-settings."""

from typing import Annotated, List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── API Metadata ──
    APP_TITLE: str = "AI Bazi Backend (Python)"
    APP_DESCRIPTION: str = "Python FastAPI backend for Chinese Bazi (八字) calculation and analysis"
    APP_VERSION: str = "1.0.0"

    # ── Server ──
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── CORS ──
    # NoDecode skips pydantic-settings' default JSON-decoding so the validator below
    # can parse comma-separated env values (`http://a,http://b`) instead of demanding
    # a JSON array literal in .env.
    CORS_ORIGINS: Annotated[List[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:3000"]
    )
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: Annotated[List[str], NoDecode] = Field(
        default_factory=lambda: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
    CORS_ALLOW_HEADERS: Annotated[List[str], NoDecode] = Field(
        default_factory=lambda: ["*"]
    )

    # ── Frontend ──
    FRONTEND_URL: str = "http://localhost:3000"

    # ── Database ──
    DATABASE_URL: str = "postgresql+psycopg2://test:password@localhost:5432/aibazi"

    # ── JWT ──
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    REFRESH_COOKIE_NAME: str = "aibazi_refresh"
    COOKIE_SECURE: bool = False  # set True in prod (HTTPS)
    COOKIE_SAMESITE: str = "lax"  # 'lax' for same-site, 'none' for cross-domain (requires Secure)

    # ── Google OAuth ──
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"

    # ── NVIDIA NIM ──
    NVIDIA_API_KEY: str = ""
    NV_AI_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NV_AI_MODEL: str = "deepseek-ai/deepseek-v4-pro"

    # ── AI quota / limits ──
    AI_DAILY_QUOTA: int = 3
    AI_MAX_TOKENS: int = 8192
    AI_TIMEOUT_SECONDS: int = 240
    AI_QUOTA_TIMEZONE: str = "Asia/Taipei"

    @field_validator("CORS_ORIGINS", "CORS_ALLOW_METHODS", "CORS_ALLOW_HEADERS", mode="before")
    @classmethod
    def _split_csv(cls, v):
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        return v


settings = Settings()
