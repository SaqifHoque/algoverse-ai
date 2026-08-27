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


def safe_value(value: Any, _depth: int = 0, _seen: set[int] | None = None) -> Any:
    """Convert runtime values into a bounded, JSON-safe structural snapshot.

    Simple user-defined nodes are expanded through ``__dict__`` so tree/linked-list objects
    can be rendered as real structures in the frontend. Depth, item, cycle, and repr limits
    keep this diagnostic serialization bounded and safe.
    """
    if isinstance(value, _SAFE_SCALAR_TYPES):
        return value
    if _depth >= 5:
        return _truncated_repr(value)
    seen = _seen or set()
    identity = id(value)
    if identity in seen:
        return f"<cycle:{type(value).__name__}>"
    next_seen = seen | {identity}
    if isinstance(value, (list, tuple)):
        return [safe_value(v, _depth + 1, next_seen) for v in list(value)[:_MAX_COLLECTION_ITEMS]]
    if isinstance(value, dict):
        return {
            str(k): safe_value(v, _depth + 1, next_seen)
            for k, v in list(value.items())[:_MAX_COLLECTION_ITEMS]
        }
    try:
        attributes = vars(value)
    except TypeError:
        attributes = None
    if isinstance(attributes, dict):
        result: dict[str, Any] = {"__type__": type(value).__name__}
        for key, item in list(attributes.items())[:_MAX_COLLECTION_ITEMS]:
            if not str(key).startswith("__"):
                result[str(key)] = safe_value(item, _depth + 1, next_seen)
        return result
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
