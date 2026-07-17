from __future__ import annotations

import base64
import io
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

BR_TIMEZONE = timezone(timedelta(hours=-3))


def _now_br() -> datetime:
    return datetime.now(timezone.utc).astimezone(BR_TIMEZONE)

TEMPLATE_PATH = __file__.replace("pdf_generator.py", "") + "../templates/report_pdf.html"


def _fig_to_b64(fig) -> str:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


def _chart_inferences(items: List[Dict]) -> Optional[str]:
    if not items:
        return None
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    statuses = {}
    for i in items:
        s = i.get("status", "unknown")
        statuses[s] = statuses.get(s, 0) + 1

    fig, ax = plt.subplots(figsize=(5, 2.5))
    colors = {"completed": "#16a34a", "failed": "#dc2626", "processing": "#2563eb", "pending": "#ca8a04"}
    bars = ax.bar(statuses.keys(), statuses.values(), color=[colors.get(k, "#888") for k in statuses.keys()])
    ax.set_title("Status das Análises", fontsize=11, color="#333")
    ax.set_ylabel("Quantidade", fontsize=9)
    for bar in bars:
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.3, str(int(bar.get_height())), ha="center", fontsize=9)
    plt.tight_layout()
    b64 = _fig_to_b64(fig)
    plt.close()
    return b64


def _chart_threats(items: List[Dict]) -> Optional[str]:
    if not items:
        return None
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    stride_totals = {"spoofing": 0, "tampering": 0, "repudiation": 0,
                     "information_disclosure": 0, "denial_of_service": 0, "elevation_of_privilege": 0}
    for r in items:
        ss = r.get("stride_summary", {})
        for k in stride_totals:
            stride_totals[k] += ss.get(k, 0)

    labels_map = {
        "spoofing": "Spoofing", "tampering": "Tampering", "repudiation": "Repudiação",
        "information_disclosure": "Exposição", "denial_of_service": "DoS", "elevation_of_privilege": "Elevação",
    }
    cats = list(stride_totals.keys())
    vals = list(stride_totals.values())
    lbls = [labels_map.get(c, c) for c in cats]
    colors_ride = ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#8b5cf6", "#ec4899"]

    fig, ax = plt.subplots(figsize=(5.5, 2.8))
    bars = ax.bar(lbls, vals, color=colors_ride)
    ax.set_title("Distribuição de Ameaças STRIDE", fontsize=11, color="#333")
    ax.set_ylabel("Ocorrências", fontsize=9)
    for bar in bars:
        if bar.get_height() > 0:
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.3, str(int(bar.get_height())), ha="center", fontsize=8)
    plt.tight_layout()
    b64 = _fig_to_b64(fig)
    plt.close()
    return b64


def _chart_dataset(items: List[Dict]) -> Optional[str]:
    if not items:
        return None
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    splits = {}
    for e in items:
        s = e.get("split", "unknown")
        splits[s] = splits.get(s, 0) + 1

    fig, ax = plt.subplots(figsize=(3.5, 3))
    colors_pie = {"train": "#16a34a", "val": "#2563eb", "test": "#8b5cf6"}
    wedges, texts, autotexts = ax.pie(
        splits.values(), labels=splits.keys(), autopct="%1.0f%%",
        colors=[colors_pie.get(k, "#888") for k in splits.keys()],
        startangle=90
    )
    ax.set_title("Split do Dataset", fontsize=11, color="#333")
    plt.tight_layout()
    b64 = _fig_to_b64(fig)
    plt.close()
    return b64


def _chart_vulnerabilities(items: List[Dict]) -> Optional[str]:
    if not items:
        return None
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    scores = [v.get("cvss_score", 0) or 0 for v in items]
    bins = [0, 4, 7, 9, 10]
    labels_bins = ["Baixo", "Médio", "Alto", "Crítico"]
    counts = [0] * 4
    for s in scores:
        if s >= 9:
            counts[3] += 1
        elif s >= 7:
            counts[2] += 1
        elif s >= 4:
            counts[1] += 1
        else:
            counts[0] += 1

    fig, ax = plt.subplots(figsize=(4, 2.5))
    colors_cvss = ["#16a34a", "#ca8a04", "#ea580c", "#dc2626"]
    bars = ax.bar(labels_bins, counts, color=colors_cvss)
    ax.set_title("Severidade das Vulnerabilidades", fontsize=11, color="#333")
    ax.set_ylabel("Quantidade", fontsize=9)
    for bar in bars:
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.3, str(int(bar.get_height())), ha="center", fontsize=9)
    plt.tight_layout()
    b64 = _fig_to_b64(fig)
    plt.close()
    return b64


