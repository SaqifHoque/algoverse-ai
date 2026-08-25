"use client";

import { Shelf } from "@/components/visualizers/bubble-sort/Shelf";
import type { VisualizerProps } from "@/components/visualizers/types";

export function BubbleSortVisualizer({ currentStep }: VisualizerProps) {
  const itemsVar = currentStep.memory_view.variables.find((v) => v.name === "items");
  const items = Array.isArray(itemsVar?.value) ? (itemsVar!.value as number[]) : [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <Shelf items={items} hints={currentStep.animation_hints} />
      </div>
      <p className="pb-2 text-center text-xs text-foreground/40">
        Objects on a shelf -- taller boxes are bigger numbers. Adjacent boxes swap when out of order.
      </p>
    </div>
  );
}
