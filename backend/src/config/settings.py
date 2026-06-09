from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "mongodb://localhost:27017/riftshield"
    jwt_secret: str = "dev-jwt-secret"
    jwt_refresh_secret: str = "dev-jwt-refresh-secret"
    frontend_url: str = "http://localhost:1999"
    master_key: str = "riftshield-master-key"
    port: int = 3000
    node_env: str = "development"

    @property
    def is_production(self) -> bool:
        return self.node_env == "production"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
