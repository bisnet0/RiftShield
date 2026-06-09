from __future__ import annotations

from fastapi import Depends, UploadFile

from middleware.auth import get_current_user
from modules.auth.models.user_model import User
from modules.inference.schemas.inference_schema import (
    AnalyzeResponse,
    BoundingBox,
    DetectedComponentResponse,
    InferenceListResponse,
)
from modules.inference.services import inference_service


async def analyze(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
) -> AnalyzeResponse:
    image_data = await file.read()
    result = await inference_service.analyze_diagram(
        image_data=image_data,
        filename=file.filename or "diagram.png",
        user_id=str(current_user.id),
    )

    components = [
        DetectedComponentResponse(
            class_id=c["class_id"],
            label=c["label"],
            confidence=c["confidence"],
            bbox=BoundingBox(x=c["bbox"][0], y=c["bbox"][1], width=c["bbox"][2], height=c["bbox"][3]),
        )
        for c in result.components
    ]

    return AnalyzeResponse(
        id=str(result.id),
        filename=result.filename,
        status=result.status,
        components=components,
        processing_time_ms=result.processing_time_ms,
        created_at=result.created_at,
    )


async def list_reports(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
) -> InferenceListResponse:
    items, total = await inference_service.list_inferences(
        user_id=str(current_user.id),
        limit=limit,
        skip=skip,
    )

    return InferenceListResponse(
        total=total,
        items=[
            AnalyzeResponse(
                id=str(i.id),
                filename=i.filename,
                status=i.status,
                components=[
                    DetectedComponentResponse(
                        class_id=c["class_id"],
                        label=c["label"],
                        confidence=c["confidence"],
                        bbox=BoundingBox(
                            x=c["bbox"][0], y=c["bbox"][1],
                            width=c["bbox"][2], height=c["bbox"][3],
                        ),
                    )
                    for c in i.components
                ],
                processing_time_ms=i.processing_time_ms,
                created_at=i.created_at,
            )
            for i in items
        ],
    )


async def get_report(
    inference_id: str,
    current_user: User = Depends(get_current_user),
) -> AnalyzeResponse:
    result = await inference_service.get_inference(inference_id)

    return AnalyzeResponse(
        id=str(result.id),
        filename=result.filename,
        status=result.status,
        components=[
            DetectedComponentResponse(
                class_id=c["class_id"],
                label=c["label"],
                confidence=c["confidence"],
                bbox=BoundingBox(
                    x=c["bbox"][0], y=c["bbox"][1],
                    width=c["bbox"][2], height=c["bbox"][3],
                ),
            )
            for c in result.components
        ],
        processing_time_ms=result.processing_time_ms,
        created_at=result.created_at,
    )


async def delete_report(
    inference_id: str,
    current_user: User = Depends(get_current_user),
) -> dict:
    deleted = await inference_service.delete_inference(inference_id)
    return {"deleted": deleted}
