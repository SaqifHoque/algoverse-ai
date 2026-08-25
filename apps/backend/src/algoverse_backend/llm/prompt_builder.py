import json

from algoverse_backend.analysis.models import AstInfo
from algoverse_backend.execution.models import ExecutionTrace, TraceStep
from algoverse_backend.lesson.schema import AnimationHint
from algoverse_backend.llm.base import LessonGenerationOptions

_METADATA_SCHEMA_HINT = """Return ONLY a JSON object with exactly these fields, no others:
{
  "title": "short lesson title",
  "story": "2-4 sentence physical-world metaphor introducing the algorithm",
  "learning_objectives": ["one short objective", "another short objective"],
  "summary": "2-3 sentence recap of what happened and why the algorithm works",
  "quiz": [{"question": "...", "choices": ["a", "b", "c", "d"], "correct_index": 0, "explanation": "..."}],
  "hints": [{"trigger": "on_request", "text": "...", "related_step_index": null}]
}
Include exactly 1-2 quiz questions and 1-2 hints."""

_STEP_SCHEMA_HINT = """Return ONLY a JSON object with exactly one field, "steps", containing a
JSON array with exactly one element per step_index listed below, in the same order. Each
array element must be shaped exactly like:
{"step_index": <int>, "narration": "one sentence, present tense, describing what is happening right now",
 "why_this_happens": "one sentence explaining the underlying reason this step occurs", "complexity_note": null}
Example shape: {"steps": [{"step_index": 0, "narration": "...", "why_this_happens": "...", "complexity_note": null}]}"""


def build_metadata_prompt(
    ast_info: AstInfo, trace: ExecutionTrace, options: LessonGenerationOptions, algorithm_name: str
) -> str:
    entry = ast_info.entrypoint_function
    return (
        f"You are an expert computer science teacher creating a beginner-friendly, story-driven lesson "
        f"about the algorithm '{algorithm_name}' for a student at the '{options.difficulty}' level.\n\n"
        f"Function signature: {entry.name}({', '.join(entry.args)})\n"
        f"Static complexity estimate: {ast_info.complexity_hint}\n"
        f"Complexity basis: {ast_info.complexity_basis}\n"
        f"The function returned: {trace.final_result!r}\n\n"
        f"Use a vivid physical-world metaphor appropriate to this specific algorithm "
        f"(for example: sorting -> objects on a shelf, searching -> flipping through a dictionary, "
        f"recursion -> nested mirrors) in the 'story' field. Keep language simple enough for a "
        f"curious beginner.\n\n"
        f"{_METADATA_SCHEMA_HINT}"
    )


def build_step_narration_prompt(
    ast_info: AstInfo,
    steps: list[TraceStep],
    options: LessonGenerationOptions,
    source_code: str,
    hints_by_step: dict[int, list[AnimationHint]],
) -> str:
    source_lines = source_code.splitlines()

    def _source_line(line_no: int) -> str:
        return source_lines[line_no - 1].strip() if 0 < line_no <= len(source_lines) else ""

    step_summaries = [
        {
            "step_index": s.step_index,
            "line_no": s.line_no,
            "source_line": _source_line(s.line_no),
            "event": s.event,
            "function_name": s.function_name,
            "locals": s.locals,
            # Ground truth, computed from the real trace -- not a guess. Base the narration
            # on these detected events (if any) rather than re-deriving them from locals.
            "detected_events": [h.description for h in hints_by_step.get(s.step_index, [])],
        }
        for s in steps
    ]
    return (
        f"You are narrating a step-by-step execution trace of '{ast_info.entrypoint_function.name}' "
        f"for a student at the '{options.difficulty}' level. Here are the recorded steps, in order. "
        f"Each step's 'detected_events' field (when non-empty) states exactly what happened at that "
        f"step -- base your narration on it directly rather than re-guessing from 'locals' alone.\n\n"
        f"{json.dumps(step_summaries)}\n\n"
        f"{_STEP_SCHEMA_HINT}"
    )


def build_repair_prompt(original_prompt: str, previous_output: str, error: Exception) -> str:
    return (
        f"{original_prompt}\n\n"
        f"--- Your previous response was invalid ---\n{previous_output}\n\n"
        f"--- Validation error ---\n{error}\n\n"
        f"Fix only what is invalid and return the corrected JSON in the exact same shape as "
        f"instructed above. Return ONLY the corrected JSON, nothing else."
    )
