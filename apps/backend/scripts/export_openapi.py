#!/usr/bin/env python
"""Exports the FastAPI app's OpenAPI schema to packages/api-contract/openapi.json, which the
frontend's `openapi-typescript` codegen reads from. Does not require the app's lifespan to run
(no DB/Redis/Ollama connection needed) since it only introspects routes/Pydantic models."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from algoverse_backend.main import app  # noqa: E402

OUTPUT_PATH = Path(__file__).parent.parent.parent.parent / "packages" / "api-contract" / "openapi.json"


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(app.openapi(), indent=2))
    print(f"Wrote OpenAPI schema to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
