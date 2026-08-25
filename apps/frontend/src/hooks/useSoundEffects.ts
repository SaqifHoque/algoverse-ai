"use client";

import { useCallback } from "react";

import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";

export type SoundEffectName = "swap" | "compare" | "correct" | "incorrect" | "step";

/** No-op v1, same rationale as useVoiceNarration: real call sites (Visualizer hint handlers,
 * quiz resolution) already invoke `play()`; swapping in real audio later only touches this
 * hook's body. */
export function useSoundEffects() {
  const enabled = useLessonPlayerStore((s) => s.soundEnabled);
  const toggle = useLessonPlayerStore((s) => s.actions.toggleSound);

  const play = useCallback((_name: SoundEffectName) => {
    // real audio call site goes here
  }, []);

  return { isEnabled: enabled, play, toggle };
}
