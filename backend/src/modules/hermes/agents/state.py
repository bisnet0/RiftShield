from typing import Annotated, List

from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage
from typing_extensions import TypedDict


class HermesState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    context: dict
    next_step: str
    tool_output: dict
    retry_count: int
