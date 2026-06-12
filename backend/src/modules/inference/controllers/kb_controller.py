from __future__ import annotations

from fastapi import Depends, Query

from modules.inference.models.kb_model import VulnerabilityFilter
from modules.inference.schemas.kb_schema import (
    CountermeasureEntryResponse,
    CountermeasureListResponse,
    VulnerabilityEntryResponse,
    VulnerabilityListResponse,
)
from modules.inference.services import kb_service


async def list_vulnerabilities(
    component: str = "",
    cwe: str = "",
    min_cvss: float = 0,
    search: str = "",
    skip: int = 0,
    limit: int = 50,
    user_id: str = "",
) -> VulnerabilityListResponse:
    filt = VulnerabilityFilter(
        component=component or None,
        cwe=cwe or None,
        min_cvss=min_cvss if min_cvss > 0 else None,
        search=search or None,
    )
    items, total = await kb_service.list_vulnerabilities(
        filter_by=filt,
        skip=skip,
        limit=limit,
    )
    return VulnerabilityListResponse(
        total=total,
        items=[
            VulnerabilityEntryResponse(
                id=str(v.id),
                cve_id=v.cve_id,
                title=v.title,
                description=v.description,
                cvss_score=v.cvss_score,
                cwe=v.cwe,
                affected_components=v.affected_components,
                tags=v.tags,
                created_at=v.created_at,
            )
            for v in items
        ],
    )


async def list_countermeasures(
    cwe: str = "",
    skip: int = 0,
    limit: int = 50,
    user_id: str = "",
) -> CountermeasureListResponse:
    cwe_ids = [cwe] if cwe else None
    items, total = await kb_service.list_countermeasures(
        cwe_ids=cwe_ids,
        skip=skip,
        limit=limit,
    )
    return CountermeasureListResponse(
        total=total,
        items=[
            CountermeasureEntryResponse(
                id=str(c.id),
                title=c.title,
                description=c.description,
                priority=c.priority,
                implementation_guide=c.implementation_guide,
                references=c.references,
                vulnerability_cwe_ids=c.vulnerability_cwe_ids,
                created_at=c.created_at,
            )
            for c in items
        ],
    )
