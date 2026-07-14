from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class FineTuneRequest(BaseModel):
    epochs: int = 10


class StartTrainingRequest(BaseModel):
    model_type: str = "yolov8n"
    epochs: int = 100
    imgsz: int = 640
    batch: int = 16
    patience: int = 20


class TrainingMetricsResponse(BaseModel):
    mAP50: Optional[float] = None
    mAP50_95: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    epochs_completed: Optional[int] = None
    error: Optional[str] = None


class TrainingLogResponse(BaseModel):
    id: str
    model_type: str
    dataset_version: str
    hyperparameters: dict
    metrics: TrainingMetricsResponse
    model_path: Optional[str] = None
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


class TrainingLogListResponse(BaseModel):
    total: int
    items: list


class ActivateModelRequest(BaseModel):
    model_path: str
