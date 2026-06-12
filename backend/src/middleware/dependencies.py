from fastapi import Cookie, Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Optional

from shared.utils.errors import UnauthorizedError
from shared.utils.token import verify_access_token


security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    access_token: Optional[str] = Cookie(default=None, alias="accessToken"),
):
    from modules.auth.models.user_model import User

    token = access_token
    if credentials:
        token = credentials.credentials

    if not token:
        raise UnauthorizedError("Token n\u00e3o fornecido")

    try:
        payload = verify_access_token(token)
        user = await User.get(payload["userId"])
    except Exception:
        raise UnauthorizedError("Token inv\u00e1lido ou expirado")

    if not user:
        raise UnauthorizedError("Usu\u00e1rio n\u00e3o encontrado")

    return user
