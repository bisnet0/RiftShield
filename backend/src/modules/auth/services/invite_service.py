from __future__ import annotations

import secrets
from datetime import datetime

from modules.auth.models.invite_model import Invite
from shared.utils.errors import AppError


async def create_invite(role: str = "ADMIN") -> dict:
    code = secrets.token_hex(16)
    invite = Invite(code=code, role=role)
    await invite.insert()
    return {"code": code, "role": role}


async def validate_and_use_invite(code: str) -> Invite:
    invite = await Invite.find_one({"code": code})
    if not invite:
        raise AppError("Código de convite inválido", status_code=403)
    if invite.used:
        raise AppError("Código de convite já utilizado", status_code=403)
    return invite


async def mark_invite_used(invite: Invite, user_id: str) -> None:
    invite.used = True
    invite.used_by = user_id
    invite.used_at = datetime.utcnow()
    await invite.save()