def _chart_training(items: List[Dict]) -> Optional[str]:
    completed = [t for t in items if t.get("status") == "completed"]
    if not completed:
        return None
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    names = [t.get("model_type", "model") for t in completed]
    accs = []
    for t in completed:
        m = t.get("metrics", {})
        accs.append(m.get("mAP50", m.get("fine_tune_epochs", 0)) or 0)

    fig, ax = plt.subplots(figsize=(4, 2.5))
    ax.bar(names, accs, color="#e65c00")
    ax.set_title("Performance dos Modelos", fontsize=11, color="#333")
    ax.set_ylabel("mAP@0.5 / Épocas", fontsize=9)
    plt.tight_layout()
    b64 = _fig_to_b64(fig)
    plt.close()
    return b64


def _stride_summary_text(stride: Dict[str, int]) -> str:
    parts = []
    labels = {
        "spoofing": "Spoofing", "tampering": "Tampering", "repudiation": "Repudiação",
        "information_disclosure": "Exposição de Info", "denial_of_service": "DoS",
        "elevation_of_privilege": "Elevação de Privilégio",
    }
    for k, v in stride.items():
        if v > 0:
            parts.append(f"{labels.get(k, k)}: {v}")
    return ", ".join(parts) if parts else "Nenhuma ameaça identificada"


