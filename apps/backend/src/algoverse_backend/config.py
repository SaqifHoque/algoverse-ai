from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://algoverse:algoverse_dev@localhost:5432/algoverse"
    redis_url: str = "redis://localhost:6379/0"
    ollama_base_url: str = "http://localhost:11434"

    # 8s rather than a tighter bound: legitimate algorithm code (bubble sort, binary search,
    # small recursion) finishes in well under 1s, but host-level contention -- antivirus/EDR
    # real-time scanning intercepting every subprocess spawn and temp-file write being the
    # concrete case observed during development -- can occasionally add multiple seconds of
    # pure overhead before the child even starts executing. The trace step cap (below) is
    # still the primary, fast defense against a genuine infinite loop; this timeout is the
    # secondary backstop for CPU-heavy-but-few-trace-lines code, so it can afford to be looser.
    sandbox_timeout_seconds: float = 8.0
    sandbox_memory_mb: int = 256
    sandbox_max_trace_steps: int = 2000

    llm_max_retries: int = 2
    llm_request_timeout_seconds: float = 120.0
    lesson_cache_ttl_seconds: int = 60 * 60 * 24


settings = Settings()
