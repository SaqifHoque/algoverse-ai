import pytest

from algoverse_backend.llm.model_selector import select_model
from algoverse_backend.llm.ollama_client import OllamaLessonPlanner

pytestmark = pytest.mark.integration


def test_ollama_is_reachable_and_model_is_pulled():
    planner = OllamaLessonPlanner(base_url="http://localhost:11434", model_tag=select_model())
    health = planner.health_check()
    assert health.reachable, health.detail


def test_ollama_returns_parseable_json_with_format_json():
    planner = OllamaLessonPlanner(base_url="http://localhost:11434", model_tag=select_model())
    raw = planner._call_ollama('Reply with a JSON object: {"ok": true}')  # noqa: SLF001 - smoke test
    import json

    parsed = json.loads(raw)
    assert isinstance(parsed, dict)
