from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from beanie import Document
from pydantic import BaseModel, Field


class KBVulnerability(Document):
    cve_id: Optional[str] = None
    title: str
    description: str
    cvss_score: Optional[float] = None
    cwe: Optional[str] = None
    affected_components: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "kb_vulnerabilities"
        use_revision = False


class KBCountermeasure(Document):
    title: str
    description: str
    priority: str = Field(default="medium", pattern=r"^(low|medium|high|critical)$")
    implementation_guide: Optional[str] = None
    references: List[str] = Field(default_factory=list)
    vulnerability_cwe_ids: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "kb_countermeasures"
        use_revision = False


class VulnerabilityFilter(BaseModel):
    component: Optional[str] = None
    cwe: Optional[str] = None
    min_cvss: Optional[float] = None
    search: Optional[str] = None
