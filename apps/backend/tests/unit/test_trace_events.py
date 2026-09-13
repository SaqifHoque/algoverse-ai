import json
from unittest.mock import Mock
from uuid import uuid4

from algoverse_backend.analysis.ast_analyzer import analyze
from algoverse_backend.execution.sandbox import run_in_sandbox
from algoverse_backend.lesson.downsample import downsample_steps
from algoverse_backend.llm.base import LessonGenerationOptions
from algoverse_backend.llm.ollama_client import MetadataBlock, OllamaLessonPlanner, StepNarrationBatch
from algoverse_backend.llm.prompt_builder import build_step_narration_prompt


def test_call_ids_disambiguate_siblings_and_match_every_exit():
    source = 'def child(x):\n    return x+1\ndef f(n):\n    for i in range(n):\n        child(i)\n    return n\n'
    trace = run_in_sandbox(uuid4(), source, 'f', [150])
    assert not trace.truncated and trace.error is None
    steps = downsample_steps(trace.steps, 2)
    calls = {s.call_id: s for s in steps if s.event == 'call'}
    returns = {s.call_id: s for s in steps if s.event == 'return'}
    assert len(calls) == 151 and calls.keys() == returns.keys()
    root = steps[0].call_id
    assert calls[root].parent_call_id is None
    for call_id, call in calls.items():
        assert returns[call_id].step_index > call.step_index
        if call_id != root:
            assert call.parent_call_id == root
    assert len(steps) <= len(trace.steps) <= 2000


def test_recursive_parent_ids_and_exception_unwinding_remain_balanced():
    source = 'def recur(n):\n    if n == 0:\n        raise ValueError("stop")\n    return recur(n-1)\ndef f():\n    try:\n        recur(4)\n    except ValueError:\n        return 42\n'
    trace = run_in_sandbox(uuid4(), source, 'f', [])
    assert trace.error is None and trace.final_result == 42
    active = []
    for step in downsample_steps(trace.steps, 1):
        if step.event == 'call':
            assert step.parent_call_id == (active[-1] if active else None)
            active.append(step.call_id)
        elif step.event == 'return':
            assert active.pop() == step.call_id
    assert not active


def test_lesson_preserves_event_metadata_and_pre_line_state_with_bounded_narration():
    source = 'def f():\n    x = 1\n    x = 2\n    return x\n'
    trace = run_in_sandbox(uuid4(), source, 'f', [])
    info = analyze(source, 'f')
    planner = OllamaLessonPlanner('http://unused', 'test')
    planner._call_with_retry = Mock(side_effect=[
        MetadataBlock(title='Test', story='Test', learning_objectives=[], summary='Test'),
        StepNarrationBatch(steps=[]),
    ])
    try:
        lesson = planner.generate_lesson(info, trace, LessonGenerationOptions(max_steps=1), 'custom', source)
    finally:
        planner.http_client.close()
    assert lesson.timeline[-1].execution_event == 'return'
    assert lesson.timeline[-1].return_value == 2
    before_assignment = next(s for s in lesson.timeline if s.current_line == 3 and s.execution_event == 'line')
    assert next(v.value for v in before_assignment.memory_view.variables if v.name == 'x') == 1
    assert 'before this line runs' in before_assignment.narration
    assert {s.call_id for s in lesson.timeline} == {0}
    narration_prompt = planner._call_with_retry.call_args_list[1].args[0]
    narrated_steps, _ = json.JSONDecoder().raw_decode(narration_prompt[narration_prompt.index('[{'):])
    assert len(narrated_steps) == 1
    assert 'state BEFORE' in narration_prompt
    prompt = build_step_narration_prompt(info, trace.steps, LessonGenerationOptions(), source, {})
    assert '"return_value": 2' in prompt
