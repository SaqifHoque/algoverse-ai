from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from algoverse_backend.analysis.ast_analyzer import analyze
from algoverse_backend.cache.redis_client import get_cached_lesson, lesson_cache_key, set_cached_lesson
from algoverse_backend.config import settings
from algoverse_backend.db.repositories import save_execution_trace, save_lesson
from algoverse_backend.execution.sandbox import run_in_sandbox
from algoverse_backend.lesson.schema import AlgorithmName, Difficulty, Lesson
from algoverse_backend.llm.base import LessonGenerationOptions, LessonPlannerClient


async def generate_lesson_for_submission(
    session: AsyncSession,
    planner: LessonPlannerClient,
    model_tag: str,
    *,
    submission_id: UUID,
    source_code: str,
    entrypoint: str,
    algorithm_name: AlgorithmName,
    args: list,
    difficulty: Difficulty,
) -> Lesson:
    """Orchestrates the full pipeline for one submission: sandboxed execution -> AST analysis
    -> (cache check) -> LLM lesson generation -> persistence. Raises on any failure; callers
    (the API route) are responsible for translating exceptions into HTTP errors and marking
    the submission failed."""
    cache_key = lesson_cache_key(source_code, entrypoint, args, difficulty, model_tag)
    cached = await get_cached_lesson(cache_key)
    if cached is not None:
        return cached.model_copy(update={"submission_id": submission_id})

    trace = run_in_sandbox(
        submission_id,
        source_code,
        entrypoint,
        args,
        timeout_seconds=settings.sandbox_timeout_seconds,
        memory_mb=settings.sandbox_memory_mb,
        max_steps=settings.sandbox_max_trace_steps,
    )
    await save_execution_trace(session, submission_id, trace)

    ast_info = analyze(source_code, entrypoint)

    lesson = planner.generate_lesson(
        ast_info,
        trace,
        LessonGenerationOptions(difficulty=difficulty),
        algorithm_name,
        source_code,
    )

    await save_lesson(session, lesson, model_tag)
    await set_cached_lesson(cache_key, lesson)
    return lesson
