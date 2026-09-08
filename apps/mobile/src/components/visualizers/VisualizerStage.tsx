import { GestureDetector } from "react-native-gesture-handler";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { resolveVisualizer } from "@/components/visualizers/registry";
import { useLessonGestureControls } from "@/hooks/useLessonGestureControls";
import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";

export function VisualizerStage() {
  const lesson = useLessonPlayerStore((s) => s.lesson);
  const stepIndex = useLessonPlayerStore((s) => s.stepIndex);
  const progressWithinStep = useLessonPlayerStore((s) => s.progressWithinStep);
  const currentStep = lesson.timeline[stepIndex]!;
  const previousStep = stepIndex > 0 ? lesson.timeline[stepIndex - 1]! : null;
  const gesture = useLessonGestureControls();

  const Visualizer = resolveVisualizer(lesson.algorithm_name);

  return (
    <GestureDetector gesture={gesture}>
      <GlassPanel style={{ height: 340 }}>
        <Visualizer
          lesson={lesson}
          currentStep={currentStep}
          previousStep={previousStep}
          allSteps={lesson.timeline}
          stepIndex={stepIndex}
          progressWithinStep={progressWithinStep}
        />
      </GlassPanel>
    </GestureDetector>
  );
}
