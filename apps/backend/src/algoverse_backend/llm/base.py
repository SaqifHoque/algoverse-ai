from abc import ABC, abstractmethod
from typing import Literal

from pydantic import BaseModel

from algoverse_backend.analysis.models import AstInfo
from algoverse_backend.execution.models import ExecutionTrace
from algoverse_backend.lesson.schema import AlgorithmName, Lesson


class LessonGenerationOptions(BaseModel):
    difficulty: Literal["beginner", "intermediate", "advanced"] = "beginner"
    max_steps: int = 12
    include_quiz: bool = True


class ModelHealth(BaseModel):
    reachable: bool
    model_tag: str
    detail: str | None = None


class LessonGenerationError(Exception):
    """Raised when the local model fails to produce schema-valid output after all retries."""


class LessonPlannerClient(ABC):
    """Abstraction over the local LLM. Ollama is the only implementation today, but callers
    depend only on this interface -- swapping providers later means writing one new class."""

    @abstractmethod
    def generate_lesson(
        self,
        ast_info: AstInfo,
        trace: ExecutionTrace,
        options: LessonGenerationOptions,
        algorithm_name: AlgorithmName,
        source_code: str,
    ) -> Lesson: ...

    @abstractmethod
    def health_check(self) -> ModelHealth: ...
