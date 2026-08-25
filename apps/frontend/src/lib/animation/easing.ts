// Shared motion tokens so every animation in the app (Framer Motion transitions, React Flow
// node transitions) feels consistent regardless of which AnimationHint.kind triggered it.
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
  short: 0.25,
  step: 0.45,
  long: 0.7,
};
