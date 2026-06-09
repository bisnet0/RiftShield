from __future__ import annotations

from datetime import datetime, timedelta, timezone

import jwt

from config.settings import get_settings

settings = get_settings()


def _generate_token(payload: dict, secret: str, expires_delta: timedelta) -> str:
    data = payload.copy()
    data["exp"] = datetime.now(timezone.utc) + expires_delta
    return jwt.encode(data, secret, algorithm="HS256")


def generate_access_token(user_id: str, email: str) -> str:
    return _generate_token(
        {"userId": user_id, "email": email},
        settings.jwt_secret,
        timedelta(minutes=15),
    )


def generate_refresh_token(user_id: str, email: str) -> str:
    return _generate_token(
        {"userId": user_id, "email": email},
        settings.jwt_refresh_secret,
        timedelta(days=7),
    )


def verify_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])


def verify_refresh_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_refresh_secret, algorithms=["HS256"])
