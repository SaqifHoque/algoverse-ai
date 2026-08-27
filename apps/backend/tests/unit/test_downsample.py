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
