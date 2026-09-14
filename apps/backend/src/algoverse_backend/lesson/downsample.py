from algoverse_backend.execution.models import TraceStep


def downsample_steps(steps: list[TraceStep], max_steps: int) -> list[TraceStep]:
    """Reduce unchanged line frames without dropping execution facts.

    The sandbox's event cap bounds input size. The narration budget must not truncate
    call structure, exceptions, or observed mutations; the planner samples prose separately.
    """
    if len(steps) <= max_steps or max_steps <= 0:
        return steps
    if not steps:
        return []

    indices = {0, len(steps) - 1}
    for index, step in enumerate(steps):
        if step.event != "line":
            indices.add(index)
        elif index:
            previous = steps[index - 1]
            if (
                step.locals != previous.locals
                or step.call_stack != previous.call_stack
                or step.call_id != previous.call_id
                or step.snapshot_warnings != previous.snapshot_warnings
            ):
                indices.add(index)

    # Keep a small representative sample of otherwise unchanged line frames as context.
    target = min(len(steps), max(2, max_steps * 2))
    indices.update(round(i * (len(steps) - 1) / (target - 1)) for i in range(target))
    return [steps[index] for index in sorted(indices)]
