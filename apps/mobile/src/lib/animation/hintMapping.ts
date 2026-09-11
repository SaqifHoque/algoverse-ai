import type { Theme } from "@/theme/tokens";
import type { AnimationKind } from "@/types/lesson";

// The backend only ever says WHICH kind of event happened and on which indices/vars -- every
// color/style/motion decision lives here, never in the LLM output. Unlike the web version
// (static CSS var strings), this takes the resolved theme object since RN has no CSS custom
// properties to reference statically.
export function getHintColor(kind: AnimationKind, theme: Theme): string {
  switch (kind) {
    case "compare":
      return theme.compare;
    case "swap":
      return theme.swap;
    case "push":
    case "recurse_in":
      return theme.push;
    case "pop":
    case "recurse_out":
      return theme.pop;
    case "pointer_move":
    case "highlight":
    default:
      return theme.accent;
  }
}

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
