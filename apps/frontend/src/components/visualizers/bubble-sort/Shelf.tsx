"use client";

import { motion } from "framer-motion";

import { HINT_COLORS } from "@/lib/animation/hintMapping";
import type { AnimationHint } from "@/types/lesson";

export function Shelf({ items, hints }: { items: number[]; hints: AnimationHint[] }) {
  const compareIndices = new Set(hints.filter((h) => h.kind === "compare").flatMap((h) => h.target_indices));
  const swapIndices = new Set(hints.filter((h) => h.kind === "swap").flatMap((h) => h.target_indices));

  return (
    <div className="flex h-full items-end justify-center gap-3 pb-10">
      {items.map((value, index) => {
        const isCompare = compareIndices.has(index);
        const isSwap = swapIndices.has(index);
        return (
          <motion.div
            key={value}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="flex flex-col items-center gap-2"
          >
            <motion.div
              animate={{
                scale: isSwap ? 1.15 : isCompare ? 1.08 : 1,
                y: isSwap ? -12 : 0,
              }}
              className="flex w-14 items-center justify-center rounded-xl border-2 font-mono text-lg font-semibold shadow-glass"
              style={{
                height: `${40 + value * 14}px`,
                borderColor: isSwap ? HINT_COLORS.swap : isCompare ? HINT_COLORS.compare : "var(--border-glass)",
                backgroundColor: isSwap
                  ? "rgb(236 72 153 / 0.15)"
                  : isCompare
                    ? "rgb(250 204 21 / 0.15)"
                    : "var(--surface-glass)",
              }}
            >
              {value}
            </motion.div>
            <span className="text-xs text-foreground/40">{index}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
