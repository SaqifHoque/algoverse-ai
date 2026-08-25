"use client";

import { AnimatePresence, motion } from "framer-motion";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { DURATION } from "@/lib/animation/easing";
import type { LessonStep } from "@/types/lesson";

export function NarrationPanel({ step }: { step: LessonStep }) {
  return (
    <GlassPanel className="space-y-2 p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step.step_index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: DURATION.short }}
        >
          <p className="text-base font-medium">{step.narration}</p>
          {step.why_this_happens && (
            <p className="mt-1 text-sm text-foreground/60">{step.why_this_happens}</p>
          )}
          {step.complexity_note && (
            <p className="mt-2 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {step.complexity_note}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </GlassPanel>
  );
}
