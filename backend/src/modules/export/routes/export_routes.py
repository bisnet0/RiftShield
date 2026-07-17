from fastapi import APIRouter, Depends

from middleware.dependencies import get_current_user
from modules.export.controllers import export_controller

router = APIRouter()


@router.post("/export")
async def export_data(
    data: dict,
    user=Depends(get_current_user),
) -> dict:
    return await export_controller.export(data, str(user.id))
