from __future__ import annotations

from pydantic import BaseModel
from typing import Dict, List, Optional


class RecentAnalysisItem(BaseModel):
    id: str
    filename: str
    status: str
    components_count: int
    created_at: Optional[str] = None


class ThreatsByRisk(BaseModel):
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0


class ComponentFrequency(BaseModel):
    label: str
    count: int


class DashboardStatsResponse(BaseModel):
    total_analyses: int = 0
    total_threats: int = 0
    completed_analyses: int = 0
    failed_analyses: int = 0
    total_components_analyzed: int = 0
    threats_by_risk: ThreatsByRisk
    stride_distribution: Dict[str, int]
    top_components: List[ComponentFrequency]
    recent_analyses: List[RecentAnalysisItem]
