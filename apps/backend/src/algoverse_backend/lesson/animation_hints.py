"""Derives AnimationHint lists structurally from the real ExecutionTrace + a light AST scan
of the submitted source -- never from the LLM. This is what lets `animation_hints[].kind`
stay a small, mechanically-accurate enum: comparisons, swaps, pointer moves and recursion
in/out are detected from actual runtime values and AST shape, not guessed by a small local
model. Detection is structural (AST-shape based, not literal-text based) so it tolerates
variable renames/reformatting of the same algorithm shape -- but it is intentionally scoped to
the three algorithm shapes in this vertical slice, not a general-purpose code analyzer.
"""

import ast

from algoverse_backend.execution.models import TraceStep
from algoverse_backend.lesson.schema import AlgorithmName, AnimationHint


def derive_animation_hints(
    algorithm_name: AlgorithmName, source_code: str, entry_args: list[str], steps: list[TraceStep]
) -> dict[int, list[AnimationHint]]:
    if algorithm_name == "bubble_sort":
        return _derive_bubble_sort_hints(source_code, entry_args, steps)
    if algorithm_name == "binary_search":
        return _derive_binary_search_hints(source_code, entry_args, steps)
    if algorithm_name == "fibonacci_recursive":
        return _derive_recursion_hints(steps)
    return {step.step_index: [] for step in steps}


# --- shared helpers -----------------------------------------------------------------------


def _eval_index_expr(node: ast.expr, local_vars: dict) -> int | None:
    if isinstance(node, ast.Name):
        val = local_vars.get(node.id)
        return val if isinstance(val, int) and not isinstance(val, bool) else None
    if isinstance(node, ast.Constant) and isinstance(node.value, int):
        return node.value
    if isinstance(node, ast.BinOp) and isinstance(node.op, (ast.Add, ast.Sub)):
        left = _eval_index_expr(node.left, local_vars)
        right = _eval_index_expr(node.right, local_vars)
        if left is None or right is None:
            return None
        return left + right if isinstance(node.op, ast.Add) else left - right
    return None


def _first_list_arg(entry_args: list[str], first_step_locals: dict) -> str | None:
    for name in entry_args:
        if isinstance(first_step_locals.get(name), list):
            return name
    return None


# --- bubble sort (and other adjacent-compare/swap iterative sorts) -----------------------


def _find_two_subscript_comparisons(source_code: str, array_var: str) -> dict[int, tuple[ast.expr, ast.expr]]:
    tree = ast.parse(source_code)
    sites: dict[int, tuple[ast.expr, ast.expr]] = {}
    for node in ast.walk(tree):
        if not (isinstance(node, ast.Compare) and len(node.ops) == 1 and len(node.comparators) == 1):
            continue
        left, right = node.left, node.comparators[0]
        if (
            isinstance(left, ast.Subscript)
            and isinstance(right, ast.Subscript)
            and isinstance(left.value, ast.Name)
            and isinstance(right.value, ast.Name)
            and left.value.id == right.value.id == array_var
        ):
            sites[node.lineno] = (left.slice, right.slice)
    return sites


def _diff_swap_indices(before: list, after: list) -> tuple[int, int] | None:
    if len(before) != len(after):
        return None
    diffs = [idx for idx, (b, a) in enumerate(zip(before, after)) if b != a]
    if len(diffs) == 2:
        i, j = diffs
        if before[i] == after[j] and before[j] == after[i]:
            return i, j
    return None


def _derive_bubble_sort_hints(
    source_code: str, entry_args: list[str], steps: list[TraceStep]
) -> dict[int, list[AnimationHint]]:
    hints_by_step: dict[int, list[AnimationHint]] = {step.step_index: [] for step in steps}
    if not steps:
        return hints_by_step

    array_var = _first_list_arg(entry_args, steps[0].locals)
    if array_var is None:
        return hints_by_step

    comparison_sites = _find_two_subscript_comparisons(source_code, array_var)

    prev_list_value: list | None = None
    for step in steps:
        hints: list[AnimationHint] = []

        if step.line_no in comparison_sites:
            left_expr, right_expr = comparison_sites[step.line_no]
            i = _eval_index_expr(left_expr, step.locals)
            j = _eval_index_expr(right_expr, step.locals)
            if i is not None and j is not None:
                hints.append(
                    AnimationHint(
                        kind="compare",
                        target_indices=[i, j],
                        target_vars=[array_var],
                        description=f"Comparing {array_var}[{i}] and {array_var}[{j}]",
                    )
                )

        # Swap detection is value-based, not line-based: `sys.settrace` line events fire
        # *before* that line executes, so the swap assignment's own step still shows
        # pre-swap values -- the mutation only becomes visible on the following step,
        # regardless of what line that happens to be. Diffing consecutive snapshots catches
        # the actual mutation wherever it becomes observable.
        current_list = step.locals.get(array_var)
        if isinstance(current_list, list) and isinstance(prev_list_value, list) and current_list != prev_list_value:
            swapped = _diff_swap_indices(prev_list_value, current_list)
            if swapped:
                i, j = swapped
                hints.append(
                    AnimationHint(
                        kind="swap",
                        target_indices=[i, j],
                        target_vars=[array_var],
                        description=f"Swapping {array_var}[{i}] and {array_var}[{j}]",
                    )
                )

        if isinstance(current_list, list):
            prev_list_value = list(current_list)

        hints_by_step[step.step_index] = hints

    return hints_by_step


