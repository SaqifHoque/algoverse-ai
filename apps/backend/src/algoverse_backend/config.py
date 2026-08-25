from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://algoverse:algoverse_dev@localhost:5432/algoverse"
    redis_url: str = "redis://localhost:6379/0"
    ollama_base_url: str = "http://localhost:11434"

    sandbox_timeout_seconds: float = 5.0
    sandbox_memory_mb: int = 256
    sandbox_max_trace_steps: int = 2000

    llm_max_retries: int = 2
    llm_request_timeout_seconds: float = 120.0
    lesson_cache_ttl_seconds: int = 60 * 60 * 24


settings = Settings()
