import { create } from "zustand";

import { createSubmission } from "@/lib/api/submissions";
import type { AlgorithmName, Difficulty, SubmissionStatus } from "@/types/lesson";

const USE_FIXTURES = process.env.NEXT_PUBLIC_USE_FIXTURES === "true";

interface SubmitParams {
  sourceCode: string;
  entrypoint: string;
  algorithmName: AlgorithmName;
  args: unknown[];
  difficulty: Difficulty;
}

interface SubmissionState {
  status: SubmissionStatus | "idle";
  lessonId: string | null;
  error: string | null;
  algorithmName: AlgorithmName | null;
  actions: {
    submit: (params: SubmitParams) => Promise<void>;
    reset: () => void;
  };
}

/** Module-level singleton (not a per-lesson context store like lessonPlayerStore) -- this is
 * exactly what lets the /submissions/pending route survive navigation and later absorb an
 * async/polling backend with zero page-level changes: the same action just starts polling
 * GET /submissions/{id} and updates these same fields instead of resolving immediately. */
export const useSubmissionStore = create<SubmissionState>((set) => ({
  status: "idle",
  lessonId: null,
  error: null,
  algorithmName: null,
  actions: {
    submit: async (params) => {
      set({ status: "running", error: null, algorithmName: params.algorithmName, lessonId: null });

      if (USE_FIXTURES) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        set({ status: "completed", lessonId: params.algorithmName });
        return;
      }

      try {
        const res = await createSubmission({
          source_code: params.sourceCode,
          entrypoint: params.entrypoint,
          algorithm_name: params.algorithmName,
          args: params.args,
          language: "python",
          difficulty: params.difficulty,
        });
        if (res.status === "completed" && res.lesson_id) {
          set({ status: "completed", lessonId: res.lesson_id });
        } else if (res.status === "failed") {
          set({ status: "failed", error: res.error ?? "Generation failed" });
        } else {
          set({ status: res.status });
        }
      } catch (err) {
        set({ status: "failed", error: err instanceof Error ? err.message : String(err) });
      }
    },
    reset: () => set({ status: "idle", lessonId: null, error: null, algorithmName: null }),
  },
}));
