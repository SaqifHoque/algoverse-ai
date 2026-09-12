// Mirrored from apps/frontend/src/types/lesson.ts, which is itself hand-mirrored from the
// backend's Pydantic schema (apps/backend/src/algoverse_backend/lesson/schema.py). Pure
// TypeScript, zero DOM/React coupling -- ports byte-for-byte across web and mobile.

export type AlgorithmName = "bubble_sort" | "binary_search" | "fibonacci_recursive" | "custom";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type AnimationKind =
  | "highlight"
  | "swap"
  | "compare"
  | "pointer_move"
  | "push"
  | "pop"
  | "recurse_in"
  | "recurse_out";

export interface MemoryVariable {
  name: string;
  value: unknown;
  changed: boolean;
}

export interface MemoryView {
  variables: MemoryVariable[];
  call_stack: string[];
  snapshot_warnings?: string[];
}

export interface AnimationHint {
  kind: AnimationKind;
  target_indices: number[];
  target_vars: string[];
  description: string;
}

export interface LessonStep {
  step_index: number;
  current_line: number;
  highlighted_lines: number[];
  memory_view: MemoryView;
  narration: string;
  why_this_happens: string;
  animation_hints: AnimationHint[];
  complexity_note: string | null;
}

export interface QuizQuestion {
  question: string;
  choices: string[];
  correct_index: number;
  explanation: string;
}

export interface Hint {
  trigger: "on_request" | "on_wrong_answer" | "proactive";
  text: string;
  related_step_index: number | null;
}

export interface Lesson {
  lesson_id: string;
  submission_id: string;
  title: string;
  algorithm_name: AlgorithmName;
  source_code: string;
  difficulty: Difficulty;
  learning_objectives: string[];
  story: string;
  timeline: LessonStep[];
  quiz: QuizQuestion[];
  hints: Hint[];
  summary: string;
  complexity_overall: string;
  generated_by_model: string;
  created_at: string;
  snapshot_warnings?: string[];
}

export type SubmissionStatus = "pending" | "running" | "completed" | "failed";

export interface SubmissionCreateRequest {
  source_code: string;
  entrypoint: string;
  algorithm_name: AlgorithmName;
  args: unknown[];
  language: "python";
  difficulty: Difficulty;
}

export interface SubmissionCreateResponse {
  submission_id: string;
  status: SubmissionStatus;
  lesson_id: string | null;
  error: string | null;
}
