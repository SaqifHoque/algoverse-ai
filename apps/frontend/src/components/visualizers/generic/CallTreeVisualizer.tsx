"use client";

import { useMemo } from "react";
import ReactFlow, { Background, Controls, MarkerType, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";

import { buildCallTree } from "@/components/visualizers/generic/buildCallTree";
import type { LessonStep } from "@/types/lesson";

function layoutTree(callNodes: ReturnType<typeof buildCallTree>) {
  const children = new Map<string | null, string[]>();
  for (const node of callNodes) {
    children.set(node.parentId, [...(children.get(node.parentId) ?? []), node.id]);
  }
  const xById = new Map<string, number>();
  let nextLeaf = 0;
  function place(id: string): number {
    const childIds = children.get(id) ?? [];
    if (!childIds.length) {
      const x = nextLeaf++ * 190;
      xById.set(id, x);
      return x;
    }
    const positions = childIds.map(place);
    const x = (positions[0]! + positions[positions.length - 1]!) / 2;
    xById.set(id, x);
    return x;
  }
  for (const root of children.get(null) ?? []) place(root);
  return xById;
}

export function CallTreeVisualizer({ allSteps, stepIndex }: { allSteps: LessonStep[]; stepIndex: number }) {
  const { nodes, edges } = useMemo(() => {
    const calls = buildCallTree(allSteps);
    const positions = layoutTree(calls);
    const nodes: Node[] = calls.map((call) => {
      const state = call.startStep > stepIndex ? "future" : call.endStep !== null && call.endStep <= stepIndex ? "done" : "active";
      return {
        id: call.id,
        position: { x: positions.get(call.id) ?? 0, y: (call.depth - 1) * 120 },
        data: {
          label: (
            <div className="text-left">
              <div className="font-mono text-xs font-bold">{call.functionName}()</div>
              {call.detail && <div className="mt-1 max-w-[145px] truncate font-mono text-[10px] opacity-65">{call.detail}</div>}
              <div className="mt-1 text-[9px] uppercase tracking-wider opacity-50">{state}</div>
            </div>
          ),
        },
        style: {
          width: 165,
          borderRadius: 14,
          border: state === "active" ? "2px solid rgb(99 102 241)" : "1px solid rgb(99 102 241 / .35)",
          background: state === "active" ? "rgb(99 102 241 / .18)" : state === "done" ? "rgb(34 197 94 / .10)" : "rgb(120 120 130 / .06)",
          opacity: state === "future" ? 0.28 : 1,
          color: "inherit",
          padding: 10,
          boxShadow: state === "active" ? "0 0 0 5px rgb(99 102 241 / .08)" : "none",
        },
      };
    });
    const edges: Edge[] = calls.filter((call) => call.parentId).map((call) => ({
      id: `edge-${call.id}`,
      source: call.parentId!,
      target: call.id,
      markerEnd: { type: MarkerType.ArrowClosed, color: "rgb(99 102 241 / .55)" },
      style: { stroke: "rgb(99 102 241 / .45)" },
      animated: call.startStep <= stepIndex && (call.endStep === null || call.endStep > stepIndex),
    }));
    return { nodes, edges };
  }, [allSteps, stepIndex]);

  if (!nodes.length) return null;
  return (
    <div className="relative h-full w-full">
      <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg bg-surface/85 px-3 py-2 text-xs shadow-sm backdrop-blur">
        <div className="font-semibold">Complete call tree</div>
        <div className="text-[10px] text-foreground/45">Scroll to zoom · drag to explore · {nodes.length} calls</div>
      </div>
      <ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: 0.22 }} nodesDraggable={false} nodesConnectable={false} proOptions={{ hideAttribution: true }} minZoom={0.08}>
        <Background gap={22} size={1} color="rgb(120 120 130 / .16)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
