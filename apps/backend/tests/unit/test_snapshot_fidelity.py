import json
from collections import deque
from unittest.mock import Mock
from uuid import uuid4

import pytest

from algoverse_backend.analysis.ast_analyzer import analyze
from algoverse_backend.execution.models import ExecutionTrace, TraceStep
from algoverse_backend.execution.sandbox import run_in_sandbox
from algoverse_backend.execution.tracer import safe_value
from algoverse_backend.lesson.schema import Lesson
from algoverse_backend.llm.base import LessonGenerationOptions
from algoverse_backend.llm.ollama_client import MetadataBlock, OllamaLessonPlanner, StepNarrationBatch
from algoverse_backend.llm.prompt_builder import build_metadata_prompt, build_step_narration_prompt


@pytest.mark.parametrize('value', [list(range(60)), tuple(range(60)), {str(i): i for i in range(60)}])
def test_collection_limits_are_explicit_without_fake_data_entries(value):
    warnings = set()
    result = safe_value(value, warnings=warnings)
    assert len(result) == 50
    assert any('50 items' in warning for warning in warnings)
    assert len(value) == 60


@pytest.mark.parametrize('value', [set([3, 1, 2]), frozenset([3, 1, 2]), deque([3, 1, 2])])
def test_sets_and_deques_keep_their_type_and_members(value):
    warnings = set()
    result = safe_value(value, warnings=warnings)
    assert result['__type__'] == type(value).__name__
    assert sorted(result['items']) == [1, 2, 3]
    if isinstance(value, deque):
        assert result['items'] == [3, 1, 2]
    assert not warnings


def test_depth_and_cycle_limits_are_reported():
    value = []
    value.append(value)
    warnings = set()
    assert safe_value(value, warnings=warnings) == ['<cycle:list>']
    assert any('Circular' in warning for warning in warnings)
    warnings.clear()
    value = [[[[[[1]]]]]]
    result = safe_value(value, warnings=warnings)
    assert '<depth limit>' in json.dumps(result)
    assert any('depth limit' in warning for warning in warnings)


def test_broad_nested_values_stop_at_the_shared_budget():
    warnings = set()
    result = safe_value([[list(range(50)) for _ in range(50)] for _ in range(50)], warnings=warnings)
    assert any('size limit' in warning for warning in warnings)
    def count(value):
        return 1 + sum(count(item) for item in value) if isinstance(value, list) else 1
    assert count(result) <= 1000


def test_strings_nonfinite_numbers_and_colliding_keys_do_not_silently_lose_information():
    warnings = set()
    result = safe_value({'long': 'x' * 500, 'nan': float('nan'), 1: 'first', '1': 'second'}, warnings=warnings)
    assert len(result['long']) < 250
    assert result['nan'] == 'nan'
    assert result['1'] == 'first'
    assert any('collide' in warning for warning in warnings)
    assert any('200 characters' in warning for warning in warnings)
    assert any('Non-finite' in warning for warning in warnings)
    json.dumps(result, allow_nan=False)


def test_snapshot_warnings_survive_real_subprocess_serialization_and_do_not_fail_execution():
    trace = run_in_sandbox(uuid4(), 'def f(xs):\n    return xs\n', 'f', [list(range(60))])
    assert trace.error is None and not trace.truncated
    assert trace.final_result == list(range(50))
    assert trace.snapshot_warnings
    assert all(step.snapshot_warnings for step in trace.steps)
    assert ExecutionTrace.model_validate_json(trace.model_dump_json()) == trace


def test_final_result_limits_are_reported_even_without_local_collection():
    trace = run_in_sandbox(uuid4(), 'def f():\n    return list(range(60))\n', 'f', [])
    assert not trace.steps[0].snapshot_warnings
    assert trace.steps[-1].snapshot_warnings
    assert trace.snapshot_warnings
    assert not trace.truncated


def test_object_attributes_are_bounded():
    class Node:
        pass
    node = Node()
    for i in range(60):
        setattr(node, f'item{i}', i)
    warnings = set()
    result = safe_value(node, warnings=warnings)
    assert result['__type__'] == 'Node'
    assert len(result) == 51
    assert any('50 items' in warning for warning in warnings)


def test_warnings_reach_lessons_and_prompts_even_when_the_affected_frame_is_not_narrated():
    source = 'def f():\n    return list(range(60))\n'
    trace = run_in_sandbox(uuid4(), source, 'f', [])
    info = analyze(source, 'f')
    options = LessonGenerationOptions(max_steps=1)
    planner = OllamaLessonPlanner('http://unused', 'test')
    planner._call_with_retry = Mock(side_effect=[
        MetadataBlock(title='Test', story='Test', learning_objectives=[], summary='Test'),
        StepNarrationBatch(steps=[]),
    ])
    try:
        lesson = planner.generate_lesson(info, trace, options, 'custom', source)
    finally:
        planner.http_client.close()
    assert lesson.snapshot_warnings == trace.snapshot_warnings
    assert lesson.snapshot_warnings and not lesson.timeline[0].memory_view.snapshot_warnings
    assert lesson.timeline[0].memory_view.snapshot_warnings == trace.steps[0].snapshot_warnings
    assert '50 items' in build_metadata_prompt(info, trace, options, 'custom')
    assert '50 items' in build_step_narration_prompt(info, trace.steps, options, source, {})


def test_legacy_lessons_and_traces_default_to_no_snapshot_warnings():
    lesson = Lesson.model_validate({
        'lesson_id': str(uuid4()), 'submission_id': str(uuid4()), 'title': 'Legacy',
        'algorithm_name': 'custom', 'source_code': 'def f(): return 1', 'difficulty': 'beginner',
        'learning_objectives': [], 'story': 'Legacy lesson', 'summary': 'Done',
        'complexity_overall': 'Unknown', 'generated_by_model': 'test',
        'created_at': '2026-01-01T00:00:00Z',
        'timeline': [{'step_index': 0, 'current_line': 1, 'highlighted_lines': [1],
                      'memory_view': {'variables': [], 'call_stack': ['f']},
                      'narration': 'Return 1', 'why_this_happens': ''}],
    })
    assert lesson.snapshot_warnings == []
    assert all(step.memory_view.snapshot_warnings == [] for step in lesson.timeline)
    step = TraceStep(step_index=0, event='return', line_no=1, function_name='f', locals={}, call_stack=[])
    trace = ExecutionTrace(submission_id=uuid4(), entrypoint='f', steps=[step])
    assert trace.snapshot_warnings == [] and step.snapshot_warnings == []


def test_collection_sampling_does_not_materialize_the_entire_input():
    class GuardedList(list):
        def __iter__(self):
            for index, value in enumerate(super().__iter__()):
                if index >= 50:
                    raise AssertionError("serializer read beyond the visible prefix")
                yield value
    warnings = set()
    assert safe_value(GuardedList(range(10000)), warnings=warnings) == list(range(50))
    assert warnings
