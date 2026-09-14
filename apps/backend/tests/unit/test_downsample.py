from algoverse_backend.execution.models import TraceStep
from algoverse_backend.lesson.downsample import downsample_steps


def _step(index: int, event: str) -> TraceStep:
    return TraceStep(
        step_index=index,
        event=event,
        line_no=index + 1,
        function_name="walk",
        locals={},
        call_stack=["walk"],
    )


def test_downsample_preserves_recursive_call_events_beyond_narration_budget():
    events = ["line", "call", "line", "call", "return", "call", "line", "return", "return", "line"]
    steps = [_step(index, event) for index, event in enumerate(events)]

    sampled = downsample_steps(steps, max_steps=4)

    sampled_call_indexes = {step.step_index for step in sampled if step.event == "call"}
    assert sampled_call_indexes == {1, 3, 5}
    assert sampled[0].step_index == 0
    assert sampled[-1].step_index == 9


def test_every_call_and_return_is_retained_beyond_the_old_120_call_cap():
    events = ['call'] + ['call', 'line', 'return'] * 150 + ['return']
    steps = [_step(index, event) for index, event in enumerate(events)]
    sampled = downsample_steps(steps, max_steps=4)
    assert [s.step_index for s in sampled if s.event != 'line'] == [
        s.step_index for s in steps if s.event != 'line'
    ]
    assert len(sampled) <= len(steps)


def test_one_narrated_step_still_keeps_calls_returns_and_exceptions():
    steps = [_step(i, event) for i, event in enumerate(['call', 'line', 'exception', 'line', 'return'])]
    sampled = downsample_steps(steps, max_steps=1)
    assert {s.step_index for s in sampled} >= {0, 2, 4}


def test_observed_mutations_and_warning_changes_are_never_sampled_away():
    steps = [_step(i, 'line') for i in range(40)]
    for i, step in enumerate(steps):
        step.locals = {'values': [0 if i < 13 else 1 if i < 15 else 0]}
    steps[17].snapshot_warnings = ['abbreviated']
    sampled = downsample_steps(steps, max_steps=2)
    assert {13, 15, 17, 18} <= {s.step_index for s in sampled}
    assert len(sampled) < len(steps)


def test_empty_and_unlimited_sampling():
    assert downsample_steps([], 1) == []
    steps = [_step(i, 'line') for i in range(10)]
    assert downsample_steps(steps, 0) == steps
