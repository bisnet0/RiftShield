from fastapi import APIRouter, Depends

from middleware.dependencies import get_current_user
from modules.auth.controllers.auth_controller import _get_profile

router = APIRouter()


@router.get("/me")
async def get_me(user=Depends(get_current_user)) -> dict:
    return await _get_profile(str(user.id))
