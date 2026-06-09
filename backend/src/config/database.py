from __future__ import annotations

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from modules.auth.models.user_model import User


async def init_database(database_url: str) -> None:
    client = AsyncIOMotorClient(database_url, serverSelectionTimeoutMS=5000)
    database = client.riftshield

    await init_beanie(database=database, document_models=[User])
    print("📦 Conectado ao MongoDB")
