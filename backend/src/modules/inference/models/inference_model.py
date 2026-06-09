from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from beanie import Document
from pydantic import Field


class DetectedComponent(Document):
    class_id: int
    label: str
    confidence: float
    bbox: List[float]
    inference_id: str

    class Settings:
        name = "detected_components"


class InferenceResult(Document):
    user_id: str
    filename: str
    image_path: str
    status: str = Field(default="completed", pattern=r"^(pending|processing|completed|failed)$")
    components: List[DetectedComponent] = Field(default_factory=list)
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    processing_time_ms: Optional[float] = None

    class Settings:
        name = "inference_results"
        use_revision = False

    class Config:
        populate_by_name = True


class TrainingLog(Document):
    model_type: str
    dataset_version: str
    hyperparameters: dict = Field(default_factory=dict)
    metrics: dict = Field(default_factory=dict)
    model_path: Optional[str] = None
    status: str = Field(default="pending", pattern=r"^(pending|running|completed|failed)$")
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "training_logs"
        use_revision = False
