import uuid

import pytest

from algoverse_backend.analysis.ast_analyzer import UnsafeCodeError
from algoverse_backend.execution.models import SandboxExecutionError, SandboxTimeoutError
from algoverse_backend.execution.sandbox import run_in_sandbox


def test_run_in_sandbox_executes_bubble_sort():
    source = (
        "def bubble_sort(items):\n"
        "    n = len(items)\n"
        "    for i in range(n):\n"
        "        for j in range(0, n - i - 1):\n"
        "            if items[j] > items[j + 1]:\n"
        "                items[j], items[j + 1] = items[j + 1], items[j]\n"
        "    return items\n"
    )
    trace = run_in_sandbox(uuid.uuid4(), source, "bubble_sort", [[5, 3, 1, 4, 2]])
    assert trace.error is None
    assert trace.final_result == [1, 2, 3, 4, 5]
    assert len(trace.steps) > 0


def test_run_in_sandbox_rejects_unsafe_imports_before_executing():
    source = "import os\ndef f():\n    return os.system('ls')\n"
    with pytest.raises(UnsafeCodeError):
        run_in_sandbox(uuid.uuid4(), source, "f", [])


def test_run_in_sandbox_enforces_wall_clock_timeout():
    # A tight Python-level loop hits the trace step cap almost immediately (see the
    # truncation test below) -- that's the fast-fail path, not the wall-clock path. To
    # exercise the timeout itself we need work that burns real CPU time in very few traced
    # lines: a single large C-level sort call takes >1s wall-clock but produces ~5 trace steps.
    source = "def slow_single_step():\n    data = list(range(20_000_000))\n    data.sort(reverse=True)\n    return len(data)\n"
    with pytest.raises(SandboxTimeoutError):
        run_in_sandbox(uuid.uuid4(), source, "slow_single_step", [], timeout_seconds=0.4)


def test_run_in_sandbox_truncates_infinite_loop_via_step_cap_before_timeout():
    # The trace step cap is the fast-fail defense for tight Python-level infinite loops --
    # it triggers in well under a second, faster than any wall-clock timeout would.
    source = "def infinite_loop():\n    while True:\n        pass\n"
    trace = run_in_sandbox(uuid.uuid4(), source, "infinite_loop", [], timeout_seconds=10.0)
    assert trace.truncated
    assert trace.error is None


def test_run_in_sandbox_surfaces_missing_entrypoint_as_execution_error():
    source = "def f():\n    return 1\n"
    trace = run_in_sandbox(uuid.uuid4(), source, "does_not_exist", [])
    assert trace.error is not None
    assert "does_not_exist" in trace.error


def test_run_in_sandbox_rejects_syntax_errors_as_execution_error():
    source = "def f(:\n    pass\n"
    with pytest.raises((SandboxExecutionError, SyntaxError)):
        run_in_sandbox(uuid.uuid4(), source, "f", [])
