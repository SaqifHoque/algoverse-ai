import { useCallback } from "react";
import * as Speech from "expo-speech";

import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";

/** Real implementation for v1 (unlike the web app's no-op stub) -- expo-speech has no
 * permission prompts or browser-support friction, so there's no reason to defer it. Same hook
 * signature/call-sites as web (NarrationPanel speaks on step change when enabled). */
export function useVoiceNarration() {
  const enabled = useLessonPlayerStore((s) => s.voiceEnabled);
  const toggle = useLessonPlayerStore((s) => s.actions.toggleVoice);

  const speak = useCallback((text: string, _opts?: { stepIndex: number }) => {
    Speech.stop();
    Speech.speak(text, { rate: 1.0 });
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  return { isEnabled: enabled, isSpeaking: false, speak, stop, toggle };
}
