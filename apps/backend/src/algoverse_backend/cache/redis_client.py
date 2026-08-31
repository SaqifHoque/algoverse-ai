import hashlib
import json

import redis.asyncio as redis

from algoverse_backend.config import settings
from algoverse_backend.lesson.schema import Lesson

_redis: redis.Redis = redis.from_url(settings.redis_url, decode_responses=True)
_LESSON_PIPELINE_VERSION = 3


def lesson_cache_key(source_code: str, entrypoint: str, args: list, difficulty: str, model_tag: str) -> str:
    digest = hashlib.sha256(
        json.dumps(
            {
                "pipeline_version": _LESSON_PIPELINE_VERSION,
                "source_code": source_code,
                "entrypoint": entrypoint,
                "args": args,
                "difficulty": difficulty,
                "model_tag": model_tag,
            },
            sort_keys=True,
        ).encode()
    ).hexdigest()
    return f"lesson:cache:{digest}"


async def get_cached_lesson(cache_key: str) -> Lesson | None:
    raw = await _redis.get(cache_key)
    if raw is None:
        return None
    return Lesson.model_validate_json(raw)


async def set_cached_lesson(cache_key: str, lesson: Lesson) -> None:
    await _redis.set(cache_key, lesson.model_dump_json(), ex=settings.lesson_cache_ttl_seconds)


async def check_rate_limit(identifier: str, max_requests: int = 5, window_seconds: int = 60) -> bool:
    """Simple sliding-window-ish limiter via INCR+EXPIRE. Returns True if the request is
    allowed. Protects the single local Ollama instance from being thrashed by concurrent
    submissions during demo/dev traffic."""
    key = f"ratelimit:submissions:{identifier}"
    count = await _redis.incr(key)
    if count == 1:
        await _redis.expire(key, window_seconds)
    return count <= max_requests
