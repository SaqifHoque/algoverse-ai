import asyncio
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from algoverse_backend.analysis.ast_analyzer import analyze
from algoverse_backend.cache.redis_client import get_cached_lesson, lesson_cache_key, set_cached_lesson
from algoverse_backend.config import settings
from algoverse_backend.db.repositories import save_execution_trace, save_lesson
from algoverse_backend.execution.sandbox import run_in_sandbox
from algoverse_backend.lesson.schema import AlgorithmName, Difficulty, Lesson
from algoverse_backend.llm.autofix import try_autofix_syntax
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
    # Cache key is based on the ORIGINAL submitted source -- identical broken submissions hit
    # cache too, without re-invoking the autofix LLM call every time. The cached Lesson's own
    # source_code field reflects whatever was actually executed (fixed, if autofix ran).
    cache_key = lesson_cache_key(source_code, entrypoint, args, difficulty, model_tag)
    cached = await get_cached_lesson(cache_key)
    if cached is not None:
        return cached.model_copy(update={"submission_id": submission_id})

    # Everything below this point is blocking I/O (subprocess.run, synchronous httpx calls to
    # Ollama) that can take anywhere from milliseconds to 100+ seconds. Running it directly
    # inside this `async def` would block Uvicorn's single-threaded event loop for that whole
    # duration -- freezing EVERY other request the server is handling, including cheap ones
    # like /health, not just other submissions. asyncio.to_thread offloads each blocking call
    # to a worker thread so the event loop stays free to serve concurrent requests.
    source_code, _was_autofixed = await asyncio.to_thread(
        try_autofix_syntax, source_code, settings.ollama_base_url, model_tag
    )

    trace = await asyncio.to_thread(
        run_in_sandbox,
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

    lesson = await asyncio.to_thread(
        planner.generate_lesson,
        ast_info,
        trace,
        LessonGenerationOptions(difficulty=difficulty),
        algorithm_name,
        source_code,
    )

    await save_lesson(session, lesson, model_tag)
    await set_cached_lesson(cache_key, lesson)
    return lesson
