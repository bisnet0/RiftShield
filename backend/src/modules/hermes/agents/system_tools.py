from langchain_core.tools import tool
from modules.inference.services.kb_service import list_vulnerabilities, list_countermeasures, get_vulnerabilities_for_component, get_countermeasures_for_vulnerabilities
from modules.inference.models.kb_model import VulnerabilityFilter
from modules.inference.services.inference_service import list_inferences
from modules.inference.services.threat_service import list_threat_reports as list_threats
from modules.dashboard.services.dashboard_service import get_dashboard_stats
from modules.inference.dataset.dataset_service import list_entries, get_stats as get_dataset_stats
from modules.inference.services.training_service import list_training_logs as list_trained_models
from modules.inference.models.inference_model import InferenceResult
from modules.hermes.services.rag_service import search_knowledge_base
from modules.auth.models.user_model import User
from datetime import datetime, timedelta


@tool("analyze_diagram")
async def analyze_diagram_tool(image_path: str, user_id: str = "") -> str:
    """Analyze a software architecture diagram image and detect components."""
    from modules.inference.services.inference_service import analyze_diagram

    try:
        with open(image_path, "rb") as f:
            data = f.read()
        result = await analyze_diagram(
            image_data=data,
            filename=image_path.split("/")[-1],
            user_id=user_id or "hermes",
        )
        components = []
        for c in result.components:
            components.append(f"{c.label} (confidence: {c.confidence:.2%})")
        return f"Diagram analyzed. Detected {len(components)} components: {', '.join(components)}"
    except Exception as e:
        return f"Error analyzing diagram: {str(e)}"


@tool("list_reports")
async def list_reports_tool(user_id: str = "", limit: int = 10) -> str:
    """List inference analysis reports. Shows recent diagram analysis history."""
    items, total = await list_inferences(
        user_id=user_id or None,
        limit=limit,
    )
    if not items:
        return "No analysis reports found."
    lines = [f"Total: {total} reports"]
    for r in items:
        comps = ", ".join(c.label for c in (r.components or []))
        lines.append(f"- {r.id}: {r.filename} | {r.status} | components: [{comps}] | {r.created_at}")
    return "\n".join(lines)


@tool("list_threats")
async def list_threats_tool(limit: int = 10) -> str:
    """List STRIDE threat reports generated from architecture analysis."""
    items, total = await list_threats(limit=limit)
    if not items:
        return "No threat reports found."
    lines = [f"Total: {total} threat reports"]
    for t in items:
        lines.append(f"- {t.id}: {t.title} | severity: {t.severity} | score: {t.risk_score} | {t.created_at}")
    return "\n".join(lines)


@tool("list_vulnerabilities")
async def list_vulnerabilities_tool(component: str = "", search: str = "", limit: int = 20) -> str:
    """Search the vulnerability knowledge base. Filter by component (server, database, api, user, gateway, etc.) or search text."""
    filter_obj = None
    if component or search:
        filter_obj = VulnerabilityFilter(component=component or None, search=search or None)
    items, total = await list_vulnerabilities(filter_by=filter_obj, limit=limit)
    if not items:
        return "No vulnerabilities found."
    lines = [f"Total: {total} vulnerabilities"]
    for v in items:
        comps = ", ".join(v.affected_components)
        lines.append(f"- {v.cve_id}: {v.title} (CVSS: {v.cvss_score}) | components: [{comps}]")
    return "\n".join(lines)


@tool("list_countermeasures")
async def list_countermeasures_tool(cwe_id: str = "", limit: int = 20) -> str:
    """List security countermeasures. Filter by CWE ID to get specific mitigations."""
    cwe_ids = [cwe_id] if cwe_id else None
    items, total = await list_countermeasures(cwe_ids=cwe_ids, limit=limit)
    if not items:
        return "No countermeasures found."
    lines = [f"Total: {total} countermeasures"]
    for c in items:
        cwes = ", ".join(c.vulnerability_cwe_ids)
        lines.append(f"- {c.title} (priority: {c.priority}) | CWEs: [{cwes}]")
    return "\n".join(lines)


@tool("dashboard_stats")
async def dashboard_stats_tool() -> str:
    """Get system-wide dashboard statistics and KPIs."""
    stats = await get_dashboard_stats()
    return (
        f"Dashboard Statistics:\n"
        f"- Total inferences: {stats.get('total_inferences', 0)}\n"
        f"- Total threats: {stats.get('total_threats', 0)}\n"
        f"- Active models: {stats.get('active_models', 0)}\n"
        f"- Dataset entries: {stats.get('total_dataset_entries', 0)}\n"
    )


@tool("list_dataset")
async def list_dataset_entries_tool(limit: int = 20) -> str:
    """List dataset entries used for model training."""
    items, total = await list_entries(limit=limit)
    if not items:
        return "No dataset entries found."
    lines = [f"Total: {total} dataset entries"]
    for e in items:
        lines.append(f"- {e.id}: {e.filename} | type: {e.type} | augmented: {e.augmented}")
    return "\n".join(lines)


@tool("list_models")
async def list_trained_models_tool(limit: int = 10) -> str:
    """List trained YOLO models and their versions."""
    items, total = await list_trained_models(limit=limit)
    if not items:
        return "No trained models found."
    lines = [f"Total: {total} models"]
    for m in items:
        lines.append(f"- {m.id}: {m.model_name} (epochs: {m.epochs}, accuracy: {m.accuracy}) | active: {m.is_active}")
    return "\n".join(lines)


@tool("rag_kb")
async def rag_kb_tool(query: str) -> str:
    """Search the security knowledge base (PDFs, articles, standards) for in-depth explanations about vulnerabilities, threats, and security practices."""
    result = await search_knowledge_base(query=query, k=4)
    return f"Knowledge base results:\n{result}"


@tool("last_threat_report")
async def last_threat_report_tool() -> str:
    """Get the latest STRIDE threat report generated from the last diagram analysis. Use this when the user asks about their last analysis or STRIDE results."""
    items, total = await list_threats(limit=1)
    if not items:
        return "Nenhum relatório STRIDE encontrado. Faça upload de um diagrama primeiro."
    r = items[0]
    comps = []
    for ca in (r.component_analyses or []):
        vulns = ", ".join(v.title for v in (ca.vulnerabilities or []))
        cm = ", ".join(c.title for c in (ca.countermeasures or []))
        comps.append(f"- {ca.component_label}: ameaças {[t.category for t in ca.stride_threats]}, vulnerabilidades: [{vulns}], contramedidas: [{cm}]")
    return (
        f"Relatório STRIDE #{r.id}\n"
        f"Risco geral: {r.overall_risk_score}/10\n"
        f"Resumo STRIDE: spoofing={r.stride_summary.get('spoofing',0)}, tampering={r.stride_summary.get('tampering',0)}, "
        f"repudiation={r.stride_summary.get('repudiation',0)}, information_disclosure={r.stride_summary.get('information_disclosure',0)}, "
        f"denial_of_service={r.stride_summary.get('denial_of_service',0)}, elevation_of_privilege={r.stride_summary.get('elevation_of_privilege',0)}\n"
        f"Componentes analisados:\n" + "\n".join(comps)
    )
