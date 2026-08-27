"use client";

import { CallTreeVisualizer } from "@/components/visualizers/generic/CallTreeVisualizer";
import type { VisualizerProps } from "@/components/visualizers/types";

export function RecursionVisualizer({ allSteps, stepIndex }: VisualizerProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <CallTreeVisualizer allSteps={allSteps} stepIndex={stepIndex} />
      </div>
      <p className="pb-2 text-center text-xs text-foreground/40">
        The entire recursion tree stays visible. Active calls glow, completed calls turn green, and future calls remain faint.
      </p>
    </div>
  );
}
