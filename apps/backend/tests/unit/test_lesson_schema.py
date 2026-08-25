from datetime import UTC, datetime
from uuid import uuid4

import pytest
from pydantic import ValidationError

from algoverse_backend.lesson.schema import Lesson, LessonStep, MemoryView


def _valid_step(**overrides) -> dict:
    base = dict(
        step_index=0,
        current_line=1,
        highlighted_lines=[1],
        memory_view=MemoryView(variables=[], call_stack=["bubble_sort"]),
        narration="Narration text.",
        why_this_happens="Because reasons.",
        animation_hints=[],
        complexity_note=None,
    )
    base.update(overrides)
    return base


def _valid_lesson(**overrides) -> dict:
    base = dict(
        lesson_id=uuid4(),
        submission_id=uuid4(),
        title="Bubble Sort",
        algorithm_name="bubble_sort",
        source_code="def bubble_sort(items):\n    return items\n",
        difficulty="beginner",
        learning_objectives=["Understand bubble sort"],
        story="Objects on a shelf...",
        timeline=[LessonStep(**_valid_step())],
        quiz=[],
        hints=[],
        summary="Summary.",
        complexity_overall="O(n^2)",
        generated_by_model="qwen2.5-coder:7b",
        created_at=datetime.now(UTC),
    )
    base.update(overrides)
    return base


def test_valid_lesson_passes_validation():
    lesson = Lesson(**_valid_lesson())
    assert lesson.algorithm_name == "bubble_sort"


def test_missing_required_field_fails_validation():
    data = _valid_lesson()
    del data["title"]
    with pytest.raises(ValidationError):
        Lesson(**data)


def test_algorithm_name_rejects_arbitrary_strings():
    with pytest.raises(ValidationError):
        Lesson(**_valid_lesson(algorithm_name="quick_sort"))


def test_animation_hint_kind_rejects_unknown_values():
    with pytest.raises(ValidationError):
        LessonStep(**_valid_step(animation_hints=[{"kind": "explode", "description": "?"}]))


def test_animation_hint_kind_accepts_known_values():
    step = LessonStep(**_valid_step(animation_hints=[{"kind": "swap", "description": "swap"}]))
    assert step.animation_hints[0].kind == "swap"
