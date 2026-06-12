from __future__ import annotations

from fastapi import Depends, UploadFile

from modules.inference.schemas.inference_schema import (
    AnalyzeResponse,
    BoundingBox,
    DetectedComponentResponse,
    InferenceListResponse,
)
from modules.inference.schemas.threat_schema import (
    ComponentThreatAnalysisResponse,
    CountermeasureResponse,
    ThreatReportListResponse,
    ThreatReportResponse,
    ThreatResponse,
    VulnerabilityResponse,
)
from modules.inference.services import inference_service, threat_service


def _build_component(c):
    return DetectedComponentResponse(
        class_id=c.class_id,
        label=c.label,
        confidence=c.confidence,
        bbox=BoundingBox(x=c.bbox[0], y=c.bbox[1], width=c.bbox[2], height=c.bbox[3]),
    )


def _build_analyze_response(inference_result) -> AnalyzeResponse:
    return AnalyzeResponse(
        id=str(inference_result.id),
        filename=inference_result.filename,
        status=inference_result.status,
        components=[_build_component(c) for c in inference_result.components],
        processing_time_ms=inference_result.processing_time_ms,
        created_at=inference_result.created_at,
    )


async def analyze(
    file: UploadFile,
    user_id: str,
) -> AnalyzeResponse:
    image_data = await file.read()
    result = await inference_service.analyze_diagram(
        image_data=image_data,
        filename=file.filename or "diagram.png",
        user_id=user_id,
    )
    return _build_analyze_response(result)


async def analyze_and_threat(
    file: UploadFile,
    user_id: str,
) -> dict:
    image_data = await file.read()
    inference = await inference_service.analyze_diagram(
        image_data=image_data,
        filename=file.filename or "diagram.png",
        user_id=user_id,
    )
    threat_report = await threat_service.analyze_threats(inference)
    return {
        "inference": _build_analyze_response(inference).model_dump(),
        "threat_report": _build_threat_report_response(threat_report).model_dump(),
    }


def _build_threat_report_response(report) -> ThreatReportResponse:
    return ThreatReportResponse(
        id=str(report.id),
        inference_id=report.inference_id,
        status=report.status,
        stride_summary=report.stride_summary,
        component_analyses=[
            ComponentThreatAnalysisResponse(
                component_label=ca.component_label,
                component_class_id=ca.component_class_id,
                stride_threats=[
                    ThreatResponse(
                        category=t.category,
                        description=t.description,
                        risk_level=t.risk_level,
                    )
                    for t in ca.stride_threats
                ],
                vulnerabilities=[
                    VulnerabilityResponse(
                        cve_id=v.cve_id,
                        title=v.title,
                        description=v.description,
                        cvss_score=v.cvss_score,
                        cwe=v.cwe,
                        affected_component=v.affected_component,
                    )
                    for v in ca.vulnerabilities
                ],
                countermeasures=[
                    CountermeasureResponse(
                        title=c.title,
                        description=c.description,
                        priority=c.priority,
                        implementation_guide=c.implementation_guide,
                        references=c.references,
                    )
                    for c in ca.countermeasures
                ],
            )
            for ca in report.component_analyses
        ],
        overall_risk_score=report.overall_risk_score,
        created_at=report.created_at,
        updated_at=report.updated_at,
    )


async def list_reports(
    skip: int = 0,
    limit: int = 20,
    user_id: str = "",
) -> InferenceListResponse:
    items, total = await inference_service.list_inferences(
        user_id=user_id,
        limit=limit,
        skip=skip,
    )
    return InferenceListResponse(
        total=total,
        items=[_build_analyze_response(i) for i in items],
    )


async def get_report(
    inference_id: str,
    user_id: str = "",
) -> AnalyzeResponse:
    result = await inference_service.get_inference(inference_id)
    if not result:
        from fastapi.exceptions import HTTPException
        raise HTTPException(status_code=404, detail="Report not found")
    return _build_analyze_response(result)


async def delete_report(
    inference_id: str,
    user_id: str = "",
) -> dict:
    deleted = await inference_service.delete_inference(inference_id)
    return {"deleted": deleted}


async def list_threat_reports(
    skip: int = 0,
    limit: int = 20,
    user_id: str = "",
) -> ThreatReportListResponse:
    items, total = await threat_service.list_threat_reports(
        user_id=user_id,
        limit=limit,
        skip=skip,
    )
    return ThreatReportListResponse(
        total=total,
        items=[_build_threat_report_response(i) for i in items],
    )


async def get_threat_report(
    inference_id: str,
    user_id: str = "",
) -> ThreatReportResponse:
    report = await threat_service.get_threat_report_by_inference(inference_id)
    if not report:
        from fastapi.exceptions import HTTPException
        raise HTTPException(status_code=404, detail="Threat report not found")
    return _build_threat_report_response(report)
