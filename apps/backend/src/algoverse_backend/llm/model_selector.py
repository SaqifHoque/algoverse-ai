"""Single source of truth for local model choice -- imported by both scripts/bootstrap_ollama.sh
(via `python -m algoverse_backend.llm.model_selector`) and the backend at startup, so the
bootstrap script and the running app can never select different models."""

import psutil

# (family, min_ram_budget_gb, ollama_tag) -- checked in order, first fit wins.
PREFERENCE_LADDER: list[tuple[str, float, str]] = [
    ("qwen-coder", 9.0, "qwen2.5-coder:14b"),
    ("qwen-coder", 4.0, "qwen2.5-coder:7b"),
    ("qwen-coder", 2.0, "qwen2.5-coder:3b"),
    ("qwen-instruct", 4.0, "qwen2.5:7b"),
    ("qwen-instruct", 2.0, "qwen2.5:3b"),
    ("deepseek-r1", 4.0, "deepseek-r1:7b"),
    ("llama3.2", 2.0, "llama3.2:3b"),
    ("gemma", 1.5, "gemma2:2b"),
]

# Headroom reserved for OS + IDE + backend + frontend + Postgres + Redis running concurrently.
RESERVED_GB = 8.0


def total_ram_gb() -> float:
    return psutil.virtual_memory().total / (1024**3)


def select_model(total_ram_gb_override: float | None = None) -> str:
    ram = total_ram_gb_override if total_ram_gb_override is not None else total_ram_gb()
    budget = max(ram - RESERVED_GB, 0.0)
    for _family, min_gb, tag in PREFERENCE_LADDER:
        if budget >= min_gb:
            return tag
    return PREFERENCE_LADDER[-1][2]


def selection_reason(total_ram_gb_override: float | None = None) -> str:
    ram = total_ram_gb_override if total_ram_gb_override is not None else total_ram_gb()
    budget = max(ram - RESERVED_GB, 0.0)
    tag = select_model(total_ram_gb_override)
    return f"total_ram={ram:.1f}GB, reserved={RESERVED_GB}GB, budget={budget:.1f}GB -> {tag}"


if __name__ == "__main__":
    print(select_model())
