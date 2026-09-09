from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field

from algoverse_backend.lesson.schema import AlgorithmName, Difficulty

SubmissionStatus = Literal["pending", "running", "completed", "failed"]


class SubmissionCreateRequest(BaseModel):
    source_code: str = Field(..., max_length=20_000)
    entrypoint: str
    algorithm_name: AlgorithmName
    args: list[Any] = Field(default_factory=list)
    language: Literal["python"] = "python"
    difficulty: Difficulty = "beginner"


class SubmissionCreateResponse(BaseModel):
    submission_id: UUID
    status: SubmissionStatus
    lesson_id: UUID | None = None
    error: str | None = None


class SubmissionStatusResponse(BaseModel):
    submission_id: UUID
    status: SubmissionStatus
    error: str | None = None


class ModelStatusResponse(BaseModel):
    provider: Literal["ollama"] = "ollama"
    model_tag: str
    reachable: bool
    total_ram_gb: float
    selection_reason: str


class LessonCompletionRequest(BaseModel):
    user_id: UUID
    score: int = Field(..., ge=0, le=100)


class BadgeResponse(BaseModel):
    id: str
    name: str
    description: str


class LessonProgressResponse(BaseModel):
    lesson_id: UUID
    completed_at: datetime
    score: int
    xp: int


class ProgressSummaryResponse(BaseModel):
    user_id: UUID
    total_xp: int
    level: int
    completed_lessons: int
    badges: list[BadgeResponse]
    lessons: list[LessonProgressResponse]
