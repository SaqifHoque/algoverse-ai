from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel


class TraceStep(BaseModel):
    step_index: int
    event: Literal["call", "line", "return", "exception"]
    line_no: int
    function_name: str
    locals: dict[str, Any]
    call_stack: list[str]
    return_value: Any | None = None
    exception: str | None = None


class ExecutionTrace(BaseModel):
    submission_id: UUID
    entrypoint: str
    steps: list[TraceStep]
    final_result: Any | None = None
    stdout: str = ""
    truncated: bool = False
    error: str | None = None


class SandboxExecutionError(Exception):
    """Raised when the sandboxed subprocess exits non-zero or produces unparseable output."""


class SandboxTimeoutError(SandboxExecutionError):
    """Raised when the sandboxed subprocess exceeds its wall-clock timeout."""


class TraceLimitExceeded(Exception):
    """Raised by the tracer when a submission produces more steps than the configured cap."""
