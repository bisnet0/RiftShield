from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class VulnerabilityEntryResponse(BaseModel):
    id: str
    cve_id: Optional[str] = None
    title: str
    description: str
    cvss_score: Optional[float] = None
    cwe: Optional[str] = None
    affected_components: List[str]
    tags: List[str]
    created_at: datetime


class CountermeasureEntryResponse(BaseModel):
    id: str
    title: str
    description: str
    priority: str
    implementation_guide: Optional[str] = None
    references: List[str]
    vulnerability_cwe_ids: List[str]
    created_at: datetime


class VulnerabilityListResponse(BaseModel):
    total: int
    items: List[VulnerabilityEntryResponse]


class CountermeasureListResponse(BaseModel):
    total: int
    items: List[CountermeasureEntryResponse]
