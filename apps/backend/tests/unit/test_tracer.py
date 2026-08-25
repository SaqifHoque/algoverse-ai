import textwrap

from algoverse_backend.execution.tracer import ExecutionTracer


def _run_traced(source: str, filename: str, entrypoint: str, args: list, max_steps: int = 200):
    namespace: dict = {"__name__": "__test__"}
    code_obj = compile(source, filename, "exec")
    exec(code_obj, namespace)
    tracer = ExecutionTracer(target_filename=filename, max_steps=max_steps)
    tracer.start()
    try:
        result = namespace[entrypoint](*args)
    finally:
        tracer.stop()
    return tracer, result


def test_tracer_records_call_and_return_events(tmp_path):
    source = textwrap.dedent(
        """
        def add(a, b):
            total = a + b
            return total
        """
    )
    filename = str(tmp_path / "add.py")
    tracer, result = _run_traced(source, filename, "add", [2, 3])

    assert result == 5
    assert tracer.steps[0].event == "call"
    assert tracer.steps[-1].event == "return"
    assert tracer.steps[-1].return_value == 5
    assert not tracer.truncated


def test_tracer_tracks_call_stack_depth_for_recursion(tmp_path):
    source = textwrap.dedent(
        """
        def fib(n):
            if n <= 1:
                return n
            return fib(n - 1) + fib(n - 2)
        """
    )
    filename = str(tmp_path / "fib.py")
    tracer, result = _run_traced(source, filename, "fib", [4])

    assert result == 3
    max_depth = max(len(step.call_stack) for step in tracer.steps)
    assert max_depth >= 3  # fib(4) -> fib(3) -> fib(2) -> fib(1) at minimum


def test_tracer_ignores_frames_outside_target_file(tmp_path):
    source = textwrap.dedent(
        """
        def uses_builtin():
            return sorted([3, 1, 2])
        """
    )
    filename = str(tmp_path / "uses_builtin.py")
    tracer, result = _run_traced(source, filename, "uses_builtin", [])

    assert result == [1, 2, 3]
    assert all(step.function_name == "uses_builtin" for step in tracer.steps)


def test_tracer_truncates_when_step_limit_exceeded(tmp_path):
    source = textwrap.dedent(
        """
        def count_up(n):
            total = 0
            for i in range(n):
                total += i
            return total
        """
    )
    filename = str(tmp_path / "count_up.py")

    namespace: dict = {"__name__": "__test__"}
    exec(compile(source, filename, "exec"), namespace)
    tracer = ExecutionTracer(target_filename=filename, max_steps=5)
    tracer.start()
    try:
        namespace["count_up"](1000)
    except Exception:
        pass
    finally:
        tracer.stop()

    assert tracer.truncated
    assert len(tracer.steps) == 5
