from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from algoverse_backend.db.models import ExecutionTraceRecord, LessonRecord, Submission, User, UserProgress
from algoverse_backend.execution.models import ExecutionTrace
from algoverse_backend.lesson.schema import Lesson


async def create_submission(
    session: AsyncSession,
    *,
    submission_id: UUID,
    source_code: str,
    entrypoint: str,
    algorithm_name: str,
    args: list,
    difficulty: str,
) -> Submission:
    submission = Submission(
        id=submission_id,
        source_code=source_code,
        entrypoint=entrypoint,
        algorithm_name=algorithm_name,
        args_json=args,
        difficulty=difficulty,
        status="running",
        created_at=datetime.now(UTC),
    )
    session.add(submission)
    await session.commit()
    return submission


async def mark_submission_completed(session: AsyncSession, submission_id: UUID) -> None:
    submission = await session.get(Submission, submission_id)
    if submission is not None:
        submission.status = "completed"
        await session.commit()


async def mark_submission_failed(session: AsyncSession, submission_id: UUID, error: str) -> None:
    submission = await session.get(Submission, submission_id)
    if submission is not None:
        submission.status = "failed"
        submission.error = error[:4000]
        await session.commit()


async def get_submission(session: AsyncSession, submission_id: UUID) -> Submission | None:
    return await session.get(Submission, submission_id)


async def save_execution_trace(session: AsyncSession, submission_id: UUID, trace: ExecutionTrace) -> None:
    record = ExecutionTraceRecord(
        submission_id=submission_id,
        trace_json=trace.model_dump(mode="json"),
        created_at=datetime.now(UTC),
    )
    session.add(record)
    await session.commit()


async def get_execution_trace(session: AsyncSession, submission_id: UUID) -> ExecutionTrace | None:
    stmt = select(ExecutionTraceRecord).where(ExecutionTraceRecord.submission_id == submission_id)
    result = await session.execute(stmt)
    record = result.scalar_one_or_none()
    if record is None:
        return None
    return ExecutionTrace.model_validate(record.trace_json)


async def save_lesson(session: AsyncSession, lesson: Lesson, model_tag: str) -> None:
    record = LessonRecord(
        id=lesson.lesson_id,
        submission_id=lesson.submission_id,
        lesson_json=lesson.model_dump(mode="json"),
        model_tag=model_tag,
        difficulty=lesson.difficulty,
        created_at=datetime.now(UTC),
    )
    session.add(record)
    await session.commit()


async def get_lesson(session: AsyncSession, lesson_id: UUID) -> Lesson | None:
    record = await session.get(LessonRecord, lesson_id)
    if record is None:
        return None
    return Lesson.model_validate(record.lesson_json)


async def complete_lesson(
    session: AsyncSession,
    *,
    user_id: UUID,
    lesson_id: UUID,
    score: int,
) -> tuple[UserProgress, LessonRecord] | None:
    lesson = await session.get(LessonRecord, lesson_id)
    if lesson is None:
        return None

    user = await session.get(User, user_id)
    if user is None:
        session.add(User(id=user_id, email=None, created_at=datetime.now(UTC)))

    progress = await session.get(UserProgress, (user_id, lesson_id))
    if progress is None:
        progress = UserProgress(user_id=user_id, lesson_id=lesson_id)
        session.add(progress)

    progress.completed_at = progress.completed_at or datetime.now(UTC)
    progress.score = max(progress.score or 0, score)
    await session.commit()
    return progress, lesson


async def list_user_progress(
    session: AsyncSession,
    user_id: UUID,
) -> list[tuple[UserProgress, LessonRecord]]:
    stmt = (
        select(UserProgress, LessonRecord)
        .join(LessonRecord, LessonRecord.id == UserProgress.lesson_id)
        .where(UserProgress.user_id == user_id, UserProgress.completed_at.is_not(None))
        .order_by(UserProgress.completed_at.desc())
    )
    result = await session.execute(stmt)
    return list(result.tuples())
