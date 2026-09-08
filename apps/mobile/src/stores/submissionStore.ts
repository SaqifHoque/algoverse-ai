import { create } from "zustand";

import { createSubmission } from "@/lib/api/submissions";
import { useSettingsStore } from "@/stores/settingsStore";
import type { AlgorithmName, Difficulty, SubmissionStatus } from "@/types/lesson";

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

function useFixtures(): boolean {
  const override = useSettingsStore.getState().useFixturesOverride;
  if (override !== null) return override;
  return process.env.EXPO_PUBLIC_USE_FIXTURES === "true";
}

/** Module-level singleton (not a per-lesson context store) -- lets app/submissions/pending.tsx
 * survive navigation and later absorb async polling (GET /submissions/{id} already exists on
 * the backend for this) with zero screen-level changes, same rationale as the web app's
 * submissionStore.ts. */
export const useSubmissionStore = create<SubmissionState>((set) => ({
  status: "idle",
  lessonId: null,
  error: null,
  algorithmName: null,
  actions: {
    submit: async (params) => {
      set({ status: "running", error: null, algorithmName: params.algorithmName, lessonId: null });

      // "custom" has no captured fixture -- it always needs a real generation.
      if (useFixtures() && params.algorithmName !== "custom") {
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
