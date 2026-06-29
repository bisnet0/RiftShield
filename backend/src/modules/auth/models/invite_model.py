from __future__ import annotations

from datetime import datetime

from beanie import Document
from pydantic import Field


class Invite(Document):
    code: str = Field(unique=True, index=True)
    role: str = Field(default="ADMIN", pattern=r"^(ADMIN|USER)$")
    used: bool = False
    used_by: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    used_at: datetime | None = None

    class Settings:
        name = "invites"
        use_revision = False
