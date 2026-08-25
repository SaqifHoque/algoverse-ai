"""Parent-side sandbox driver. Scoped explicitly as dev/portfolio-grade sandboxing for
user-authored, presumed non-malicious code -- not hardened for hostile multi-tenant use.
Two layers of defense: (1) a static AST allowlist check rejecting filesystem/network/process
imports and eval/exec/open, run before anything executes; (2) a resource-limited subprocess
(RLIMIT_AS/CPU/NOFILE/NPROC + a wall-clock timeout backstop) for the execution itself.

RLIMIT_AS is not reliably enforced by macOS/Darwin the way it is on Linux, so when running
tests directly on a macOS host (rather than via `docker compose run backend pytest`), memory
limits are not authoritative -- the backend container's own `mem_limit` is the real backstop
in every deployed environment.
"""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from uuid import UUID

from algoverse_backend.analysis.ast_analyzer import static_safety_check
from algoverse_backend.execution.limits import apply_rlimits
from algoverse_backend.execution.models import ExecutionTrace, SandboxExecutionError, SandboxTimeoutError

_RUNNER_SCRIPT = Path(__file__).with_name("sandbox_runner.py")


def run_in_sandbox(
    submission_id: UUID,
    source_code: str,
    entrypoint: str,
    args: list,
    timeout_seconds: float = 5.0,
    memory_mb: int = 256,
    max_steps: int = 2000,
) -> ExecutionTrace:
    static_safety_check(source_code)

    with tempfile.TemporaryDirectory() as tmp:
        payload_path = Path(tmp) / "payload.json"
        payload_path.write_text(
            json.dumps(
                {
                    "submission_id": str(submission_id),
                    "source_code": source_code,
                    "entrypoint": entrypoint,
                    "args": args,
                    "max_steps": max_steps,
                }
            )
        )
        try:
            result = subprocess.run(
                [sys.executable, "-I", str(_RUNNER_SCRIPT), str(payload_path)],
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
                cwd=tmp,
                env=_minimal_env(),
                preexec_fn=lambda: apply_rlimits(memory_mb, int(timeout_seconds) + 1),
            )
        except subprocess.TimeoutExpired as exc:
            raise SandboxTimeoutError(f"execution exceeded {timeout_seconds}s") from exc

    if result.returncode != 0:
        raise SandboxExecutionError(result.stderr[-4000:] or "sandboxed process exited non-zero with no stderr")

    try:
        return ExecutionTrace.model_validate_json(result.stdout)
    except Exception as exc:  # noqa: BLE001 - want the raw stdout in the error either way
        raise SandboxExecutionError(
            f"could not parse sandbox output: {exc}\nstdout={result.stdout[-2000:]}"
        ) from exc


def _minimal_env() -> dict[str, str]:
    return {"PATH": os.environ.get("PATH", "/usr/bin:/bin"), "PYTHONDONTWRITEBYTECODE": "1"}
