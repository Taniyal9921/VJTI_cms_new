"""
Application configuration loaded from environment.

Design: pydantic-settings keeps secrets and URLs out of code and matches 12-factor app style.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Default matches scripts/setup_postgres.sql and docker-compose.yml. Override via backend/.env DATABASE_URL.
    # Use 127.0.0.1 on Windows if "localhost" resolves to ::1 and auth fails unexpectedly.
    database_url: str = "postgresql://cms_user:cms_pass@127.0.0.1:5432/college_cms"
    secret_key: str = "dev-only-change-in-production-min-32-chars!!"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    # Comma-separated list in .env
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
