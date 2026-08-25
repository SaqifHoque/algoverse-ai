import sys
from types import FrameType
from typing import Any

from algoverse_backend.execution.models import TraceLimitExceeded, TraceStep

_SAFE_SCALAR_TYPES = (int, float, str, bool, type(None))
_MAX_COLLECTION_ITEMS = 50
_MAX_REPR_LEN = 200


def _truncated_repr(value: Any) -> str:
    try:
        text = repr(value)
    except Exception:
        return f"<unrepresentable {type(value).__name__}>"
    return text if len(text) <= _MAX_REPR_LEN else text[:_MAX_REPR_LEN] + "...<truncated>"


def safe_value(value: Any, _depth: int = 0) -> Any:
    """Only JSON-safe primitives/lists/dicts survive intact (bounded size); anything else
    (or anything nested too deep) degrades to a truncated repr() rather than blowing up
    the trace payload or failing to serialize."""
    if isinstance(value, _SAFE_SCALAR_TYPES):
        return value
    if _depth >= 2:
        return _truncated_repr(value)
    if isinstance(value, (list, tuple)):
        return [safe_value(v, _depth + 1) for v in list(value)[:_MAX_COLLECTION_ITEMS]]
    if isinstance(value, dict):
        return {
            str(k): safe_value(v, _depth + 1)
            for k, v in list(value.items())[:_MAX_COLLECTION_ITEMS]
        }
    return _truncated_repr(value)


class ExecutionTracer:
    """sys.settrace-based tracer. Only ever traces frames whose co_filename matches
    target_filename -- this is what keeps the tracer from descending into stdlib/framework
    code, which would otherwise blow up both step count and locals noise."""

    def __init__(self, target_filename: str, max_steps: int = 2000):
        self.target_filename = target_filename
        self.max_steps = max_steps
        self.steps: list[TraceStep] = []
        self.truncated = False
        self._call_stack: list[str] = []

    def start(self) -> None:
        sys.settrace(self._trace_dispatch)

    def stop(self) -> None:
        sys.settrace(None)

    def _trace_dispatch(self, frame: FrameType, event: str, arg: Any):
        if frame.f_code.co_filename != self.target_filename:
            return None

        if event == "call":
            self._call_stack.append(frame.f_code.co_name)

        if len(self.steps) >= self.max_steps:
            self.truncated = True
            self.stop()
            raise TraceLimitExceeded()

        self.steps.append(
            TraceStep(
                step_index=len(self.steps),
                event=event,  # type: ignore[arg-type]
                line_no=frame.f_lineno,
                function_name=frame.f_code.co_name,
                locals=safe_value(dict(frame.f_locals)),
                call_stack=list(self._call_stack),
                return_value=safe_value(arg) if event == "return" else None,
                exception=_truncated_repr(arg[1]) if event == "exception" else None,
            )
        )

        if event == "return" and self._call_stack:
            self._call_stack.pop()

        return self._trace_dispatch
