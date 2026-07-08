from fastapi import APIRouter, Depends

from middleware.dependencies import get_current_user
from modules.hermes.controllers import hermes_controller

router = APIRouter()


@router.post("/chat")
async def chat(
    data: dict,
    user=Depends(get_current_user),
):
    message = data.get("message", "")
    attachment = data.get("attachment")
    return await hermes_controller.chat(message, attachment, str(user.id))


@router.get("/history")
async def history(
    user=Depends(get_current_user),
):
    return await hermes_controller.get_history(str(user.id))


@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: str,
    user=Depends(get_current_user),
):
    ok = await hermes_controller.delete_message(message_id, str(user.id))
    return {"deleted": ok}


@router.get("/config")
async def get_config(
    user=Depends(get_current_user),
):
    return await hermes_controller.get_config(str(user.id))


@router.put("/config")
async def save_config(
    data: dict,
    user=Depends(get_current_user),
):
    return await hermes_controller.save_config(str(user.id), data)
