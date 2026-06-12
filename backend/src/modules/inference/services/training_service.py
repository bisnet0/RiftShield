from __future__ import annotations

import tempfile
from datetime import datetime
from typing import List, Optional, Tuple

from modules.inference.models.inference_model import TrainingLog


async def start_training(
    user_id: str,
    model_type: str = "yolov8n",
    epochs: int = 100,
    imgsz: int = 640,
    batch: int = 16,
    patience: int = 20,
) -> TrainingLog:
    log = TrainingLog(
        model_type=model_type,
        dataset_version="latest",
        hyperparameters={
            "epochs": epochs,
            "imgsz": imgsz,
            "batch": batch,
            "patience": patience,
        },
        status="running",
        started_at=datetime.utcnow(),
    )
    await log.insert()

    try:
        from modules.inference.ml_workflow import ml_train_yolo

        with tempfile.TemporaryDirectory() as tmpdir:
            yaml_path = await ml_train_yolo.export_dataset_to_yolo(tmpdir)
            result = await ml_train_yolo.train_yolo(
                dataset_yaml=yaml_path,
                model_name=f"{model_type}.pt",
                epochs=epochs,
                imgsz=imgsz,
                batch=batch,
                patience=patience,
            )

        log.status = "completed"
        log.model_path = result["best_model_path"]
        log.metrics = result.get("metrics", {})
        log.completed_at = datetime.utcnow()
        await log.save()

        from modules.inference.services.inference_service import set_active_model
        set_active_model(result["best_model_path"])

    except Exception as e:
        log.status = "failed"
        log.metrics = {"error": str(e)}
        log.completed_at = datetime.utcnow()
        await log.save()

    return log


async def get_training_log(log_id: str) -> Optional[TrainingLog]:
    return await TrainingLog.get(log_id)


async def list_training_logs(
    limit: int = 20,
    skip: int = 0,
) -> Tuple[List[TrainingLog], int]:
    total = await TrainingLog.find({}).count()
    items = (
        await TrainingLog.find({})
        .sort(-TrainingLog.created_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    return items, total


async def activate_model(model_path: str) -> bool:
    from modules.inference.services.inference_service import set_active_model
    set_active_model(model_path)
    return True
