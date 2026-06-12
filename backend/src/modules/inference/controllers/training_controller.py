from __future__ import annotations

from modules.inference.schemas.training_schema import (
    ActivateModelRequest,
    StartTrainingRequest,
    TrainingLogListResponse,
    TrainingLogResponse,
    TrainingMetricsResponse,
)
from modules.inference.services import training_service


async def start_training(
    req: StartTrainingRequest,
    user_id: str,
) -> TrainingLogResponse:
    log = await training_service.start_training(
        user_id=user_id,
        model_type=req.model_type,
        epochs=req.epochs,
        imgsz=req.imgsz,
        batch=req.batch,
        patience=req.patience,
    )
    return _build_log_response(log)


async def list_training_logs(
    skip: int = 0,
    limit: int = 20,
    user_id: str = "",
) -> TrainingLogListResponse:
    items, total = await training_service.list_training_logs(limit=limit, skip=skip)
    return TrainingLogListResponse(
        total=total,
        items=[_build_log_response(i).model_dump() for i in items],
    )


async def get_training_log(
    log_id: str,
    user_id: str = "",
) -> TrainingLogResponse:
    log = await training_service.get_training_log(log_id)
    if not log:
        from fastapi.exceptions import HTTPException
        raise HTTPException(status_code=404, detail="Training log not found")
    return _build_log_response(log)


async def activate_model(
    req: ActivateModelRequest,
    user_id: str,
) -> dict:
    success = await training_service.activate_model(req.model_path)
    return {"activated": success}


def _build_log_response(log) -> TrainingLogResponse:
    metrics = log.metrics or {}
    return TrainingLogResponse(
        id=str(log.id),
        model_type=log.model_type,
        dataset_version=log.dataset_version,
        hyperparameters=log.hyperparameters,
        metrics=TrainingMetricsResponse(
            mAP50=metrics.get("mAP50"),
            mAP50_95=metrics.get("mAP50_95"),
            precision=metrics.get("precision"),
            recall=metrics.get("recall"),
            f1_score=metrics.get("f1_score"),
            epochs_completed=metrics.get("epochs_completed"),
            error=metrics.get("error"),
        ),
        model_path=log.model_path,
        status=log.status,
        started_at=log.started_at,
        completed_at=log.completed_at,
        created_at=log.created_at,
    )
