"use client";

import { DictionaryPage } from "@/components/visualizers/binary-search/DictionaryPage";
import type { VisualizerProps } from "@/components/visualizers/types";

function findVar(step: VisualizerProps["currentStep"], name: string): unknown {
  return step.memory_view.variables.find((v) => v.name === name)?.value;
}

export function BinarySearchVisualizer({ currentStep }: VisualizerProps) {
  const items = Array.isArray(findVar(currentStep, "items")) ? (findVar(currentStep, "items") as number[]) : [];
  const low = findVar(currentStep, "low") as number | undefined;
  const high = findVar(currentStep, "high") as number | undefined;
  const mid = findVar(currentStep, "mid") as number | undefined;
  const target = findVar(currentStep, "target") as number | undefined;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <DictionaryPage items={items} low={low} high={high} mid={mid} target={target} />
      </div>
      <p className="pb-2 text-center text-xs text-foreground/40">
        Like flipping to the middle of a dictionary and narrowing which half to check next.
      </p>
    </div>
  );
}
