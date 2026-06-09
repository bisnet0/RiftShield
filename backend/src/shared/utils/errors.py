from __future__ import annotations


class AppError(Exception):
    def __init__(self, message: str = "Erro interno", status_code: int = 400) -> None:
        self.status_code = status_code
        self.message = message
        super().__init__(message)


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Não autorizado") -> None:
        super().__init__(message, status_code=401)


class ForbiddenError(AppError):
    def __init__(self, message: str = "Acesso negado") -> None:
        super().__init__(message, status_code=403)


class NotFoundError(AppError):
    def __init__(self, message: str = "Recurso não encontrado") -> None:
        super().__init__(message, status_code=404)
