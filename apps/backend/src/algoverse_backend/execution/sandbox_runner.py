"""Child-process entrypoint. Never imported by the parent process directly -- invoked as
`python sandbox_runner.py <payload.json>` inside a resource-limited subprocess (see sandbox.py).
Writes exactly one line of ExecutionTrace JSON to stdout and nothing else, so the parent can
parse stdout directly regardless of what the user's code printed (which is captured separately)."""

import contextlib
import io
import json
import sys
import traceback
from pathlib import Path
from uuid import UUID

from algoverse_backend.execution.models import ExecutionTrace, TraceLimitExceeded
from algoverse_backend.execution.tracer import ExecutionTracer, safe_value


def main() -> None:
    payload_path = Path(sys.argv[1])
    payload = json.loads(payload_path.read_text())

    source_code: str = payload["source_code"]
    entrypoint: str = payload["entrypoint"]
    args: list = payload["args"]
    max_steps: int = payload.get("max_steps", 2000)

    user_file = payload_path.parent / "user_solution.py"
    user_file.write_text(source_code)

    tracer = ExecutionTracer(target_filename=str(user_file), max_steps=max_steps)
    namespace: dict = {"__name__": "__algoverse_user__"}
    stdout_buffer = io.StringIO()
    final_result = None
    error: str | None = None

    try:
        code_obj = compile(source_code, str(user_file), "exec")
        with contextlib.redirect_stdout(stdout_buffer):
            exec(code_obj, namespace)
            entry_fn = namespace.get(entrypoint)
            if not callable(entry_fn):
                raise NameError(f"entrypoint '{entrypoint}' not found or not callable")
            tracer.start()
            try:
                final_result = entry_fn(*args)
            except TraceLimitExceeded:
                pass
            finally:
                tracer.stop()
    except Exception as exc:  # noqa: BLE001 - this boundary must always produce a trace, never crash silently
        error = "".join(traceback.format_exception_only(type(exc), exc)).strip()

    trace = ExecutionTrace(
        submission_id=UUID(payload["submission_id"]),
        entrypoint=entrypoint,
        steps=tracer.steps,
        final_result=safe_value(final_result) if error is None else None,
        stdout=stdout_buffer.getvalue(),
        truncated=tracer.truncated,
        error=error,
    )
    sys.stdout.write(trace.model_dump_json())


if __name__ == "__main__":
    main()
