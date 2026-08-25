"use client";

import { useEffect, useRef } from "react";

import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";

/** Drives the store's `tick` action off requestAnimationFrame -- the single clock every panel
 * (code highlight, memory view, active Visualizer) derives its rendering from indirectly via
 * `stepIndex`/`progressWithinStep`. */
export function useLessonPlayback() {
  const tick = useLessonPlayerStore((s) => s.actions.tick);
  const isPlaying = useLessonPlayerStore((s) => s.isPlaying);
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>();

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
