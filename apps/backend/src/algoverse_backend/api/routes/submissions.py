from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from algoverse_backend.analysis.ast_analyzer import UnsafeCodeError
from algoverse_backend.api.deps import get_db_session, get_model_tag, get_planner
from algoverse_backend.api.schemas import SubmissionCreateRequest, SubmissionCreateResponse, SubmissionStatusResponse
from algoverse_backend.cache.redis_client import check_rate_limit
from algoverse_backend.db.repositories import (
    create_submission,
    get_submission,
    mark_submission_completed,
    mark_submission_failed,
)
from algoverse_backend.execution.models import SandboxExecutionError, SandboxTimeoutError
from algoverse_backend.lesson.planner_service import generate_lesson_for_submission
from algoverse_backend.llm.base import LessonGenerationError
from algoverse_backend.llm.ollama_client import OllamaLessonPlanner

router = APIRouter()


@router.post("/submissions", response_model=SubmissionCreateResponse)
async def create_submission_route(
    payload: SubmissionCreateRequest,
    session: AsyncSession = Depends(get_db_session),
    planner: OllamaLessonPlanner = Depends(get_planner),
    model_tag: str = Depends(get_model_tag),
) -> SubmissionCreateResponse:
    if not await check_rate_limit("global"):
        raise HTTPException(status_code=429, detail="Too many submissions right now -- please wait a moment.")

    submission_id = uuid4()
    await create_submission(
        session,
        submission_id=submission_id,
        source_code=payload.source_code,
        entrypoint=payload.entrypoint,
        algorithm_name=payload.algorithm_name,
        args=payload.args,
        difficulty=payload.difficulty,
    )

    try:
        lesson = await generate_lesson_for_submission(
            session,
            planner,
            model_tag,
            submission_id=submission_id,
            source_code=payload.source_code,
            entrypoint=payload.entrypoint,
            algorithm_name=payload.algorithm_name,
            args=payload.args,
            difficulty=payload.difficulty,
        )
    except UnsafeCodeError as exc:
        await mark_submission_failed(session, submission_id, str(exc))
        raise HTTPException(status_code=400, detail=f"Submitted code is not allowed: {exc}") from exc
    except (SandboxTimeoutError, SandboxExecutionError) as exc:
        await mark_submission_failed(session, submission_id, str(exc))
        raise HTTPException(status_code=422, detail=f"Execution failed: {exc}") from exc
    except LessonGenerationError as exc:
        await mark_submission_failed(session, submission_id, str(exc))
        raise HTTPException(status_code=502, detail=f"Local model failed to generate a lesson: {exc}") from exc

    await mark_submission_completed(session, submission_id)
    return SubmissionCreateResponse(submission_id=submission_id, status="completed", lesson_id=lesson.lesson_id)


@router.get("/submissions/{submission_id}", response_model=SubmissionStatusResponse)
async def get_submission_status(
    submission_id: str,
    session: AsyncSession = Depends(get_db_session),
) -> SubmissionStatusResponse:
    submission = await get_submission(session, UUID(submission_id))
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    return SubmissionStatusResponse(submission_id=submission.id, status=submission.status, error=submission.error)
