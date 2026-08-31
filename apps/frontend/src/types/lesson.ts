// Hand-mirrored from the backend's Pydantic schema (apps/backend/src/algoverse_backend/lesson/schema.py).
// The backend also exports packages/api-contract/openapi.json for openapi-typescript codegen
// (`npm run generate-types`) -- these types are kept in sync with that contract by hand for
// now since both sides are moving fast during this vertical slice; codegen output lands in
// types/generated/openapi.d.ts and can replace this file's bodies once the schema stabilizes.

export type AlgorithmName = "bubble_sort" | "binary_search" | "fibonacci_recursive";
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

export interface ProgressBadge {
  id: string;
  name: string;
  description: string;
}

export interface LessonProgress {
  lesson_id: string;
  completed_at: string;
  score: number;
  xp: number;
}

export interface ProgressSummary {
  user_id: string;
  total_xp: number;
  level: number;
  completed_lessons: number;
  badges: ProgressBadge[];
  lessons: LessonProgress[];
}