# --- binary search --------------------------------------------------------------------------


def _find_binary_search_pattern(source_code: str) -> dict | None:
    tree = ast.parse(source_code)
    for node in ast.walk(tree):
        if (
            isinstance(node, ast.Assign)
            and len(node.targets) == 1
            and isinstance(node.targets[0], ast.Name)
            and isinstance(node.value, ast.BinOp)
            and isinstance(node.value.op, ast.FloorDiv)
            and isinstance(node.value.left, ast.BinOp)
            and isinstance(node.value.left.op, ast.Add)
            and isinstance(node.value.left.left, ast.Name)
            and isinstance(node.value.left.right, ast.Name)
        ):
            return {
                "mid_line": node.lineno,
                "mid_var": node.targets[0].id,
                "low_var": node.value.left.left.id,
                "high_var": node.value.left.right.id,
            }
    return None


def _find_subscript_vs_scalar_comparisons(source_code: str, array_var: str, index_var: str) -> set[int]:
    tree = ast.parse(source_code)
    lines: set[int] = set()
    for node in ast.walk(tree):
        if not (isinstance(node, ast.Compare) and len(node.ops) == 1 and len(node.comparators) == 1):
            continue
        left, right = node.left, node.comparators[0]
        sides = (left, right)
        is_target_subscript = any(
            isinstance(side, ast.Subscript)
            and isinstance(side.value, ast.Name)
            and side.value.id == array_var
            and isinstance(side.slice, ast.Name)
            and side.slice.id == index_var
            for side in sides
        )
        if is_target_subscript:
            lines.add(node.lineno)
    return lines


def _find_pointer_assignment_lines(source_code: str, var_names: set[str]) -> set[int]:
    tree = ast.parse(source_code)
    lines: set[int] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            if node.targets[0].id in var_names:
                lines.add(node.lineno)
    return lines


def _derive_binary_search_hints(
    source_code: str, entry_args: list[str], steps: list[TraceStep]
) -> dict[int, list[AnimationHint]]:
    hints_by_step: dict[int, list[AnimationHint]] = {step.step_index: [] for step in steps}
    if not steps:
        return hints_by_step

    array_var = _first_list_arg(entry_args, steps[0].locals)
    pattern = _find_binary_search_pattern(source_code)
    if array_var is None or pattern is None:
        return hints_by_step

    mid_var, low_var, high_var = pattern["mid_var"], pattern["low_var"], pattern["high_var"]
    compare_lines = _find_subscript_vs_scalar_comparisons(source_code, array_var, mid_var)
    pointer_lines = _find_pointer_assignment_lines(source_code, {low_var, high_var})

    for step in steps:
        hints: list[AnimationHint] = []

        if step.line_no == pattern["mid_line"] and mid_var in step.locals:
            mid_val = step.locals.get(mid_var)
            if isinstance(mid_val, int):
                hints.append(
                    AnimationHint(
                        kind="pointer_move",
                        target_indices=[mid_val],
                        target_vars=[low_var, mid_var, high_var],
                        description=f"Narrowing range: {low_var}={step.locals.get(low_var)}, "
                        f"{high_var}={step.locals.get(high_var)}, {mid_var}={mid_val}",
                    )
                )

        if step.line_no in compare_lines and mid_var in step.locals:
            mid_val = step.locals.get(mid_var)
            if isinstance(mid_val, int):
                hints.append(
                    AnimationHint(
                        kind="compare",
                        target_indices=[mid_val],
                        target_vars=[array_var],
                        description=f"Comparing {array_var}[{mid_val}] against the target",
                    )
                )

        if step.line_no in pointer_lines:
            moved_var = low_var if low_var in step.locals else high_var
            val = step.locals.get(moved_var)
            if isinstance(val, int):
                hints.append(
                    AnimationHint(
                        kind="pointer_move",
                        target_indices=[val],
                        target_vars=[moved_var],
                        description=f"Moving {moved_var} to {val}",
                    )
                )

        hints_by_step[step.step_index] = hints

    return hints_by_step


# --- recursion (fully generic: driven by call_stack depth, not AST shape) -----------------


def _derive_recursion_hints(steps: list[TraceStep]) -> dict[int, list[AnimationHint]]:
    """Every 'call' event is a recurse_in and every 'return' event is a recurse_out --
    unconditionally. (An earlier version gated recurse_in on call_stack depth increasing
    versus the previous step, but a 'return' step's recorded call_stack still includes the
    returning frame -- the tracer pops it only after recording -- so a sibling call at the
    same depth right after a return looked like "no increase" and was wrongly skipped.)"""
    hints_by_step: dict[int, list[AnimationHint]] = {}
    for step in steps:
        hints: list[AnimationHint] = []
        depth = len(step.call_stack)
        if step.event == "call":
            hints.append(
                AnimationHint(
                    kind="recurse_in",
                    target_indices=[depth],
                    target_vars=list(step.locals.keys()),
                    description=f"Entering {step.function_name} (depth {depth}) with {step.locals}",
                )
            )
        elif step.event == "return":
            hints.append(
                AnimationHint(
                    kind="recurse_out",
                    target_indices=[depth],
                    target_vars=["return_value"],
                    description=f"Returning {step.return_value} from {step.function_name} (depth {depth})",
                )
            )
        hints_by_step[step.step_index] = hints
    return hints_by_step
