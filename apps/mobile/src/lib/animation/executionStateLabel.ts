import type { LessonStep } from "@/types/lesson";

/** Legacy lessons omit event metadata; avoid guessing their state timing. */
export function executionStateLabel(step: LessonStep): string | null {
  switch (step.execution_event) {
    case "line": return "Variables show the state before the highlighted line runs.";
    case "call": return "Function entry: variables show the initial local state.";
    case "return": return `Function exit · recorded return value: ${JSON.stringify(step.return_value ?? null)}. An exception can also cause a function to exit.`;
    case "exception": return `Exception raised: ${step.exception ?? "unknown"}. The program may handle it.`;
    default: return null;
  }
}
