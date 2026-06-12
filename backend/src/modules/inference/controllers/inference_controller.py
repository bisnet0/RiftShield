from __future__ import annotations

from fastapi import Depends, UploadFile

from modules.inference.schemas.inference_schema import (
    AnalyzeResponse,
    BoundingBox,
    DetectedComponentResponse,
    InferenceListResponse,
)
from modules.inference.services import inference_service


def _current_user():
    from middleware.auth import get_current_user
    return Depends(get_current_user)


async def analyze(
    file: UploadFile,
    user_id: str,
) -> AnalyzeResponse:
    image_data = await file.read()
    result = await inference_service.analyze_diagram(
        image_data=image_data,
        filename=file.filename or "diagram.png",
        user_id=user_id,
    )
    return _build_analyze_response(result)


def _build_analyze_response(inference_result) -> AnalyzeResponse:
    def _build_component(c):
        return DetectedComponentResponse(
            class_id=c.class_id,
            label=c.label,
            confidence=c.confidence,
            bbox=BoundingBox(x=c.bbox[0], y=c.bbox[1], width=c.bbox[2], height=c.bbox[3]),
        )

    return AnalyzeResponse(
        id=str(inference_result.id),
        filename=inference_result.filename,
        status=inference_result.status,
        components=[_build_component(c) for c in inference_result.components],
        processing_time_ms=inference_result.processing_time_ms,
        created_at=inference_result.created_at,
    )


async def list_reports(
    skip: int = 0,
    limit: int = 20,
    user_id: str = "",
) -> InferenceListResponse:
    items, total = await inference_service.list_inferences(
        user_id=user_id,
        limit=limit,
        skip=skip,
    )

    return InferenceListResponse(
        total=total,
        items=[_build_analyze_response(i) for i in items],
    )


async def get_report(
    inference_id: str,
    user_id: str = "",
) -> AnalyzeResponse:
    result = await inference_service.get_inference(inference_id)
    if not result:
        from fastapi.exceptions import HTTPException
        raise HTTPException(status_code=404, detail="Report not found")
    return _build_analyze_response(result)


async def delete_report(
    inference_id: str,
    user_id: str = "",
) -> dict:
    deleted = await inference_service.delete_inference(inference_id)
    return {"deleted": deleted}
