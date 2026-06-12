from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from beanie import Document
from pydantic import BaseModel, Field


class ComponentLabel(BaseModel):
    class_id: int
    label: str
    x_center: float
    y_center: float
    width: float
    height: float


class DatasetEntry(Document):
    user_id: str
    filename: str
    image_path: str
    labels: List[ComponentLabel] = Field(default_factory=list)
    source: str = Field(default="manual", pattern=r"^(manual|augmented|synthetic)$")
    split: str = Field(default="train", pattern=r"^(train|val|test)$")
    augmented: bool = False
    original_entry_id: Optional[str] = None
    image_width: int = 640
    image_height: int = 640
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "dataset_entries"
        use_revision = False

    class Config:
        populate_by_name = True