def build_pdf_sections(
    inferences: List[Dict],
    threats: List[Dict],
    dataset: List[Dict],
    training_logs: List[Dict],
    vulnerabilities: List[Dict],
    countermeasures: List[Dict],
    profile: Optional[Dict] = None,
    settings: Optional[Dict] = None,
) -> List[Dict]:
    sections = []

    # Dashboard / Resumo
    stats = [
        {"value": len(inferences), "label": "Análises Realizadas"},
        {"value": len(threats), "label": "Relatórios STRIDE"},
        {"value": len(dataset), "label": "Imagens no Dataset"},
        {"value": len(training_logs), "label": "Treinamentos"},
        {"value": len(vulnerabilities), "label": "Vulnerabilidades na Base"},
        {"value": len(countermeasures), "label": "Contramedidas na Base"},
    ]
    sections.append({
        "title": "Resumo Geral",
        "description": "Visão geral dos dados exportados do RiftShield.",
        "stats": stats,
    })

    # Análise de Diagramas
    chart_inf = _chart_inferences(inferences)
    inf_table = []
    for i in inferences[:20]:
        comps = ", ".join(c.get("label", "?") for c in (i.get("components") or [])[:3])
        inf_table.append([i.get("filename", "-")[:30], i.get("status", "-"), comps or "-",
                          f'{i.get("processing_time_ms", 0):.0f}ms' if i.get("processing_time_ms") else "-"])
    sections.append({
        "title": "Análise de Diagramas",
        "description": f"Total de {len(inferences)} análises realizadas.",
        "stats": [
            {"value": len([i for i in inferences if i.get("status") == "completed"]), "label": "Concluídas"},
            {"value": len([i for i in inferences if i.get("fallback_used")]), "label": "Com Fallback IA"},
        ],
        "chart": chart_inf,
        "table_headers": ["Arquivo", "Status", "Componentes", "Tempo"],
        "table_rows": inf_table,
        "table_note": f"Mostrando até 20 de {len(inferences)} análises." if len(inferences) > 20 else None,
    })

    # Relatórios STRIDE
    chart_thr = _chart_threats(threats)
    thr_table = []
    for r in threats[:20]:
        risk = r.get("overall_risk_score", 0) or 0
        risk_str = f'{risk:.1f}/10'
        stride_text = _stride_summary_text(r.get("stride_summary", {}))
        thr_table.append([str(r.get("id", "-"))[:12], r.get("status", "-"), risk_str, stride_text])
    sections.append({
        "title": "Relatórios STRIDE",
        "description": f"Total de {len(threats)} relatórios de modelagem de ameaças.",
        "stats": [
            {"value": len(threats), "label": "Total de Relatórios"},
            {"value": sum(t.get("overall_risk_score", 0) or 0 for t in threats) / max(len(threats), 1), "label": "Risco Médio"},
        ],
        "chart": chart_thr,
        "table_headers": ["ID", "Status", "Risco", "Ameaças"],
        "table_rows": thr_table,
        "table_note": f"Mostrando até 20 de {len(threats)} relatórios." if len(threats) > 20 else None,
    })

    # Dataset
    chart_ds = _chart_dataset(dataset)
    ds_table = []
    for e in dataset[:20]:
        ds_table.append([e.get("filename", "-")[:30], e.get("split", "-"), e.get("source", "-"),
                         str(len(e.get("labels", [])))])
    sections.append({
        "title": "Dataset",
        "description": f"Total de {len(dataset)} imagens no dataset para treinamento.",
        "stats": [
            {"value": len([e for e in dataset if e.get("split") == "train"]), "label": "Treino"},
            {"value": len([e for e in dataset if e.get("split") == "val"]), "label": "Validação"},
            {"value": len([e for e in dataset if e.get("split") == "test"]), "label": "Teste"},
        ],
        "chart": chart_ds,
        "table_headers": ["Arquivo", "Split", "Origem", "Labels"],
        "table_rows": ds_table,
        "table_note": f"Mostrando até 20 de {len(dataset)} entradas." if len(dataset) > 20 else None,
    })

    # Treinamento
    chart_tr = _chart_training(training_logs)
    tr_table = []
    for t in training_logs[:20]:
        tr_table.append([t.get("model_type", "-"), t.get("status", "-"),
                         str(t.get("hyperparameters", {}).get("epochs", "-")),
                         t.get("created_at", "-")[:10] if t.get("created_at") else "-"])
    sections.append({
        "title": "Treinamento de Modelos",
        "description": f"Total de {len(training_logs)} sessões de treinamento/fine-tune.",
        "stats": [
            {"value": len([t for t in training_logs if t.get("status") == "completed"]), "label": "Concluídos"},
            {"value": len([t for t in training_logs if t.get("status") == "failed"]), "label": "Falhos"},
        ],
        "chart": chart_tr,
        "table_headers": ["Modelo", "Status", "Épocas", "Data"],
        "table_rows": tr_table,
        "table_note": f"Mostrando até 20 de {len(training_logs)} treinamentos." if len(training_logs) > 20 else None,
    })

    # Vulnerabilidades
    chart_vuln = _chart_vulnerabilities(vulnerabilities)
    vuln_table = []
    for v in vulnerabilities[:25]:
        tags = ", ".join((v.get("tags") or [])[:3])
        vuln_table.append([v.get("cve_id", "-"), v.get("title", "-")[:40],
                           f'{v.get("cvss_score", "-")}', tags])
    sections.append({
        "title": "Base de Vulnerabilidades",
        "description": f"Total de {len(vulnerabilities)} vulnerabilidades catalogadas na base de conhecimento.",
        "stats": [
            {"value": len(vulnerabilities), "label": "Total"},
            {"value": len([v for v in vulnerabilities if (v.get("cvss_score") or 0) >= 9]), "label": "Críticas"},
            {"value": len([v for v in vulnerabilities if 7 <= (v.get("cvss_score") or 0) < 9]), "label": "Altas"},
        ],
        "chart": chart_vuln,
        "table_headers": ["CVE", "Título", "CVSS", "Tags"],
        "table_rows": vuln_table,
        "table_note": f"Mostrando até 25 de {len(vulnerabilities)} vulnerabilidades." if len(vulnerabilities) > 25 else None,
    })

    # Contramedidas
    cm_table = []
    for c in countermeasures[:20]:
        cm_table.append([c.get("title", "-")[:45], c.get("priority", "-"),
                         ", ".join((c.get("vulnerability_cwe_ids") or [])[:3])])
    sections.append({
        "title": "Base de Contramedidas",
        "description": f"Total de {len(countermeasures)} contramedidas disponíveis.",
        "stats": [
            {"value": len([c for c in countermeasures if c.get("priority") == "critical"]), "label": "Críticas"},
            {"value": len([c for c in countermeasures if c.get("priority") == "high"]), "label": "Altas"},
        ],
        "table_headers": ["Contramedida", "Prioridade", "CWEs"],
        "table_rows": cm_table,
        "table_note": f"Mostrando até 20 de {len(countermeasures)} contramedidas." if len(countermeasures) > 20 else None,
    })

    if profile:
        prof_items = [
            ["Nome", profile.get("name", "-")],
            ["Email", profile.get("email", "-")],
            ["Profissão", profile.get("profession", "-") or "-"],
            ["Senioridade", profile.get("seniority", "-") or "-"],
            ["Idioma", profile.get("language", "pt-BR")],
            ["Dias Ativo", str(profile.get("total_days_active", 0))],
        ]
        sections.append({
            "title": "Perfil do Usuário",
            "description": "Informações cadastrais do usuário.",
            "table_headers": ["Campo", "Valor"],
            "table_rows": prof_items,
        })

    if settings:
        sett_items = [
            ["Hermes Ativo", "Sim" if settings.get("enabled") else "Não"],
            ["Provedor IA", settings.get("provider", "-")],
            ["Fallback Diagramas", settings.get("diag_fallback", "yolo")],
        ]
        sections.append({
            "title": "Configurações",
            "description": "Preferências do assistente Hermes.",
            "table_headers": ["Configuração", "Valor"],
            "table_rows": sett_items,
        })

    return sections


def generate_pdf(sections_data: List[Dict], generation_date: str, profile: Optional[Dict] = None) -> bytes:
    from jinja2 import Template

    with open(TEMPLATE_PATH, encoding="utf-8") as f:
        template_str = f.read()

    template = Template(template_str)
    html = template.render(
        sections=sections_data,
        generation_date=generation_date,
        profile=profile,
    )

    from weasyprint import HTML
    pdf_bytes = HTML(string=html).write_pdf()
    return pdf_bytes
