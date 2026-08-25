.PHONY: bootstrap-ollama dev backend-test verify-e2e

bootstrap-ollama:
	./apps/backend/scripts/bootstrap_ollama.sh

dev:
	docker compose up --build

backend-test:
	cd apps/backend && . .venv/bin/activate && python -m pytest tests/unit -q

verify-e2e:
	@echo "--- health ---"; curl -sf http://localhost:8000/api/v1/health; echo
	@echo "--- health/model ---"; curl -sf http://localhost:8000/api/v1/health/model; echo
	@echo "--- submit bubble_sort ---"
	curl -s -X POST http://localhost:8000/api/v1/submissions \
		-H "Content-Type: application/json" \
		-d @apps/backend/tests/fixtures/requests/bubble_sort_request.json | tee /tmp/algoverse_submission.json
	@echo
