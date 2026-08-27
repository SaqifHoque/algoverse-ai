"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

/** Builds ONE short GSAP timeline per step transition (not one lesson-long timeline -- that
 * would make scrubbing cost grow with lesson length). The timeline is paused and driven
 * entirely by `.progress()`, called from the caller's `progressWithinStep` -- this is what
 * makes it genuinely scrub-seekable from the global timeline scrubber, unlike a
 * fire-and-forget Framer Motion transition. Torn down and rebuilt whenever `buildTimeline`
 * (keyed by the caller via deps) changes, so stale tweens never target unmounted elements. */
export function useGsapStepTimeline(
  buildTimeline: (tl: gsap.core.Timeline) => void,
  deps: unknown[],
  progress: number,
) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    buildTimeline(tl);
    timelineRef.current = tl;
    return () => {
      tl.kill();
      timelineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    timelineRef.current?.progress(Math.min(Math.max(progress, 0), 1));
  }, [progress]);
}
