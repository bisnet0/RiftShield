from fastapi import APIRouter, Depends

from middleware.dependencies import get_current_user
from modules.inference.controllers import kb_controller
from modules.inference.schemas.kb_schema import (
    CountermeasureListResponse,
    VulnerabilityListResponse,
)

router = APIRouter()


@router.get("/vulnerabilities", response_model=VulnerabilityListResponse)
async def list_vulnerabilities(
    component: str = "",
    cwe: str = "",
    min_cvss: float = 0,
    search: str = "",
    skip: int = 0,
    limit: int = 50,
    user=Depends(get_current_user),
) -> VulnerabilityListResponse:
    return await kb_controller.list_vulnerabilities(component, cwe, min_cvss, search, skip, limit, str(user.id))


@router.get("/countermeasures", response_model=CountermeasureListResponse)
async def list_countermeasures(
    cwe: str = "",
    skip: int = 0,
    limit: int = 50,
    user=Depends(get_current_user),
) -> CountermeasureListResponse:
    return await kb_controller.list_countermeasures(cwe, skip, limit, str(user.id))
