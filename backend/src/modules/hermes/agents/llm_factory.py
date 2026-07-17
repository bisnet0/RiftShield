from typing import Optional

from langchain_core.language_models.chat_models import BaseChatModel
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
    enable_fallback: bool = True,
) -> Optional[BaseChatModel]:
    order = ["google", "openai", "deepseek"]
    models_map = {
        "google": (google_key, google_model, _build_google),
        "openai": (openai_key, openai_model, _build_openai),
        "deepseek": (deepseek_key, deepseek_model, _build_deepseek),
    }
    keys_map = {"google": google_key, "openai": openai_key, "deepseek": deepseek_key}

    if provider in keys_map and keys_map[provider]:
        key, model, builder = models_map[provider]
        return builder(key, model, tools)

    if enable_fallback:
        for alt_provider in order:
            if alt_provider == provider:
                continue
            if keys_map.get(alt_provider):
                key, model, builder = models_map[alt_provider]
                print(f"Fallback: {provider} sem chave, usando {alt_provider}")
                return builder(key, model, tools)

    return None
