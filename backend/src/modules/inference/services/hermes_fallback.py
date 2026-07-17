from __future__ import annotations

import base64
import json
import os
import uuid
from pathlib import Path

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

from modules.inference.models.inference_model import DetectedComponent, InferenceResult

COMPONENT_CLASSES = [
    "user", "server", "database", "api", "load_balancer",
    "firewall", "message_queue", "cache", "cdn", "dns",
    "microservice", "gateway", "storage", "container", "identity_provider",
]

SYSTEM_PROMPT_FALLBACK = """Você é o Hermes, Arquiteto de Sistemas Sênior especializado em análise de diagramas de arquitetura.

Analise esta imagem de diagrama de arquitetura de software.

Identifique os componentes de arquitetura presentes na imagem. Considere formas geométricas (retângulos, círculos, losangos), ícones, texto e conexões entre eles.

Componentes válidos: user, server, database, api, load_balancer, firewall, message_queue, cache, cdn, dns, microservice, gateway, storage, container, identity_provider

Regras:
- Mapeie formas e ícones para o componente mais adequado
- Retângulos com nome de banco de dados → database
- Retângulos com nomes de servidores → server
- Figuras humanas/ícones de pessoa → user
- Ícones de nuvem → cloud/gateway
- Conectores/setas → ignore (não são componentes)
- Responda APENAS com um JSON array válido, nada mais

Formato da resposta (JSON apenas):
[
  {"label": "server", "confidence": 0.85, "bbox": [50, 50, 200, 150]},
  {"label": "database", "confidence": 0.78, "bbox": [300, 50, 200, 150]}
]

bbox = [x, y, width, height] em pixels aproximados. Se não souber as coordenadas, use [0, 0, 100, 100]."

RESPONDA APENAS COM O JSON. Nenhum texto adicional."""


def _build_llm(config: dict):
    provider = config.get("provider", "google")
    key_google = config.get("google_api_key", "")
    key_openai = config.get("openai_api_key", "")
    key_deepseek = config.get("deepseek_api_key", "")

    if provider == "google" and key_google:
        return ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", google_api_key=key_google, temperature=0.1)
    if provider == "openai" and key_openai:
        return ChatOpenAI(model="gpt-4o-mini", api_key=key_openai, temperature=0.1)
    if provider == "deepseek" and key_deepseek:
        return ChatOpenAI(model="deepseek-chat", api_key=key_deepseek, base_url="https://api.deepseek.com/v1", temperature=0.1)
    return None


async def analyze_with_llm(
    image_data: bytes,
    filename: str,
    user_id: str,
    llm_config: dict,
) -> InferenceResult | None:
    llm = _build_llm(llm_config)
    if llm is None:
        return None

    from modules.hermes.models.chat_model import HermesMessage

    file_id = uuid.uuid4().hex[:12]
    safe_filename = f"{file_id}_{filename}"
    upload_dir = Path(__file__).resolve().parent.parent.parent.parent / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / safe_filename
    with open(file_path, "wb") as f:
        f.write(image_data)

    b64 = base64.b64encode(image_data).decode("utf-8")
    data_url = f"data:image/png;base64,{b64}"

    try:
        msg = HumanMessage(
            content=[
                {"type": "text", "text": "Analise este diagrama de arquitetura e liste os componentes presentes."},
                {"type": "image_url", "image_url": {"url": data_url}},
            ]
        )
        response = llm.invoke([SystemMessage(content=SYSTEM_PROMPT_FALLBACK), msg])
        raw = response.content.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[-1].rsplit("\n", 1)[0]
        components_data = json.loads(raw)
    except Exception as e:
        print(f"Hermes fallback error: {e}")
        return None

    inference = InferenceResult(
        user_id=user_id,
        filename=safe_filename,
        image_path=str(file_path),
        status="processing",
    )
    await inference.insert()

    components = []
    for item in components_data:
        label = item.get("label", "server")
        if label not in COMPONENT_CLASSES:
            label = "server"
        class_id = COMPONENT_CLASSES.index(label)
        conf = min(item.get("confidence", 0.5), 1.0)
        bbox = item.get("bbox", [0, 0, 100, 100])
        components.append(
            DetectedComponent(
                class_id=class_id,
                label=label,
                confidence=conf,
                bbox=bbox,
                inference_id=str(inference.id),
            )
        )

    inference.components = components
    inference.status = "completed"
    inference.processing_time_ms = 0
    inference.fallback_used = True
    await inference.save()

    try:
        from modules.hermes.models.chat_model import HermesMessage as HM
        await HM(
            user_id=user_id,
            role="user",
            content=f"⚡ Fallback IA acionado: diagrama '{filename}' analisado via {llm_config.get('provider', 'IA')}. Componentes: {', '.join(c.label for c in components)}",
            has_attachment=False,
        ).insert()
    except Exception as e:
        print(f"Hermes log error: {e}")

    return inference
