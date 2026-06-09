from fastapi import APIRouter, Depends, UploadFile, File

from middleware.auth import get_current_user
from modules.auth.models.user_model import User
from modules.inference.controllers import inference_controller
from modules.inference.schemas.inference_schema import AnalyzeResponse, InferenceListResponse

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_diagram(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> AnalyzeResponse:
    return await inference_controller.analyze(file, current_user)


@router.get("/reports", response_model=InferenceListResponse)
async def list_reports(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
) -> InferenceListResponse:
    return await inference_controller.list_reports(skip, limit, current_user)


@router.get("/reports/{inference_id}", response_model=AnalyzeResponse)
async def get_report(
    inference_id: str,
    current_user: User = Depends(get_current_user),
) -> AnalyzeResponse:
    return await inference_controller.get_report(inference_id, current_user)


@router.delete("/reports/{inference_id}")
async def delete_report(
    inference_id: str,
    current_user: User = Depends(get_current_user),
) -> dict:
    return await inference_controller.delete_report(inference_id, current_user)
