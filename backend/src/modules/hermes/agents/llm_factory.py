from typing import Optional

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, SystemMessage
from langchain_core.tools import BaseTool


def _build_google(api_key: str, model: str, tools: list[BaseTool]) -> BaseChatModel:
    from langchain_google_genai import ChatGoogleGenerativeAI
    return ChatGoogleGenerativeAI(
        model=model,
        google_api_key=api_key,
        temperature=0.2,
        max_retries=2,
    ).bind_tools(tools)


def _build_openai(api_key: str, model: str, tools: list[BaseTool]) -> BaseChatModel:
    from langchain_openai import ChatOpenAI
    return ChatOpenAI(
        model=model,
        api_key=api_key,
        temperature=0.2,
        max_retries=2,
    ).bind_tools(tools)


def _build_deepseek(api_key: str, model: str, tools: list[BaseTool]) -> BaseChatModel:
    from langchain_openai import ChatOpenAI
    return ChatOpenAI(
        model=model,
        api_key=api_key,
        base_url="https://api.deepseek.com/v1",
        temperature=0.2,
        max_retries=2,
    ).bind_tools(tools)


def build_llm(
    provider: str,
    tools: list[BaseTool],
    google_key: str = "",
    openai_key: str = "",
    deepseek_key: str = "",
    google_model: str = "gemini-2.5-flash-lite",
    openai_model: str = "gpt-4o-mini",
    deepseek_model: str = "deepseek-chat",
) -> Optional[BaseChatModel]:
    if provider == "google" and google_key:
        return _build_google(google_key, google_model, tools)
    if provider == "openai" and openai_key:
        return _build_openai(openai_key, openai_model, tools)
    if provider == "deepseek" and deepseek_key:
        return _build_deepseek(deepseek_key, deepseek_model, tools)
    return None
