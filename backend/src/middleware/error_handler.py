from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from shared.utils.errors import AppError


async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"error": exc.message})


async def validation_error_handler(_request: Request, exc: ValidationError) -> JSONResponse:
    messages = ", ".join(e["msg"] for e in exc.errors())
    return JSONResponse(status_code=400, content={"error": messages})
