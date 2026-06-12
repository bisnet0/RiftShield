from __future__ import annotations

import os
import time
import uuid
from pathlib import Path
from typing import List, Optional, Tuple

from ultralytics import YOLO

from config.settings import get_settings
from modules.inference.models.inference_model import DetectedComponent, InferenceResult

settings = get_settings()

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

TRAIN_RESULTS_DIR = Path(__file__).resolve().parent.parent / "train_results"
ACTIVE_MODEL_PATH = TRAIN_RESULTS_DIR / "best.pt"

COMPONENT_CLASSES = [
    "user", "server", "database", "api", "load_balancer",
    "firewall", "message_queue", "cache", "cdn", "dns",
    "microservice", "gateway", "storage", "container", "identity_provider",
]

_model_instance: Optional[YOLO] = None


def _get_model() -> YOLO:
    global _model_instance
    if _model_instance is not None:
        return _model_instance

    if ACTIVE_MODEL_PATH.exists():
        _model_instance = YOLO(str(ACTIVE_MODEL_PATH))
    else:
        _model_instance = YOLO("yolov8n.pt")

    return _model_instance


def set_active_model(model_path: str) -> None:
    global _model_instance
    _model_instance = YOLO(model_path)


async def analyze_diagram(
    image_data: bytes,
    filename: str,
    user_id: str,
    confidence_threshold: float = 0.25,
) -> InferenceResult:
    start_time = time.time()

    file_id = uuid.uuid4().hex[:12]
    safe_filename = f"{file_id}_{filename}"
    file_path = UPLOAD_DIR / safe_filename

    with open(file_path, "wb") as f:
        f.write(image_data)

    model = _get_model()

    results = model(str(file_path), conf=confidence_threshold)

    inference = InferenceResult(
        user_id=user_id,
        filename=safe_filename,
        image_path=str(file_path),
        status="processing",
    )
    await inference.insert()

    components = []
    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue
        for i in range(len(boxes)):
            cls_id = int(boxes.cls[i].item())
            conf = float(boxes.conf[i].item())
            xyxy = boxes.xyxy[i].tolist()

            label = COMPONENT_CLASSES[cls_id] if cls_id < len(COMPONENT_CLASSES) else f"unknown_{cls_id}"

            x1, y1, x2, y2 = xyxy
            components.append(
                DetectedComponent(
                    class_id=cls_id,
                    label=label,
                    confidence=conf,
                    bbox=[x1, y1, x2 - x1, y2 - y1],
                    inference_id=str(inference.id),
                )
            )

    elapsed = (time.time() - start_time) * 1000

    inference.components = components
    inference.status = "completed"
    inference.processing_time_ms = round(elapsed, 2)
    await inference.save()

    return inference


async def get_inference(inference_id: str) -> Optional[InferenceResult]:
    return await InferenceResult.get(inference_id)


async def list_inferences(
    user_id: Optional[str] = None,
    limit: int = 20,
    skip: int = 0,
) -> Tuple[List[InferenceResult], int]:
    query = {}
    if user_id:
        query["user_id"] = user_id

    total = await InferenceResult.find(query).count()
    items = (
        await InferenceResult.find(query)
        .sort(-InferenceResult.created_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    return items, total


async def delete_inference(inference_id: str) -> bool:
    inference = await InferenceResult.get(inference_id)
    if not inference:
        return False

    if inference.image_path and os.path.exists(inference.image_path):
        os.remove(inference.image_path)

    await inference.delete()
    return True
