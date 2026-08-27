"""Best-effort auto-repair for syntax/indentation errors in submitted code, using the same
local model as lesson generation. Runs BEFORE anything else in the pipeline (execution, AST
analysis) -- code that doesn't parse can't be traced or analyzed at all. This is deliberately
narrow: it only ever attempts to fix parse errors, never logic. If the code already parses,
this is a no-op with zero LLM calls (the common case costs nothing)."""

import ast
import re

import httpx

_AUTOFIX_PROMPT_TEMPLATE = """The following Python code has a syntax or indentation error and fails to parse.
Fix ONLY the syntax/indentation error -- do not change the algorithm's logic, variable names,
function names, or behavior in any other way. Preserve the code exactly otherwise.

```python
{source_code}
```

Return ONLY the corrected Python code in a single fenced code block (```python ... ```), nothing else."""

_CODE_BLOCK_RE = re.compile(r"```(?:python)?\s*\n(.*?)```", re.DOTALL)


def _extract_code(response_text: str) -> str:
    match = _CODE_BLOCK_RE.search(response_text)
    return (match.group(1) if match else response_text).strip() + "\n"


def try_autofix_syntax(
    source_code: str,
    ollama_base_url: str,
    model_tag: str,
    max_attempts: int = 2,
    request_timeout: float = 60.0,
) -> tuple[str, bool]:
    """Returns (possibly-fixed source, was_fixed). Falls back to the original source
    (was_fixed=False) if it already parses, or if it still doesn't parse after all attempts --
    callers should surface the original parse error in that case, never a silently-broken
    "fixed" version."""
    try:
        ast.parse(source_code)
        return source_code, False
    except SyntaxError:
        pass

    client = httpx.Client(timeout=request_timeout)
    current = source_code
    for _ in range(max_attempts):
        try:
            resp = client.post(
                f"{ollama_base_url.rstrip('/')}/api/generate",
                json={
                    "model": model_tag,
                    "prompt": _AUTOFIX_PROMPT_TEMPLATE.format(source_code=current),
                    "stream": False,
                    "options": {"temperature": 0.0},
                },
            )
            resp.raise_for_status()
            candidate = _extract_code(resp.json()["response"])
        except Exception:  # noqa: BLE001 - autofix is best-effort; any failure just falls through
            break

        try:
            ast.parse(candidate)
            return candidate, True
        except SyntaxError:
            current = candidate
            continue

    return source_code, False
