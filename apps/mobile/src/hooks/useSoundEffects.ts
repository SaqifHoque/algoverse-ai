import { useCallback } from "react";

import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";

export type SoundEffectName = "swap" | "compare" | "correct" | "incorrect" | "step";

/** Unlike useVoiceNarration (real TTS, needs no bundled asset), sound effects need actual
 * audio files (src/assets/sfx/*.mp3) that haven't been authored in this pass -- there's no
 * text-to-audio equivalent for arbitrary short SFX. Kept as a no-op with real call sites (same
 * pattern as the web app's original stub) so dropping in real .mp3 assets + expo-audio's
 * useAudioPlayer later only touches this hook's body, not any call site. */
export function useSoundEffects() {
  const enabled = useLessonPlayerStore((s) => s.soundEnabled);
  const toggle = useLessonPlayerStore((s) => s.actions.toggleSound);

  const play = useCallback((_name: SoundEffectName) => {
    // real expo-audio call site goes here once .mp3 assets are added
  }, []);

  return { isEnabled: enabled, play, toggle };
}
