from fastapi import APIRouter, Depends

from middleware.dependencies import get_current_user
from modules.dashboard.controllers import dashboard_controller
from modules.dashboard.schemas.dashboard_schema import DashboardStatsResponse

router = APIRouter()


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_stats(
    user=Depends(get_current_user),
) -> DashboardStatsResponse:
    return await dashboard_controller.get_stats(str(user.id))
