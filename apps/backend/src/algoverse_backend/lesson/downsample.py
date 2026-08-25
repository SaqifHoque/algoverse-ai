from algoverse_backend.execution.models import TraceStep


def downsample_steps(steps: list[TraceStep], max_steps: int) -> list[TraceStep]:
    """Reduces a potentially large trace to at most max_steps, evenly spaced across the full
    run (always including the first and last step). This keeps the LLM's per-step narration
    prompt within a small local model's context window regardless of how many steps the raw
    execution produced."""
    if len(steps) <= max_steps or max_steps <= 0:
        return steps
    if max_steps == 1:
        return [steps[0]]

    last = len(steps) - 1
    indices = sorted({round(i * last / (max_steps - 1)) for i in range(max_steps)})
    return [steps[i] for i in indices]
