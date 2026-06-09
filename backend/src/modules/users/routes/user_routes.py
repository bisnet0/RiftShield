from fastapi import APIRouter, Depends

from middleware.auth import get_current_user
from modules.auth.controllers.auth_controller import me
from modules.auth.models.user_model import User

router = APIRouter()


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)) -> dict:
    return await me(current_user)
