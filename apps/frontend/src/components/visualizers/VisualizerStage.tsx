"use client";

import { motion } from "framer-motion";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { resolveVisualizer } from "@/components/visualizers/registry";
import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";

export function VisualizerStage() {
  const lesson = useLessonPlayerStore((s) => s.lesson);
  const stepIndex = useLessonPlayerStore((s) => s.stepIndex);
  const currentStep = lesson.timeline[stepIndex]!;
  const previousStep = stepIndex > 0 ? lesson.timeline[stepIndex - 1]! : null;

  const Visualizer = resolveVisualizer(lesson.algorithm_name);

  return (
    <GlassPanel className="h-[560px] overflow-hidden p-4">
      <motion.div
        key={lesson.algorithm_name}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full w-full"
      >
        <Visualizer
          lesson={lesson}
          currentStep={currentStep}
          previousStep={previousStep}
          allSteps={lesson.timeline}
          stepIndex={stepIndex}
        />
      </motion.div>
    </GlassPanel>
  );
}
