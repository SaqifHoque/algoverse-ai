#!/usr/bin/env python
"""Runs the full pipeline (execute -> trace -> AST analyze -> local LLM lesson generation)
directly, with no HTTP/DB/Redis involved -- the fastest possible "does this work at all" check,
usable before the API layer exists. Usage:

    python scripts/cli_demo.py --fixture bubble_sort
    python scripts/cli_demo.py --fixture binary_search
    python scripts/cli_demo.py --fixture fibonacci_recursive
"""

import argparse
import json
import sys
import time
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from algoverse_backend.analysis.ast_analyzer import analyze  # noqa: E402
from algoverse_backend.execution.sandbox import run_in_sandbox  # noqa: E402
from algoverse_backend.llm.base import LessonGenerationOptions  # noqa: E402
from algoverse_backend.llm.model_selector import select_model, selection_reason  # noqa: E402
from algoverse_backend.llm.ollama_client import OllamaLessonPlanner  # noqa: E402

FIXTURES: dict[str, dict] = {
    "bubble_sort": {"entrypoint": "bubble_sort", "args": [[5, 3, 1, 4, 2]]},
    "binary_search": {"entrypoint": "binary_search", "args": [[1, 3, 5, 7, 9, 11], 7]},
    "fibonacci_recursive": {"entrypoint": "fibonacci_recursive", "args": [6]},
}

FIXTURES_DIR = Path(__file__).parent.parent / "tests" / "fixtures" / "algorithms"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fixture", required=True, choices=sorted(FIXTURES.keys()))
    parser.add_argument("--difficulty", default="beginner", choices=["beginner", "intermediate", "advanced"])
    parser.add_argument("--max-steps", type=int, default=12)
    args = parser.parse_args()

    fixture = FIXTURES[args.fixture]
    source_code = (FIXTURES_DIR / f"{args.fixture}.py").read_text()

    print(f"[1/4] Model selection: {selection_reason()}", file=sys.stderr)
    model_tag = select_model()

    print("[2/4] Executing in sandbox + tracing...", file=sys.stderr)
    submission_id = uuid.uuid4()
    t0 = time.time()
    trace = run_in_sandbox(submission_id, source_code, fixture["entrypoint"], fixture["args"])
    print(f"      {len(trace.steps)} steps captured in {time.time() - t0:.2f}s (error={trace.error})", file=sys.stderr)

    print("[3/4] Analyzing AST...", file=sys.stderr)
    ast_info = analyze(source_code, fixture["entrypoint"])
    print(f"      complexity_hint={ast_info.complexity_hint}", file=sys.stderr)

    print(f"[4/4] Generating lesson via Ollama ({model_tag})... this can take up to ~30s", file=sys.stderr)
    planner = OllamaLessonPlanner(base_url="http://localhost:11434", model_tag=model_tag)
    health = planner.health_check()
    if not health.reachable:
        print(f"ERROR: Ollama not reachable/model not pulled: {health.detail}", file=sys.stderr)
        sys.exit(1)

    t0 = time.time()
    lesson = planner.generate_lesson(
        ast_info,
        trace,
        LessonGenerationOptions(difficulty=args.difficulty, max_steps=args.max_steps),
        args.fixture,
        source_code,
    )
    print(f"      lesson generated in {time.time() - t0:.2f}s", file=sys.stderr)

    print(lesson.model_dump_json(indent=2))


if __name__ == "__main__":
    main()
