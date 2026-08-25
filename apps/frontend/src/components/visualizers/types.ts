import type { Lesson, LessonStep } from "@/types/lesson";

export interface VisualizerProps {
  lesson: Lesson;
  currentStep: LessonStep;
  previousStep: LessonStep | null;
  allSteps: LessonStep[];
  stepIndex: number;
}

export type AlgorithmVisualizerComponent = (props: VisualizerProps) => JSX.Element;
