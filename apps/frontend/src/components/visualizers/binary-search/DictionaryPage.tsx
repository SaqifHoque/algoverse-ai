"use client";

import { motion } from "framer-motion";

import { HINT_COLORS } from "@/lib/animation/hintMapping";

export function DictionaryPage({
  items,
  low,
  high,
  mid,
  target,
}: {
  items: number[];
  low: number | undefined;
  high: number | undefined;
  mid: number | undefined;
  target: number | undefined;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="text-sm text-foreground/50">
        Looking for <span className="font-mono font-semibold text-accent">{target}</span>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((value, index) => {
          const inRange = low !== undefined && high !== undefined && index >= low && index <= high;
          const isMid = index === mid;
          return (
            <motion.div
              key={index}
              className="relative flex w-12 flex-col items-center gap-1 rounded-lg border-2 px-2 py-3 font-mono text-sm shadow-glass"
              animate={{
                opacity: inRange ? 1 : 0.3,
                scale: isMid ? 1.15 : 1,
                borderColor: isMid ? HINT_COLORS.pointer_move : "var(--border-glass)",
              }}
              style={{ backgroundColor: isMid ? "rgb(99 102 241 / 0.15)" : "var(--surface-glass)" }}
            >
              {isMid && (
                <motion.span
                  layoutId="mid-pointer"
                  className="absolute -top-6 text-xs font-semibold text-accent"
                >
                  mid
                </motion.span>
              )}
              {value}
              <span className="text-[10px] text-foreground/40">{index}</span>
            </motion.div>
          );
        })}
      </div>
      <div className="flex gap-6 text-xs text-foreground/50">
        <span>low = {low ?? "-"}</span>
        <span>high = {high ?? "-"}</span>
      </div>
    </div>
  );
}
