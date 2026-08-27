"use client";

import { useState } from "react";
import { clsx } from "clsx";

import { buildCallTree } from "@/components/visualizers/generic/buildCallTree";
import { CallTreeVisualizer } from "@/components/visualizers/generic/CallTreeVisualizer";
import { DataStructureVisualizer } from "@/components/visualizers/generic/DataStructureVisualizer";
import type { VisualizerProps } from "@/components/visualizers/types";

/** A safe structural renderer for arbitrary code. The visual grammar comes from the actual
 * trace rather than model-generated markup: complete recursion trees, object/array trees,
 * graphs, indexed arrays with pointers, maps, and scalar memory. */
export function GenericVisualizer(props: VisualizerProps) {
  const hasCallTree = buildCallTree(props.allSteps).length > 1;
  const isGraphAlgorithm = /\bgraph\b|neighbors?|adjacency/i.test(props.lesson.source_code);
  const [view, setView] = useState<"structure" | "calls">(hasCallTree && !isGraphAlgorithm ? "calls" : "structure");

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between border-b border-border-glass pb-2">
        <div className="flex gap-1 rounded-lg bg-foreground/5 p-1">
          <button type="button" onClick={() => setView("structure")} className={clsx("rounded-md px-3 py-1.5 text-xs font-medium transition", view === "structure" ? "bg-surface text-accent shadow-sm" : "text-foreground/45")}>Data structure</button>
          {hasCallTree && <button type="button" onClick={() => setView("calls")} className={clsx("rounded-md px-3 py-1.5 text-xs font-medium transition", view === "calls" ? "bg-surface text-accent shadow-sm" : "text-foreground/45")}>Complete call tree</button>}
        </div>
        <span className="text-[10px] text-foreground/35">trace-driven · no generated HTML</span>
      </div>
      <div className="min-h-0 flex-1">
        {view === "calls" && hasCallTree ? <CallTreeVisualizer allSteps={props.allSteps} stepIndex={props.stepIndex} /> : <DataStructureVisualizer {...props} />}
      </div>
    </div>
  );
}
