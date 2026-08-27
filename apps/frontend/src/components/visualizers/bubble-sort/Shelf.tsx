"use client";

import gsap from "gsap";
import { motion } from "framer-motion";
import { useRef } from "react";

import { useGsapStepTimeline } from "@/hooks/useGsapStepTimeline";
import { HINT_COLORS } from "@/lib/animation/hintMapping";
import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";
import type { AnimationHint } from "@/types/lesson";

// w-14 (56px) + gap-3 (12px) -- the fixed horizontal distance between adjacent slots. Used to
// compute the arc tween's start offset without a DOM measurement pass.
const SLOT_PITCH = 68;
const ARC_HEIGHT = 34;

export function Shelf({
  items,
  hints,
  stepKey,
}: {
  items: number[];
  hints: AnimationHint[];
  stepKey: number;
}) {
  const progressWithinStep = useLessonPlayerStore((s) => s.progressWithinStep);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const compareIndices = new Set(hints.filter((h) => h.kind === "compare").flatMap((h) => h.target_indices));
  const swapHint = hints.find((h) => h.kind === "swap");
  const swapIndices = new Set(swapHint?.target_indices ?? []);

  // A real GSAP timeline, paused and driven by `.progress()` from the shared playback clock --
  // this is what makes the swap scrub-seekable via the global timeline scrubber, unlike a
  // Framer Motion `layout` transition (which only plays forward once and can't be scrubbed
  // to an arbitrary point). Rebuilt once per step (see `stepKey` in the deps array below).
  useGsapStepTimeline(
    (tl) => {
      if (!swapHint) return;
      const [i, j] = swapHint.target_indices;
      if (i === undefined || j === undefined) return;
      const elA = itemRefs.current.get(i);
      const elB = itemRefs.current.get(j);
      const delta = (j - i) * SLOT_PITCH;
      if (elA) {
        tl.fromTo(elA, { x: delta, y: 0 }, { x: 0, y: 0, duration: 1, ease: "power2.inOut" }, 0);
        tl.to(elA, { y: -ARC_HEIGHT, duration: 0.5, ease: "power1.out" }, 0);
        tl.to(elA, { y: 0, duration: 0.5, ease: "power1.in" }, 0.5);
      }
      if (elB) {
        tl.fromTo(elB, { x: -delta, y: 0 }, { x: 0, y: 0, duration: 1, ease: "power2.inOut" }, 0);
        tl.to(elB, { y: -ARC_HEIGHT, duration: 0.5, ease: "power1.out" }, 0);
        tl.to(elB, { y: 0, duration: 0.5, ease: "power1.in" }, 0.5);
      }
    },
    [stepKey],
    progressWithinStep,
  );

  return (
    <div className="flex h-full items-end justify-center gap-3 pb-10">
      {items.map((value, index) => {
        const isCompare = compareIndices.has(index);
        const isSwap = swapIndices.has(index);
        return (
          <motion.div
            key={value}
            layout={!isSwap}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="flex flex-col items-center gap-2"
          >
            <div
              ref={(el) => {
                if (el) itemRefs.current.set(index, el);
                else itemRefs.current.delete(index);
              }}
              className="flex w-14 items-center justify-center rounded-xl border-2 font-mono text-lg font-semibold shadow-glass transition-[border-color,background-color,transform] duration-200"
              style={{
                height: `${40 + value * 14}px`,
                borderColor: isSwap ? HINT_COLORS.swap : isCompare ? HINT_COLORS.compare : "var(--border-glass)",
                backgroundColor: isSwap
                  ? "rgb(236 72 153 / 0.15)"
                  : isCompare
                    ? "rgb(250 204 21 / 0.15)"
                    : "var(--surface-glass)",
                transform: isCompare && !isSwap ? "scale(1.08)" : undefined,
              }}
            >
              {value}
            </div>
            <span className="text-xs text-foreground/40">{index}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
