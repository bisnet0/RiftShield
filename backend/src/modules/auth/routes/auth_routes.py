from fastapi import APIRouter, Cookie, Depends, Response

from modules.auth.controllers import auth_controller
from modules.auth.schemas.auth_schema import LoginInput, RegisterInput
from middleware.auth import get_current_user
from modules.auth.models.user_model import User

router = APIRouter()


@router.post("/register", status_code=201)
async def register(body: RegisterInput, response: Response) -> dict:
    return await auth_controller.register(body, response)


@router.post("/login")
async def login(body: LoginInput, response: Response) -> dict:
    return await auth_controller.login(body, response)


@router.post("/refresh")
async def refresh(response: Response, refresh_token: str | None = Cookie(default=None, alias="refreshToken")) -> dict:
    return await auth_controller.refresh(response, refresh_token)


@router.post("/logout")
async def logout(response: Response, current_user: User = Depends(get_current_user)) -> dict:
    return await auth_controller.logout(response, current_user)
