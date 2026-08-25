import type { AnimationKind } from "@/types/lesson";

// The backend only ever tells us WHICH kind of event happened and on which
// indices/vars -- every color/style/motion decision lives here, never in the LLM output.
export const HINT_COLORS: Record<AnimationKind, string> = {
  highlight: "rgb(var(--accent))",
  compare: "rgb(250 204 21)", // amber
  swap: "rgb(var(--accent-2))",
  pointer_move: "rgb(var(--accent))",
  push: "rgb(52 211 153)", // emerald
  pop: "rgb(248 113 113)", // red
  recurse_in: "rgb(52 211 153)",
  recurse_out: "rgb(248 113 113)",
};

export const HINT_LABELS: Record<AnimationKind, string> = {
  highlight: "Highlight",
  compare: "Comparing",
  swap: "Swapping",
  pointer_move: "Moving pointer",
  push: "Pushing frame",
  pop: "Popping frame",
  recurse_in: "Diving in",
  recurse_out: "Returning",
};
