from __future__ import annotations

from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime


class User(Document):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    role: str = Field(default="USER", pattern=r"^(ADMIN|USER)$")
    profession: Optional[str] = None
    seniority: Optional[str] = Field(default=None, pattern=r"^(junior|mid-level|senior)$")
    age: Optional[int] = None
    total_days_active: int = 0
    language: str = Field(default="pt-BR", pattern=r"^(pt-BR|en-US)$")
    custom_cursor_enabled: bool = True
    total_seconds_active: int = 0
    refresh_token: Optional[str] = Field(default=None, alias="refreshToken")
    created_at: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    updated_at: datetime = Field(default_factory=datetime.utcnow, alias="updatedAt")

    class Settings:
        name = "users"
        use_revision = False

    class Config:
        populate_by_name = True
