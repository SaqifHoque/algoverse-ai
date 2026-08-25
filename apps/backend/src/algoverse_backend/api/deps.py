from collections.abc import AsyncGenerator

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from algoverse_backend.db.session import async_session_factory
from algoverse_backend.llm.ollama_client import OllamaLessonPlanner


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session


def get_planner(request: Request) -> OllamaLessonPlanner:
    return request.app.state.planner


def get_model_tag(request: Request) -> str:
    return request.app.state.model_tag
