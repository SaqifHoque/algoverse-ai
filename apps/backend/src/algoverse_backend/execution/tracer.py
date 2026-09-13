import math
import sys
from collections import deque
from itertools import islice
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


def safe_value(
    value: Any,
    _depth: int = 0,
    _seen: set[int] | None = None,
    *,
    warnings: set[str] | None = None,
    _budget: list[int] | None = None,
) -> Any:
    """Bounded snapshots retain familiar list/dict shapes and report information loss.

    Warning metadata lives outside values so a shortened array cannot acquire a fake
    element that visualizers mistake for user data. The node budget is shared recursively.
    """
    notices = warnings if warnings is not None else set()
    budget = _budget if _budget is not None else [1000]
    if budget[0] <= 0:
        notices.add("Some values are omitted because the snapshot size limit was reached.")
        return "<snapshot limit>"
    budget[0] -= 1
    if isinstance(value, str):
        if len(value) > _MAX_REPR_LEN:
            notices.add("Text values are limited to 200 characters.")
            return value[:_MAX_REPR_LEN] + "...<truncated>"
        return value
    if isinstance(value, float) and not math.isfinite(value):
        notices.add("Non-finite numbers are shown as text.")
        return str(value)
    if isinstance(value, _SAFE_SCALAR_TYPES):
        return value
    if _depth >= 5:
        notices.add("Nested values beyond the snapshot depth limit are omitted.")
        return "<depth limit>"
    seen = _seen if _seen is not None else set()
    identity = id(value)
    if identity in seen:
        notices.add("Circular references are abbreviated.")
        return f"<cycle:{type(value).__name__}>"
    next_seen = seen | {identity}

    def snapshot(item: Any) -> Any:
        return safe_value(item, _depth + 1, next_seen, warnings=notices, _budget=budget)

    def bounded(items, size: int):
        if size > _MAX_COLLECTION_ITEMS:
            notices.add("Collections show at most 50 items; additional items are omitted.")
        for item in islice(items, _MAX_COLLECTION_ITEMS):
            if budget[0] <= 0:
                notices.add("Some values are omitted because the snapshot size limit was reached.")
                break
            yield item

    if isinstance(value, (list, tuple)):
        return [snapshot(item) for item in bounded(value, len(value))]
    if isinstance(value, (set, frozenset, deque)):
        return {
            "__type__": type(value).__name__,
            "items": [snapshot(item) for item in bounded(value, len(value))],
        }
    if isinstance(value, dict):
        result = {}
        for key, item in bounded(value.items(), len(value)):
            text_key = key if isinstance(key, str) else _truncated_repr(key)
            if not isinstance(key, str):
                notices.add("Non-string dictionary keys are shown as text.")
            if len(text_key) > _MAX_REPR_LEN:
                notices.add("Text values are limited to 200 characters.")
                text_key = text_key[:_MAX_REPR_LEN] + "...<truncated>"
            if text_key in result:
                notices.add("Some dictionary entries are omitted because their displayed keys collide.")
                continue
            result[text_key] = snapshot(item)
        return result
    try:
        attributes = vars(value)
    except TypeError:
        attributes = None
    if isinstance(attributes, dict):
        result = {"__type__": type(value).__name__}
        for key, item in bounded(attributes.items(), len(attributes)):
            if not str(key).startswith("__"):
                result[str(key)] = snapshot(item)
        return result
    notices.add("Some unsupported values are shown as text instead of structured data.")
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
        self.snapshot_warnings: set[str] = set()
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

        warnings: set[str] = set()
        locals_snapshot = safe_value(dict(frame.f_locals), warnings=warnings)
        return_snapshot = safe_value(arg, warnings=warnings) if event == "return" else None
        self.snapshot_warnings.update(warnings)
        self.steps.append(
            TraceStep(
                step_index=len(self.steps),
                event=event,  # type: ignore[arg-type]
                line_no=frame.f_lineno,
                function_name=frame.f_code.co_name,
                locals=locals_snapshot,
                call_stack=list(self._call_stack),
                return_value=return_snapshot,
                snapshot_warnings=sorted(warnings),
                exception=_truncated_repr(arg[1]) if event == "exception" else None,
            )
        )

        if event == "return" and self._call_stack:
            self._call_stack.pop()

        return self._trace_dispatch
