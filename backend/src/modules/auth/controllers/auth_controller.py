from __future__ import annotations

from fastapi import Depends, Response

from config.settings import get_settings
from middleware.auth import get_current_user
from modules.auth.models.user_model import User
from modules.auth.schemas.auth_schema import LoginInput, RegisterInput
from modules.auth.services import auth_service

settings = get_settings()


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key="accessToken",
        value=access_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=15 * 60,
    )
    response.set_cookie(
        key="refreshToken",
        value=refresh_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
        path="/api/auth",
    )


async def register(data: RegisterInput, response: Response) -> dict:
    result = await auth_service.register_user(data)
    _set_auth_cookies(response, result["accessToken"], result["refreshToken"])
    return {"user": result["user"].model_dump()}


async def login(data: LoginInput, response: Response) -> dict:
    result = await auth_service.login_user(data)
    _set_auth_cookies(response, result["accessToken"], result["refreshToken"])
    return {"user": result["user"].model_dump()}


async def refresh(response: Response, refresh_token: str | None = None) -> dict:
    if not refresh_token:
        from fastapi.exceptions import HTTPException
        raise HTTPException(status_code=401, detail="Refresh token não fornecido")

    result = await auth_service.refresh_tokens(refresh_token)
    _set_auth_cookies(response, result["accessToken"], result["refreshToken"])
    return {"message": "Tokens renovados"}


async def logout(response: Response, current_user: User = Depends(get_current_user)) -> dict:
    await auth_service.logout_user(str(current_user.id))
    response.delete_cookie("accessToken")
    response.delete_cookie("refreshToken", path="/api/auth")
    return {"message": "Logout realizado com sucesso"}


async def me(current_user: User = Depends(get_current_user)) -> dict:
    profile = await auth_service.get_profile(str(current_user.id))
    return {"user": profile.model_dump()}
