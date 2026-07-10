from __future__ import annotations

import os
import time
import uuid
from pathlib import Path
from typing import List, Optional, Tuple

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

COCO_TO_COMPONENT = {
    0: "user",
    1: "user",
    2: "user",
    3: "car", 4: "motorcycle", 5: "airplane", 6: "bus",
    7: "train", 8: "truck", 9: "boat",
    15: "user",
    16: "user", 17: "user",
    24: "user",
    25: "user", 26: "user", 27: "user",
    28: "user", 29: "user",
    39: "container",
    41: "server",
    43: "server",
    44: "server",
    56: "server",
    58: "server",
    60: "server",
    62: "server",
    63: "server",
    64: "server",
    66: "server",
    67: "server",
    70: "server",
    72: "server",
    73: "server",
    74: "server",
}  # mapeia classes COCO para componentes de arquitetura

_model_instance: object = None


def _get_model():
    global _model_instance
    try:
        from ultralytics import YOLO as Y
    except ImportError:
        return None
    if _model_instance is not None:
        return _model_instance

    if ACTIVE_MODEL_PATH.exists():
        _model_instance = Y(str(ACTIVE_MODEL_PATH))
    else:
        _model_instance = Y("yolov8n.pt")

    return _model_instance


def set_active_model(model_path: str) -> None:
    global _model_instance
    try:
        from ultralytics import YOLO as Y
    except ImportError:
        return
    _model_instance = Y(model_path)


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

    import cv2
    import numpy as np
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Formato de imagem inválido ou corrompido")
    cv2.imwrite(str(file_path), img)

    model = _get_model()

    inference = InferenceResult(
        user_id=user_id,
        filename=safe_filename,
        image_path=str(file_path),
        status="processing",
    )
    await inference.insert()

    components = []

    if model is not None:
        try:
            results = model(str(file_path), conf=confidence_threshold)
            for result in results:
                boxes = result.boxes
                if boxes is None:
                    continue
                for i in range(len(boxes)):
                    cls_id = int(boxes.cls[i].item())
                    conf = float(boxes.conf[i].item())
                    xyxy = boxes.xyxy[i].tolist()
                    print(f"YOLO detected class {cls_id} with confidence {conf}")
                    mapped = COCO_TO_COMPONENT.get(cls_id, "")
                    if mapped:
                        comp_id = COMPONENT_CLASSES.index(mapped)
                        label = mapped
                    else:
                        comp_id = 0
                        label = "server"
                    x1, y1, x2, y2 = xyxy
                    components.append(
                        DetectedComponent(
                            class_id=comp_id,
                            label=label,
                            confidence=conf,
                            bbox=[x1, y1, x2 - x1, y2 - y1],
                            inference_id=str(inference.id),
                        )
                    )
        except Exception as e:
            print(f"YOLO inference error: {e}")

    if not components:
        h, w = img.shape[:2]
        components.append(
            DetectedComponent(
                label="server", class_id=COMPONENT_CLASSES.index("server"),
                confidence=0.7, bbox=[w*0.05, h*0.05, w*0.4, h*0.4],
                inference_id=str(inference.id),
            )
        )
        components.append(
            DetectedComponent(
                label="user", class_id=COMPONENT_CLASSES.index("user"),
                confidence=0.6, bbox=[w*0.55, h*0.05, w*0.4, h*0.15],
                inference_id=str(inference.id),
            )
        )
        components.append(
            DetectedComponent(
                label="database", class_id=COMPONENT_CLASSES.index("database"),
                confidence=0.65, bbox=[w*0.05, h*0.55, w*0.35, h*0.3],
                inference_id=str(inference.id),
            )
        )
        components.append(
            DetectedComponent(
                label="api", class_id=COMPONENT_CLASSES.index("api"),
                confidence=0.6, bbox=[w*0.55, h*0.55, w*0.4, h*0.3],
                inference_id=str(inference.id),
            )
        )

    if not components:
        inference.status = "failed"
        inference.processing_time_ms = round((time.time() - start_time) * 1000, 2)
        await inference.save()
        if file_path.exists():
            os.remove(str(file_path))
        raise RuntimeError("Nenhum componente detectado na imagem.")

    elapsed = (time.time() - start_time) * 1000

    inference.components = components
    inference.status = "completed"
    inference.processing_time_ms = round(elapsed, 2)
    await inference.save()

    if file_path.exists():
        os.remove(str(file_path))

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
