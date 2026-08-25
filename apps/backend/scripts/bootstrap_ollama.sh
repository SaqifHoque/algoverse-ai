#!/usr/bin/env bash
# Idempotent: installs Ollama if missing, starts it, selects a model sized to available RAM
# (via model_selector.py, the single source of truth also used by the running backend),
# pulls it, and runs a smoke-test prompt to confirm it actually responds.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama not found -- installing via Homebrew..."
  brew install ollama
fi

echo "Starting Ollama service..."
brew services start ollama >/dev/null 2>&1 || true

echo -n "Waiting for Ollama to become reachable..."
for _ in $(seq 1 30); do
  if curl -sf http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo " up."
    break
  fi
  echo -n "."
  sleep 1
done

cd "$BACKEND_DIR"
if [ -d .venv ]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

MODEL_TAG=$(python -m algoverse_backend.llm.model_selector)
echo "Selected model: $MODEL_TAG"

echo "Pulling $MODEL_TAG (this can take a while on first run)..."
ollama pull "$MODEL_TAG"

echo "Running smoke test..."
RESPONSE=$(curl -sf http://localhost:11434/api/generate -d "{\"model\":\"$MODEL_TAG\",\"prompt\":\"Reply with exactly: OK\",\"stream\":false}")
python - "$RESPONSE" <<'PY'
import json
import sys

payload = json.loads(sys.argv[1])
print("Smoke test response:", payload.get("response", "").strip())
PY

echo "Ollama bootstrap complete."
