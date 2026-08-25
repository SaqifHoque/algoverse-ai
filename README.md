# AlgoVerse AI

Turn any Python algorithm into a beautiful, interactive, AI-narrated lesson — entirely with
local AI (Ollama). No paid APIs, no cloud LLM calls, ever.

This repo currently implements a **vertical slice**: one fully working, polished pipeline for
three algorithms (Bubble Sort, Binary Search, recursive Fibonacci), proven end to end, rather
than a broad scaffold of every feature in the long-term product vision. See
`.claude/plans` history or ask for the original plan for the full roadmap (gamification,
more languages, more algorithms, learning modes, etc.) — none of that is built yet.

## Architecture

```
User's Python solution
  -> Execution Engine (sandboxed subprocess, sys.settrace)   apps/backend/.../execution/
  -> AST analysis (complexity heuristics, safety check)      apps/backend/.../analysis/
  -> Local LLM Lesson Planner (Ollama, structured JSON only) apps/backend/.../llm/
  -> Lesson JSON (fixed Pydantic schema)                     apps/backend/.../lesson/schema.py
  -> Next.js Animation Engine + Lesson Player                apps/frontend/
```

The AI never generates HTML or freeform prose meant for direct rendering — only the structured
`Lesson` JSON. All animation timing/color/easing decisions live in the frontend.

## Prerequisites

- macOS with Homebrew, Docker Desktop
- Python 3.12 (via `pyenv`) for the backend
- Node.js 18.18+ for the frontend

## First-time setup

```bash
make bootstrap-ollama   # installs Ollama if missing, pulls a model sized to your RAM, smoke-tests it
```

This picks a model via a RAM-aware ladder (`apps/backend/src/algoverse_backend/llm/model_selector.py`):
Qwen2.5-Coder → Qwen2.5-Instruct → DeepSeek-R1 → Llama 3.2 → Gemma, sized to whatever fits your
machine (e.g. 16GB RAM → `qwen2.5-coder:7b`).

**Ollama runs on the host, not in Docker** — Docker Desktop on macOS has no GPU passthrough, so
a containerized Ollama would be CPU-only and much slower. The backend container reaches host
Ollama via `host.docker.internal`.

## Running everything

```bash
make dev   # docker compose up --build: postgres + redis + backend + frontend
```

Then open http://localhost:3000.

## Backend development

```bash
cd apps/backend
pyenv local 3.12.11
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

make backend-test                    # unit tests, no Ollama/Docker required
python scripts/cli_demo.py --fixture bubble_sort   # full pipeline, no HTTP, prints Lesson JSON
```

Integration tests that require a real local Ollama are marked `@pytest.mark.integration`:

```bash
python -m pytest tests/integration -m integration
```

## Frontend development

```bash
cd apps/frontend
npm install
npm run dev
```

`.env.local` defaults to `NEXT_PUBLIC_USE_FIXTURES=true`, which renders the 3 real captured
`Lesson` JSON fixtures (`src/lib/fixtures/data/*.lesson.json`) with zero backend dependency —
the fast day-to-day iteration loop. Visit `/lessons/bubble_sort`, `/lessons/binary_search`, or
`/lessons/fibonacci_recursive` directly. Set it to `false` to talk to a real running backend.

## Known limitations of this vertical slice

- Synchronous submission (no job queue yet) — a submission blocks on the local model, which can
  take 30-100+ seconds on modest hardware. The frontend shows a "this can take a while" progress
  state rather than a bare spinner.
- Sandboxing is dev/portfolio-grade (AST allowlist + resource-limited subprocess), not hardened
  for hostile multi-tenant use.
- Only 3 algorithms, Python only, no auth, no XP/badges/gamification, no async job queue —
  all explicitly deferred, not architecturally blocked.
- `next@14.2.18` has a known security advisory (see `npm install` output) — worth upgrading to
  a patched 14.2.x release before any real deployment; not yet bumped in this pass.
