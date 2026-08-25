"use client";

import { CallStackFlow } from "@/components/visualizers/recursion/CallStackFlow";
import { reconstructCallStack } from "@/components/visualizers/recursion/reconstructCallStack";
import type { VisualizerProps } from "@/components/visualizers/types";

export function RecursionVisualizer({ allSteps, stepIndex }: VisualizerProps) {
  const frames = reconstructCallStack(allSteps, stepIndex);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <CallStackFlow frames={frames} />
      </div>
      <p className="pb-2 text-center text-xs text-foreground/40">
        Each call is a smaller mirror nested inside the last -- it waits for its two children before returning.
      </p>
    </div>
  );
}
