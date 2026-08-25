import ast

from algoverse_backend.analysis.models import AstInfo, FunctionInfo, LoopInfo

_FORBIDDEN_MODULES = {"os", "sys", "subprocess", "socket", "shutil", "ctypes", "multiprocessing"}
_FORBIDDEN_CALLS = {"eval", "exec", "__import__", "open"}
_MEMOIZATION_DECORATORS = {"lru_cache", "cache"}


class UnsafeCodeError(Exception):
    """Raised by static_safety_check when submitted source uses a disallowed import or builtin."""


class _SafetyVisitor(ast.NodeVisitor):
    def __init__(self) -> None:
        self.violations: list[str] = []

    def visit_Import(self, node: ast.Import) -> None:
        for alias in node.names:
            root = alias.name.split(".")[0]
            if root in _FORBIDDEN_MODULES:
                self.violations.append(f"import of '{alias.name}' is not allowed")
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        root = (node.module or "").split(".")[0]
        if root in _FORBIDDEN_MODULES:
            self.violations.append(f"import from '{node.module}' is not allowed")
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call) -> None:
        if isinstance(node.func, ast.Name) and node.func.id in _FORBIDDEN_CALLS:
            self.violations.append(f"call to '{node.func.id}' is not allowed")
        self.generic_visit(node)


def static_safety_check(source_code: str) -> None:
    """Allowlist-style guard run before any execution: rejects imports/builtins that could
    reach the filesystem, network, or process table. Scoped for algorithm-visualization code
    (pure functions/loops/recursion/basic data structures) -- not a general-purpose sandbox."""
    tree = ast.parse(source_code)
    visitor = _SafetyVisitor()
    visitor.visit(tree)
    if visitor.violations:
        raise UnsafeCodeError("; ".join(visitor.violations))


def analyze(source_code: str, entrypoint: str) -> AstInfo:
    tree = ast.parse(source_code)
    functions: list[FunctionInfo] = []
    entry_info: FunctionInfo | None = None
    entry_node: ast.FunctionDef | ast.AsyncFunctionDef | None = None

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            info = _analyze_function(node)
            functions.append(info)
            if node.name == entrypoint:
                entry_info = info
                entry_node = node

    if entry_info is None or entry_node is None:
        raise ValueError(f"entrypoint '{entrypoint}' not found in submitted source")

    complexity_hint, complexity_basis = _estimate_complexity(entry_info, entry_node)
    return AstInfo(
        functions=functions,
        entrypoint_function=entry_info,
        complexity_hint=complexity_hint,
        complexity_basis=complexity_basis,
    )


def _analyze_function(node: ast.FunctionDef | ast.AsyncFunctionDef) -> FunctionInfo:
    loops = _collect_loops(node)
    return FunctionInfo(
        name=node.name,
        line_start=node.lineno,
        line_end=getattr(node, "end_lineno", node.lineno),
        args=[a.arg for a in node.args.args],
        docstring=ast.get_docstring(node),
        is_recursive=_is_recursive(node),
        loops=loops,
        max_loop_nesting=max((loop.nesting_depth for loop in loops), default=0),
    )


def _collect_loops(func_node: ast.AST) -> list[LoopInfo]:
    loops: list[LoopInfo] = []

    def walk(node: ast.AST, depth: int) -> None:
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue  # nested function defs count their own loops independently
            if isinstance(child, (ast.For, ast.AsyncFor, ast.While)):
                new_depth = depth + 1
                loops.append(
                    LoopInfo(
                        line_no=child.lineno,
                        kind="for" if isinstance(child, (ast.For, ast.AsyncFor)) else "while",
                        nesting_depth=new_depth,
                    )
                )
                walk(child, new_depth)
            else:
                walk(child, depth)

    walk(func_node, 0)
    return loops


def _is_recursive(func_node: ast.FunctionDef | ast.AsyncFunctionDef) -> bool:
    for node in ast.walk(func_node):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == func_node.name:
            return True
    return False


def _has_memoization_decorator(node: ast.FunctionDef | ast.AsyncFunctionDef) -> bool:
    for dec in node.decorator_list:
        dec_name = dec.attr if isinstance(dec, ast.Attribute) else getattr(dec, "id", None)
        if dec_name in _MEMOIZATION_DECORATORS:
            return True
    return False


def _estimate_complexity(info: FunctionInfo, node: ast.FunctionDef | ast.AsyncFunctionDef) -> tuple[str, str]:
    basis_prefix = "Heuristic based on static structure only — not a formal proof."

    if info.is_recursive:
        if _has_memoization_decorator(node):
            hint = "O(n) (heuristic: recursive with a caching decorator detected)"
            basis = f"{basis_prefix} '{info.name}' is self-recursive but decorated with lru_cache/cache."
        else:
            hint = "O(2^n) (heuristic: naive recursion, no memoization detected)"
            basis = f"{basis_prefix} '{info.name}' calls itself with no caching decorator detected."
        return hint, basis

    if info.max_loop_nesting >= 2:
        hint = f"O(n^{info.max_loop_nesting}) (heuristic: {info.max_loop_nesting} nested loops)"
        basis = f"{basis_prefix} Detected {info.max_loop_nesting} levels of nested for/while loops."
        return hint, basis

    if info.max_loop_nesting == 1:
        hint = "O(n) (heuristic: single loop over input)"
        basis = f"{basis_prefix} Detected one loop with no nesting."
        return hint, basis

    hint = "O(1) (heuristic: no loops or recursion detected)"
    basis = f"{basis_prefix} No for/while loops or self-recursive calls detected in '{info.name}'."
    return hint, basis
