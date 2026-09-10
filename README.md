# AlgoVerse AI

Turn any Python algorithm into a beautiful, interactive, AI-narrated lesson — entirely with
local AI (Ollama). No paid APIs, no cloud LLM calls, ever.

This repo includes a beginner curriculum of **103 runnable exercises across 14 separate
data-structure and algorithm modules**, plus one fully working visualization pipeline for
arbitrary Python solutions. Bubble Sort, Binary Search, and recursive Fibonacci have bespoke
visual metaphors; every other catalog or custom solution uses the trace-driven generic
data-structure and complete call-tree visualizers with locally generated narration.
Lesson completion also awards XP and badges. More languages and learning modes remain
part of the longer-term roadmap.

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

## Progress and rewards

Completing a lesson records the learner's best quiz score and awards XP based on difficulty.
Progress is idempotent, so replaying a lesson cannot farm XP. Milestones unlock First Steps,
Perfect Score, Dedicated Learner, and XP Explorer badges. Until authentication is introduced,
the web client uses a stable anonymous player ID; fixture-mode progress remains in local storage.

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

`make dev` copies `apps/backend/.env.example` to `apps/backend/.env` automatically if it's
missing (docker-compose's `env_file:` directive requires the file to exist, even though the
values it holds are overridden by `docker-compose.yml`'s own `environment:` block for the
containerized run). Running `docker compose up` directly instead of via `make dev` skips that
step — copy the file yourself first if you hit `env file ... not found`.

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

`/dev/preview` renders each Visualizer standalone against the fixtures, independent of the
submission flow — the lighter alternative to Storybook for reviewing layout/metaphor changes;
worth upgrading to real Storybook once a 4th+ algorithm makes isolated review pay for itself.

## Known limitations of this vertical slice

- Synchronous submission (no job queue yet) — a submission blocks on the local model, which can
  take 30-100+ seconds on modest hardware. The frontend shows a "this can take a while" progress
  state rather than a bare spinner.
- Sandboxing is dev/portfolio-grade (AST allowlist + resource-limited subprocess), not hardened
  for hostile multi-tenant use.
- Python only, no auth, and no async job queue. Progress uses an anonymous browser profile. The curriculum has
  103 runnable lessons, while three algorithms currently have bespoke visual metaphors; the
  others use the generic execution-trace visualizer.
- The `swap` animation (Bubble Sort's `Shelf`) is the one visual driven by a real scrub-seekable
  GSAP timeline (`useGsapStepTimeline`), matching the original design intent — the rest of the
  visualizers currently lean on Framer Motion's `layout` transitions instead, which are smooth
  but not independently scrubbable to an arbitrary mid-step point the way the GSAP one is.
  Worth extending to `compare`/`pointer_move`/recursion transitions if/when that polish matters.
- `sandbox_timeout_seconds` defaults to 8s specifically because host-level contention (real-time
  antivirus/EDR scanning intercepting subprocess spawns, observed during development) can add
  multi-second overhead on top of otherwise-instant algorithm code; the trace step cap is still
  the primary, fast defense against a genuine infinite loop.
