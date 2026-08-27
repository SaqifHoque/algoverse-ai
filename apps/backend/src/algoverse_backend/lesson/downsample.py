from algoverse_backend.execution.models import TraceStep


def downsample_steps(steps: list[TraceStep], max_steps: int) -> list[TraceStep]:
    """Build a bounded visualization trace while preserving recursive call structure.

    Earlier even-only sampling routinely dropped sibling ``call`` events, making a recursion
    tree appear as one incomplete branch. All call events are now retained up to a generous
    structural cap, then ordinary line events fill the remaining narration-sized budget.
    """
    if len(steps) <= max_steps or max_steps <= 0:
        return steps
    if max_steps == 1:
        return [steps[0]]

    last = len(steps) - 1
    call_indices = [index for index, step in enumerate(steps) if step.event == "call"]
    structural_cap = 120
    if len(call_indices) > structural_cap:
        call_last = len(call_indices) - 1
        call_indices = [call_indices[round(i * call_last / (structural_cap - 1))] for i in range(structural_cap)]

    indices = {0, last, *call_indices}
    # Keep roughly twice the narration budget for smooth state animation. The model still
    # narrates only ``max_steps`` representative frames in OllamaLessonPlanner.
    target = min(len(steps), max(max_steps * 2, len(indices)))
    if len(indices) < target:
        indices.update(round(i * last / (target - 1)) for i in range(target))
    indices = sorted(indices)
    return [steps[i] for i in indices]
