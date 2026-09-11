"""Real execution through HTTP, with storage and model inference replaced by test doubles."""
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI

from algoverse_backend.api.deps import get_db_session, get_model_tag, get_planner
from algoverse_backend.api.routes import submissions
from algoverse_backend.lesson import planner_service
from algoverse_backend.lesson.schema import Lesson


@pytest.fixture
def pipeline(monkeypatch):
    planner, session, storage = Mock(), Mock(), {}
    for module, names in [
        (submissions, ['create_submission', 'mark_submission_completed', 'mark_submission_failed']),
        (planner_service, ['save_execution_trace', 'save_lesson', 'set_cached_lesson']),
    ]:
        for name in names:
            storage[name] = AsyncMock()
            monkeypatch.setattr(module, name, storage[name])
    monkeypatch.setattr(submissions, 'check_rate_limit', AsyncMock(return_value=True))
    monkeypatch.setattr(planner_service, 'get_cached_lesson', AsyncMock(return_value=None))
    monkeypatch.setattr(planner_service, 'try_autofix_syntax', lambda source, *args: (source, False))
    app = FastAPI()
    app.include_router(submissions.router)
    app.dependency_overrides[get_db_session] = lambda: session
    app.dependency_overrides[get_planner] = lambda: planner
    app.dependency_overrides[get_model_tag] = lambda: 'test-model'
    return app, planner, storage


async def submit(app, source, entrypoint='f', args=None):
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
        return await client.post('/submissions', json={
            'source_code': source, 'entrypoint': entrypoint, 'algorithm_name': 'custom', 'args': args or [],
        })


@pytest.mark.asyncio
@pytest.mark.parametrize(('source', 'entrypoint', 'message'), [
    ('def f():\n    return 1 / 0\n', 'f', 'ZeroDivisionError'),
    ('def f():\n    return 1\n', 'missing', "entrypoint 'missing'"),
    ('def f():\n    while True:\n        pass\n', 'f', 'trace step limit'),
    ('async def f():\n    return 1\n', 'f', 'Async entrypoints'),
    ('def f():\n    yield 1\n', 'f', 'Generator entrypoints'),
    ('async def f():\n    yield 1\n', 'f', 'Async entrypoints'),
    ('async def work():\n    return 1\ndef f():\n    return work()\n', 'f', 'Async results'),
    ('def work():\n    yield 1\ndef f():\n    return work()\n', 'f', 'Generator results'),
    ('async def work():\n    yield 1\ndef f():\n    return work()\n', 'f', 'Async results'),
])
async def test_failed_execution_returns_422_without_generating_a_lesson(pipeline, source, entrypoint, message):
    app, planner, storage = pipeline
    response = await submit(app, source, entrypoint)
    assert response.status_code == 422
    assert message in response.json()['detail']
    storage['save_execution_trace'].assert_awaited_once()
    storage['mark_submission_failed'].assert_awaited_once()
    assert message in storage['mark_submission_failed'].await_args.args[2]
    planner.generate_lesson.assert_not_called()
    storage['mark_submission_completed'].assert_not_awaited()
    storage['save_lesson'].assert_not_awaited()
    storage['set_cached_lesson'].assert_not_awaited()


@pytest.mark.asyncio
async def test_empty_trace_is_rejected_before_analysis_or_inference(pipeline):
    app, planner, storage = pipeline
    # An imported callable can execute, but none of its frames belong to submitted code.
    response = await submit(app, 'from math import sqrt\nf = sqrt\n', args=[4])
    assert response.status_code == 422
    assert 'No execution steps' in response.json()['detail']
    storage['save_execution_trace'].assert_awaited_once()
    planner.generate_lesson.assert_not_called()
    storage['mark_submission_failed'].assert_awaited_once()


@pytest.mark.asyncio
@pytest.mark.parametrize(('source', 'args', 'expected'), [
    ('def f(n):\n    if n <= 1:\n        return 1\n    return n * f(n-1)\n', [5], 120),
    ('def f():\n    try:\n        return 1/0\n    except ZeroDivisionError:\n        return 42\n', [], 42),
    ('def f():\n    return list(i for i in range(3))\n', [], [0, 1, 2]),
    ('def f():\n    pass\n', [], None),
])
async def test_successful_execution_still_generates_and_caches_a_lesson(pipeline, source, args, expected):
    app, planner, storage = pipeline
    lesson = Lesson.model_construct(lesson_id=uuid4())
    planner.generate_lesson.return_value = lesson
    response = await submit(app, source, args=args)
    assert response.status_code == 200
    assert response.json()['status'] == 'completed'
    trace = planner.generate_lesson.call_args.args[1]
    assert trace.final_result == expected
    assert trace.steps and trace.error is None and not trace.truncated
    storage['save_lesson'].assert_awaited_once()
    storage['set_cached_lesson'].assert_awaited_once()
    storage['mark_submission_completed'].assert_awaited_once()
    storage['mark_submission_failed'].assert_not_awaited()
