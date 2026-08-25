from pydantic import BaseModel


class LoopInfo(BaseModel):
    line_no: int
    kind: str  # "for" | "while"
    nesting_depth: int


class FunctionInfo(BaseModel):
    name: str
    line_start: int
    line_end: int
    args: list[str]
    docstring: str | None
    is_recursive: bool
    loops: list[LoopInfo]
    max_loop_nesting: int


class AstInfo(BaseModel):
    functions: list[FunctionInfo]
    entrypoint_function: FunctionInfo
    complexity_hint: str
    complexity_basis: str
