from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel

AlgorithmName = Literal["bubble_sort", "binary_search", "fibonacci_recursive"]
Difficulty = Literal["beginner", "intermediate", "advanced"]
AnimationKind = Literal[
    "highlight", "swap", "compare", "pointer_move", "push", "pop", "recurse_in", "recurse_out"
]


class MemoryVariable(BaseModel):
    name: str
    value: Any
    changed: bool = False


class MemoryView(BaseModel):
    variables: list[MemoryVariable]
    call_stack: list[str]


class AnimationHint(BaseModel):
    kind: AnimationKind
    target_indices: list[int] = []
    target_vars: list[str] = []
    description: str


class LessonStep(BaseModel):
    step_index: int
    current_line: int
    highlighted_lines: list[int]
    memory_view: MemoryView
    narration: str
    why_this_happens: str
    animation_hints: list[AnimationHint] = []
    complexity_note: str | None = None


class QuizQuestion(BaseModel):
    question: str
    choices: list[str]
    correct_index: int
    explanation: str


class Hint(BaseModel):
    trigger: Literal["on_request", "on_wrong_answer", "proactive"]
    text: str
    related_step_index: int | None = None


class Lesson(BaseModel):
    lesson_id: UUID
    submission_id: UUID
    title: str
    algorithm_name: AlgorithmName
    source_code: str
    difficulty: Difficulty
    learning_objectives: list[str]
    story: str
    timeline: list[LessonStep]
    quiz: list[QuizQuestion] = []
    hints: list[Hint] = []
    summary: str
    complexity_overall: str
    generated_by_model: str
    created_at: datetime
