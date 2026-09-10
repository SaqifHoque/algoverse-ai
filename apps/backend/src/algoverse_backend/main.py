from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from algoverse_backend.api.routes import health, lessons, progress, submissions, traces
from algoverse_backend.config import settings
from algoverse_backend.db.models import Base
from algoverse_backend.db.session import engine
from algoverse_backend.llm.model_selector import select_model
from algoverse_backend.llm.ollama_client import OllamaLessonPlanner


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # create_all is a pragmatic stand-in for real migrations while this vertical slice's
    # schema is still settling; swap for Alembic once the schema stabilizes.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    model_tag = select_model()
    app.state.model_tag = model_tag
    app.state.planner = OllamaLessonPlanner(
        base_url=settings.ollama_base_url,
        model_tag=model_tag,
        max_retries=settings.llm_max_retries,
        request_timeout=settings.llm_request_timeout_seconds,
    )
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="AlgoVerse AI Backend", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix="/api/v1")
    app.include_router(submissions.router, prefix="/api/v1")
    app.include_router(lessons.router, prefix="/api/v1")
    app.include_router(progress.router, prefix="/api/v1")
    app.include_router(traces.router, prefix="/api/v1")

    return app


app = create_app()
