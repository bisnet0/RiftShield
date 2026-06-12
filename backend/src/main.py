from __future__ import annotations

from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from config.database import init_database
from config.settings import get_settings
from middleware.error_handler import app_error_handler, validation_error_handler
from modules.auth import auth_router
from modules.dashboard.routes.dashboard_routes import router as dashboard_router
from modules.inference.dataset.dataset_routes import router as dataset_router
from modules.inference.routes.inference_routes import router as inference_router
from modules.inference.routes.kb_routes import router as kb_router
from modules.inference.routes.training_routes import router as training_router
from modules.users import user_router
from shared.utils.errors import AppError

load_dotenv()
settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_database(settings.database_url)
    from modules.inference.services.kb_service import seed_knowledge_base
    seeded = await seed_knowledge_base()
    if seeded:
        print(f"\U0001f4da Knowledge base seeded: {seeded} entries")
    yield


app = FastAPI(title="RiftShield API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(ValidationError, validation_error_handler)


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}


app.include_router(auth_router, prefix="/api/auth")
app.include_router(user_router, prefix="/api/users")
app.include_router(dashboard_router, prefix="/api/dashboard")
app.include_router(inference_router, prefix="/api/inference")
app.include_router(dataset_router, prefix="/api/dataset")
app.include_router(kb_router, prefix="/api/kb")
app.include_router(training_router, prefix="/api/training")
