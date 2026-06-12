from fastapi import APIRouter, Depends, File, UploadFile

from middleware.dependencies import get_current_user
from modules.inference.controllers import inference_controller
from modules.inference.schemas.inference_schema import AnalyzeResponse, InferenceListResponse

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_diagram(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
) -> AnalyzeResponse:
    return await inference_controller.analyze(file, str(user.id))


@router.get("/reports", response_model=InferenceListResponse)
async def list_reports(
    skip: int = 0,
    limit: int = 20,
    user=Depends(get_current_user),
) -> InferenceListResponse:
    return await inference_controller.list_reports(skip, limit, str(user.id))


@router.get("/reports/{inference_id}", response_model=AnalyzeResponse)
async def get_report(
    inference_id: str,
    user=Depends(get_current_user),
) -> AnalyzeResponse:
    return await inference_controller.get_report(inference_id, str(user.id))


@router.delete("/reports/{inference_id}")
async def delete_report(
    inference_id: str,
    user=Depends(get_current_user),
) -> dict:
    return await inference_controller.delete_report(inference_id, str(user.id))
