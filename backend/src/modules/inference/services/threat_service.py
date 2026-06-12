from __future__ import annotations

from typing import List, Optional, Tuple

from modules.inference.agents.stride_kb import (
    COMPONENT_THREAT_MAP,
    STRIDE_CATEGORIES,
    STRIDE_DESCRIPTIONS,
    get_countermeasures_for_vulnerabilities,
    get_vulnerabilities_for_component,
)
from modules.inference.models.inference_model import DetectedComponent, InferenceResult
from modules.inference.models.threat_model import (
    ComponentThreatAnalysis,
    Countermeasure,
    Threat,
    ThreatReport,
    Vulnerability,
)


def _risk_from_cvss(cvss: Optional[float]) -> str:
    if cvss is None:
        return "medium"
    if cvss >= 9.0:
        return "critical"
    if cvss >= 7.0:
        return "high"
    if cvss >= 4.0:
        return "medium"
    return "low"


async def analyze_threats(inference: InferenceResult) -> ThreatReport:
    report = ThreatReport(
        inference_id=str(inference.id),
        user_id=inference.user_id,
        status="processing",
    )
    await report.insert()

    stride_counts = {cat: 0 for cat in STRIDE_CATEGORIES}
    component_analyses: List[ComponentThreatAnalysis] = []

    for comp in (inference.components or []):
        if isinstance(comp, dict):
            label = comp.get("label", "unknown")
            class_id = comp.get("class_id", -1)
        else:
            label = comp.label
            class_id = comp.class_id

        applicable_categories = COMPONENT_THREAT_MAP.get(label, [])
        threats = [
            Threat(
                category=cat,
                description=STRIDE_DESCRIPTIONS.get(cat, ""),
                risk_level=_risk_from_cvss(None),
            )
            for cat in applicable_categories
        ]

        for t in threats:
            stride_counts[t.category] = stride_counts.get(t.category, 0) + 1

        vulnerabilities = get_vulnerabilities_for_component(label)
        countermeasures = get_countermeasures_for_vulnerabilities(vulnerabilities)

        component_analyses.append(
            ComponentThreatAnalysis(
                component_label=label,
                component_class_id=class_id,
                stride_threats=threats,
                vulnerabilities=vulnerabilities,
                countermeasures=countermeasures,
            )
        )

    total_threats = sum(stride_counts.values())
    max_possible = len(inference.components or []) * 6
    overall_risk = round((total_threats / max(max_possible, 1)) * 10, 2)

    report.stride_summary = stride_counts
    report.component_analyses = component_analyses
    report.overall_risk_score = overall_risk
    report.status = "completed"
    await report.save()

    return report


async def get_threat_report(report_id: str) -> Optional[ThreatReport]:
    return await ThreatReport.get(report_id)


async def get_threat_report_by_inference(inference_id: str) -> Optional[ThreatReport]:
    return await ThreatReport.find_one({"inference_id": inference_id})


async def list_threat_reports(
    user_id: Optional[str] = None,
    limit: int = 20,
    skip: int = 0,
) -> Tuple[List[ThreatReport], int]:
    query = {}
    if user_id:
        query["user_id"] = user_id

    total = await ThreatReport.find(query).count()
    items = (
        await ThreatReport.find(query)
        .sort(-ThreatReport.created_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    return items, total
