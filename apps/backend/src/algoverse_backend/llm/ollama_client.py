import json
from datetime import UTC, datetime
from uuid import uuid4

import httpx
from pydantic import BaseModel, TypeAdapter, ValidationError

from algoverse_backend.analysis.models import AstInfo
from algoverse_backend.execution.models import ExecutionTrace
from algoverse_backend.lesson.animation_hints import derive_animation_hints
from algoverse_backend.lesson.downsample import downsample_steps
from algoverse_backend.lesson.schema import (
    AlgorithmName,
    Hint,
    Lesson,
    LessonStep,
    MemoryVariable,
    MemoryView,
    QuizQuestion,
)
from algoverse_backend.llm.base import (
    LessonGenerationError,
    LessonGenerationOptions,
    LessonPlannerClient,
    ModelHealth,
)
from algoverse_backend.llm.prompt_builder import (
    build_metadata_prompt,
    build_repair_prompt,
    build_step_narration_prompt,
)
from algoverse_backend.llm.validation import parse_as


class MetadataBlock(BaseModel):
    title: str
    story: str
    learning_objectives: list[str]
    summary: str
    quiz: list[QuizQuestion] = []
    hints: list[Hint] = []


class StepNarrationBlock(BaseModel):
    step_index: int
    narration: str
    why_this_happens: str
    complexity_note: str | None = None


class StepNarrationBatch(BaseModel):
    """Small local models are noticeably more reliable at producing a JSON *object* than a
    bare top-level JSON *array* under grammar-constrained decoding -- wrapping the array in
    a single named field avoids that failure mode (confirmed empirically: qwen2.5-coder:7b
    reliably collapsed a bare-array request down to a single object)."""

    steps: list[StepNarrationBlock]


class OllamaLessonPlanner(LessonPlannerClient):
    """The only LessonPlannerClient implementation for v1. The LLM is only ever asked for
    prose (narration, story, quiz, hints) -- every structural field (current_line,
    highlighted_lines, memory_view, animation_hints, complexity_overall) is populated
    programmatically from the real ExecutionTrace/AstInfo, never reproduced by the model."""

    def __init__(
        self,
        base_url: str,
        model_tag: str,
        max_retries: int = 2,
        request_timeout: float = 120.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.model_tag = model_tag
        self.max_retries = max_retries
        self.request_timeout = request_timeout
        self.http_client = httpx.Client(timeout=request_timeout)

    def health_check(self) -> ModelHealth:
        try:
            resp = self.http_client.get(f"{self.base_url}/api/tags")
            resp.raise_for_status()
            tags = [m["name"] for m in resp.json().get("models", [])]
            reachable = self.model_tag in tags
            detail = f"available models: {tags}" if reachable else f"'{self.model_tag}' not pulled yet; available: {tags}"
            return ModelHealth(reachable=reachable, model_tag=self.model_tag, detail=detail)
        except Exception as exc:  # noqa: BLE001 - health check must never raise, only report
            return ModelHealth(reachable=False, model_tag=self.model_tag, detail=str(exc))

    def generate_lesson(
        self,
        ast_info: AstInfo,
        trace: ExecutionTrace,
        options: LessonGenerationOptions,
        algorithm_name: AlgorithmName,
        source_code: str,
    ) -> Lesson:
        downsampled = downsample_steps(trace.steps, options.max_steps)
        hints_by_step = derive_animation_hints(
            algorithm_name, source_code, ast_info.entrypoint_function.args, downsampled
        )

        metadata: MetadataBlock = self._call_with_retry(
            build_metadata_prompt(ast_info, trace, options, algorithm_name), MetadataBlock
        )
        # The visualization trace can contain extra call events needed to reconstruct a whole
        # recursion tree. Narrate only an evenly spaced subset so local models stay fast and
        # reliable; non-narrated structural frames receive the deterministic fallback below.
        narration_steps = downsampled
        if len(downsampled) > options.max_steps:
            if options.max_steps == 1:
                narration_steps = [downsampled[0]]
            else:
                last = len(downsampled) - 1
                narration_indices = sorted({round(i * last / (options.max_steps - 1)) for i in range(options.max_steps)})
                narration_steps = [downsampled[index] for index in narration_indices]

        narration_batch: StepNarrationBatch = self._call_with_retry(
            build_step_narration_prompt(ast_info, narration_steps, options, source_code, hints_by_step),
            StepNarrationBatch,
        )
        narration_by_index = {n.step_index: n for n in narration_batch.steps}

        timeline: list[LessonStep] = []
        for step in downsampled:
            narration = narration_by_index.get(step.step_index)
            timeline.append(
                LessonStep(
                    step_index=step.step_index,
                    current_line=step.line_no,
                    highlighted_lines=[step.line_no],
                    memory_view=MemoryView(
                        variables=[MemoryVariable(name=k, value=v) for k, v in step.locals.items()],
                        call_stack=step.call_stack,
                    ),
                    narration=narration.narration
                    if narration
                    else f"Executing line {step.line_no} in {step.function_name}.",
                    why_this_happens=narration.why_this_happens if narration else "",
                    animation_hints=hints_by_step.get(step.step_index, []),
                    complexity_note=narration.complexity_note if narration else None,
                )
            )

        return Lesson(
            lesson_id=uuid4(),
            submission_id=trace.submission_id,
            title=metadata.title,
            algorithm_name=algorithm_name,
            source_code=source_code,
            difficulty=options.difficulty,
            learning_objectives=metadata.learning_objectives,
            story=metadata.story,
            timeline=timeline,
            quiz=metadata.quiz if options.include_quiz else [],
            hints=metadata.hints,
            summary=metadata.summary,
            complexity_overall=ast_info.complexity_hint,
            generated_by_model=self.model_tag,
            created_at=datetime.now(UTC),
        )

    def _call_with_retry(self, prompt: str, target: type[BaseModel] | TypeAdapter) -> object:
        last_error: Exception | None = None
        for _attempt in range(self.max_retries + 1):
            raw = self._call_ollama(prompt)
            try:
                return parse_as(target, raw)
            except (json.JSONDecodeError, ValidationError) as exc:
                last_error = exc
                prompt = build_repair_prompt(prompt, raw, exc)
        raise LessonGenerationError(f"model failed to produce schema-valid JSON after retries: {last_error}")

    def _call_ollama(self, prompt: str) -> str:
        resp = self.http_client.post(
            f"{self.base_url}/api/generate",
            json={
                "model": self.model_tag,
                "prompt": prompt,
                "format": "json",
                "stream": False,
                "options": {"temperature": 0.2, "num_ctx": 8192},
            },
            timeout=self.request_timeout,
        )
        resp.raise_for_status()
        return resp.json()["response"]
