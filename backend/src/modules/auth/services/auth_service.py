from __future__ import annotations

import bcrypt as _bcrypt

from config.settings import get_settings
from modules.auth.models.user_model import User
from modules.auth.schemas.auth_schema import LoginInput, RegisterInput, UserResponse
from modules.auth.services.invite_service import mark_invite_used, validate_and_use_invite
from shared.utils.errors import AppError, UnauthorizedError
from shared.utils.token import (
    generate_access_token,
    generate_refresh_token,
    verify_refresh_token,
)
settings = get_settings()


def _build_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        phone=user.phone,
        country=user.country,
        state=user.state,
        city=user.city,
        role=user.role,
        profession=user.profession,
        seniority=user.seniority,
        age=user.age,
        total_days_active=user.total_days_active,
    )


async def register_user(data: RegisterInput) -> dict:
    existing = await User.find_one({"email": data.email.lower()})
    if existing:
        raise AppError("E-mail já cadastrado", status_code=409)

    invite = await validate_and_use_invite(data.invite_code)

    hashed_password = _bcrypt.hashpw(data.password.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")

    user = User(
        name=data.name,
        email=data.email,
        password=hashed_password,
        phone=data.phone,
        country=data.country,
        state=data.state,
        city=data.city,
        role=invite.role,
    )

    access_token = generate_access_token(str(user.id), user.email)
    refresh_token = generate_refresh_token(str(user.id), user.email)

    user.refresh_token = refresh_token
    await user.insert()

    await mark_invite_used(invite, str(user.id))

    return {
        "user": _build_user_response(user),
        "accessToken": access_token,
        "refreshToken": refresh_token,
    }


async def login_user(data: LoginInput) -> dict:
    user = await User.find_one({"email": data.email.lower()})
    if not user:
        raise UnauthorizedError("E-mail ou senha inválidos")

    if not _bcrypt.checkpw(data.password.encode("utf-8"), user.password.encode("utf-8")):
        raise UnauthorizedError("E-mail ou senha inválidos")

    access_token = generate_access_token(str(user.id), user.email)
    refresh_token = generate_refresh_token(str(user.id), user.email)

    user.refresh_token = refresh_token
    await user.save()

    return {
        "user": _build_user_response(user),
        "accessToken": access_token,
        "refreshToken": refresh_token,
    }


async def refresh_tokens(token: str) -> dict:
    try:
        payload = verify_refresh_token(token)
        user = await User.get(payload["userId"])
    except Exception:
        raise UnauthorizedError("Refresh token inválido ou expirado")

    if not user or user.refresh_token != token:
        raise UnauthorizedError("Refresh token inválido")

    access_token = generate_access_token(str(user.id), user.email)
    new_refresh_token = generate_refresh_token(str(user.id), user.email)

    user.refresh_token = new_refresh_token
    await user.save()

    return {"accessToken": access_token, "refreshToken": new_refresh_token}


async def logout_user(user_id: str) -> None:
    user = await User.get(user_id)
    if user:
        user.refresh_token = None
        await user.save()


async def get_profile(user_id: str) -> UserResponse:
    user = await User.get(user_id)
    if not user:
        raise AppError("Usuário não encontrado", status_code=404)
    delta = (datetime.utcnow() - user.created_at).days
    if delta > user.total_days_active:
        user.total_days_active = min(delta, 30)
        await user.save()
    return _build_user_response(user)


async def update_profile(user_id: str, data: dict) -> UserResponse:
    user = await User.get(user_id)
    if not user:
        raise AppError("Usuário não encontrado", status_code=404)
    allowed = {"name", "phone", "country", "state", "city", "profession", "seniority", "age"}
    for key, value in data.items():
        if key in allowed and value is not None:
            setattr(user, key, value)
    user.updated_at = datetime.utcnow()
    await user.save()
    return _build_user_response(user)
