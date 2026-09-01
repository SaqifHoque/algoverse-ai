from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from algoverse_backend.api.deps import get_db_session
from algoverse_backend.api.schemas import (
    BadgeResponse,
    LessonCompletionRequest,
    LessonProgressResponse,
    ProgressSummaryResponse,
)
from algoverse_backend.db.repositories import complete_lesson, list_user_progress
from algoverse_backend.gamification import completion_xp, earned_badges, level_for_xp

router = APIRouter()


async def _summary(user_id: UUID, session: AsyncSession) -> ProgressSummaryResponse:
    rows = await list_user_progress(session, user_id)
    lessons = [
        LessonProgressResponse(
            lesson_id=progress.lesson_id,
            completed_at=progress.completed_at,
            score=progress.score or 0,
            xp=completion_xp(progress.score or 0, lesson.difficulty),
        )
        for progress, lesson in rows
        if progress.completed_at is not None
    ]
    total_xp = sum(lesson.xp for lesson in lessons)
    badges = earned_badges(scores=[lesson.score for lesson in lessons], total_xp=total_xp)
    return ProgressSummaryResponse(
        user_id=user_id,
        total_xp=total_xp,
        level=level_for_xp(total_xp),
        completed_lessons=len(lessons),
        badges=[BadgeResponse(id=badge.id, name=badge.name, description=badge.description) for badge in badges],
        lessons=lessons,
    )


@router.post("/progress/lessons/{lesson_id}/complete", response_model=ProgressSummaryResponse)
async def complete_lesson_route(
    lesson_id: UUID,
    payload: LessonCompletionRequest,
    session: AsyncSession = Depends(get_db_session),
) -> ProgressSummaryResponse:
    completed = await complete_lesson(
        session,
        user_id=payload.user_id,
        lesson_id=lesson_id,
        score=payload.score,
    )
    if completed is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return await _summary(payload.user_id, session)


@router.get("/progress/{user_id}", response_model=ProgressSummaryResponse)
async def get_progress_route(
    user_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> ProgressSummaryResponse:
    return await _summary(user_id, session)
