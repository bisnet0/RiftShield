from fastapi import APIRouter, Depends

from middleware.dependencies import get_current_user
from modules.attack.controllers import attack_controller

router = APIRouter()


@router.post("/simulate")
async def simulate_attack(
    data: dict,
    user=Depends(get_current_user),
) -> dict:
    return await attack_controller.simulate(data, str(user.id))


@router.get("/simulations")
async def list_simulations(
    user=Depends(get_current_user),
) -> dict:
    return await attack_controller.list_simulations(str(user.id))
