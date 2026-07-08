from typing import Literal, Optional

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import SystemMessage, AIMessage
from langchain_core.language_models.chat_models import BaseChatModel

from modules.hermes.agents.state import HermesState
from modules.hermes.agents.tools import HERMES_TOOLS
from modules.hermes.agents.llm_factory import build_llm

SYSTEM_PROMPT = """Você é o Hermes, um Arquiteto de Sistemas Sênior e Analista de Segurança especializado em modelagem de ameaças STRIDE.

SUA PERSONALIDADE:
- Analista técnico experiente, direto e preciso
- Senior Engineer com vasto conhecimento em arquitetura de software, segurança e infraestrutura
- Tom profissional mas didático quando necessário
- Use linguagem técnica apropriada, explicando conceitos complexos de forma clara

SUAS CAPACIDADES:
1. ANÁLISE DE DIAGRAMAS: Receba imagens de arquitetura, detecte componentes e aponte vulnerabilidades
2. BASE DE CONHECIMENTO: Consulte vulnerabilidades, contramedidas e relatórios STRIDE
3. DATASET E MODELOS: Gerencie datasets de treinamento e modelos YOLO
4. DASHBOARD: Acesse estatísticas e KPIs do sistema
5. RAG: Consulte a base de conhecimento para explicações aprofundadas

REGRAS:
1. Sempre que o usuário pedir análise de uma imagem, use a ferramenta analyze_diagram
2. Para perguntas sobre vulnerabilidades, consulte list_vulnerabilidades
3. Para recomendações de segurança, use list_countermeasures
4. Para contexto adicional, use rag_kb para buscar na base de conhecimento
5. Seja proativo: sugira análises e aponte problemas mesmo sem solicitação explícita
6. NUNCA invente informações. Use APENAS os retornos das ferramentas.
7. Baseie suas respostas em STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
"""


llm_cache: Optional[BaseChatModel] = None
last_config: dict = {}


def get_llm(config: dict) -> Optional[BaseChatModel]:
    global llm_cache, last_config
    if config == last_config and llm_cache is not None:
        return llm_cache
    provider = config.get("provider", "google")
    llm = build_llm(
        provider=provider,
        tools=HERMES_TOOLS,
        google_key=config.get("google_api_key", ""),
        openai_key=config.get("openai_api_key", ""),
        deepseek_key=config.get("deepseek_api_key", ""),
        google_model=config.get("google_model", "gemini-2.5-flash-lite"),
        openai_model=config.get("openai_model", "gpt-4o-mini"),
        deepseek_model=config.get("deepseek_model", "deepseek-chat"),
    )
    if llm is not None:
        llm_cache = llm
        last_config = config
    return llm


def supervisor_node(state: HermesState):
    config = state.get("context", {}).get("llm_config", {})
    llm = get_llm(config)
    if llm is None:
        return {
            "messages": [
                AIMessage(
                    content="Hermes não está configurado. Vá em Configurações e adicione uma chave de API (Google, OpenAI ou DeepSeek) para ativar o assistente."
                )
            ]
        }
    messages = state["messages"]
    if not messages or not isinstance(messages[0], SystemMessage):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages
    response = llm.invoke(messages)
    return {"messages": [response]}


def should_continue(state: HermesState) -> Literal["tools", "final"]:
    messages = state.get("messages", [])
    if not messages:
        return "final"
    last_message = messages[-1]
    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        return "tools"
    return "final"


workflow = StateGraph(HermesState)
workflow.add_node("supervisor", supervisor_node)
workflow.add_node("tools", ToolNode(HERMES_TOOLS))
workflow.set_entry_point("supervisor")
workflow.add_conditional_edges(
    "supervisor", should_continue, {"tools": "tools", "final": END}
)
workflow.add_edge("tools", "supervisor")

hermes_graph = workflow.compile()
