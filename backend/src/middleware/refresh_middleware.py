from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class RefreshTokenMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        new_token = getattr(request.state, "new_access_token", None)
        if new_token:
            response.set_cookie(
                key="accessToken",
                value=new_token,
                httponly=True,
                samesite="lax",
                secure=False,
                max_age=900,
            )
        return response
