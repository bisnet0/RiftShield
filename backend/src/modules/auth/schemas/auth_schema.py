from __future__ import annotations

from pydantic import BaseModel, EmailStr, field_validator


class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str
    invite_code: str
    phone: str | None = None
    country: str | None = None
    state: str | None = None
    city: str | None = None

    @field_validator("name")
    @classmethod
    def name_min_length(cls, v: str) -> str:
        if len(v) < 3:
            raise ValueError("Nome deve ter no mínimo 3 caracteres")
        return v

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Senha deve ter no mínimo 6 caracteres")
        return v


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str | None = None
    country: str | None = None
    state: str | None = None
    city: str | None = None
    role: str
