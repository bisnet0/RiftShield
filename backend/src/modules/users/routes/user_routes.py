from fastapi import APIRouter, Depends

from middleware.dependencies import get_current_user
from modules.auth.controllers.auth_controller import _get_profile, _update_profile

router = APIRouter()


@router.get("/me")
async def get_me(user=Depends(get_current_user)) -> dict:
    return await _get_profile(str(user.id))


@router.put("/me")
async def update_me(data: dict, user=Depends(get_current_user)) -> dict:
    return await _update_profile(str(user.id), data)


@router.post("/usage-tick")
async def usage_tick(user=Depends(get_current_user)) -> dict:
    from modules.auth.models.user_model import User as UserModel
    u = await UserModel.get(user.id)
    if u:
        u.total_seconds_active = (u.total_seconds_active or 0) + 30
        await u.save()
    return {"ok": True}


@router.get("/usage-time")
async def get_usage_time(user=Depends(get_current_user)) -> dict:
    from modules.auth.models.user_model import User as UserModel
    u = await UserModel.get(user.id)
    total = u.total_seconds_active if u else 0
    hours = total // 3600
    minutes = (total % 3600) // 60
    seconds = total % 60
    return {"total_seconds": total, "hours": hours, "minutes": minutes, "seconds": seconds}
