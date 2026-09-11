import { useEffect, useRef } from "react";

import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";

/** Drives the store's `tick` action off requestAnimationFrame -- available in RN/Hermes
 * unchanged, so this ports directly from the web version with no polyfill needed. */
export function useLessonPlayback() {
  const tick = useLessonPlayerStore((s) => s.actions.tick);
  const isPlaying = useLessonPlayerStore((s) => s.isPlaying);
  const rafRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isPlaying) return;

    const step = (time: number) => {
      if (lastTimeRef.current !== undefined) {
        tick((time - lastTimeRef.current) / 1000);
      }
      lastTimeRef.current = time;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = undefined;
    };
  }, [isPlaying, tick]);
}
