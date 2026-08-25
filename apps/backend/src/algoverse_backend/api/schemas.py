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
