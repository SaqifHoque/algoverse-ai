"use client";

import { useCallback } from "react";

import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";

/** No-op v1: the call sites are real (NarrationPanel calls `speak` on every step change when
 * enabled) so wiring in real TTS (e.g. the Web Speech API, or a hosted voice) later only
 * touches this hook's body -- zero changes needed at any call site. */
export function useVoiceNarration() {
  const enabled = useLessonPlayerStore((s) => s.voiceEnabled);
  const toggle = useLessonPlayerStore((s) => s.actions.toggleVoice);

  const speak = useCallback((_text: string, _opts?: { stepIndex: number }) => {
    // real TTS call site goes here
  }, []);

  const stop = useCallback(() => {
    // real TTS stop call site goes here
  }, []);

  return { isEnabled: enabled, isSpeaking: false, speak, stop, toggle };
}
