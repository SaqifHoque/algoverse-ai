from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from algoverse_backend.api.deps import get_db_session
from algoverse_backend.db.repositories import get_lesson
from algoverse_backend.lesson.schema import Lesson

router = APIRouter()


@router.get("/lessons/{lesson_id}", response_model=Lesson)
async def get_lesson_route(lesson_id: UUID, session: AsyncSession = Depends(get_db_session)) -> Lesson:
    lesson = await get_lesson(session, lesson_id)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson
